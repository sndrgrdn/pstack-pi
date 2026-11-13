import { getAgentDir, stripFrontmatter } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const potetoModePath = join(root, "upstream", "skills", "poteto-mode", "SKILL.md");
export const adapterPath = join(root, "skills", "pstack-pi", "SKILL.md");

const skillBlock = (name: string, path: string) =>
  `<skill name="${name}" location="${path}">\nReferences are relative to ${dirname(path)}.\n\n${stripFrontmatter(readFileSync(path, "utf-8")).trim()}\n</skill>`;

export const potetoSkills = () =>
  `Both skills below are the complete SKILL.md files, already read, and they stay in this prompt for the whole session: follow them from here on every turn. The pstack-pi skill maps the Cursor names in poteto-mode to Pi. Read every playbook, principle and other skill in full from its file before you use it.\n\n${skillBlock("poteto-mode", potetoModePath)}\n\n${skillBlock("pstack-pi", adapterPath)}`;

export const modelSheet = () => {
  const userSheet = join(getAgentDir(), "pstack-models.md");
  const path = existsSync(userSheet) ? userSheet : join(dirname(adapterPath), "models.md");
  return `<model_sheet location="${path}">\n${readFileSync(path, "utf-8").trim()}\n</model_sheet>`;
};
