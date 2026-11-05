import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const potetoModePath = join(root, "upstream", "skills", "poteto-mode", "SKILL.md");
const adapterPath = join(root, "skills", "pstack-pi", "SKILL.md");
const MODE = "poteto-mode";
const SECTION = "poteto_mode";

const instructions = `Poteto mode governs every request: follow ${potetoModePath}, mapped to Pi by ${adapterPath}. Read both in full once per session, before acting.`;

export default function (pi: ExtensionAPI) {
  let on = false;

  const showStatus = (ctx: ExtensionContext) => ctx.ui.setStatus(MODE, on ? "poteto" : undefined);

  const restore = (ctx: ExtensionContext) => {
    on = false;
    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type === "custom" && entry.customType === MODE) on = Boolean((entry.data as { on?: boolean })?.on);
    }
    showStatus(ctx);
  };

  pi.on("session_start", async (_event, ctx) => restore(ctx));
  pi.on("session_tree", async (_event, ctx) => restore(ctx));

  pi.on("before_agent_start", async (event) => {
    if (on) event.systemPromptOptions.sections[SECTION] = instructions;
    else delete event.systemPromptOptions.sections[SECTION];
  });

  pi.registerCommand("poteto-mode", {
    description: "Run one task under poteto-mode (/poteto-mode <task>), or keep it on (/poteto-mode on|off, bare to toggle)",
    getArgumentCompletions: (prefix: string) =>
      ["on", "off"].filter((value) => value.startsWith(prefix)).map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const arg = args.trim();
      if (arg && arg !== "on" && arg !== "off") {
        await ctx.waitForIdle();
        pi.sendUserMessage(`/skill:poteto-mode ${arg}`, { expandPromptTemplates: true });
        return;
      }
      on = arg === "on" ? true : arg === "off" ? false : !on;
      pi.appendEntry(MODE, { on });
      showStatus(ctx);
      ctx.ui.notify(`poteto-mode ${on ? "on" : "off"}`, "info");
    },
  });
}
