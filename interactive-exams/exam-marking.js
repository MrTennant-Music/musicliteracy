(function (root) {
  "use strict";

  function normalise(value) {
    return String(value ?? "")
      .toLocaleLowerCase("en-GB")
      .trim()
      .replace(/[‐‑‒–—-]/g, " ")
      .replace(/[.,;:!?()[\]{}'\"]/g, "")
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
      return { marks: Math.max(0, Math.min(subquestion.marks, correctCount - incorrectCount)), status: correctCount === expected.length && incorrectCount === 0 ? "correct" : "incorrect" };
    }
    const expected = subquestion.acceptedAnswers || [subquestion.answer];
    const correct = expected.map(normalise).includes(normalise(value));
    return { marks: correct ? subquestion.marks : 0, status: correct ? "correct" : "incorrect" };
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
