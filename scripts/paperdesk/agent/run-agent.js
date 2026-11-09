// Agent step: runs Claude Code headless (`claude -p`) with read + web tools only, on a packet built by code.
// Returns { status: "ok"|"missing"|"failed", reason, out, raw } — never throws.
// Auth: the CLI's own login (claude login / setup-token). ANTHROPIC_API_KEY from web/.env.local is passed ONLY
// when config.agent.allowApiKey = true (off by default: unattended spend is the trader's call).
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const { DATA, ROOT } = require("../lib/util.js");
const DIR = path.join(DATA, "agent"); fs.mkdirSync(DIR, { recursive: true });

function resolveCli() {
  if (process.env.PAPERDESK_CLAUDE && fs.existsSync(process.env.PAPERDESK_CLAUDE)) return process.env.PAPERDESK_CLAUDE;
  const base = path.join(process.env.APPDATA || "", "Claude", "claude-code");
  const found = [];
  try { for (const v of fs.readdirSync(base)) for (const h of fs.readdirSync(path.join(base, v))) { const f = path.join(base, v, h, "claude.exe"); if (fs.existsSync(f)) found.push({ v, f }); } } catch (e) {}
  const cmp = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let k = 0; k < 3; k++) if ((x[k] || 0) !== (y[k] || 0)) return (x[k] || 0) - (y[k] || 0); return 0; };
  found.sort((a, b) => cmp(a.v, b.v));
  if (found.length) return found[found.length - 1].f;
  const w = spawnSync("where", ["claude"], { encoding: "utf8", shell: true }); if (w.status === 0) return w.stdout.split(/\r?\n/)[0].trim();
  return null;
}

const SCHEMA = { type: "object", required: ["promptVersion", "decisions"], properties: {
  promptVersion: { type: "string" }, regimeNote: { type: "string" },
  decisions: { type: "array", items: { type: "object", required: ["cid", "take"], properties: { cid: { type: "string" }, take: { type: "boolean" }, grade: { enum: ["A+", "B"] }, thesis: { type: "string" }, stopPrice: { type: "number" }, reason: { type: "string" },
    epVerdict: { type: "object", properties: { story: { enum: ["real-change", "one-quarter-beat", "unclear"] }, notes: { type: "string" }, sources: { type: "array", items: { type: "string" } } } } } } },
  positionAdjustments: { type: "array", items: { type: "object", required: ["positionId", "newStop"], properties: { positionId: { type: "string" }, newStop: { type: "number" }, reason: { type: "string" } } } },
  proposals: { type: "array", items: { type: "object", properties: { idea: { type: "string" }, why: { type: "string" } } } } } };

// Validate the agent's answer against the packet. Returns list of errors.
function validate(out, packet, maxOrders) {
  const e = [];
  if (!out || typeof out !== "object") return ["output is not a JSON object"];
  if (!Array.isArray(out.decisions)) e.push("decisions must be an array");
  const C = new Map(packet.candidates.map(c => [c.cid, c])), syms = new Set(); let takes = 0;
  for (const d of out.decisions || []) {
    const c = C.get(d.cid); if (!c) { e.push(`unknown cid ${d.cid} (no invented orders)`); continue; }
    if (!d.take) continue; takes++;
    if (!["A+", "B"].includes(d.grade)) e.push(`${d.cid}: grade must be A+ or B`);
    if (typeof d.thesis !== "string" || d.thesis.length < 10 || d.thesis.length > 300) e.push(`${d.cid}: thesis 10-300 chars`);
    if (syms.has(c.sym)) e.push(`${d.cid}: second candidate on ${c.sym}`); syms.add(c.sym);
    if (d.stopPrice != null) {
      if (c.stopType !== "price") e.push(`${d.cid}: stopPrice only for fixed-price stops`);
      else if (c.dir === "long" ? !(d.stopPrice >= c.stop && d.stopPrice < c.triggerLevel) : !(d.stopPrice <= c.stop && d.stopPrice > c.triggerLevel)) e.push(`${d.cid}: stopPrice must tighten (between the planned stop and the trigger)`);
    }
    if (c.ep && !(d.epVerdict && d.epVerdict.story)) e.push(`${d.cid}: EP needs epVerdict`);
  }
  if (takes > maxOrders) e.push(`${takes} takes > max ${maxOrders}`);
  const P = new Map((packet.positions || []).map(p => [p.id, p]));
  for (const a of out.positionAdjustments || []) {
    const p = P.get(a.positionId); if (!p) { e.push(`unknown position ${a.positionId}`); continue; }
    if (!(typeof a.newStop === "number" && isFinite(a.newStop))) { e.push(`${a.positionId}: newStop must be a number`); continue; }
    if (p.dir === "long" ? !(a.newStop > p.stop && a.newStop < p.lastClose) : !(a.newStop < p.stop && a.newStop > p.lastClose)) e.push(`${a.positionId}: adjustment must tighten and stay on the right side of the last close`);
  }
  return e;
}

