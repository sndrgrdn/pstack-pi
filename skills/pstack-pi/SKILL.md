---
name: pstack-pi
description: Pi adapter for pstack (poteto-mode and its skills). Read it once per session before following any pstack skill or playbook, or any instruction that uses Cursor names such as Task, subagent_type, AskQuestion, or ~/.cursor paths.
---

# pstack in Pi

pstack skills use Cursor names. On Pi, map each Cursor name with the tables below. `<pstack>` means the folder that holds `skills/` and `docs/`: the `upstream` folder two levels above this skill's directory (`../../upstream`). If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

An active pstack skill is the user's request to delegate wherever that skill prescribes subagents. Project and user instruction files still win where they conflict with a pstack skill.

## Tools

| Cursor | Pi |
| --- | --- |
| `Task` | The `subagent` tool from pi-subagents. |
| `AskQuestion` | Ask in plain text in your reply, with the options as a numbered list. |
| Open a todolist, or copy steps into the todolist tool | Use a todo tool if the session offers one. Otherwise show the list in your first reply, carry it forward yourself, and show it again in the final report with each step's outcome. |
| Run another pstack skill (`/name` or "the **name** skill") | `read` `<pstack>/skills/<name>/SKILL.md` and follow it. pstack skills are hidden from your skill catalog. When you tell the user to type it, use the Commands table. |
| `Grep`, `Glob` | Pi's `grep` and `find` tools when the session has them. Otherwise `bash` with `rg` or `find`. |

## Commands

| Cursor | Pi |
| --- | --- |
| `/poteto-mode <task>` with Enter, attached to one message | `/poteto-mode <task>` |
| `/poteto-mode` as a Custom Mode (Option+Enter, Alt+Enter, or Use as Mode) | `/poteto-mode on`, until `/poteto-mode off` |
| `/<skill>` | `/skill:<skill>` |
| `/loop` | Not available on Pi. |

## Subagent fields

| Cursor | pi-subagents |
| --- | --- |
| `subagent_type: "poteto-agent"`, `"comment-sicko"` | `agent: "poteto-agent"`, `agent: "comment-sicko"`. Always put the absolute path of `<pstack>/skills/poteto-mode/SKILL.md` in a `poteto-agent` brief. |
| `subagent_type: generalPurpose` | The general-purpose agent this session lists: a user agent named `general-purpose`, else pi-subagents' builtin `delegate`. If neither is listed, use `poteto-agent`. |
| `readonly: true` | The same agent, with "do not edit files" in the brief. Check `git status` afterward. |
| `readonly: false` | Omit. |
| `environment: "cloud"` | `worktree: true`. Name the branch or commit the worker checks out. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | `async: true`. Completion wakes you; do not poll or sleep. |
| `run_in_background: false` | `async: false`. |
| N parallel `Task` calls | One ```` ```js workflow ```` block that awaits `runs.all([...])`, with `subagent({ workflow: true })` in the same reply, or N async `subagent` calls in one reply. |
| `resume` | `subagent({ action: "resume", id, message })`, when the run is retained. Otherwise spawn a new agent and paste the earlier result into its brief. |
| `file_attachments` | List the paths in the brief. |

## Models

The model sheet sets each role's model and effort. Take it from your system prompt when it is there. Else read it before the first spawn: `~/.pi/agent/pstack-models.md`, with `models.md` in this skill's directory as the fallback. Its role lines override every default slug in the skills. Its comment lines are rules: a comment line on raising or lowering effort, or on changing model, replaces poteto-mode's rule for that.

| Cursor | Pi |
| --- | --- |
| A role value `<provider>/<id>:<effort>`, such as `anthropic/claude-opus-5-5:xhigh` | `model: "anthropic/claude-opus-5-5:xhigh"`. |
| `claude-<family>-<version>-<effort>[-fast]` or `gemini-<version>-<name>-<effort>` with no role line | The sheet's line for the same family. Drop `-fast`. |
| A `grok-*`, `gpt-*`, or other default slug with no role line | The sheet's `feature, refactoring` line. |
| `auto` or `inherit-parent` | Omit `model`. |
| `~/.cursor/rules/pstack-models.mdc` | `~/.pi/agent/pstack-models.md`. |

Diverse-model panels stay diverse only while their entries name distinct models. When every entry shares one provider, say once in the verdict that diversity is reduced.

## setup-pstack

Follow its steps with these changes:

- Detect. Run `pi --list-models`. Write each real model as `<provider>/<id>:<effort>`. The effort is the last token, after the colon, so the budget step works as written.
- Defaults. Start from the current model sheet, not the Cursor slugs.
- Ask. Ask in plain text, as in Tools.
- Write. Write `~/.pi/agent/pstack-models.md` with no frontmatter, then the comment lines, the `# defaults: 3` line, the `# budget` line, and one line per role from step 5. Rewrite the whole file and carry over every other comment line of the current sheet. Never put the role lines in `AGENTS.md`. Tell the user to run `/reload`.

