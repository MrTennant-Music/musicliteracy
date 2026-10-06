"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Babel = require("@babel/standalone");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "dist", "classroom-pilot");
const files = ["keyboard-classroom.html", "keyboard-notes.html", "keyboard-notes.js", "desktop-layout.css", "desktop-layout.js", "hub-ui.css", "hub-input.js", "hub-audio.js", "hub-progress.js", "hub-achievements.js", "hub-shell.js", "hub-menu.js", "bravura-symbols.js", "footer.js", "Bravura.otf"];
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const file of [...files, ...fs.readdirSync(root).filter(file => /\.(svg|woff2?|ttf)$/.test(file))]) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
for (const file of files.filter(file => file.endsWith(".html"))) {
  let html = fs.readFileSync(path.join(out, file), "utf8");
  html = html.replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/, '<link rel="stylesheet" href="./site.css" />');
  html = html.replace(/<script[^>]*src="https:\/\/unpkg.com\/@babel\/standalone[^>]*><\/script>/, "");
  html = html.replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g, (_, code) => `<script>${Babel.transform(code, { presets: ["react"] }).code}</script>`);
  fs.writeFileSync(path.join(out, file), html);
}
fs.copyFileSync(path.join(out, "keyboard-classroom.html"), path.join(out, "index.html"));
const css = spawnSync(process.execPath, [require.resolve("tailwindcss/lib/cli.js"), "-c", "tailwind.config.js", "-i", "styles/production-tailwind.css", "-o", path.join(out, "site.css"), "--minify"], { cwd: root, stdio: "inherit" });
if (css.status !== 0) throw new Error("Pilot stylesheet build failed.");
console.log("Keyboard-only pilot built; no database credentials or server files are published.");
