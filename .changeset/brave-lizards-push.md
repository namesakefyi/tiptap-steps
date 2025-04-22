---
"tiptap-steps": major
---

BREAKING: Update steps extension API to better handle selections and keyboard commands

Rename: `addStep()` is now `insertStep()`
Rename: `deleteStep()` is now `removeStep()`
Rename: `addStepBefore()` is now `insertStep({ before: true })`

Fix: When inserting a step, the cursor is now focused at the start of the title instead of within the content
Fix: Now properly converts headings to title text when inserting a step
Fix: Now joins adjacent lists when adding or removing list items
Fix: Now with fewer Tiptap console warnings about text selection in improper places

Change: Now converts titles to h2 headings instead of bold text when removing steps
