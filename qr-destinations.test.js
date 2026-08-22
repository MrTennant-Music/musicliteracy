"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const netlifyBase = "https://themusicliteracyhub.netlify.app/";

function source(file) {
  return fs.readFileSync(file, "utf8");
}

test("every website QR destination uses the Netlify version of the Hub", () => {
  const homepage = source("index.html");
  assert.ok(homepage.includes(`create-qr-code/?size=380x380&data=${netlifyBase}`));
  assert.ok(homepage.includes(`copyText(copyLinkBtn, "${netlifyBase}"`));

  assert.match(source("hub-shell.js"), /return `https:\/\/themusicliteracyhub\.netlify\.app\/\$\{fileName\}\$\{window\.location\.search\}`/);
  assert.match(source("barlines.html"), /const baseProfileUrl = `https:\/\/themusicliteracyhub\.netlify\.app\/barlines\.html\?level=/);
  assert.match(source("timesig.html"), /const baseProfileUrl = `https:\/\/themusicliteracyhub\.netlify\.app\/timesig\.html\?level=/);

  const worksheets = source("worksheet-generator.html");
  assert.equal((worksheets.match(/https:\/\/themusicliteracyhub\.netlify\.app(?:\/\$\{|\$\{)/g) || []).length, 3);
  assert.match(worksheets, /url\.hostname === "mrtennant-music\.github\.io"[\s\S]*?url\.pathname\.slice\("\/musicliteracy"\.length\)/);

  assert.match(source("interactive-exams/exam-ui.js"), /return `https:\/\/themusicliteracyhub\.netlify\.app\/interactive-exams\/exam\.html\?paper=/);
});
