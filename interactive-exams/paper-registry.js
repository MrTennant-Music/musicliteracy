(function (root) {
  "use strict";

  const papers = {
    "higher-2015": {
      id: "higher-2015",
      title: "Higher Music 2015",
      level: "Higher",
      levelCode: "H",
      year: 2015,
      dataFile: "papers/higher-2015.js?v=20260801-q6-no-additional-penalty",
    },
    "higher-2016": {
      id: "higher-2016",
      title: "Higher Music 2016",
      level: "Higher",
      levelCode: "H",
      year: 2016,
      dataFile: "papers/higher-2016.js?v=20260803-higher-2016-feedback-transpose-fix-v1",
    },
    "higher-2017": {
      id: "higher-2017",
      title: "Higher Music 2017",
      level: "Higher",
      levelCode: "H",
      year: 2017,
      dataFile: "papers/higher-2017.js?v=20260803-higher-2017-time-signatures-v1",
    },
    "higher-2018": {
      id: "higher-2018",
      title: "Higher Music 2018",
      level: "Higher",
      levelCode: "H",
      year: 2018,
      dataFile: "papers/higher-2018.js?v=20260802-higher-2018-q2-indent-v1",
    },
    "higher-2019": {
      id: "higher-2019",
      title: "Higher Music 2019",
      level: "Higher",
      levelCode: "H",
      year: 2019,
      dataFile: "papers/higher-2019.js?v=20260803-higher-2019-controls-v1",
    },
    "higher-2022": {
      id: "higher-2022",
      title: "Higher Music 2022",
      level: "Higher",
      levelCode: "H",
      year: 2022,
      dataFile: "papers/higher-2022.js?v=20260804-higher-2022-pitch-inventory-v3",
    },
    "higher-2023": {
      id: "higher-2023",
      title: "Higher Music 2023",
      level: "Higher",
      levelCode: "H",
      year: 2023,
      dataFile: "papers/higher-2023.js?v=20260804-higher-2023-q4c-answer-v5",
    },
    "higher-2024": {
      id: "higher-2024",
      title: "Higher Music 2024",
      level: "Higher",
      levelCode: "H",
      year: 2024,
      dataFile: "papers/higher-2024.js?v=20260804-higher-q4-score-v1",
    },
    "higher-2025": {
      id: "higher-2025",
      title: "Higher Music 2025",
      level: "Higher",
      levelCode: "H",
      year: 2025,
      dataFile: "papers/higher-2025.js?v=20260804-higher-2025-q4d-answer-v1",
    },
    "national5-2014": {
      id: "national5-2014",
      title: "National 5 Music 2014",
      level: "National 5",
      levelCode: "N5",
      year: 2014,
      dataFile: "papers/national5-2014.js?v=20260716-pizzicato-spellings",
    },
    "national5-2015": {
      id: "national5-2015",
      title: "National 5 Music 2015",
      level: "National 5",
      levelCode: "N5",
      year: 2015,
      dataFile: "papers/national5-2015.js?v=20260801-q3-tempo-audit",
    },
    "national5-2016": {
      id: "national5-2016",
      title: "National 5 Music 2016",
      level: "National 5",
      levelCode: "N5",
      year: 2016,
      dataFile: "papers/national5-2016.js?v=20260801-q3-tempo-audit",
    },
    "national5-2017": {
      id: "national5-2017",
      title: "National 5 Music 2017",
      level: "National 5",
      levelCode: "N5",
      year: 2017,
      dataFile: "papers/national5-2017.js?v=20260801-q3-tempo-audit",
    },
    "national5-2018": {
      id: "national5-2018",
      title: "National 5 Music 2018",
      level: "National 5",
      levelCode: "N5",
      year: 2018,
      dataFile: "papers/national5-2018.js?v=20260731-initial-import",
    },
    "national5-2019": {
      id: "national5-2019",
      title: "National 5 Music 2019",
      level: "National 5",
      levelCode: "N5",
      year: 2019,
      dataFile: "papers/national5-2019.js?v=20260731-initial-import",
    },
    // The 2021 assessment resource is intentionally excluded because it was
    // not sat as an official examination under exam conditions.
    "national5-2022": {
      id: "national5-2022",
      title: "National 5 Music 2022",
      level: "National 5",
      levelCode: "N5",
      year: 2022,
      dataFile: "papers/national5-2022.js?v=20260801-q3-tempo-audit",
    },
    "national5-2023": {
      id: "national5-2023",
      title: "National 5 Music 2023",
      level: "National 5",
      levelCode: "N5",
      year: 2023,
      dataFile: "papers/national5-2023.js?v=20260801-q3-tempo-audit",
    },
    "national5-2024": {
      id: "national5-2024",
      title: "National 5 Music 2024",
      level: "National 5",
      levelCode: "N5",
      year: 2024,
      dataFile: "papers/national5-2024.js?v=20260801-q3-tempo-audit",
    },
    "national5-2025": {
      id: "national5-2025",
      title: "National 5 Music 2025",
      level: "National 5",
      levelCode: "N5",
      year: 2025,
      dataFile: "papers/national5-2025.js?v=20260801-q3-tempo-audit",
    },
  };

  root.InteractiveExamPaperRegistry = papers;
  root.InteractiveExamPaperReady = Promise.resolve(null);

  if (typeof document !== "undefined") {
    const requestedId = new URLSearchParams(root.location.search).get("paper") || "national5-2014";
    const entry = papers[requestedId];
    if (entry) {
      root.InteractiveExamPaperReady = new Promise(resolve => {
        const script = document.createElement("script");
        script.src = entry.dataFile;
        script.async = false;
        script.addEventListener("load", () => resolve(root.InteractiveExamPapers?.[requestedId] || null), { once: true });
        script.addEventListener("error", () => resolve(null), { once: true });
        document.head.appendChild(script);
      });
    }
  }

  if (typeof module !== "undefined" && module.exports) module.exports = papers;
})(typeof window !== "undefined" ? window : globalThis);
