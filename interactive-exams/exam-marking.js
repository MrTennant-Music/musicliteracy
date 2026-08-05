(function (root) {
  "use strict";

  // Teacher-confirmed alternatives for specialist musical vocabulary. These
  // apply to every paper while leaving short, easily confused concepts strict.
  const COMMON_MUSICAL_SPELLINGS = Object.freeze({
    accelerando: ["acelerando", "accelarando", "accellerando", "accelerendo", "acselerando"],
    acciaccatura: ["achaccatura", "aciaccatura", "acciacatura", "acciacattura", "acciaccattura", "acciaccutura"],
    accordion: ["acordian", "acordion", "accordeon", "accordian"],
    adagio: ["adageeo", "adageo", "adaggeo"],
    alberti: ["alberty"],
    allegro: ["allegrow"],
    anacrusis: ["anocrusis"],
    andante: ["andanti"],
    appoggiatura: ["apoggiatura", "appogiatoura", "appogiatura", "appoggiattura"],
    arco: ["arcko"],
    ascending: ["asending"],
    ballet: ["ballett"],
    baroque: ["baroc", "barock", "baroak", "barroque"],
    bass: ["base"],
    basso: ["baso", "bass"],
    bodhran: ["bodrahn", "bodran", "bodhron", "bohran", "bowran", "bowron"],
    cadenza: ["cadensa"],
    canon: ["canan", "cannon"],
    cappella: ["capella", "cappela"],
    castanets: ["castinets"],
    ceilidh: ["caylee", "ceildh", "ceili", "ceilie", "kaylee"],
    cello: ["chello", "chellow", "celo", "cellow"],
    chord: ["chored", "cord"],
    chorale: ["choral", "corale"],
    chromatic: ["chromattic", "chrommatik", "cromatic"],
    clarinet: ["claranet", "clarinett", "clarionet"],
    clarsach: ["carsack"],
    coloratura: ["coleratura", "colorartura", "colourartura", "colouratura"],
    concertino: ["conchertino"],
    concerto: ["concherto", "conserto", "concertoe", "concertto"],
    concrete: ["concret", "concreate"],
    continuo: ["continue"],
    crescendo: ["crecendo", "cresendo", "creshendo"],
    crotchet: ["crochet", "crotchett", "crotchit"],
    cymbal: ["cymbol", "simbal", "symbol"],
    cymbals: ["cymbols", "simbals", "symbols"],
    de: ["da", "di"],
    descending: ["desending"],
    diminution: ["diminushion", "diminootion"],
    discord: ["dischord", "discorde", "dissord"],
    distortion: ["distorshon"],
    fiddle: ["fiddol"],
    flute: ["floot"],
    forte: ["fortay", "fortee"],
    fugue: ["fewg", "fuge", "fuguee", "fyoog", "fyoogue"],
    gaelic: ["gaellic", "galic", "gaylic"],
    glissando: ["glisando"],
    harmonic: ["haronimc"],
    harmonics: ["harmonic"],
    glockenspiel: ["glockenshpiel", "glockenspeel", "glockenspeil", "glockensspiel"],
    guitar: ["gittar", "guitarre", "guiter", "gutar"],
    harpsichord: ["harpsichored", "harpsicord", "harpsicorde"],
    hemiola: ["hemeeloa"],
    impressionist: ["impresionist", "impressionest", "impressionisst"],
    improvisation: ["improv"],
    improvised: ["improv"],
    inversion: ["inverssion", "invertion", "inverzion"],
    legato: ["ligato"],
    leitmotiv: ["leitmotif", "leitmotiff", "leitmotivv", "lightmotif"],
    lied: ["lead", "leed", "leet"],
    major: ["majer", "majore", "majour", "mayjor"],
    mezzo: ["metzo", "mezo"],
    minimalist: ["minimalest", "minamilist", "minimilist"],
    minor: ["miner", "minore", "minur", "mynor"],
    modulation: ["modulashion"],
    musique: ["music", "musike", "muzique"],
    obbligato: ["obligato"],
    oboe: ["obo", "obow"],
    organ: ["orgun"],
    orchestra: ["orcestra", "orchesta"],
    passacaglia: ["pasacaglia", "pasacallia", "passacagliah", "passacalia", "passacallia"],
    percussion: ["percushin", "percushon"],
    phrase: ["frase", "fraze", "phraze"],
    piano: ["peano", "peeano", "pianno"],
    pibroch: ["pibroc", "pibrock"],
    picardie: ["picardi", "picardy", "pickardi", "pickardy"],
    piccolo: ["piccalo", "piccollo", "pickalo", "picollo", "picolo"],
    pizzicato: ["pizicato", "pizzacato", "pizzacatto", "pizzicarto", "pizzicatto", "pitsicato", "pitzicato", "pitsickato"],
    plainchant: ["planechant"],
    rallentando: ["ralentando", "rallentendo", "ralentendo"],
    rapping: ["rap"],
    practice: ["practise"],
    practise: ["practice"],
    psalm: ["psam", "psarm", "salm", "sam"],
    recapitulation: ["recapitualtion", "recapituation", "recapitulashion"],
    recitative: ["recetative", "recitativ", "recititive", "resitative"],
    reggae: ["regae", "rege", "regga", "reggay", "regge", "reggea"],
    reel: ["real"],
    renaissance: ["renaisance", "renaissence", "renasance", "renasans", "renassance", "renissance", "rennaisance"],
    repetition: ["repetion", "repetiton", "repitition", "reppitition"],
    ritardando: ["retardando", "ritardanto", "ritardendo"],
    ritornello: ["returnello"],
    rubato: ["roobato"],
    rhythm: ["rhthm", "rhythym", "rithem", "rithm", "rythem", "rythm"],
    saxophone: ["saxafone", "saxaphon", "saxaphone", "saxofone"],
    sequence: ["seequince"],
    serial: ["searial", "seriel", "seriall"],
    sitar: ["siter"],
    soprano: ["saprano", "soparano", "sopranno", "suprano"],
    sprechgesang: ["shprechgesang", "sprecgisang", "sprechgesaing", "sprechgesgang", "spreckisang", "sprekisang"],
    staccato: ["stacato", "stacatto", "staccatto", "stakkato"],
    strophic: ["strofic", "strofick", "strophik"],
    syllabic: ["silabic"],
    symphony: ["simfony"],
    syncopation: ["sincopation", "syncapation", "syncopashion", "syncopatient"],
    tenor: ["tenner"],
    tierce: ["tearce", "teerce", "teirce", "tirce"],
    timbre: ["tamber", "timber", "timbur"],
    timpani: ["timpanie", "timpanni", "timpany", "tympani"],
    tonguing: ["tonging", "toungeing", "tounging", "tunging"],
    tremolando: ["tremalando", "tremilando", "tremolo"],
    trombone: ["tromboan", "trombon", "trombonee"],
    trumpet: ["trumpat", "trumpett", "trumpit"],
    tuba: ["chooba"],
    viola: ["veeola"],
    waltz: ["walts"],
    xylophone: ["xilophone", "xylaphone", "xylifone", "xylofone", "zilafone", "zilaphone", "zylaphone", "zylophone"],
  });

  const COMMON_MUSICAL_PHRASE_SPELLINGS = Object.freeze({
    "3 against 2": ["3 against two", "three against 2", "three against two"],
    "a cappella": ["a capella", "a cappela", "acapella", "acappela", "acappella", "cappella"],
    "alberti bass": ["alberty base"],
    antiphonal: ["anti phonal"],
    "bass guitar": ["base guitar", "baseguitar", "bassguitar"],
    "basso continuo": ["baso continuo", "bass continuo", "basso continue"],
    coloratura: ["colour a tura"],
    "ceilidh band": ["caylee band", "ceilidhband", "kaylee band"],
    "con sordino": ["consordino"],
    contrapuntal: ["contra puntal"],
    countermelody: ["counter melody"],
    countertenor: ["counter tenor", "coutner tenor"],
    "double bass": ["double base", "doublebase", "doublebass"],
    "flutter tonguing": ["flutter tongue", "fluttertonging", "fluttertonguing"],
    "gaelic psalm": ["gaelic salm", "gaelic sam", "gaelicpsalm"],
    "hi hat": ["hihat"],
    homophonic: ["homo fonic", "homo phonic"],
    leitmotiv: ["leit motif", "leit motive", "light motif"],
    "mezzo forte": ["mezzoforte"],
    "mezzo piano": ["mezzopiano"],
    "mezzo soprano": ["metzo soparano", "metzo soprano", "mezzo soparano", "mezzosoprano"],
    "musique concrete": ["music concrete", "musiqueconcrete"],
    "neo classical": ["neoclassical"],
    plainchant: ["plain chant"],
    polyphonic: ["poly fonic", "poly phonic"],
    ragtime: ["rag time"],
    "scat singing": ["scat", "scatting"],
    soul: ["soul music"],
    "through composed": ["throughcomposed", "trew composed"],
    tritone: ["tri tone"],
    "walking bass": ["walkin bass", "walking base", "walkingbass"],
    "waulking song": ["walking song", "waulkin song", "waulkingsong", "wawking song"],
    "whole tone": ["hole tone", "holetone", "wholetone"],
    "whole tone scale": ["hole tone scale", "holetone scale", "wholetone scale"],
  });

  function normalise(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en-GB")
      .trim()
      .replace(/[‐‑‒–—-]/g, " ")
      .replace(/[.,;:!?()[\]{}'\"]/g, "")
      .replace(/\s*\/\s*/g, "/")
      .replace(/\s+/g, " ");
  }

  function acceptedPhraseSpellings(value, allowCommonSpellings = true) {
    const expected = normalise(value);
    if (!allowCommonSpellings) return [expected];
    for (const [canonical, alternatives] of Object.entries(COMMON_MUSICAL_PHRASE_SPELLINGS)) {
      const spellings = [canonical, ...alternatives].map(normalise);
      if (spellings.includes(expected)) return [...new Set(spellings)];
    }
    return [expected];
  }

  function isAnswered(subquestion, value) {
    if (subquestion.type === "checkbox") return Array.isArray(value) && value.length > 0;
    if (subquestion.type === "comparison-grid") return Array.isArray(value?.c) && value.c.length > 0;
    if (subquestion.type === "lyric-placement") return Boolean(value && Object.values(value).some(entry => String(entry || "").trim()));
    if (subquestion.type === "structured-review") {
      if (subquestion.finalAnswerField) return Boolean(String(value?.final || "").trim());
      return Boolean(value && Object.values(value).some(entry => String(entry || "").trim()));
    }
    if (subquestion.notationTool === "accidental") {
      const response = normalise(value);
      const match = response.match(/^(flat|natural|sharp)@(\d+)$/);
      const allowedIndices = subquestion.accidentalNoteIndices || [];
      return Boolean(match && (!allowedIndices.length || allowedIndices.includes(Number(match[2]))));
    }
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function responseCount(source, recognisedConceptCount = 0) {
    const entries = String(source || "")
      .split(/\n|[,;•]+/)
      .map(entry => entry.trim())
      .filter(Boolean);
    return Math.max(recognisedConceptCount, entries.length || (String(source || "").trim() ? 1 : 0));
  }

  function markConceptLines(subquestion, value) {
    if (!isAnswered(subquestion, value)) return { marks: 0, status: "unanswered", matchedConcepts: [], matchedEvidence: [], correctEvidence: [], additionalAnswers: 0 };
    const source = String(value || "");
    const matches = (subquestion.conceptBank || []).map(concept => {
      const evidence = (concept.answers || [concept.label]).map(answer => phraseEvidence(source, answer, concept.allowFuzzy !== false, [], concept.allowCommonSpellings !== false)).find(Boolean);
      return evidence ? { concept, evidence } : null;
    }).filter(Boolean);
    const correctMatches = matches.filter(match => match.concept.correct);
    const requiredResponses = Number(subquestion.requiredResponses || subquestion.marks);
    const additionalAnswers = subquestion.additionalAnswerPenalty
      ? Math.max(0, responseCount(source, matches.length) - requiredResponses)
      : 0;
    const marks = Math.max(0, Math.min(subquestion.marks, correctMatches.length) - additionalAnswers);
    const credited = correctMatches.slice(0, marks);
    return {
      marks,
      status: marks === subquestion.marks ? "correct" : marks > 0 ? "partial" : "incorrect",
      matchedConcepts: credited.map(match => match.concept.label),
      matchedEvidence: credited.map(match => ({ label: match.concept.label, ...match.evidence })),
      correctEvidence: correctMatches.map(match => ({ label: match.concept.label, ...match.evidence })),
      recognisedConcepts: matches.map(match => match.concept.label),
      additionalAnswers,
    };
  }

  function markComparisonGrid(subquestion, value) {
    if (!isAnswered(subquestion, value)) return { marks: 0, status: "unanswered", selectedCorrect: [], additionalAnswers: 0 };
    const selected = [...new Set((value?.c || []).map(normalise))];
    const expected = new Set((subquestion.answers || []).map(normalise));
    const selectedCorrect = selected.filter(item => expected.has(item));
    const additionalAnswers = subquestion.additionalAnswerPenalty
      ? Math.max(0, selected.length - Number(subquestion.requiredResponses || subquestion.marks))
      : 0;
    const marks = Math.max(0, Math.min(subquestion.marks, selectedCorrect.length) - additionalAnswers);
    return {
      marks,
      status: marks === subquestion.marks ? "correct" : marks > 0 ? "partial" : "incorrect",
      selectedCorrect,
      additionalAnswers,
    };
  }

  function markLyricPlacement(subquestion, value) {
    if (!isAnswered(subquestion, value)) return { marks: 0, status: "unanswered", matchedConcepts: [], matchedLines: {}, additionalAnswers: 0 };
    const entries = Object.entries(value || {}).filter(([, answer]) => String(answer || "").trim());
    const matchedLines = {};
    const matchedConcepts = [];
    const matchedEntryKeys = new Set();
    for (const concept of subquestion.concepts || []) {
      const acceptedLines = new Set((concept.lines || []).map(String));
      const matches = entries.filter(([line, answer]) => acceptedLines.has(String(line)) && (concept.answers || [concept.label]).some(expected => phraseMatches(normalise(answer), expected, concept.allowFuzzy !== false, concept.allowCommonSpellings !== false)));
      if (!matches.length) continue;
      matchedConcepts.push(concept.id || concept.label);
      matchedLines[concept.id || concept.label] = matches.map(([line]) => String(line));
      matches.forEach(([line]) => matchedEntryKeys.add(String(line)));
    }
    const invalidEntries = entries.filter(([line]) => !matchedEntryKeys.has(String(line))).length;
    const effectiveResponses = matchedConcepts.length + invalidEntries;
    const additionalAnswers = subquestion.additionalAnswerPenalty
      ? Math.max(0, effectiveResponses - Number(subquestion.requiredResponses || subquestion.marks))
      : 0;
    const marks = Math.max(0, Math.min(subquestion.marks, matchedConcepts.length) - additionalAnswers);
    return {
      marks,
      status: marks === subquestion.marks ? "correct" : marks > 0 ? "partial" : "incorrect",
      matchedConcepts: matchedConcepts.slice(0, marks),
      matchedLines,
      additionalAnswers,
    };
  }

  function markObjective(subquestion, value) {
    if (!isAnswered(subquestion, value)) return { marks: 0, status: "unanswered" };
    if (subquestion.type === "checkbox") {
      const expected = (subquestion.answers || []).map(normalise);
      const chosen = value.map(normalise);
      const correctCount = chosen.filter(item => expected.includes(item)).length;
      const incorrectCount = chosen.filter(item => !expected.includes(item)).length;
      const correct = correctCount === expected.length && incorrectCount === 0;
      return { marks: Math.min(subquestion.marks, correctCount), status: correct ? "correct" : correctCount > 0 ? "partial" : "incorrect", correctCount, incorrectCount };
    }
    const expected = subquestion.acceptedAnswers || [subquestion.answer];
    const rawResponse = normalise(value);
    const notationResponse = subquestion.notationTool === "rhythm-entry" ? rawResponse.split("|", 1)[0].trim() : rawResponse;
    const response = subquestion.allowMusicSuffix ? notationResponse.replace(/\s+music$/, "").trim() : notationResponse;
    const comparableResponse = subquestion.notationTool === "accidental" ? response.replace(/@\d+$/, "") : response;
    const exactMatch = expected.map(normalise).includes(comparableResponse);
    const spellingMatch = expected.some(answer => answerSpellingMatches(comparableResponse, answer, subquestion.allowFuzzy !== false, subquestion.allowCommonSpellings !== false));
    const phrasedMatch = subquestion.allowAnswerInPhrase && expected.some(answer => phraseMatches(comparableResponse, answer, subquestion.allowFuzzy !== false, subquestion.allowCommonSpellings !== false));
    const keywordMatch = (subquestion.acceptedKeywords || []).some(keyword => phraseMatches(comparableResponse, keyword, subquestion.allowFuzzy !== false, subquestion.allowCommonSpellings !== false));
    const keywordGroupMatch = (subquestion.acceptedKeywordGroups || []).some(group => group.every(keyword => phraseMatches(comparableResponse, keyword, subquestion.allowFuzzy !== false, subquestion.allowCommonSpellings !== false)));
    const exactKeywordGroupMatch = (subquestion.acceptedExactKeywordGroups || []).some(group => group.every(keyword => phraseMatches(comparableResponse, keyword, false)));
    const matchedAcceptedConcepts = (subquestion.acceptedConcepts || []).filter(concept =>
      (concept.answers || []).some(answer => phraseMatches(comparableResponse, answer, concept.allowFuzzy !== false, concept.allowCommonSpellings !== false)),
    );
    const conceptThresholdMatch = matchedAcceptedConcepts.length >= Number(subquestion.minAcceptedConcepts || 1);
    const forbiddenException = (subquestion.forbiddenExceptions || []).some(phrase => phraseMatches(response, phrase, false));
    const forbiddenMatch = !forbiddenException && (subquestion.forbiddenKeywordGroups || []).some(group => group.every(keyword => phraseMatches(response, keyword)));
    const forbiddenExactMatch = !forbiddenException && (subquestion.forbiddenExactKeywordGroups || []).some(group => group.every(keyword => phraseMatches(response, keyword, false)));
    const correct = !forbiddenMatch && !forbiddenExactMatch && (exactMatch || spellingMatch || phrasedMatch || keywordMatch || keywordGroupMatch || exactKeywordGroupMatch || conceptThresholdMatch);
    const result = { marks: correct ? subquestion.marks : 0, status: correct ? "correct" : "incorrect" };
    if (subquestion.acceptedConcepts) result.matchedAcceptedConcepts = matchedAcceptedConcepts.map(concept => concept.id || concept.label);
    return result;
  }

  function editDistance(left, right) {
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      const current = [leftIndex];
      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        current[rightIndex] = Math.min(
          current[rightIndex - 1] + 1,
          previous[rightIndex] + 1,
          previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
        );
      }
      previous.splice(0, previous.length, ...current);
    }
    return previous[right.length];
  }

  function tokenMatches(responseToken, expectedToken, allowFuzzy = true, allowCommonSpellings = true) {
    if (responseToken === expectedToken) return true;
    if (allowCommonSpellings && (COMMON_MUSICAL_SPELLINGS[expectedToken] || []).includes(responseToken)) return true;
    if (!allowFuzzy) return false;
    if (expectedToken.length >= 5 && (responseToken === `${expectedToken}s` || expectedToken === `${responseToken}s`)) return true;
    if (/\d/.test(expectedToken) || expectedToken.length < 6) return false;
    if (editDistance(responseToken, expectedToken) <= 1) return true;
    if (responseToken.length !== expectedToken.length) return false;
    const differences = [];
    for (let index = 0; index < expectedToken.length; index += 1) {
      if (responseToken[index] !== expectedToken[index]) differences.push(index);
    }
    return differences.length === 2
      && differences[1] === differences[0] + 1
      && responseToken[differences[0]] === expectedToken[differences[1]]
      && responseToken[differences[1]] === expectedToken[differences[0]];
  }

  function answerSpellingMatches(response, answer, allowFuzzy = true, allowCommonSpellings = true) {
    const normalisedResponse = normalise(response);
    const expectedSpellings = acceptedPhraseSpellings(answer, allowCommonSpellings);
    if (!normalisedResponse || !expectedSpellings.some(Boolean)) return false;
    if (expectedSpellings.includes(normalisedResponse)) return true;
    return expectedSpellings.some(expected => {
      if (!/^[a-z]+(?: [a-z]+)*$/.test(normalisedResponse) || !/^[a-z]+(?: [a-z]+)*$/.test(expected)) return false;
      const responseTokens = normalisedResponse.match(/[a-z]+/g) || [];
      const expectedTokens = expected.match(/[a-z]+/g) || [];
      return responseTokens.length === expectedTokens.length
        && expectedTokens.length > 0
        && expectedTokens.every((token, index) => tokenMatches(responseTokens[index], token, allowFuzzy, allowCommonSpellings));
    });
  }

  function phraseMatches(response, phrase, allowFuzzy = true, allowCommonSpellings = true) {
    const normalisedResponse = normalise(response);
    const expectedSpellings = acceptedPhraseSpellings(phrase, allowCommonSpellings);
    if (!normalisedResponse || !expectedSpellings.some(Boolean)) return false;
    if (expectedSpellings.some(expected => ` ${normalisedResponse} `.includes(` ${expected} `))) return true;
    const responseTokens = normalisedResponse.match(/[a-z]+/g) || [];
    for (const expected of expectedSpellings) {
      if (/\d|\//.test(expected)) continue;
      const expectedTokens = expected.match(/[a-z]+/g) || [];
      if (!expectedTokens.length || responseTokens.length < expectedTokens.length) continue;
      for (let index = 0; index <= responseTokens.length - expectedTokens.length; index += 1) {
        const matches = expectedTokens.every((token, tokenIndex) => tokenMatches(responseTokens[index + tokenIndex], token, allowFuzzy, allowCommonSpellings));
        const harmonicMinorConflict = normalise(phrase) === "harmonics"
          && responseTokens[index] === "harmonic"
          && responseTokens[index + 1] === "minor";
        if (matches && !harmonicMinorConflict) return true;
      }
    }
    return false;
  }

  function phraseEvidence(source, phrase, allowFuzzy = true, excludedRanges = [], allowCommonSpellings = true) {
    const responseTokens = [];
    const tokenPattern = /[a-zÀ-ÖØ-öø-ÿ]+|\d+(?:\s*\/\s*\d+)?|[<＜]/gi;
    for (const match of String(source || "").matchAll(tokenPattern)) {
      responseTokens.push({ value: normalise(match[0]), start: match.index, end: match.index + match[0].length });
    }
    for (const expectedSpelling of acceptedPhraseSpellings(phrase, allowCommonSpellings)) {
      const expectedTokens = expectedSpelling.match(/[a-z]+|\d+(?:\/\d+)?|[<＜]/g) || [];
      if (!expectedTokens.length || responseTokens.length < expectedTokens.length) continue;
      for (let index = 0; index <= responseTokens.length - expectedTokens.length; index += 1) {
        const window = responseTokens.slice(index, index + expectedTokens.length);
        const matches = expectedTokens.every((expected, tokenIndex) => {
          const actual = window[tokenIndex].value;
          if (actual === expected) return true;
          if (/\d|\/|[<＜]/.test(expected)) return false;
          return tokenMatches(actual, expected, allowFuzzy, allowCommonSpellings);
        });
        const harmonicMinorConflict = normalise(phrase) === "harmonics"
          && window[0]?.value === "harmonic"
          && responseTokens[index + 1]?.value === "minor";
        if (matches && !harmonicMinorConflict) {
          const start = window[0].start;
          const end = window.at(-1).end;
          if (excludedRanges.some(range => range && start >= range.start && end <= range.end)) continue;
          return { start, end, text: String(source || "").slice(start, end) };
        }
      }
    }
    return null;
  }

  function markStructuredResponse(subquestion, value) {
    if (!isAnswered(subquestion, value)) return { marks: 0, status: "unanswered", matchedConcepts: {}, matchedEvidence: {}, validConceptCounts: {} };
    const source = String(value?.final || "");
    const matchedConcepts = {};
    const matchedEvidence = {};
    const validConceptCounts = {};
    const creditedConceptIds = new Set();
    let marks = 0;
    for (const heading of subquestion.headings || []) {
      const concepts = heading.concepts || (heading.markingPoints || []).map(point => ({ label: point, answers: [point] }));
      const matches = concepts.map(concept => {
        const answers = concept.answers || [concept.label];
        const allowCommonSpellings = concept.allowCommonSpellings !== false;
        const excludedRanges = (concept.excludeWithinAnswers || []).map(answer => phraseEvidence(source, answer, false, [], allowCommonSpellings)).filter(Boolean);
        const alwaysBlockedRanges = (concept.alwaysBlockedAnswers || []).map(answer => phraseEvidence(source, answer, false, [], allowCommonSpellings)).filter(Boolean);
        const exactEvidence = answers.map(answer => phraseEvidence(source, answer, false, [...excludedRanges, ...alwaysBlockedRanges], allowCommonSpellings)).find(Boolean);
        const alwaysBlocked = !exactEvidence && alwaysBlockedRanges.length > 0;
        const blocked = !exactEvidence && (alwaysBlocked || (concept.blockedAnswers || []).some(answer => phraseEvidence(source, answer, false, [], allowCommonSpellings)));
        const evidence = exactEvidence || (!blocked ? answers.map(answer => phraseEvidence(source, answer, concept.allowFuzzy !== false, excludedRanges, allowCommonSpellings)).find(Boolean) : null);
        return evidence ? { concept, evidence } : null;
      }).filter(Boolean);
      const eligible = matches.filter(match => !match.concept.creditId || !creditedConceptIds.has(match.concept.creditId));
      const remainingMarks = Math.max(0, subquestion.marks - marks);
      const banked = eligible.slice(0, Math.min(subquestion.maxMarksPerHeading || 2, remainingMarks));
      banked.forEach(match => {
        if (match.concept.creditId) creditedConceptIds.add(match.concept.creditId);
      });
      matchedConcepts[heading.id] = banked.map(match => match.concept.label);
      matchedEvidence[heading.id] = banked.map(match => ({ label: match.concept.label, ...match.evidence }));
      validConceptCounts[heading.id] = matches.length;
      marks += banked.length;
    }
    // Structured final answers award valid concepts up to the heading and paper
    // caps. Extra or incorrect entries are ignored and do not reduce the mark.
    const headingsCovered = Object.values(matchedConcepts).filter(items => items.length > 0).length;
    if (subquestion.minHeadingsForFullMarks && marks === subquestion.marks && headingsCovered < subquestion.minHeadingsForFullMarks) {
      marks = Math.max(0, subquestion.marks - 1);
    }
    return { marks, status: marks === subquestion.marks ? "correct" : marks > 0 ? "partial" : "incorrect", matchedConcepts, matchedEvidence, validConceptCounts, headingsCovered, additionalAnswers: 0 };
  }

  function suggestedReview(subquestion, value) {
    const byHeading = {};
    let suggestedCount = 0;
    for (const heading of subquestion.headings || []) {
      const response = normalise(subquestion.finalAnswerField ? value?.final : value?.[heading.id]);
      const matches = heading.markingPoints.filter(point => {
        const target = normalise(point);
        return response && (response.includes(target) || target.includes(response));
      });
      byHeading[heading.id] = [...new Set(matches)];
      suggestedCount += Math.min(2, byHeading[heading.id].length);
    }
    return { marks: 0, status: "review", reviewRequired: true, suggestedMarks: Math.min(subquestion.marks, suggestedCount), suggestedMatches: byHeading };
  }

  function markSubquestion(subquestion, value) {
    if (subquestion.type === "concept-lines") return markConceptLines(subquestion, value);
    if (subquestion.type === "comparison-grid") return markComparisonGrid(subquestion, value || {});
    if (subquestion.type === "lyric-placement") return markLyricPlacement(subquestion, value || {});
    if (subquestion.type === "structured-review" && subquestion.autoMark) return markStructuredResponse(subquestion, value || {});
    if (subquestion.type === "structured-review") return suggestedReview(subquestion, value || {});
    return markObjective(subquestion, value);
  }

  function markPaper(paper, answers) {
    let score = 0;
    let reviewMarks = 0;
    const questionBreakdown = paper.questions.map(question => {
      const parts = question.subquestions.map(subquestion => {
        const result = markSubquestion(subquestion, answers[subquestion.id]);
        score += result.marks;
        if (result.reviewRequired) reviewMarks += subquestion.marks;
        return { id: subquestion.id, label: subquestion.label, maxMarks: subquestion.marks, value: answers[subquestion.id], ...result };
      });
      return { id: question.id, number: question.number, topic: question.topic, marks: parts.reduce((sum, part) => sum + part.marks, 0), maxMarks: question.marks, reviewRequired: parts.some(part => part.reviewRequired), parts };
    });
    const topicMap = {};
    questionBreakdown.forEach(item => {
      topicMap[item.topic] ||= { topic: item.topic, marks: 0, maxMarks: 0, reviewRequired: false };
      topicMap[item.topic].marks += item.marks;
      topicMap[item.topic].maxMarks += item.maxMarks;
      topicMap[item.topic].reviewRequired ||= item.reviewRequired;
    });
    return {
      score,
      totalMarks: paper.totalMarks,
      automaticallyMarkableMarks: paper.totalMarks - reviewMarks,
      reviewMarks,
      percentage: Math.round((score / paper.totalMarks) * 100),
      questionBreakdown,
      topicBreakdown: Object.values(topicMap),
    };
  }

  const api = { normalise, isAnswered, responseCount, markSubquestion, markPaper };
  root.ExamMarking = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
