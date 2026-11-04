#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPOSITORY = "https://github.com/cursor/plugins.git";
const UPSTREAM_PATH = "pstack";
const EXCLUDED = [
  "automations",
  "skills/make-bot-ui",
  "skills/poteto-help",
  "skills/poteto-mode/playbooks/autopilot-full.md",
  "skills/poteto-mode/playbooks/autopilot-stack.md",
  "skills/poteto-mode/playbooks/shipping.md",
];
const CURSOR_TERMS = /\.cursor\/|agent-transcripts|AskQuestion|subagent_type|\bTask\b|cloud agent|Graphite|Bugbot|cursor-team-kit|create-skill|grok-|composer-/;

const root = resolve(import.meta.dirname, "..");
const upstreamDir = join(root, "upstream");
const agentsDir = join(root, "agents");
const lockPath = join(root, "upstream.lock.json");
const ref = process.argv[2] ?? "main";

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const checkout = mkdtempSync(join(tmpdir(), "pstack-sync-"));
try {
  git(["clone", "--quiet", "--depth", "1", "--filter=blob:none", "--sparse", "--branch", ref, REPOSITORY, checkout]);
  git(["sparse-checkout", "set", UPSTREAM_PATH], checkout);
  const commit = git(["rev-parse", "HEAD"], checkout);

  rmSync(upstreamDir, { recursive: true, force: true });
  cpSync(join(checkout, UPSTREAM_PATH), upstreamDir, { recursive: true });
  for (const path of EXCLUDED) rmSync(join(upstreamDir, path), { recursive: true, force: true });

  rmSync(agentsDir, { recursive: true, force: true });
  mkdirSync(agentsDir);
  for (const file of readdirSync(join(upstreamDir, "agents"))) {
    if (!file.endsWith(".md")) continue;
    writeFileSync(join(agentsDir, file), piAgent(readFileSync(join(upstreamDir, "agents", file), "utf8")));
  }

  writeFileSync(lockPath, JSON.stringify({ repository: REPOSITORY, ref, path: UPSTREAM_PATH, commit, excluded: EXCLUDED }, null, 2) + "\n");
  console.log(`Synced ${UPSTREAM_PATH} @ ${commit.slice(0, 12)}`);
} finally {
  rmSync(checkout, { recursive: true, force: true });
}

console.log(git(["status", "--short", "--", "upstream", "agents", "upstream.lock.json"], root) || "No changes.");

const added = git(["diff", "--unified=0", "--", "upstream"], root)
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++") && CURSOR_TERMS.test(line));
if (added.length) {
  console.log(`\nNew lines with Cursor terms; check pi/skills/pstack-pi/SKILL.md covers them:`);
  for (const line of added) console.log(`  ${line.slice(0, 160)}`);
}

function piAgent(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("Upstream agent has no frontmatter");
  const lines = match[1].split("\n");
  const kept = lines.filter((line) => !line.startsWith("is_background:"));
  const pi = ["async: true", "inheritProjectContext: true"];
  return `---\n${[...kept, ...pi].join("\n")}\n---\n${text.slice(match[0].length)}`;
}
