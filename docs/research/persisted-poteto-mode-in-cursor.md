# How "persisted poteto-mode" works in Cursor

Researched 2026. Evidence labels: **Finding** means a source directly says it. **Inference** means I reasoned from sources that do not say it outright.

## Direct answer

"Persisted poteto-mode" is not one named feature, and pstack stores nothing to make it persist. The only thing that keeps poteto-mode on across turns is a **Cursor feature called a Custom Mode**. The user switches it on by hand: pick `/poteto-mode` from the `/` menu and press Option+Enter (Mac) or Alt+Enter (Windows) instead of Enter. Cursor then keeps the skill's text in context on every turn until the user exits the mode. Cursor writes and reads that state, not pstack. The pstack files only describe how to switch it on. Two other pstack mechanisms are easy to confuse with it, but they do not persist the mode: the always-applied rule written by `/setup-pstack` (it only stores model choices), and the instruction that every spawned `poteto-agent` reads the skill file itself.

Cursor's docs do not say what happens to a Custom Mode when the context is summarised, when a new chat starts, or in subagents. Those three parts are unanswered (see "Unanswered questions").

## 1. What the pstack files say

**Findings**

- The skill is marked `disable-model-invocation: true`, so the agent never loads it on its own. It only loads when the user types `/poteto-mode`. It also has `icon: crown` and `color: yellow`, which are the fields Cursor uses to style a Custom Mode badge. [upstream/skills/poteto-mode/SKILL.md:1-7](../../upstream/skills/poteto-mode/SKILL.md)
- The README says to keep poteto-mode on by pressing option+enter or alt+enter, that this makes it a Custom Mode, that it "stays in context every turn until you exit the mode", and that plain Enter "attaches it to one message only". [upstream/README.md:106](../../upstream/README.md)
- The setup guide says the same: "Plain Enter attaches the skill to one message, and it fades as the chat moves on." [upstream/docs/guide/01-setup.md:64](../../upstream/docs/guide/01-setup.md)
- The routing guide repeats it: "a Custom Mode keeps `/poteto-mode` in context on every turn". [upstream/docs/guide/02-poteto-mode.md:93](../../upstream/docs/guide/02-poteto-mode.md)
- The `/poteto-help` skill is told to mention "once that a Custom Mode keeps it on" when the user asks for work without using the mode. [upstream/skills/poteto-help/SKILL.md:13](../../upstream/skills/poteto-help/SKILL.md)
- I searched all of upstream for `alwaysApply`, `sessionStart`, `hooks.json`, `preCompact` and `.cursor/rules`. The only hits are the model rule (section 4) and one table in the Claude Code guide. pstack ships no hook, no rule that holds poteto-mode, and no stored flag. The plugin manifest lists only `skills` and `agents`. [upstream/.cursor-plugin/plugin.json:29-30](../../upstream/.cursor-plugin/plugin.json)
- The skill file never says how to exit the mode, and never mentions summarising or compaction as a risk to the mode itself. It does list "imminent context compaction" as a trigger for the Pause safely playbook, which writes a resume note to a file such as `/tmp/<slug>-resume.md`. [upstream/skills/poteto-mode/SKILL.md:147](../../upstream/skills/poteto-mode/SKILL.md), [upstream/skills/poteto-mode/playbooks/pause-safely.md:3-8](../../upstream/skills/poteto-mode/playbooks/pause-safely.md)

## 2. What Cursor's docs say about Custom Modes

**Findings** (official pages, fetched 2026)

- "Pressing Enter attaches the skill to one message, and it fades as the conversation moves on." and "Pick the skill from the `/` menu and press Option+Enter (Mac) or Alt+Enter (Windows) instead. You can also select **Use as Mode** from the skill entry. Inside a mode, the skill stays in context on every turn, even as the agent works for hours, until you exit the mode." https://cursor.com/docs/agent/prompting.md (section "Custom Modes")
- Custom Modes are available in the Agents Window and the CLI. Same page. The IDE chat is not listed.
- "Any skill with a valid frontmatter block can back a mode", and an active mode shows a badge in the chat input. https://cursor.com/docs/skills.md (section "Using a skill as a Custom Mode")
- The `icon` and `color` fields only style the badge. https://cursor.com/docs/skills.md (frontmatter table)
- The CLI page says the mode "stays active until you exit it". https://cursor.com/docs/cli/using.md (section "Custom Modes")
- `disable-model-invocation: true` means the skill is included only when the user types `/skill-name`. https://cursor.com/docs/skills.md (section "Disabling automatic invocation")

