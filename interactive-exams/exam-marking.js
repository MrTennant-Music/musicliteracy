(function (root) {
  "use strict";

  function normalise(value) {
    return String(value ?? "")
      .toLocaleLowerCase("en-GB")
      .trim()
      .replace(/[‐‑‒–—-]/g, " ")
      .replace(/[.,;:!?()[\]{}'\"]/g, "")
      .replace(/\s*\/\s*/g, "/")
      .replace(/\s+/g, " ");
  }

  function isAnswered(subquestion, value) {
    if (subquestion.type === "checkbox") return Array.isArray(value) && value.length > 0;
    if (subquestion.type === "structured-review") {
      if (subquestion.finalAnswerField) return Boolean(String(value?.final || "").trim());
      return Boolean(value && Object.values(value).some(entry => String(entry || "").trim()));
    }
    return value !== undefined && value !== null && String(value).trim() !== "";
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
    const response = subquestion.allowMusicSuffix ? rawResponse.replace(/\s+music$/, "").trim() : rawResponse;
    const exactMatch = expected.map(normalise).includes(response);
    const phrasedMatch = subquestion.allowAnswerInPhrase && expected.some(answer => phraseMatches(response, answer));
    const keywordMatch = (subquestion.acceptedKeywords || []).some(keyword => phraseMatches(response, keyword));
    const keywordGroupMatch = (subquestion.acceptedKeywordGroups || []).some(group => group.every(keyword => phraseMatches(response, keyword)));
    const forbiddenMatch = (subquestion.forbiddenKeywordGroups || []).some(group => group.every(keyword => phraseMatches(response, keyword)));
    const correct = !forbiddenMatch && (exactMatch || phrasedMatch || keywordMatch || keywordGroupMatch);
    return { marks: correct ? subquestion.marks : 0, status: correct ? "correct" : "incorrect" };
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

  function tokenMatches(responseToken, expectedToken) {
    if (responseToken === expectedToken) return true;
    if (/\d/.test(expectedToken) || expectedToken.length < 5) return false;
    const allowance = expectedToken.length >= 8 ? 2 : 1;
    return editDistance(responseToken, expectedToken) <= allowance;
  }

  function phraseMatches(response, phrase, allowFuzzy = true) {
    const expected = normalise(phrase);
    if (!response || !expected) return false;
    if (` ${response} `.includes(` ${expected} `)) return true;
    if (!allowFuzzy || /\d|\//.test(expected)) return false;
    const responseTokens = response.match(/[a-z]+/g) || [];
    const expectedTokens = expected.match(/[a-z]+/g) || [];
    if (!expectedTokens.length || responseTokens.length < expectedTokens.length) return false;
    for (let index = 0; index <= responseTokens.length - expectedTokens.length; index += 1) {
      if (expectedTokens.every((token, tokenIndex) => tokenMatches(responseTokens[index + tokenIndex], token))) return true;
    }
    return false;
  }

  function phraseEvidence(source, phrase, allowFuzzy = true) {
    const responseTokens = [];
    const tokenPattern = /[a-z]+|\d+(?:\s*\/\s*\d+)?|[<＜]/gi;
    for (const match of String(source || "").matchAll(tokenPattern)) {
      responseTokens.push({ value: normalise(match[0]), start: match.index, end: match.index + match[0].length });
    }
    const expectedTokens = normalise(phrase).match(/[a-z]+|\d+(?:\/\d+)?|[<＜]/g) || [];
    if (!expectedTokens.length || responseTokens.length < expectedTokens.length) return null;
    for (let index = 0; index <= responseTokens.length - expectedTokens.length; index += 1) {
      const window = responseTokens.slice(index, index + expectedTokens.length);
      const matches = expectedTokens.every((expected, tokenIndex) => {
        const actual = window[tokenIndex].value;
        if (actual === expected) return true;
        if (!allowFuzzy || /\d|\/|[<＜]/.test(expected)) return false;
        return tokenMatches(actual, expected);
      });
      if (matches) {
        const start = window[0].start;
        const end = window.at(-1).end;
        return { start, end, text: String(source || "").slice(start, end) };
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
        const exactEvidence = answers.map(answer => phraseEvidence(source, answer, false)).find(Boolean);
        const blocked = (concept.blockedAnswers || []).some(answer => phraseEvidence(source, answer, false));
        const evidence = exactEvidence || (!blocked ? answers.map(answer => phraseEvidence(source, answer, concept.allowFuzzy !== false)).find(Boolean) : null);
        return evidence ? { concept, evidence } : null;
      }).filter(Boolean);
      const eligible = matches.filter(match => !match.concept.creditId || !creditedConceptIds.has(match.concept.creditId));
      const banked = eligible.slice(0, subquestion.maxMarksPerHeading || 2);
      banked.forEach(match => {
        if (match.concept.creditId) creditedConceptIds.add(match.concept.creditId);
      });
      matchedConcepts[heading.id] = banked.map(match => match.concept.label);
      matchedEvidence[heading.id] = banked.map(match => ({ label: match.concept.label, ...match.evidence }));
      validConceptCounts[heading.id] = matches.length;
      marks += banked.length;
    }
    marks = Math.min(subquestion.marks, marks);
    const headingsCovered = Object.values(matchedConcepts).filter(items => items.length > 0).length;
    if (subquestion.minHeadingsForFullMarks && marks === subquestion.marks && headingsCovered < subquestion.minHeadingsForFullMarks) {
      marks = Math.max(0, subquestion.marks - 1);
    }
    return { marks, status: marks === subquestion.marks ? "correct" : marks > 0 ? "partial" : "incorrect", matchedConcepts, matchedEvidence, validConceptCounts, headingsCovered };
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

  const api = { normalise, isAnswered, markSubquestion, markPaper };
  root.ExamMarking = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
