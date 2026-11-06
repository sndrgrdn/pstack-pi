# pstack-pi

pstack-pi runs [pstack](https://github.com/cursor/plugins/tree/main/pstack), Lauren Tan's ([poteto](https://x.com/poteto)) skills for rigorous agent work, in the [Pi](https://pi.dev) coding agent. pstack is written for Cursor. This package ships the upstream skills unchanged and adds an adapter skill that maps each Cursor name to its Pi equivalent.

## Install

pstack-pi spawns subagents through [pi-subagents](https://www.npmjs.com/package/pi-subagents), so install both:

```bash
pi install npm:pi-subagents
pi install git:github.com/sndrgrdn/pstack-pi
```

## Use it

- `/poteto-mode <task>` runs one task in poteto mode.
- `/poteto-mode on` keeps poteto mode on for every message until you run `/poteto-mode off`.
- `/skill:setup-pstack` picks the model for each role and writes your choices to `~/.pi/agent/pstack-models.md`. Run `/reload` afterward.

Without `~/.pi/agent/pstack-models.md`, pstack uses the upstream defaults: `xai/grok-4.7` for code and `anthropic/claude-opus-5-5` for prose and judgment.

For what each skill and playbook does, read the [upstream README](./upstream/README.md).

## What is in the package

| Path | Contents |
| --- | --- |
| `upstream/` | The `pstack` folder from [cursor/plugins](https://github.com/cursor/plugins), copied unchanged. |
| `team-kit/deslop/` | The `deslop` skill from `cursor-team-kit`, which pstack runs before each commit. |
| `agents/` | The upstream agents, with the frontmatter that pi-subagents reads. |
| `skills/pstack-pi/SKILL.md` | The adapter. It maps Cursor tools, subagent fields, model names, paths, and commands to Pi. |
| `skills/pstack-pi/models.md` | The fallback model sheet, generated from upstream's defaults. |
| `extensions/poteto-mode.ts` | The `/poteto-mode` command. |

## Sync with upstream

`npm run sync` copies the latest `pstack` from `cursor/plugins` `main`. It regenerates `agents/` and `skills/pstack-pi/models.md`, then records the upstream commit in `upstream.lock.json`. Pass a branch or tag to sync a different ref: `node scripts/sync.mjs <ref>`.

The sync also prints new upstream lines that use Cursor-only names. Check that the adapter covers each one.

A GitHub Actions workflow runs the sync every Monday. It opens a pull request when skill or agent files change.

## License

Everything here is MIT licensed. The files in `upstream/` are copyright Lauren Tan, under [`upstream/LICENSE`](./upstream/LICENSE). The files in `team-kit/` are copyright Cursor, under the [cursor-team-kit license](https://github.com/cursor/plugins/blob/main/cursor-team-kit/LICENSE). The rest is copyright Sander Tuin, under [`LICENSE`](./LICENSE).
