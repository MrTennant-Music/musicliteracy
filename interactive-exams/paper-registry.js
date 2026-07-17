(function (root) {
  "use strict";

  const papers = {
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
      dataFile: "papers/national5-2015.js?v=20260717-source-audit",
    },
  };

  root.InteractiveExamPaperRegistry = papers;

  if (typeof document !== "undefined") {
    const requestedId = new URLSearchParams(root.location.search).get("paper") || "national5-2014";
    const entry = papers[requestedId];
    if (entry) document.write(`<script src="${entry.dataFile}"><\/script>`);
  }

  if (typeof module !== "undefined" && module.exports) module.exports = papers;
})(typeof window !== "undefined" ? window : globalThis);
