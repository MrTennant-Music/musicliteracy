(function initialiseMillionaireCustomSets(globalScope) {
  "use strict";

  const FORMAT = "millionaire-question-set";
  const FORMAT_VERSION = 1;
  const QUESTION_COUNT = 15;
  const MIN_RESERVE_COUNT = 1;
  const DB_NAME = "mlh-millionaire-custom-sets";
  const DB_VERSION = 1;
  const STORE_NAME = "questionSets";
  const TYPES = Object.freeze({
    text: { label: "Text", image: false, audio: false },
    image: { label: "Image", image: true, audio: false },
    audio: { label: "Audio", image: false, audio: true },
    youtube: { label: "YouTube video", image: false, audio: false, youtube: true },
  });
  const LIMITS = Object.freeze({
    imageBytes: 5 * 1024 * 1024,
    audioBytes: 15 * 1024 * 1024,
    packageBytes: 50 * 1024 * 1024,
    decompressedBytes: 60 * 1024 * 1024,
  });
  const IMAGE_MIME_TYPES = Object.freeze(["image/png", "image/jpeg", "image/gif", "image/webp"]);
  const AUDIO_MIME_TYPES = Object.freeze([
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg",
  ]);

  function uniqueId(prefix = "id") {
    if (globalScope.crypto?.randomUUID) return `${prefix}-${globalScope.crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function cloneBlob(blob) {
    return blob instanceof Blob ? blob.slice(0, blob.size, blob.type) : null;
  }

  function cloneMedia(media, regenerateId = false) {
    if (!media || typeof media !== "object") return null;
    return {
      id: regenerateId ? uniqueId("media") : (typeof media.id === "string" && media.id ? media.id : uniqueId("media")),
      name: typeof media.name === "string" ? media.name : "media",
      type: typeof media.type === "string" ? media.type : media.blob?.type || "",
      size: Number.isFinite(media.size) ? media.size : media.blob?.size || 0,
      duration: Number.isFinite(media.duration) ? media.duration : null,
      blob: cloneBlob(media.blob),
    };
  }

  function emptyQuestion(number) {
    return {
      id: uniqueId("question"),
      number,
      type: "text",
      prompt: "",
      answers: ["", "", "", ""],
      correctAnswerIndex: null,
      hint: "",
      image: null,
      imageAlt: "",
      audio: null,
      youtubeUrl: "",
    };
  }

  function normaliseQuestion(question, number, regenerateIds = false) {
    const source = question && typeof question === "object" ? question : {};
    const answers = Array.isArray(source.answers) ? source.answers.slice(0, 4) : [];
    while (answers.length < 4) answers.push("");
    const sourceType = source.type === "image-audio"
      ? source.image ? "image" : source.audio ? "audio" : "text"
      : source.type;
    const type = TYPES[sourceType] ? sourceType : "text";
    return {
      id: regenerateIds ? uniqueId("question") : (typeof source.id === "string" && source.id ? source.id : uniqueId("question")),
      number,
      type,
      prompt: typeof source.prompt === "string" ? source.prompt : "",
      answers: answers.map((answer) => typeof answer === "string" ? answer : ""),
      correctAnswerIndex: Number.isInteger(source.correctAnswerIndex) ? source.correctAnswerIndex : null,
      hint: typeof source.hint === "string" ? source.hint : "",
      image: type === "image" ? cloneMedia(source.image, regenerateIds) : null,
      imageAlt: typeof source.imageAlt === "string" ? source.imageAlt : "",
      audio: type === "audio" ? cloneMedia(source.audio, regenerateIds) : null,
      youtubeUrl: type === "youtube" && typeof source.youtubeUrl === "string" ? source.youtubeUrl.trim() : "",
    };
  }

  function createSet(title) {
    const now = new Date().toISOString();
    return {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: uniqueId("set"),
      title: String(title || "").trim(),
      createdAt: now,
      updatedAt: now,
      includeInRandom: true,
      questions: Array.from({ length: QUESTION_COUNT }, (_, index) => emptyQuestion(index + 1)),
    };
  }

  function normaliseSet(value, options = {}) {
    const source = value && typeof value === "object" ? value : {};
    const regenerateIds = Boolean(options.regenerateIds);
    const now = new Date().toISOString();
    const sourceQuestions = Array.isArray(source.questions) ? source.questions : [];
    const questionCount = Math.max(QUESTION_COUNT, sourceQuestions.length);
    return {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: regenerateIds ? uniqueId("set") : (typeof source.id === "string" && source.id ? source.id : uniqueId("set")),
      title: typeof source.title === "string" ? source.title.trim() : "",
      createdAt: regenerateIds ? now : (typeof source.createdAt === "string" ? source.createdAt : now),
      updatedAt: regenerateIds ? now : (typeof source.updatedAt === "string" ? source.updatedAt : now),
      includeInRandom: source.includeInRandom !== false,
      questions: Array.from({ length: questionCount }, (_, index) => normaliseQuestion(sourceQuestions[index], index + 1, regenerateIds)),
    };
  }

  function hasQuestionContent(question) {
    if (!question) return false;
    return Boolean(
      String(question.prompt || "").trim()
      || String(question.hint || "").trim()
      || String(question.imageAlt || "").trim()
      || (question.answers || []).some((answer) => String(answer || "").trim())
      || Number.isInteger(question.correctAnswerIndex)
      || question.image
      || question.audio
      || String(question.youtubeUrl || "").trim()
      || question.type !== "text"
    );
  }

  function mediaReadable(media, allowedTypes) {
    return Boolean(
      media
      && media.blob instanceof Blob
      && media.blob.size > 0
      && allowedTypes.includes(media.type || media.blob.type)
    );
  }

  function youtubeVideoId(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
      let id = "";
      if (hostname === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
      else if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
        if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
        else {
          const parts = url.pathname.split("/").filter(Boolean);
          if (["embed", "shorts", "live"].includes(parts[0])) id = parts[1] || "";
        }
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
    } catch {
      return "";
    }
  }

  function youtubeEmbedUrl(value) {
    const id = youtubeVideoId(value);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  }

  function validateQuestion(question) {
    const issues = [];
    if (!String(question?.prompt || "").trim()) issues.push({ field: "prompt", message: "has no question text" });
    if (!Array.isArray(question?.answers) || question.answers.length !== 4) {
      issues.push({ field: "answers", message: "must have exactly four answer options" });
    } else if (question.answers.some((answer) => !String(answer || "").trim())) {
      issues.push({ field: "answers", message: "has an empty answer option" });
    }
    if (!Number.isInteger(question?.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
      issues.push({ field: "correctAnswer", message: "has no correct answer" });
    }
    if (!String(question?.hint || "").trim()) issues.push({ field: "hint", message: "has no hint" });
    const type = TYPES[question?.type];
    if (!type) issues.push({ field: "type", message: "has an unsupported question type" });
    if (type?.image && !mediaReadable(question.image, IMAGE_MIME_TYPES)) {
      issues.push({ field: "image", message: question.image ? "refers to an unreadable image" : "requires an image" });
    }
    if (type?.audio && !mediaReadable(question.audio, AUDIO_MIME_TYPES)) {
      issues.push({ field: "audio", message: question.audio ? "refers to unreadable audio" : "requires audio" });
    }
    if (type?.youtube && !youtubeVideoId(question.youtubeUrl)) {
      issues.push({ field: "youtube", message: "requires a valid YouTube link" });
    }
    return issues;
  }

  function validateSet(set) {
    const issues = [];
    const questions = Array.isArray(set?.questions) ? set.questions : [];
    if (!String(set?.title || "").trim()) issues.push({ questionNumber: null, field: "title", message: "The set name is required." });
    if (questions.length < QUESTION_COUNT) {
      issues.push({ questionNumber: null, field: "questions", message: `The set must contain at least ${QUESTION_COUNT} main questions.` });
    }
    let completeCount = 0;
    let mainCompleteCount = 0;
    let reserveCompleteCount = 0;
    questions.forEach((question, index) => {
      const questionIssues = validateQuestion(question);
      if (!questionIssues.length) {
        completeCount += 1;
        if (index < QUESTION_COUNT) mainCompleteCount += 1;
        else reserveCompleteCount += 1;
      }
      if (index < QUESTION_COUNT) {
        questionIssues.forEach((issue) => issues.push({
          ...issue,
          questionNumber: index + 1,
          message: `Question ${index + 1} ${issue.message}.`,
        }));
      }
    });
    const reserveCount = Math.max(0, questions.length - QUESTION_COUNT);
    if (reserveCompleteCount < MIN_RESERVE_COUNT) {
      issues.push({
        questionNumber: null,
        field: "reserve",
        message: `Add at least ${MIN_RESERVE_COUNT} complete reserve question for the Switch lifeline.`,
      });
    }
    const incompleteCount = Math.max(0, QUESTION_COUNT - mainCompleteCount)
      + Math.max(0, MIN_RESERVE_COUNT - reserveCompleteCount);
    return {
      valid: issues.length === 0,
      completeCount,
      incompleteCount,
      mainCompleteCount,
      reserveCompleteCount,
      reserveCount,
      issues,
    };
  }

  function setSummary(set) {
    const validation = validateSet(set);
    return {
      id: set.id,
      title: set.title,
      updatedAt: set.updatedAt,
      includeInRandom: set.includeInRandom !== false,
      completeCount: validation.completeCount,
      incompleteCount: validation.incompleteCount,
      mainCompleteCount: validation.mainCompleteCount,
      reserveCompleteCount: validation.reserveCompleteCount,
      reserveCount: validation.reserveCount,
      playable: validation.valid,
      hasImage: set.questions.some((question) => Boolean(question.image)),
      hasAudio: set.questions.some((question) => Boolean(question.audio)),
      hasYoutube: set.questions.some((question) => question.type === "youtube" && Boolean(youtubeVideoId(question.youtubeUrl))),
      issueCount: validation.issues.length,
    };
  }

  function duplicateSet(set) {
    const copy = normaliseSet(set, { regenerateIds: true });
    copy.title = `${String(set.title || "Untitled Set").trim()} – Copy`;
    return copy;
  }

  function duplicateQuestion(question, number) {
    const copy = normaliseQuestion(question, number, true);
    copy.number = number;
    return copy;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("The browser storage request failed."));
    });
  }

  class QuestionSetRepository {
    constructor(indexedDBFactory = globalScope.indexedDB) {
      this.indexedDB = indexedDBFactory;
      this.databasePromise = null;
    }

    async open() {
      if (!this.indexedDB) throw new Error("Browser storage is unavailable.");
      if (this.databasePromise) return this.databasePromise;
      this.databasePromise = new Promise((resolve, reject) => {
        const request = this.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("updatedAt", "updatedAt");
          }
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => database.close();
          resolve(database);
        };
        request.onerror = () => {
          this.databasePromise = null;
          reject(request.error || new Error("Browser storage could not be opened."));
        };
        request.onblocked = () => reject(new Error("Browser storage is blocked by another open page."));
      });
      return this.databasePromise;
    }

    async list() {
      const database = await this.open();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const sets = await requestToPromise(transaction.objectStore(STORE_NAME).getAll());
      return sets.map((set) => normaliseSet(set)).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    }

    async get(id) {
      const database = await this.open();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const value = await requestToPromise(transaction.objectStore(STORE_NAME).get(id));
      return value ? normaliseSet(value) : null;
    }

    async save(set, options = {}) {
      const database = await this.open();
      const value = normaliseSet(set);
      if (options.touch !== false) value.updatedAt = new Date().toISOString();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("The question set could not be saved."));
        transaction.onabort = () => reject(transaction.error || new Error("The question set could not be saved."));
        transaction.objectStore(STORE_NAME).put(value);
      });
      return value;
    }

    async delete(id) {
      const database = await this.open();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("The question set could not be deleted."));
        transaction.objectStore(STORE_NAME).delete(id);
      });
    }

    async duplicate(id) {
      const source = await this.get(id);
      if (!source) throw new Error("The question set could not be found.");
      return this.save(duplicateSet(source), { touch: false });
    }

    async idExists(id) {
      return Boolean(await this.get(id));
    }
  }

  function safeExtension(name, fallback) {
    const match = String(name || "").toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    return match ? match[1] : fallback;
  }

  function safeFilename(title) {
    const base = String(title || "question-set")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return `${base || "question-set"}.millionaire-set`;
  }

  async function exportSet(set, zipLibrary = globalScope.JSZip) {
    if (!zipLibrary) throw new Error("ZIP support is unavailable.");
    const value = normaliseSet(set);
    const zip = new zipLibrary();
    const manifest = {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: value.id,
      title: value.title,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      includeInRandom: value.includeInRandom,
      questions: [],
    };
    for (let index = 0; index < value.questions.length; index += 1) {
      const question = value.questions[index];
      const type = TYPES[question.type] ? question.type : "text";
      const number = String(index + 1).padStart(2, "0");
      const imageRelevant = TYPES[type].image && mediaReadable(question.image, IMAGE_MIME_TYPES);
      const audioRelevant = TYPES[type].audio && mediaReadable(question.audio, AUDIO_MIME_TYPES);
      const imagePath = imageRelevant ? `images/question-${number}.${safeExtension(question.image.name, "bin")}` : null;
      const audioPath = audioRelevant ? `audio/question-${number}.${safeExtension(question.audio.name, "bin")}` : null;
      if (imagePath) zip.file(imagePath, await question.image.blob.arrayBuffer());
      if (audioPath) zip.file(audioPath, await question.audio.blob.arrayBuffer());
      manifest.questions.push({
        id: question.id,
        number: index + 1,
        type,
        prompt: question.prompt,
        answers: [...question.answers],
        correctAnswerIndex: question.correctAnswerIndex,
        hint: question.hint,
        imageAlt: question.imageAlt,
        image: imagePath ? { path: imagePath, name: question.image.name, type: question.image.type, size: question.image.size } : null,
        audio: audioPath ? { path: audioPath, name: question.audio.name, type: question.audio.type, size: question.audio.size, duration: question.audio.duration } : null,
        youtubeUrl: type === "youtube" ? question.youtubeUrl : "",
      });
    }
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    if (blob.size > LIMITS.packageBytes) throw new Error(`The exported package is larger than ${Math.round(LIMITS.packageBytes / 1024 / 1024)} MB.`);
    return { blob, filename: safeFilename(value.title) };
  }

  function safeZipPath(path) {
    return typeof path === "string"
      && path.length > 0
      && !path.startsWith("/")
      && !path.startsWith("\\")
      && !path.includes("\\")
      && path.split("/").every((part) => part && part !== "." && part !== "..");
  }

  function assertManifestShape(manifest) {
    if (!manifest || typeof manifest !== "object") throw new Error("manifest.json is not valid.");
    if (manifest.format !== FORMAT) throw new Error("This is not a Millionaire question-set file.");
    if (manifest.formatVersion !== FORMAT_VERSION) throw new Error(`Question-set format version ${manifest.formatVersion} is not supported.`);
    if (!Array.isArray(manifest.questions) || manifest.questions.length < QUESTION_COUNT) {
      throw new Error(`The imported set must contain at least ${QUESTION_COUNT} main questions.`);
    }
    if (typeof manifest.title !== "string" || !manifest.title.trim()) throw new Error("The imported set has no name.");
  }

  async function importPackage(file, zipLibrary = globalScope.JSZip) {
    if (!zipLibrary) throw new Error("ZIP support is unavailable.");
    if (!(file instanceof Blob)) throw new Error("Choose a .millionaire-set file to import.");
    if (file.size > LIMITS.packageBytes) throw new Error(`The selected file is larger than ${Math.round(LIMITS.packageBytes / 1024 / 1024)} MB.`);
    let zip;
    try {
      zip = await zipLibrary.loadAsync(await file.arrayBuffer(), { createFolders: false });
    } catch (error) {
      console.error("Millionaire set ZIP could not be read.", error);
      throw new Error("The selected file is corrupt or is not a valid .millionaire-set package.");
    }
    const entries = Object.values(zip.files);
    if (entries.some((entry) => !safeZipPath(entry.dir && entry.name.endsWith("/") ? entry.name.slice(0, -1) : entry.name))) {
      throw new Error("The package contains an unsafe file path.");
    }
    const estimatedSize = entries.reduce((total, entry) => total + (entry?._data?.uncompressedSize || 0), 0);
    if (estimatedSize > LIMITS.decompressedBytes) throw new Error(`The unpacked package is larger than ${Math.round(LIMITS.decompressedBytes / 1024 / 1024)} MB.`);
    const manifestEntry = zip.file("manifest.json");
    if (!manifestEntry) throw new Error("The package does not contain manifest.json.");
    let manifest;
    try {
      manifest = JSON.parse(await manifestEntry.async("string"));
    } catch {
      throw new Error("manifest.json is not valid JSON.");
    }
    assertManifestShape(manifest);
    let totalUnpacked = 0;
    let imageCount = 0;
    let audioCount = 0;
    let youtubeCount = 0;
    const questions = [];
    for (let index = 0; index < manifest.questions.length; index += 1) {
      const source = manifest.questions[index];
      if (!source || typeof source !== "object") throw new Error(`Question ${index + 1} is malformed.`);
      if (!Array.isArray(source.answers) || source.answers.length !== 4 || source.answers.some((answer) => typeof answer !== "string")) {
        throw new Error(`Question ${index + 1} must contain four text answers.`);
      }
      if (!TYPES[source.type]) throw new Error(`Question ${index + 1} has an unsupported type.`);
      const question = normaliseQuestion(source, index + 1);
      if (source.type === "youtube" && youtubeVideoId(source.youtubeUrl)) youtubeCount += 1;
      for (const mediaKind of ["image", "audio"]) {
        if (!TYPES[source.type][mediaKind]) continue;
        const reference = source[mediaKind];
        if (!reference) continue;
        if (!safeZipPath(reference.path) || !reference.path.startsWith(`${mediaKind === "image" ? "images" : "audio"}/`)) {
          throw new Error(`Question ${index + 1} contains an unsafe ${mediaKind} path.`);
        }
        const entry = zip.file(reference.path);
        if (!entry) throw new Error(`Question ${index + 1} refers to missing ${mediaKind}.`);
        const mediaBuffer = await entry.async("arraybuffer");
        const blob = new Blob([mediaBuffer], { type: typeof reference.type === "string" ? reference.type : "" });
        totalUnpacked += blob.size;
        if (totalUnpacked > LIMITS.decompressedBytes) throw new Error("The unpacked package is too large.");
        const allowedTypes = mediaKind === "image" ? IMAGE_MIME_TYPES : AUDIO_MIME_TYPES;
        const declaredType = typeof reference.type === "string" ? reference.type : "";
        if (!allowedTypes.includes(declaredType)) throw new Error(`Question ${index + 1} has an unsupported ${mediaKind} type.`);
        const limit = mediaKind === "image" ? LIMITS.imageBytes : LIMITS.audioBytes;
        if (!blob.size || blob.size > limit) throw new Error(`Question ${index + 1} ${mediaKind} is empty or too large.`);
        question[mediaKind] = {
          id: uniqueId("media"),
          name: String(reference.name || `${mediaKind}-${index + 1}`).replace(/[\\/]/g, "_").slice(0, 160),
          type: declaredType,
          size: blob.size,
          duration: mediaKind === "audio" && Number.isFinite(reference.duration) ? reference.duration : null,
          blob: blob.slice(0, blob.size, declaredType),
        };
        if (mediaKind === "image") imageCount += 1;
        else audioCount += 1;
      }
      questions.push(question);
    }
    const set = normaliseSet({ ...manifest, questions });
    const validation = validateSet(set);
    return {
      set,
      summary: {
        title: set.title,
        questionCount: set.questions.length,
        imageCount,
        audioCount,
        youtubeCount,
        playable: validation.valid,
        completeCount: validation.completeCount,
        incompleteCount: validation.incompleteCount,
        mainCompleteCount: validation.mainCompleteCount,
        reserveCompleteCount: validation.reserveCompleteCount,
        reserveCount: validation.reserveCount,
        warnings: validation.issues.map((issue) => issue.message),
      },
    };
  }

  function runtimeSet(set) {
    const validation = validateSet(set);
    if (!validation.valid) {
      const error = new Error("This question set is incomplete and cannot be played.");
      error.validation = validation;
      throw error;
    }
    const objectUrls = [];
    const letters = ["A", "B", "C", "D"];
    const playableQuestions = [
      ...set.questions.slice(0, QUESTION_COUNT),
      ...set.questions.slice(QUESTION_COUNT).filter((question) => validateQuestion(question).length === 0),
    ];
    const runtimeQuestions = playableQuestions.map((question, index) => {
      const imageUrl = TYPES[question.type].image ? globalScope.URL.createObjectURL(question.image.blob) : "";
      const audioUrl = TYPES[question.type].audio ? globalScope.URL.createObjectURL(question.audio.blob) : "";
      const youtubeUrl = TYPES[question.type].youtube ? youtubeEmbedUrl(question.youtubeUrl) : "";
      if (imageUrl) objectUrls.push(imageUrl);
      if (audioUrl) objectUrls.push(audioUrl);
      return {
        id: `custom-${set.id}-${question.id}`,
        level: "N3",
        category: "literacy",
        difficulty: index < 5 ? "easy" : index < 10 ? "medium" : "hard",
        difficultyMin: index < 5 ? 1 : index < 10 ? 6 : 11,
        difficultyMax: index < 5 ? 5 : index < 10 ? 10 : 15,
        fixedStage: index < QUESTION_COUNT ? index + 1 : null,
        concept: "custom-question",
        question: question.prompt,
        prompt: question.prompt,
        answers: question.answers.map((text, answerIndex) => ({
          id: `answer-${answerIndex}`,
          originalId: `answer-${answerIndex}`,
          letter: letters[answerIndex],
          text,
        })),
        correctAnswer: `answer-${question.correctAnswerIndex}`,
        correctLetter: letters[question.correctAnswerIndex],
        explanation: `The correct answer is ${question.answers[question.correctAnswerIndex]}.`,
        tip: question.hint || "Consider each answer carefully.",
        type: imageUrl ? "image" : audioUrl ? "audio" : youtubeUrl ? "youtube" : "text",
        image: imageUrl ? { src: imageUrl, alt: question.imageAlt || "Question image" } : null,
        audioSrc: audioUrl,
        audio: null,
        youtube: youtubeUrl ? { src: youtubeUrl, title: index < QUESTION_COUNT ? `Video for Question ${index + 1}` : `Video for Reserve Question ${index - QUESTION_COUNT + 1}` } : null,
        notationData: null,
        customSetId: set.id,
        customReserve: index >= QUESTION_COUNT,
      };
    });
    return {
      questions: runtimeQuestions.slice(0, QUESTION_COUNT),
      reserveQuestions: runtimeQuestions.slice(QUESTION_COUNT),
      revoke() {
        objectUrls.splice(0).forEach((url) => globalScope.URL.revokeObjectURL(url));
      },
    };
  }

  const api = {
    FORMAT,
    FORMAT_VERSION,
    QUESTION_COUNT,
    MIN_RESERVE_COUNT,
    TYPES,
    LIMITS,
    IMAGE_MIME_TYPES,
    AUDIO_MIME_TYPES,
    uniqueId,
    emptyQuestion,
    createSet,
    normaliseSet,
    normaliseQuestion,
    hasQuestionContent,
    validateQuestion,
    validateSet,
    youtubeVideoId,
    youtubeEmbedUrl,
    setSummary,
    duplicateSet,
    duplicateQuestion,
    safeFilename,
    safeZipPath,
    exportSet,
    importPackage,
    runtimeSet,
    QuestionSetRepository,
  };

  globalScope.MILLIONAIRE_CUSTOM_SETS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
