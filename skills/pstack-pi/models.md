# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit `model`). Alias entries in a panel list still count toward its fan-out.
# budget: large (xhigh)
feature, refactoring: xai/grok-4.7:xhigh
bug-fix: xai/grok-4.7:xhigh
perf-issue: xai/grok-4.7:xhigh
hillclimb: xai/grok-4.7:xhigh
judgment and prose: anthropic/claude-opus-5-5:xhigh
hardest tasks: anthropic/claude-opus-5-5:xhigh
how explorer: xai/grok-4.7:xhigh
how explainer: anthropic/claude-opus-5-5:xhigh
why investigators: xai/grok-4.7:xhigh
why synthesizer: anthropic/claude-opus-5-5:xhigh
reflect tooling: xai/grok-4.7:xhigh
reflect judgment, divergent, synthesizer: anthropic/claude-opus-5-5:xhigh
arena runners: anthropic/claude-opus-5-5:xhigh, xai/grok-4.7:xhigh
arena cross-judge pool: anthropic/claude-opus-5-5:xhigh, xai/grok-4.7:xhigh
swarm workers: xai/grok-4.7:xhigh
architect runners: anthropic/claude-opus-5-5:xhigh, xai/grok-4.7:xhigh
interrogate reviewers: anthropic/claude-opus-5-5:xhigh, xai/grok-4.7:xhigh
