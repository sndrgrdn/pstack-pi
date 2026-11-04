import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pstack = join(root, "upstream");
const harnessPath = join(root, "pi", "skills", "pstack-pi", "SKILL.md");
const potetoModePath = join(pstack, "skills", "poteto-mode", "SKILL.md");
const agentDir = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
const userSheetPath = join(agentDir, "pstack-models.md");
const defaultSheetPath = join(root, "pi", "models.md");
const STATE = "pstack-poteto-mode";

function harnessSection(): string {
  const harness = readFileSync(harnessPath, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "").replaceAll("`<pstack>`", `\`${pstack}\``);
  const sheetPath = existsSync(userSheetPath) ? userSheetPath : defaultSheetPath;
  return `${harness}\n## Model sheet (${sheetPath})\n\n${readFileSync(sheetPath, "utf8")}\n\`<pstack>\` is ${pstack}.`;
}

const toggleMessage = (on: boolean) =>
  on
    ? `/poteto on: poteto-mode is on from now until /poteto off. Before acting on each request, follow ${potetoModePath}. Read it in full if you have not read it in this session.`
    : "/poteto off: poteto-mode is off. Stop following poteto-mode unless a request asks for it.";

export default function (pi: ExtensionAPI) {
  let potetoMode = false;

  const restore = (ctx: ExtensionContext) => {
    potetoMode = false;
    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type === "custom_message" && entry.customType === STATE) potetoMode = Boolean((entry.details as { on?: boolean })?.on);
    }
    ctx.ui.setStatus("pstack", potetoMode ? "poteto" : undefined);
  };

  pi.on("session_start", async (_event, ctx) => restore(ctx));
  pi.on("session_tree", async (_event, ctx) => restore(ctx));

  pi.on("before_agent_start", async (event) => {
    event.systemPromptOptions.sections.pstack = harnessSection();
  });

  pi.registerCommand("poteto", {
    description: "Toggle poteto-mode for this session (/poteto [on|off])",
    getArgumentCompletions: (prefix: string) =>
      ["on", "off"].filter((value) => value.startsWith(prefix)).map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const arg = args.trim();
      potetoMode = arg === "on" ? true : arg === "off" ? false : !potetoMode;
      pi.sendMessage({ customType: STATE, content: toggleMessage(potetoMode), display: true, details: { on: potetoMode } });
      ctx.ui.setStatus("pstack", potetoMode ? "poteto" : undefined);
      ctx.ui.notify(`poteto-mode ${potetoMode ? "on" : "off"}`, "info");
    },
  });
}