function extractJson(txt) {
  if (txt && typeof txt === "object") return txt;
  if (typeof txt !== "string") return null;
  try { return JSON.parse(txt); } catch (e) {}
  const m = txt.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) { try { return JSON.parse(m[1]); } catch (e) {} }
  const a = txt.indexOf("{"), b = txt.lastIndexOf("}"); if (a >= 0 && b > a) { try { return JSON.parse(txt.slice(a, b + 1)); } catch (e) {} }
  return null;
}

// Tools: web only. The packet is inlined in the prompt, so the agent needs no file access at all (red-team #9:
// with Read + WebFetch a prompt injection in a press release could read local secrets and send them out).
function runOnce(cli, prompt, cfg, env, timeoutMs) {
  // the prompt (with the inlined packet) goes on stdin: as an argument it overflows Windows' 32K command line (ENAMETOOLONG)
  const args = ["-p", "--output-format", "json", "--allowedTools", cfg.agent.tools, "--disallowedTools", "Read,Glob,Grep,Bash,Edit,Write,NotebookEdit,Task",
    "--json-schema", JSON.stringify(SCHEMA), "--no-session-persistence", "--max-budget-usd", String(cfg.agent.maxBudgetUsd || 3)];
  const r = spawnSync(cli, args, { cwd: DIR, input: prompt, encoding: "utf8", timeout: timeoutMs, env, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (r.error) return { err: `spawn: ${r.error.message}` };
  let j = null; try { j = JSON.parse(r.stdout); } catch (e) { return { err: `CLI output not JSON (exit ${r.status}): ${(r.stdout || r.stderr || "").slice(0, 300)}` }; }
  if (j.is_error) return { err: `CLI error: ${String(j.result || j.subtype || "").slice(0, 300)}`, notLoggedIn: /not logged in|\/login|authenticat/i.test(String(j.result || "")) };
  return { out: j.structured_output || extractJson(j.result), meta: { cost: j.total_cost_usd, turns: j.num_turns, ms: j.duration_ms } };
}

// deadlineMs = wall-clock time by which the agent must be done (the lock must not slip past 09:25 ET)
function runAgent(packet, cfg, deadlineMs = Date.now() + cfg.agent.timeoutSec * 1000) {
  const ver = cfg.agent.promptVersion;
  if (!cfg.agent.enabled) return { status: "missing", reason: "agent disabled in config", promptVersion: ver };
  const cli = resolveCli(); if (!cli) return { status: "missing", reason: "claude CLI not found", promptVersion: ver };
  const pf = path.join(DIR, `${packet.date}-packet.json`); fs.writeFileSync(pf, JSON.stringify(packet, null, 1));
  const tmpl = fs.readFileSync(path.join(ROOT, "agent", `prompt-${ver}.md`), "utf8");
  let prompt = tmpl.replace(/\{\{PACKET\}\}/g, () => JSON.stringify(packet)).replace(/\{\{MAX_ORDERS\}\}/g, String(cfg.agent.maxOrders));
  const env = { ...process.env };
  if (cfg.agent.allowApiKey) { try { const { parseEnvLocal, ENV_PATH } = require("../../review/env.js"); const k = parseEnvLocal(ENV_PATH).ANTHROPIC_API_KEY; if (k) env.ANTHROPIC_API_KEY = k; } catch (e) {} }
  else delete env.ANTHROPIC_API_KEY;
  const log = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    const left = Math.min(cfg.agent.timeoutSec * 1000, deadlineMs - Date.now());
    if (left < 60000) { log.push(`attempt ${attempt}: < 1 min left before the lock deadline — not started`); break; }
    const r = runOnce(cli, prompt, cfg, env, left);
    fs.writeFileSync(path.join(DIR, `${packet.date}-attempt${attempt}.json`), JSON.stringify(r, null, 1));
    if (r.err) { log.push(r.err); if (r.notLoggedIn) return { status: "missing", reason: "claude CLI not logged in (run `claude login` or `claude setup-token` once)", promptVersion: ver, log }; if (attempt === 2) break; continue; }
    const errs = validate(r.out, packet, cfg.agent.maxOrders);
    if (!errs.length) return { status: "ok", out: r.out, meta: r.meta, promptVersion: ver, attempts: attempt, log };
    log.push(`attempt ${attempt} rejected: ${errs.join("; ")}`);
    prompt += `\n\n## Your previous answer was rejected by the validator\n${errs.map(x => "- " + x).join("\n")}\nFix these and answer again with JSON only.`;
  }
  return { status: "failed", reason: log[log.length - 1] || "unknown", promptVersion: ver, log };
}
module.exports = { runAgent, validate, resolveCli, SCHEMA };
