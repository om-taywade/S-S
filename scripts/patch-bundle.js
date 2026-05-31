#!/usr/bin/env node
/**
 * Apply wedding-config.json to assets/js/app.js (for GitHub deploy).
 * Run: node scripts/patch-bundle.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const configPath = path.join(root, "wedding-config.json");
const basePath = path.join(root, "assets/js/app.base.js");
const outPath = path.join(root, "assets/js/app.js");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const base = fs.readFileSync(basePath, "utf8");

await import(pathToFileURL(path.join(root, "assets/js/apply-patch.js")).href);
const patched = globalThis.WeddingPatch.applyPatch(base, config);
fs.writeFileSync(outPath, patched);

const indexPath = path.join(root, "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf8");
const title = config.meta?.title || "Wedding Invitation";
indexHtml = indexHtml.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
fs.writeFileSync(indexPath, indexHtml);

console.log("Patched assets/js/app.js and updated index.html title.");
