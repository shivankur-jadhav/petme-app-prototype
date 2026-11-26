// Build the web version of PetMe for the claude.ai artifact (the browser test link in CLAUDE.md).
// Usage: node scripts/build-artifact.mjs <output-folder>
// Writes <output-folder>/petme.html (the page) and <output-folder>/site/ (code, fonts, photos),
// plus <output-folder>/files.json: the `files` map for the Artifact publish call, with `null` for
// any code file from the previous build so it is removed.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] || "artifact-build");
const web = path.join(out, "web");
const site = path.join(out, "site");
fs.rmSync(web, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir "${web}"`, { stdio: "inherit", env: { ...process.env, CI: "1" } });

// Code from the last build, so the publish can remove it.
const oldApp = fs.existsSync(path.join(site, "app")) ? fs.readdirSync(path.join(site, "app")) : [];
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(site, "app"), { recursive: true });

// The artifact host reserves names starting with "_", and serves files next to the page rather
// than at the site root, so move the code to app/ and make every asset path relative.
const jsDir = path.join(web, "_expo/static/js/web");
const js = fs.readdirSync(jsDir).find((f) => f.endsWith(".js"));
const code = fs.readFileSync(path.join(jsDir, js), "utf8").replaceAll('"/assets/', '"./assets/');
fs.writeFileSync(path.join(site, "app", js), code);

// Only the font weights the app loads (see useFonts in App.tsx); the rest are never requested.
const FONTS = ["Inter_400Regular", "Inter_500Medium", "Inter_600SemiBold", "SpaceGrotesk_500Medium", "SpaceGrotesk_600SemiBold", "SpaceGrotesk_700Bold"];
const files = { [`app/${js}`]: `app/${js}` };
for (const f of oldApp) if (f !== js) files[`app/${f}`] = null;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
for (const abs of walk(path.join(web, "assets"))) {
  const rel = path.relative(web, abs).split(path.sep).join("/");
  if (rel.endsWith(".ttf") && !FONTS.some((n) => rel.includes(n + "."))) continue;
  fs.mkdirSync(path.dirname(path.join(site, rel)), { recursive: true });
  fs.copyFileSync(abs, path.join(site, rel));
  files[rel] = rel.endsWith(".ttf") ? { from: rel, contentType: "font/ttf" } : rel;
}

fs.writeFileSync(path.join(out, "petme.html"), `<title>PetMe</title>
<style>
  /* PetMe app, built for the web from the Expo project. The app paints its own light/dark UI; this only sizes the root and matches its canvas. */
  :root { --bg: #EEF4F9; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #061426; color-scheme: dark; } }
  :root[data-theme="dark"] { --bg: #061426; color-scheme: dark; }
  html, body { height: 100%; }
  body { overflow: hidden; background: var(--bg); }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<noscript>PetMe needs JavaScript to run.</noscript>
<div id="root"></div>
<script src="app/${js}" defer></script>
`);
fs.writeFileSync(path.join(out, "files.json"), JSON.stringify(files, null, 1));
console.log(`Built ${js}: ${Object.values(files).filter(Boolean).length} files to publish from ${site}`);
