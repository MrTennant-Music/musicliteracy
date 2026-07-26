"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Babel = require("@babel/standalone");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "dist");
const EXCLUDED_DIRECTORIES = new Set([".git", ".github", "dist", "exampapers", "node_modules"]);

function isExcluded(sourcePath) {
  const relativePath = path.relative(ROOT, sourcePath);
  if (!relativePath) return false;
  return relativePath.split(path.sep).some(part => EXCLUDED_DIRECTORIES.has(part));
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });
}

function relativeAssetPath(htmlPath) {
  const relativeHtmlPath = path.relative(OUTPUT, htmlPath);
  const assetPath = path.relative(path.dirname(relativeHtmlPath), "assets/site.css").split(path.sep).join("/");
  return assetPath.startsWith(".") ? assetPath : `./${assetPath}`;
}

function compileJsx(source, filename) {
  return Babel.transform(source, {
    filename,
    presets: ["react"],
    sourceMaps: false,
  }).code;
}

function compileBabelScripts(htmlPath) {
  let html = fs.readFileSync(htmlPath, "utf8");
  const cssPath = relativeAssetPath(htmlPath);

  html = html.replace(/<script\b[^>]*\bsrc=(['"])\s*[^'"]*(?:cdn\.tailwindcss\.com|vendor\/tailwind\/tailwind-3\.4\.17\.js)[^'"]*\1[^>]*>\s*<\/script>/gi, `<link rel="stylesheet" href="${cssPath}" />`);
  html = html.replace(/<script\b[^>]*\bsrc=(['"])\s*[^'"]*(?:@babel\/standalone|vendor\/babel\/babel\.min\.js)[^'"]*\1[^>]*>\s*<\/script>\s*/gi, "");

  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (fullTag, attributes, body) => {
    if (!/\btype=(['"])text\/babel\1/i.test(attributes)) return fullTag;

    const sourceMatch = attributes.match(/\bsrc=(['"])(.*?)\1/i);
    const cleanAttributes = attributes
      .replace(/\s+type=(['"])text\/babel\1/i, "")
      .replace(/\s+data-presets=(['"]).*?\1/i, "");

    if (!sourceMatch) {
      return `<script${cleanAttributes}>\n${compileJsx(body, path.relative(ROOT, htmlPath))}\n</script>`;
    }

    const sourceUrl = sourceMatch[2];
    const sourceFile = sourceUrl.split(/[?#]/)[0];
    const sourcePath = path.resolve(path.dirname(htmlPath), sourceFile);
    if (!fs.existsSync(sourcePath)) throw new Error(`Cannot compile JSX source: ${sourceUrl}`);

    const parsed = path.parse(sourcePath);
    const compiledPath = path.join(parsed.dir, `${parsed.name}.compiled.js`);
    fs.writeFileSync(compiledPath, `${compileJsx(fs.readFileSync(sourcePath, "utf8"), path.relative(ROOT, sourcePath))}\n`);
    const compiledUrl = `${sourceFile.slice(0, -parsed.ext.length)}.compiled.js`;
    return `<script${cleanAttributes.replace(sourceUrl, compiledUrl)}></script>`;
  });

  if (/type=(['"])text\/babel\1/i.test(html) || /(?:cdn\.tailwindcss\.com|@babel\/standalone)/i.test(html)) {
    throw new Error(`Production build still contains browser compilation code: ${path.relative(ROOT, htmlPath)}`);
  }
  fs.writeFileSync(htmlPath, html);
}

function copySource() {
  fs.rmSync(OUTPUT, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT, { recursive: true });
  for (const entry of fs.readdirSync(ROOT)) {
    if (EXCLUDED_DIRECTORIES.has(entry)) continue;
    fs.cpSync(path.join(ROOT, entry), path.join(OUTPUT, entry), {
      recursive: true,
      filter: sourcePath => !isExcluded(sourcePath),
    });
  }
  copyPublishedExamAssets();
}

function copyPublishedExamAssets() {
  const paperDirectory = path.join(ROOT, "interactive-exams", "papers");
  const publishedDirectories = new Set();

  for (const paperPath of listFiles(paperDirectory).filter(file => file.endsWith(".js"))) {
    const source = fs.readFileSync(paperPath, "utf8");
    for (const match of source.matchAll(/\.\.\/exampapers\/([^/"'`]+\/\d{4})\//g)) {
      publishedDirectories.add(match[1]);
    }
  }

  for (const directory of publishedDirectories) {
    fs.cpSync(path.join(ROOT, "exampapers", directory), path.join(OUTPUT, "exampapers", directory), { recursive: true });
  }
}

function buildTailwind() {
  const outputCss = path.join(OUTPUT, "assets", "site.css");
  fs.mkdirSync(path.dirname(outputCss), { recursive: true });
  const tailwindCli = require.resolve("tailwindcss/lib/cli.js");
  const result = spawnSync(process.execPath, [tailwindCli, "-c", "tailwind.config.js", "-i", "styles/production-tailwind.css", "-o", outputCss, "--minify"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error("Tailwind production build failed.");
}

function removeBrowserBuildTools() {
  fs.rmSync(path.join(OUTPUT, "vendor", "babel"), { recursive: true, force: true });
  fs.rmSync(path.join(OUTPUT, "vendor", "tailwind"), { recursive: true, force: true });
}

function main() {
  copySource();
  for (const htmlPath of listFiles(OUTPUT).filter(file => file.endsWith(".html"))) compileBabelScripts(htmlPath);
  buildTailwind();
  removeBrowserBuildTools();
  fs.writeFileSync(path.join(OUTPUT, ".nojekyll"), "");
  console.log(`Production site built in ${path.relative(ROOT, OUTPUT)}.`);
}

main();
