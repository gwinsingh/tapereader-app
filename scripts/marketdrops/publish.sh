#!/usr/bin/env bash
# Market-drops study: copy the study's code and the built site into the deployment worktree (branch market-drops-study,
# which tracks origin/main) and show what changed. It does NOT commit or push; do that by hand after looking at the diff:
#   bash scripts/marketdrops/publish.sh
#   cd ~/tapereader-worktrees/marketdrops && git add -A scripts/marketdrops web/public/studies docs/trade-journal/market-drops-handoff.md \
#     && git commit -m "..." && git push origin market-drops-study:main
# The main checkout stays on its own branch; nothing there is staged, stashed or switched.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
WT="${WT:-$HOME/tapereader-worktrees/marketdrops}"
[ -d "$WT/.git" ] || [ -f "$WT/.git" ] || { echo "no worktree at $WT (git worktree add \"$WT\" -b market-drops-study origin/main)"; exit 1; }
git -C "$WT" pull --ff-only origin main
mkdir -p "$WT/scripts/marketdrops" "$WT/web/public/studies" "$WT/docs/trade-journal"
# code, fragments, events, research notes (not the downloaded data)
rm -rf "$WT/scripts/marketdrops"; mkdir -p "$WT/scripts/marketdrops"
( cd "$SRC/scripts/marketdrops" && tar cf - --exclude=.data . ) | ( cd "$WT/scripts/marketdrops" && tar xf - )
# the built site
rm -rf "$WT/web/public/studies/market-drops"; cp -r "$SRC/web/public/studies/market-drops" "$WT/web/public/studies/market-drops"
[ -f "$SRC/docs/trade-journal/market-drops-handoff.md" ] && cp "$SRC/docs/trade-journal/market-drops-handoff.md" "$WT/docs/trade-journal/"
grep -q "scripts/marketdrops/.data/" "$WT/.gitignore" || printf '\n# Market-drops study: downloaded public data and computed results (rebuilt by scripts/marketdrops/run.js)\nscripts/marketdrops/.data/\n' >> "$WT/.gitignore"
git -C "$WT" status --short | sed -n '1,25p'
echo "files changed: $(git -C "$WT" status --short | wc -l) | site size: $(du -sh "$WT/web/public/studies/market-drops" | cut -f1)"
