import type { CompactionEntry, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { convertToLlm, serializeConversation } from "@earendil-works/pi-coding-agent";
import { uuidv7 } from "@earendil-works/pi-ai";
import { adapterPath, potetoModePath, potetoSkills, root } from "../lib/poteto-skills.ts";

const MODE = "poteto-mode";
const SECTION = "poteto_mode";

const instructions = () => `Poteto mode is on and governs every request. ${potetoSkills()}`;
const rereadReminder = (skillFiles: string[]) =>
  `The conversation was compacted, so the playbooks, principles and other skills you read are no longer in context. The poteto-mode and pstack-pi skills are still in your system prompt. Before acting, read these in full again:\n${(skillFiles.length ? skillFiles : ["the active playbook"]).map((path) => `- ${path}`).join("\n")}`;

const summaryPrompt = (conversation: string, previousSummary?: string, focus?: string) => `Write the summary that replaces the conversation below in the context of a lead agent running poteto mode. The most recent messages stay word for word, next to your summary.

Use these sections, in this order. Leave a section out when it has nothing to say.

## Working on
The user's goal, then the task in progress in specifics: the playbook and the step the lead is on, what is finished, and what was being done when the conversation was cut.

## Next steps
The steps that remain, in order, starting with the very next action.

## In flight
Subagents, branches, worktrees, pull requests and running processes, each with its identifier and state.

## Exact values
Paths, commands, IDs, URLs, numbers and error messages needed to continue.

Write one line per item. Leave out finished work that does not limit what comes next, and anything the lead can read back from the repository or a skill file.${previousSummary ? `\n\nThe previous summary below covers the conversation before this one. Carry forward what is still true.\n\n<previous-summary>\n${previousSummary}\n</previous-summary>` : ""}${focus ? `\n\nThe user asked this compaction to focus on: ${focus}` : ""}

Reply with the summary only, in Markdown.

<conversation>
${conversation}
</conversation>`;

const isSkillFile = (path: string) => path.startsWith(root) || path.endsWith("/SKILL.md");

const previousSkillFiles = (entry: CompactionEntry | undefined): string[] => {
  const files = (entry?.details as { skillFiles?: unknown } | undefined)?.skillFiles;
  return Array.isArray(files) ? files.map(String) : [];
};

type Brief = { agent?: unknown; task?: unknown; model?: unknown };
type SubagentInput = Brief & { action?: unknown; workflow?: unknown; args?: { tasks?: unknown } };

const missingModel = (input: SubagentInput, tasks: Brief[]) => {
  if (input.action || (input.workflow && input.workflow !== "parallel")) return false;
  return tasks.some((task) => task.agent && !task.model && !input.model);
};

const withSkillPath = (brief: Brief) => {
  if (brief.agent === "poteto-agent" && typeof brief.task === "string" && !brief.task.includes(potetoModePath)) {
    brief.task = `${brief.task}\n\nPoteto-mode skill: ${potetoModePath}`;
  }
};

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

  let skillFiles: string[] = [];

  pi.on("session_before_compact", async (event, ctx) => {
    if (!on) return;
    const { preparation, branchEntries, customInstructions, signal } = event;

    const previous = branchEntries.findLast((entry) => entry.type === "compaction");
    skillFiles = [
      ...new Set([...previousSkillFiles(previous), ...skillFiles, ...[...preparation.fileOps.read].filter(isSkillFile)]),
    ].filter((path) => path !== potetoModePath && path !== adapterPath);

    if (!ctx.model) return;

    const conversation = serializeConversation(
      convertToLlm([...preparation.messagesToSummarize, ...preparation.turnPrefixMessages]),
    );

    try {
      const response = await ctx.modelRegistry.complete(
        ctx.model,
        {
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: summaryPrompt(conversation, preparation.previousSummary, customInstructions) }],
              timestamp: Date.now(),
            },
          ],
        },
        { maxTokens: 8192, signal, cacheRetention: "none", sessionId: uuidv7() },
      );

      const summary = response.content
        .flatMap((part) => (part.type === "text" ? [part.text] : []))
        .join("\n")
        .trim();

      if (!summary) return;

      return {
        compaction: {
          summary,
          firstKeptEntryId: preparation.firstKeptEntryId,
          tokensBefore: preparation.tokensBefore,
          usage: response.usage,
          details: { skillFiles },
        },
      };
    } catch (error) {
      if (!signal.aborted)
        ctx.ui.notify(`poteto compaction failed, using Pi's: ${error instanceof Error ? error.message : error}`, "warning");
      return;
    }
  });

  pi.on("session_compact", async () => {
    if (on)
      pi.sendMessage(
        { customType: MODE, content: rereadReminder(skillFiles), display: false },
        { deliverAs: "steer" },
      );
  });

  pi.on("before_agent_start", async (event) => {
    if (on) event.systemPromptOptions.sections[SECTION] = instructions();
    else delete event.systemPromptOptions.sections[SECTION];
  });

  pi.on("tool_call", async (event) => {
    if (event.toolName !== "subagent") return;
    const input = event.input as SubagentInput;
    const tasks: Brief[] = Array.isArray(input.args?.tasks) ? input.args.tasks : [input];

    if (on && missingModel(input, tasks)) {
      return {
        block: true,
        reason: `Pass a model on every spawn, as "<provider>/<id>:<effort>" from the role's line in the model sheet. The Models section of ${adapterPath} says where the sheet is. For a role set to inherit-parent, pass your own model.`,
      };
    }

    tasks.forEach(withSkillPath);
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
