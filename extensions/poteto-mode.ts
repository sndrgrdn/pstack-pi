import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const potetoModePath = join(root, "upstream", "skills", "poteto-mode", "SKILL.md");
const adapterPath = join(root, "skills", "pstack-pi", "SKILL.md");
const MODE = "poteto-mode";

const modeMessage = (on: boolean) =>
  on
    ? `/poteto on: poteto-mode is on from now until /poteto off. Before acting on each request, follow ${potetoModePath}, mapped to Pi by ${adapterPath}. Read both in full if you have not read them in this session.`
    : "/poteto off: poteto-mode is off. Stop following poteto-mode unless a request asks for it.";

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

  pi.registerCommand("poteto", {
    description: "Toggle poteto-mode for this session (/poteto [on|off])",
    getArgumentCompletions: (prefix: string) =>
      ["on", "off"].filter((value) => value.startsWith(prefix)).map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const arg = args.trim();
      on = arg === "on" ? true : arg === "off" ? false : !on;
      pi.sendMessage({ customType: MODE, content: modeMessage(on), display: true, details: { on } });
      showStatus(ctx);
      ctx.ui.notify(`poteto-mode ${on ? "on" : "off"}`, "info");
    },
  });
}
