"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const netlifyBase = "https://themusicliteracyhub.netlify.app/";
const oldGithubBase = "https://mrtennant-music.github.io/musicliteracy/";
const ignoredDirectories = new Set([".git", "dist", "node_modules", "tests", "vendor"]);

function source(file) {
  return fs.readFileSync(file, "utf8");
}

function websiteSourceFiles(directory = ".") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith(".") || ignoredDirectories.has(entry.name)) return [];
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return websiteSourceFiles(file);
    if (!entry.isFile() || entry.name.endsWith(".test.js") || !/\.(?:css|html|js)$/.test(entry.name)) return [];
    return [file];
  });
}

test("every website QR destination uses the Netlify version of the Hub", () => {
  const homepage = source("index.html");
  assert.ok(homepage.includes(`create-qr-code/?size=380x380&data=${netlifyBase}`));
  assert.ok(homepage.includes(`copyText(copyLinkBtn, "${netlifyBase}"`));

  assert.ok(source("footer.js").includes(`<a href="${netlifyBase}" aria-label="Return to Music Literacy Hub home page">`));

  assert.match(source("hub-shell.js"), /return `https:\/\/themusicliteracyhub\.netlify\.app\/\$\{fileName\}\$\{window\.location\.search\}`/);
  assert.match(source("barlines.html"), /const baseProfileUrl = `https:\/\/themusicliteracyhub\.netlify\.app\/barlines\.html\?level=/);
  assert.match(source("timesig.html"), /const baseProfileUrl = `https:\/\/themusicliteracyhub\.netlify\.app\/timesig\.html\?level=/);

  const worksheets = source("worksheet-generator.html");
  assert.equal((worksheets.match(/https:\/\/themusicliteracyhub\.netlify\.app(?:\/\$\{|\$\{)/g) || []).length, 4);
  assert.match(worksheets, /url\.hostname === "mrtennant-music\.github\.io"[\s\S]*?url\.pathname\.slice\("\/musicliteracy"\.length\)/);

  assert.match(source("interactive-exams/exam-ui.js"), /return `https:\/\/themusicliteracyhub\.netlify\.app\/interactive-exams\/exam\.html\?paper=/);
});

test("published website source contains no outgoing links to the old GitHub Pages version", () => {
  const oldHostReferences = websiteSourceFiles().filter(file => source(file).includes(oldGithubBase));
  assert.deepEqual(oldHostReferences, []);
});

test("every literal Netlify asset referenced by website source exists locally", () => {
  const missingAssets = new Set();
  websiteSourceFiles().forEach(file => {
    const urls = source(file).match(/https:\/\/themusicliteracyhub\.netlify\.app\/[^\s"'`)]+/g) || [];
    urls.filter(url => !url.includes("${")).forEach(url => {
      const pathname = new URL(url).pathname;
      if (path.extname(pathname) && !fs.existsSync(path.join(".", pathname))) missingAssets.add(pathname);
    });
  });
  assert.deepEqual([...missingAssets].sort(), []);
});
