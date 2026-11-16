# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit `model`). Alias entries in a panel list still count toward its fan-out.
# defaults: 2
# budget: large (xhigh)
feature, refactoring: anthropic/claude-opus-5-5:xhigh
bug-fix: anthropic/claude-opus-5-5:xhigh
perf-issue: anthropic/claude-opus-5-5:xhigh
hillclimb: anthropic/claude-opus-5-5:xhigh
judgment and prose: anthropic/claude-opus-5-5:xhigh
hardest tasks: anthropic/claude-fable-5-2:max
reflect tooling: anthropic/claude-opus-5-5:high
reflect judgment, divergent, synthesizer: anthropic/claude-opus-5-5:xhigh
arena runners: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, gemini-4-carbon-high
arena cross-judge pool: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, gemini-4-carbon-high
swarm workers: anthropic/claude-opus-5-5:high
architect runners: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, gemini-4-carbon-high
interrogate reviewers: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, gemini-4-carbon-high
