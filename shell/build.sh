#!/bin/bash
# Production build on the server.
# The live site keeps being served from `dist` the whole time: the new build goes to `dist-next`
# and replaces `dist` only when it succeeded (two renames, a few milliseconds). A failed build
# leaves the live site untouched.

cd "$(dirname "$0")/.." || exit 1

DIR=".git"
if [ -d "$DIR" ]; then
  echo "git repo exists ${DIR}..."
else
  git init
  git remote add origin git@github.com:ragentone/react-r-agency-v2.git
fi

git fetch --all
git reset --hard origin/main
git pull origin main --force

LIVE="dist"
NEXT="dist-next"
PREV="dist-prev"

rm -rf node_modules
rm -rf "$NEXT" "$PREV"
nvm use
if ! npm install; then
  echo "npm install failed – live site unchanged"
  exit 1
fi

if ! npm run build:prod -- --outDir "$NEXT" --emptyOutDir; then
  echo "build failed – live site unchanged"
  rm -rf "$NEXT"
  exit 1
fi

if [ ! -f "$NEXT/index.html" ]; then
  echo "build produced no index.html – live site unchanged"
  rm -rf "$NEXT"
  exit 1
fi

# Keep the chunks of the build that is live right now, so open tabs can still lazy-load their
# pages. Only the files of that one build (from its Vite manifest) → never more than two builds.
if [ -f "$LIVE/.vite/manifest.json" ]; then
  node -e '
    const fs = require("fs");
    const path = require("path");
    const [live, next] = process.argv.slice(1);
    const manifest = JSON.parse(fs.readFileSync(path.join(live, ".vite/manifest.json"), "utf8"));
    const files = new Set();
    Object.values(manifest).forEach(entry => {
      if (entry.file) files.add(entry.file);
      (entry.css || []).forEach(file => files.add(file));
      (entry.assets || []).forEach(file => files.add(file));
    });
    let kept = 0;
    files.forEach(file => {
      const from = path.join(live, file);
      const to = path.join(next, file);
      if (!fs.existsSync(from) || fs.existsSync(to)) return;
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      kept += 1;
    });
    console.log(`kept ${kept} files of the previous build for open tabs`);
  ' "$LIVE" "$NEXT" || echo "warning: could not keep the previous chunks"
fi

# Swap: live → prev, next → live.
if [ -d "$LIVE" ]; then
  mv "$LIVE" "$PREV"
fi
mv "$NEXT" "$LIVE"
rm -rf "$PREV"

echo "new build is live"
