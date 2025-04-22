import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, test } from "vitest";
import { newEditor } from "./utils";

describe("Tiptap Steps Extension", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  test("basic setup works", () => {
    expect(editor).toBeDefined();
    expect(editor.commands.toggleSteps).toBeDefined();
    expect(editor.commands.insertStep).toBeDefined();
    expect(editor.commands.removeStep).toBeDefined();
  });
});
