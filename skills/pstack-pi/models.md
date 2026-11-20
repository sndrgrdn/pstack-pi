# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit `model` and spawn `generalPurpose`). Alias entries in a panel list still count toward its fan-out.
# defaults: 3
# budget: large (xhigh)
feature, refactoring: anthropic/claude-opus-5-5:xhigh
bug-fix: anthropic/claude-opus-5-5:xhigh
perf-issue: anthropic/claude-opus-5-5:xhigh
hillclimb: anthropic/claude-opus-5-5:xhigh
judgment and prose: anthropic/claude-opus-5-5:xhigh
arena runners: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, google/gemini-4-neon:xhigh
arena cross-judge pool: anthropic/claude-opus-5-5:high, google/gemini-4-neon:xhigh
swarm workers: anthropic/claude-opus-5-5:high
interrogate reviewers: anthropic/claude-fable-5-2:high, anthropic/claude-opus-5-5:high, google/gemini-4-neon:xhigh
