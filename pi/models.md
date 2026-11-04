# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit `model`). Alias entries in a panel list still count toward its fan-out.
# budget: large (xhigh)
feature, refactoring: meridian/claude-sonnet-5-5:xhigh
bug-fix: meridian/claude-sonnet-5-5:xhigh
perf-issue: meridian/claude-sonnet-5-5:xhigh
hillclimb: meridian/claude-sonnet-5-5:xhigh
judgment and prose: meridian/claude-opus-5-5:xhigh
hardest tasks: meridian/claude-opus-5-5:xhigh
how explorer: meridian/claude-sonnet-5-5:xhigh
how explainer: meridian/claude-opus-5-5:xhigh
why investigators: meridian/claude-sonnet-5-5:xhigh
why synthesizer: meridian/claude-opus-5-5:xhigh
reflect tooling: meridian/claude-sonnet-5-5:xhigh
reflect judgment, divergent, synthesizer: meridian/claude-opus-5-5:xhigh
arena runners: meridian/claude-opus-5-5:xhigh, meridian/claude-fable-5-1:xhigh
arena cross-judge pool: meridian/claude-opus-5-5:xhigh, meridian/claude-fable-5-1:xhigh
swarm workers: meridian/claude-sonnet-5-5:xhigh
architect runners: meridian/claude-opus-5-5:xhigh, meridian/claude-fable-5-1:xhigh
interrogate reviewers: meridian/claude-opus-5-5:xhigh, meridian/claude-fable-5-1:xhigh