## Paths

| Cursor | Pi |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.agents/skills/`, `~/.agents/skills/` |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | `<pstack>`, `<pstack>/plugin.json` |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md`. Pi never reads `.mdc` files. The model sheet is the exception. See Models. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | `<pstack>/<path>` when that file exists. Read the local copy and never fetch it. Give the user the URL when they need a link. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.pi/agent/sessions/--<slug>--/`. The slug is the workspace path without its leading `/` and with each `/`, `\`, and `:` changed to `-`, so `/Users/you/proj` is `--Users-you-proj--`. The newest `.jsonl` is the current session. After the session header on the first line, each line is an entry with `id` and `parentId`; follow `parentId` back from the last entry for the active branch. Read only this workspace's folder. |
| `create-skill`, Cursor's skill authoring guidance | `~/.agents/skills/writing-for-agents/SKILL.md`, then Pi's skills documentation. |

## cursor-team-kit skills

| pstack names | Pi |
| --- | --- |
| `deslop` (`/deslop`) | `<pstack>/../team-kit/deslop/SKILL.md`. |
| `control-ui` | A browser MCP server this session has, such as Playwright, Chrome DevTools, or `browse`. |
| `control-cli` | The `rex` skill to drive the CLI or TUI in a pane. |
| `visualize` | A Mermaid diagram, or the `show-me` skill. |

## Cursor-only features

Pi has no Cursor Automations, Bugbot, Cursor cloud agents, Cursor Projects, Graphite, `cursor-team-kit`, or built-in PR tool. When a step needs one of them, put one line in your reply, `Skipped in Pi: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, leave a placeholder and name it in the line.

| Cursor | Pi |
| --- | --- |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads, so triage them with the forge command that the step gives. Skip a step that starts, waits for, or configures Bugbot when the PR has no Bugbot check or comment. |
| Graphite (`gt`) | `git` and `gh`: one branch and one PR per unit. |
| Cursor cloud agents | `environment: "cloud"` maps to a worktree, as in Subagent fields. Skip a step that needs the cloud agent itself, such as its dashboard status or its own machine. |
| A built-in PR tool | The forge command that the step gives, such as `gh pr create`. That is not a skip, so write no line. |

## Writing the reply

While work remains (a subagent running, a playbook step left, a process you wait on), your reply is a **status line**: one sentence that names what is running and what you wait for. A blocker or a decision the user must make adds one sentence. Within a turn, go straight from one tool call to the next. Findings, reasoning and the todolist go in the **final report**, the reply after the last step.

For the final report, these rules replace poteto-mode's "Writing the reply" rules on short declarative sentences and on the colon as a connector. Its other rules still apply.

- Write full sentences in plain English. A sentence may join related ideas with words such as "because", "so", or "which" when that makes the point easier to follow.
- A colon may join two parts of a sentence. The long-dash character is still out.