**What this means (inference):** the stored state is Cursor's own per-chat "active mode" setting. Cursor, not pstack, writes it when the user presses Option+Enter or Alt+Enter, and Cursor reads it when it builds each prompt. Where Cursor keeps it is not documented.

## 3. Each part of the question

| Question | Answer | Status |
| --- | --- | --- |
| Across turns | The Custom Mode keeps the skill in context every turn. | Finding (prompting.md, above) |
| Across compaction | Cursor says only that older conversation is compressed into a summary. It does not say whether a mode's skill text is re-injected or summarised. | Not documented. Inference: since the docs promise it stays "on every turn", it is most likely re-sent, not summarised, but I could not confirm that. |
| New chat or session | Nothing documented says a mode carries over. The docs describe a mode as lasting "the whole session". The user has to start it again. | Finding for "whole session" (skills.md). Inference for "does not carry over". |
| Subagents | Subagents "start with a clean context" and do not see earlier conversation, so a parent's mode is not passed to them by Cursor. pstack handles this itself, see section 5. | Finding (subagents.md) plus inference that the mode is not inherited. Cursor does not state it for modes. |
| What is stored | An "active mode" setting in Cursor. pstack stores nothing. | Inference |
| Who writes it | Cursor, when the user presses Option+Enter, Alt+Enter, or Use as Mode. | Finding |
| When read | On every turn. | Finding |
| Switch off | "Exit the mode". The docs give no button or key. The badge in the chat input is the visible sign. | Finding that you exit. The method is not documented. |

Context compaction in Cursor: "When the window gets close to full, Cursor compresses older parts of the conversation into a summary." The context breakdown lists "Skills", "Rules" and "Summarized conversation" as separate categories. https://cursor.com/docs/agent/prompting.md (section "Context usage"). It does not list the Custom Mode skill as its own category.

## 4. The always-applied rule is a different thing

`/setup-pstack` writes `~/.cursor/rules/pstack-models.mdc` with `alwaysApply: true`. The file holds a budget line and one model name per role. It holds no poteto-mode text. [upstream/skills/setup-pstack/SKILL.md:8, 39-44](../../upstream/skills/setup-pstack/SKILL.md)

**Findings**

- Cursor says a rule with `alwaysApply: true` is "Always included", and "Apply to every chat session". https://cursor.com/docs/rules.md (sections "Rule anatomy", and the `alwaysApply` table)
- The setup skill says the rule "applies to new sessions", and the guide says to "start a new chat" after setup. [upstream/skills/setup-pstack/SKILL.md:220](../../upstream/skills/setup-pstack/SKILL.md), [upstream/docs/guide/01-setup.md:43](../../upstream/docs/guide/01-setup.md)
- Skills read that rule to choose models, and fall back to defaults when it is missing. [upstream/skills/poteto-mode/SKILL.md:96](../../upstream/skills/poteto-mode/SKILL.md), [upstream/skills/swarm/SKILL.md:22](../../upstream/skills/swarm/SKILL.md)
- It is switched off by deleting a role line or the file. [upstream/docs/guide/01-setup.md:29](../../upstream/docs/guide/01-setup.md)

So this rule does persist across chats, but it only persists model choices. It does not turn poteto-mode on.

## 5. Subagents

**Findings**

