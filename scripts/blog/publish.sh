#!/usr/bin/env bash
# Blog: copy the generator, the posts and the built pages into the deployment worktree (branch blog, which tracks
# origin/main) and show what changed. It does NOT commit or push; do that by hand after looking at the diff:
#   node scripts/blog/build.js && bash scripts/blog/publish.sh
#   cd ~/tapereader-worktrees/blog && git add -A scripts/blog web/public/blog web/lib/blog-latest.json \
#     && git commit -m "Blog: <what changed>" && git push origin blog:main
# The main checkout stays on its own branch; nothing there is staged, stashed or switched.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
WT="${WT:-$HOME/tapereader-worktrees/blog}"
[ -d "$WT/.git" ] || [ -f "$WT/.git" ] || { echo "no worktree at $WT (git worktree add \"$WT\" -b blog origin/main)"; exit 1; }
git -C "$WT" pull --ff-only origin main
# generator, posts, research notes
rm -rf "$WT/scripts/blog"; mkdir -p "$WT/scripts/blog"
( cd "$SRC/scripts/blog" && tar cf - . ) | ( cd "$WT/scripts/blog" && tar xf - )
# built pages and the file the home page reads
rm -rf "$WT/web/public/blog"; cp -r "$SRC/web/public/blog" "$WT/web/public/blog"
cp "$SRC/web/lib/blog-latest.json" "$WT/web/lib/blog-latest.json"
# studies that are linked from the blog and live outside it (copied only when asked: bash publish.sh --studies)
if [ "${1:-}" = "--studies" ]; then
  mkdir -p "$WT/web/public/studies"
  rm -rf "$WT/web/public/studies/ai-buildout-atlas"; cp -r "$SRC/web/public/studies/ai-buildout-atlas" "$WT/web/public/studies/ai-buildout-atlas"
fi
git -C "$WT" status --short | sed -n '1,30p'
echo "files changed: $(git -C "$WT" status --short | wc -l) | blog size: $(du -sh "$WT/web/public/blog" | cut -f1)"
