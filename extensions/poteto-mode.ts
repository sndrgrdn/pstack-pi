import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const potetoModePath = join(root, "upstream", "skills", "poteto-mode", "SKILL.md");
const adapterPath = join(root, "skills", "pstack-pi", "SKILL.md");
const MODE = "poteto-mode";

const modeMessage = (on: boolean) =>
  on
    ? `/poteto-mode on: poteto-mode is on from now until /poteto-mode off. Before acting on each request, follow ${potetoModePath}, mapped to Pi by ${adapterPath}. Read both in full if you have not read them in this session.`
    : "/poteto-mode off: poteto-mode is off. Stop following poteto-mode unless a request asks for it.";

export default function (pi: ExtensionAPI) {
  let on = false;

  const showStatus = (ctx: ExtensionContext) => ctx.ui.setStatus(MODE, on ? "poteto" : undefined);

  const restore = (ctx: ExtensionContext) => {
    on = false;
    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type === "custom_message" && entry.customType === MODE) on = Boolean((entry.details as { on?: boolean })?.on);
    }
    showStatus(ctx);
  };

  pi.on("session_start", async (_event, ctx) => restore(ctx));
  pi.on("session_tree", async (_event, ctx) => restore(ctx));

  pi.registerCommand("poteto-mode", {
    description: "Run one task under poteto-mode (/poteto-mode <task>), or keep it on (/poteto-mode on|off)",
    getArgumentCompletions: (prefix: string) =>
      ["on", "off"].filter((value) => value.startsWith(prefix)).map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const arg = args.trim();
      if (arg && arg !== "on" && arg !== "off") {
        pi.sendUserMessage(`/skill:poteto-mode ${arg}`, { expandPromptTemplates: true, ...(ctx.isIdle() ? {} : { deliverAs: "followUp" }) });
        return;
      }
      on = arg === "on" ? true : arg === "off" ? false : !on;
      pi.sendMessage({ customType: MODE, content: modeMessage(on), display: true, details: { on } });
      showStatus(ctx);
      ctx.ui.notify(`poteto-mode ${on ? "on" : "off"}`, "info");
    },
  });
}
