#!/usr/bin/env node
// Start a new post:  node scripts/blog/new.js "Title of the note" tag1 tag2
// Creates scripts/blog/posts/<today>-<slug>.md with the front matter filled in and draft: true.
const fs = require("fs");
const path = require("path");
const [title, ...tags] = process.argv.slice(2);
if (!title) { console.error('Usage: node scripts/blog/new.js "Title of the note" tag1 tag2'); process.exit(1); }
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-$/, "");
const file = path.join(__dirname, "posts", `${today}-${slug}.md`);
if (fs.existsSync(file)) { console.error("Already exists: " + file); process.exit(1); }
fs.writeFileSync(file, `---
title: "${title.replace(/"/g, "'")}"
date: ${today}
tags: [${(tags.length ? tags : ["research"]).join(", ")}]
summary: One sentence that states the main point.
draft: true
---

Open with the answer in three or four sentences.

## First section

Text. Cite right after the claim ([Source, date](https://example.com)).

> [!take] What to take from it
> - First point.
`);
console.log("Created " + path.relative(process.cwd(), file) + "\nPreview: node scripts/blog/build.js --drafts   (remove the draft line to publish)");
