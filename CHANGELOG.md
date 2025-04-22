# tiptap-steps

## 2.0.0

### Major Changes

- d27a9b3: BREAKING: Update steps extension API to better handle selections and keyboard commands

  Rename: `addStep()` is now `insertStep()`
  Rename: `deleteStep()` is now `removeStep()`
  Rename: `addStepBefore()` is now `insertStep({ before: true })`

  Fix: When inserting a step, the cursor is now focused at the start of the title instead of within the content
  Fix: Now properly converts headings to title text when inserting a step
  Fix: Now joins adjacent lists when adding or removing list items
  Fix: Now with fewer Tiptap console warnings about text selection in improper places

  Change: Now converts titles to h2 headings instead of bold text when removing steps

## 1.0.4

### Patch Changes

- 204b833: Add a step item before the current item when pressing enter at the beginning of a title other than the first step item
- 204b833: Fix keyboard handling logic on enter and backspace keypresses within list items
- 204b833: Fix Tiptap console warning about text selection being outside of an inline text element

## 1.0.3

### Patch Changes

- 8f80f7c: Tag GitHub releases before publish

## 1.0.2

### Patch Changes

- e899b27: Fix broken package

## 1.0.1

### Patch Changes

- 99ff9a6: Fix repository link from npm package
- 8a7ce50: Add test coverage and unit tests
