import { stripFrontmatter } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const potetoModePath = join(root, "upstream", "skills", "poteto-mode", "SKILL.md");
export const adapterPath = join(root, "skills", "pstack-pi", "SKILL.md");

const skillBlock = (name: string, path: string) =>
  `<skill name="${name}" location="${path}">\nReferences are relative to ${dirname(path)}.\n\n${stripFrontmatter(readFileSync(path, "utf-8")).trim()}\n</skill>`;

export const potetoSkills = () =>
  `Both skills below are complete and stay in this prompt for the whole session, so follow them on every turn without reading their files. The pstack-pi skill maps the Cursor names in poteto-mode to Pi. Playbooks, principles and other skills are not in this prompt: read each one in full before you use it.\n\n${skillBlock("poteto-mode", potetoModePath)}\n\n${skillBlock("pstack-pi", adapterPath)}`;
