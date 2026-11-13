import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { potetoSkills } from "../lib/poteto-skills.ts";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    event.systemPromptOptions.sections.poteto_mode = `You are a poteto-agent delegate. ${potetoSkills()}`;
  });
}