- The skill says to use `subagent_type: "poteto-agent"` for any subagent spawned inside a playbook step, and to put the skill file's absolute path in every `poteto-agent` prompt. [upstream/skills/poteto-mode/SKILL.md:11, 94](../../upstream/skills/poteto-mode/SKILL.md)
- `poteto-agent` is a plugin subagent whose body tells it to read the whole poteto-mode `SKILL.md` first. If the parent gave no path, it searches `~/.cursor/plugins/` for `skills/poteto-mode/SKILL.md`, and stops and tells the parent if it finds none. [upstream/agents/poteto-agent.md:3, 9](../../upstream/agents/poteto-agent.md)
- The description says it is for delegates, "not as the runner for `/poteto-mode` itself". [upstream/agents/poteto-agent.md:3](../../upstream/agents/poteto-agent.md)
- Cursor says subagents have their own context window, start clean, and rely on the parent to put needed information in the prompt. https://cursor.com/docs/subagents.md ("How subagents work")
- Cursor plugins can package agents from an `agents/` folder. https://cursor.com/docs/reference/plugins.md ("Plugin structure", component table)

So in subagents, poteto-mode is "persisted" by a plain instruction that makes each subagent read the file at start. It is not carried by Cursor's mode feature. It lasts only as long as that subagent's own context keeps the file in view. Nothing in the files re-reads it after that subagent's own compaction (inference from absence).

Note: routed skills (`how`, `why`, `interrogate`, `reflect`, `swarm`) set their own subagent type and are told not to be overridden to `poteto-agent`. [upstream/skills/poteto-mode/SKILL.md:94](../../upstream/skills/poteto-mode/SKILL.md)

## 6. What does NOT persist

