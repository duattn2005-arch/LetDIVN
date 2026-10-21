#!/bin/sh
# Production build without downtime: build into dist-next/, then swap it in.
# A plain `vite build` empties dist/ first, and for the ~30 s it takes the
# running server has no index.html to serve (visitors get a 404).
set -e
cd "$(dirname "$0")/.."
rm -rf dist-next dist-old
npx vite build --outDir dist-next --emptyOutDir
if [ -d dist ]; then mv dist dist-old; fi
mv dist-next dist
rm -rf dist-old
