from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path == "/practicequestions-oneoff.html":
            source = Path("practicequestions.html").read_text()
            source = source.replace(
                "const PRACTICE_QUESTION_COUNT = 6;",
                "const PRACTICE_QUESTION_COUNT = 10;",
            )
            source = source.replace(
                "const PRACTICE_WORKSHEET_PAPER_COUNT = 20;",
                "const PRACTICE_WORKSHEET_PAPER_COUNT = 1;",
            )
            source = source.replace(
                'const expectedPartCount = level === "AH" ? 8 : 6;',
                'const expectedPartCount = level === "AH" ? 8 : level === "H" ? 10 : 6;',
            )
            source = source.replace(
                'const HIGHER_PRACTICE_QUESTION_TYPE_IDS = new Set([\n      "barlines",',
                'const HIGHER_PRACTICE_QUESTION_TYPE_IDS = new Set([\n      "noteIdentification",\n      "barlines",',
            )
            source = source.replace(
                'if (level === "AH") return idSet.has("ahChordTypes") && idSet.has("cadence");',
                'if (level === "AH") return idSet.has("ahChordTypes") && idSet.has("cadence");\n      if (level === "H") return false;',
            )
            source = source.replace(
                "const endBar = Math.min(systemEnd, startBar + 1);",
                "const endBar = startBar;",
            )
            source = source.replace(
                "if (new Set(barQuestionTargets).size !== barQuestionTargets.length && canRetryPracticeQuestion) {",
                "if (false && new Set(barQuestionTargets).size !== barQuestionTargets.length && canRetryPracticeQuestion) {",
            )
            source = source.replace(
                "const canRetryPracticeQuestion = canRetryForLevel(level, attempt);",
                "const canRetryPracticeQuestion = false;",
            )
            source = source.replace(
                "const canRetryQualityPracticeQuestion = canRetryQualityRules(level, attempt, timeSignatureLevel);",
                "const canRetryQualityPracticeQuestion = false;",
            )
            source = source.replace(
                "await document.fonts?.ready;",
                "// Fonts are already loaded by the one-off worksheet page.",
            )
            source = source.replace(
                "const question = makeQuestion(level, index, worksheetTypes);",
                'console.log("oneoff: before question"); const question = makeQuestion(level, index, worksheetTypes); console.log("oneoff: after question");',
            )
            source = source.replace(
                "const score = await renderPracticeWorksheetScore(question, { worksheetLevel: level });",
                'console.log("oneoff: before score"); const score = await renderPracticeWorksheetScore(question, { worksheetLevel: level }); console.log("oneoff: after score");',
            )
            source = source.replace(
                "const answerScore = await renderPracticeWorksheetScore(completed.question, { ...completed, worksheetLevel: level });",
                'console.log("oneoff: before answer"); const answerScore = await renderPracticeWorksheetScore(completed.question, { ...completed, worksheetLevel: level }); console.log("oneoff: after answer");',
            )
            source = source.replace(
                'console.log("oneoff: before score"); const score = await renderPracticeWorksheetScore(question, { worksheetLevel: level }); console.log("oneoff: after score");',
                'const currentWrapper = document.querySelector(".practice-score-scroll")?.firstElementChild; const currentSvg = currentWrapper?.querySelector("svg"); const currentViewBox = currentSvg?.getAttribute("viewBox")?.trim().split(/\\s+/).map(Number) ?? []; if (!currentWrapper || currentViewBox.length !== 4) throw new Error("The visible score could not be prepared."); const score = { markup: currentWrapper.outerHTML, scoreWidth: currentViewBox[2], scoreHeight: currentViewBox[3] };',
            )
            source = source.replace(
                'console.log("oneoff: before answer"); const answerScore = await renderPracticeWorksheetScore(completed.question, { ...completed, worksheetLevel: level }); console.log("oneoff: after answer");',
                "const answerScore = score;",
            )
            source = source.replace(
                "async function buildPracticeWorksheetConfig(level, enabledQuestionTypes) {",
                "async function buildPracticeWorksheetConfig(level, enabledQuestionTypes, currentQuestion = null) {",
            )
            source = source.replace(
                'console.log("oneoff: before question"); const question = makeQuestion(level, index, worksheetTypes); console.log("oneoff: after question");',
                'const question = currentQuestion ?? makeQuestion(level, index, worksheetTypes);',
            )
            source = source.replace(
                "worksheetConfig={() => buildPracticeWorksheetConfig(activeLevel, enabledQuestionTypes)}",
                "worksheetConfig={() => buildPracticeWorksheetConfig(activeLevel, enabledQuestionTypes, question)}",
            )
            source = source.replace(
                "const key = randomPracticeKeyWith(random, generationLevel);",
                'const key = KEYS.find((item) => item.id === "Am");',
            )
            source = source.replace(
                "const timeSignature = withFiveFourGrouping(weightedItemWith(random, availableSignatures.length ? availableSignatures : fallbackSignatures));",
                'const timeSignature = TIME_SIGNATURES.find((signature) => signature.id === "6/8");',
            )
            source = source.replace(
                "const timeChangeTarget = needsTime\n        &&",
                "const timeChangeTarget = false && needsTime\n        &&",
            )
            source = source.replace(
                'if ((questionSelectionLevel === "AH" || level === "H") && needsTime && !timeChangeTarget && canRetryPracticeQuestion) {',
                'if (false && (questionSelectionLevel === "AH" || level === "H") && needsTime && !timeChangeTarget && canRetryPracticeQuestion) {',
            )
            source = source.replace(
                "const givenTriplets = needsTriplets && tripletTarget ? plantGivenTriplets(question, tripletTarget, [...usedQuestionBars], 2) : [];",
                "const givenTriplets = [];",
            )
            source = source.replace(
                "if (needsTriplets && tripletTarget && givenTriplets.length < 2 && canRetryPracticeQuestion) {",
                "if (false && needsTriplets && tripletTarget && givenTriplets.length < 2 && canRetryPracticeQuestion) {",
            )
            source = source.replace(
                "if (needsKey || needsTime) reserveQuestionBar(0);",
                "if (needsKey || needsTime) reserveQuestionBar(0);\n      if (needsTriplets) { reserveQuestionBar(1); reserveQuestionBar(2); }",
            )
            source = source.replace(
                "const tripletTarget = needsTriplets ? plantTripletTarget(question, [...usedQuestionBars]) : null;",
                "const tripletTarget = needsTriplets ? plantTripletBar(question, 1) : null;",
            )
            source = source.replace(
                "if (candidates.length) return randomItem(candidates);",
                '''if (candidates.length) {
        const target = randomItem(candidates);
        const note = { ...target.note, ...noteByLetter("A", 12), writtenAccidental: null };
        target.bar.notes[target.noteIndex] = note;
        return { ...target, note };
      }''',
            )
            old_defaults = '''const defaultPracticeQuestionTypesForLevel = (level) => {
      return Object.fromEntries(PRACTICE_QUESTION_TYPES.map((type) => [
        type.id,
        practiceQuestionTypesForLevel(level).some((availableType) => availableType.id === type.id),
      ]));
    };'''
            new_defaults = '''const defaultPracticeQuestionTypesForLevel = (level) => {
      const oneOffHigherTypes = new Set(["key", "time", "interval", "transposition", "rests", "scaleDegrees", "rhythmIdentification", "articulation", "noteIdentification", "barlines"]);
      return Object.fromEntries(PRACTICE_QUESTION_TYPES.map((type) => [
        type.id,
        level === "H" ? oneOffHigherTypes.has(type.id) : practiceQuestionTypesForLevel(level).some((availableType) => availableType.id === type.id),
      ]));
    };'''
            if old_defaults not in source:
                raise RuntimeError("Default Practice Questions settings source was not found")
            source = source.replace(old_defaults, new_defaults)
            body = source.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if urlparse(self.path).path == "/worksheet-generator.html":
            source = Path("worksheet-generator.html").read_text()
            source = source.replace(
                "./worksheet-generic.jsx?v=20260805-ah-answer-area",
                "./worksheet-generic.jsx?v=20260921-oneoff-two-page-v5",
            )
            body = source.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if urlparse(self.path).path == "/worksheet-generic.jsx":
            source = Path("worksheet-generic.jsx").read_text()
            source = source.replace(
                'const showPupilFields=data.header&&!answers&&(level!=="AH"||pageNumber===1);',
                'const showPupilFields=data.header&&!answers&&(!["AH","H"].includes(level)||pageNumber===1);',
            )
            source = source.replace(
                'const splitAdvancedHigherPages=level==="AH", pagesPerPaper=splitAdvancedHigherPages?2:1;',
                'const splitAdvancedHigherPages=level==="AH"||level==="H", pagesPerPaper=splitAdvancedHigherPages?2:1;',
            )
            source = source.replace(
                "practice-paper-answer-area relative mt-1 min-h-4",
                "practice-paper-answer-area relative mt-3 min-h-4",
            )
            body = source.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