- **Findings.** A plain Enter attach lasts one message and "fades as the chat moves on". [upstream/README.md:106](../../upstream/README.md)
- **Finding.** Per-turn re-reading of the playbook is not automatic. The skill asks only that the todo list start with the playbook's steps, so the plan lives in the chat. [upstream/skills/poteto-mode/SKILL.md:124](../../upstream/skills/poteto-mode/SKILL.md)
- **Finding.** Principle skills: poteto-mode only lets the agent cite principles "whose leaf SKILL.md you read this session". [upstream/skills/poteto-mode/SKILL.md:15](../../upstream/skills/poteto-mode/SKILL.md) Leaf skills, playbooks and principles are ordinary reads, so after a summary they may be lost. **Inference**, because Cursor does not say how they are kept in summaries.
- **Not used.** No hooks (`sessionStart`, `preCompact`) and no always-on rule hold poteto-mode. Cursor offers these hooks (https://cursor.com/docs/hooks.md), but pstack does not use them. I found no Cursor "memories" feature in the pages I read, and pstack does not mention one.

## 7. The Pi adapter, briefly

Pi has no Custom Mode, so the adapter builds its own persistence. This is the reason the question matters here.

| Cursor | Pi adapter |
| --- | --- |
| Custom Mode: Cursor stores the active mode and keeps the skill in context. | `/poteto-mode on` and `off` toggle a flag. The flag is saved as a session entry with `pi.appendEntry("poteto-mode", { on })` and restored on `session_start` and `session_tree` by scanning the session branch. [extensions/poteto-mode.ts:63-76, 161-177](../../extensions/poteto-mode.ts) |
| Skill text kept in context each turn. | While on, a system prompt section holds the full text of both skill files, so it stays in context every turn and survives compaction. The section is removed when off. (Changed after this research; before, the section only told the agent to read the files.) [extensions/poteto-mode.ts](../../extensions/poteto-mode.ts) |
| Summary made by Cursor with unknown handling of the mode. | When on, the extension writes its own summary from a work-focused prompt and records which skill files were read. After compaction it sends a hidden steering message listing the playbooks and other skill files to read again. If its summary call fails, Pi's default summary is used. [extensions/poteto-mode.ts:17-39, 80-139](../../extensions/poteto-mode.ts) |
| Plain Enter attaches to one message. | `/poteto-mode <task>` runs one task via `/skill:poteto-mode`. [skills/pstack-pi/SKILL.md:26-27](../../skills/pstack-pi/SKILL.md), [extensions/poteto-mode.ts:166-171](../../extensions/poteto-mode.ts) |
| `poteto-agent` told to read the skill. | Same agent body. A child-only extension puts the full text of both skill files in every `poteto-agent` system prompt, so the subagent does not depend on reading them. (Changed after this research.) The parent extension still appends `Poteto-mode skill: <path>` to each brief that lacks it, and blocks a spawn without a model while on. [child-extensions/poteto-agent.ts](../../child-extensions/poteto-agent.ts), [extensions/poteto-mode.ts](../../extensions/poteto-mode.ts), [agents/poteto-agent.md](../../agents/poteto-agent.md) |
| `pstack-models.mdc` always-applied rule. | `~/.pi/agent/pstack-models.md`. Pi never reads `.mdc`. [skills/pstack-pi/SKILL.md:58, 77](../../skills/pstack-pi/SKILL.md) |
| Exit the mode. | `/poteto-mode off`, or a bare `/poteto-mode` to toggle. |

Differences, all **findings from the code**: the Pi adapter is stronger than Cursor's documented behaviour on compaction (it names files to re-read), and it persists across a resumed Pi session because the flag lives in the session file. The adapter's compaction and system-prompt handling is its own design. It is not a copy of anything Cursor does.

## 8. Conflicting evidence, uncertainties, unanswered questions

- **Not in the docs I read:** compaction, new chats and subagents for Custom Modes. Cursor says a mode stays on "every turn" and "for the whole session". It never says what summarisation does to it. I have no source for the claim that the skill text is re-sent after a summary.
- **Exit method.** The docs say "until you exit" without naming the control. I could not check the UI.
- **Where Custom Mode availability stops.** The docs say Agents Window and CLI. Whether the plain IDE editor chat supports it is not stated. The upstream docs say the same thing. [upstream/docs/guide/01-setup.md:64](../../upstream/docs/guide/01-setup.md)
- **Small doc mismatch.** The CLI page says Option+Enter "invokes it as a Custom Mode", and the skills page says the mode is "in context for the whole session". These agree in effect. I found no conflict in substance.
- **`~/.cursor/rules/` user path.** The rules docs I read describe project rules in `.cursor/rules` and User Rules set in Customize → Rules. I did not find the global file path `~/.cursor/rules/*.mdc` in https://cursor.com/docs/rules.md. The pstack plugin relies on it, and the upstream Claude Code guide also mentions it. So whether Cursor loads that path is supported only by pstack's own docs. [upstream/docs/harness/claude-code.md:37](../../upstream/docs/harness/claude-code.md)
- **Plugin manifest.** The vendored `upstream/plugin.json` is a different file from the upstream Cursor one and uses the Agent Plugins schema, with no `skills` or `agents` fields. The real Cursor manifest, `.cursor-plugin/plugin.json`, is vendored too. I relied on the latter. Cursor's docs say Cursor Plugins use `.cursor-plugin/plugin.json` and Agent Plugins use a root `plugin.json`. https://cursor.com/docs/plugins.md ("Plugin structure")
- **Subagent inheritance of rules.** Whether always-applied rules (including `pstack-models.mdc`) reach subagents is not stated in the subagent docs I read. pstack's skills read the rule directly in the parent, so they do not depend on it.
- **Memories.** I did not find a Cursor "memories" feature in the pages I read. I did not search release notes or the changelog.
- **Cursor internals.** All Cursor claims come from docs. I did not test the product, and I did not read Cursor's closed source.

### Upstream state check

- `upstream.lock.json` pins `cursor/plugins` at `2776ddd2355d6d6c8747d3964600f28daf62f049`, path `pstack`. [upstream.lock.json](../../upstream.lock.json)
- GitHub `main` is now `24621dbcc59e205a7faadb0e06d540f91712b5cc`, 36 commits later. `git diff` between the two commits for the `pstack/` folder is empty, so the vendored copy is the same as the current upstream for everything this note covers. Plugin version in both is 0.15.36. https://github.com/cursor/plugins/tree/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack
- Permalink for the main skill at the pinned commit: https://github.com/cursor/plugins/blob/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/poteto-mode/SKILL.md

## Sources

- Local vendored files under `upstream/` (identical to upstream at both commits above) and the adapter files under `extensions/`, `agents/`, `skills/pstack-pi/`.
- https://cursor.com/docs/agent/prompting.md
- https://cursor.com/docs/skills.md
- https://cursor.com/docs/cli/using.md
- https://cursor.com/docs/rules.md
- https://cursor.com/docs/subagents.md
- https://cursor.com/docs/plugins.md and https://cursor.com/docs/reference/plugins.md
- https://cursor.com/docs/hooks.md
