import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getStepContents,
  getStepItems,
  getStepTitles,
  getSteps,
  newEditor,
} from "./utils";

describe("StepContent", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("renders with correct HTML attributes and placeholder", () => {
    editor.commands.toggleSteps();

    const html = editor.getHTML();
    expect(html).toMatch(/div data-type="step-content"/);
  });

  it("handles Backspace key at start of content", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    // Press enter to jump to contents
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Add content
    editor.commands.insertContent("Content");

    // Focus at the start of the content
    const stepContents = getStepContents(editor);
    editor.commands.focus(stepContents[0].pos + 2);

    // Paragraph within content
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");

    // Simulate Backspace key
    editor.view.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace" }),
    );

    // Should move focus to the end of the title
    expect(editor.state.selection.$from.parent.type.name).toBe("stepTitle");

    // Content should remain
    const stepTitlesAfterBackspace = getStepTitles(editor);
    expect(stepTitlesAfterBackspace[0].node.textContent).toBe("Title");

    const stepContentsAfterBackspace = getStepContents(editor);
    expect(stepContentsAfterBackspace[0].node.textContent).toBe("Content");
  });

  it("handles Enter key at end of empty content", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    // Press enter to jump to contents
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Focus at the end of the content
    const stepContents = getStepContents(editor);
    const endOfContent =
      stepContents[0].pos + stepContents[0].node.content.size;
    editor.commands.focus(endOfContent);

    // Simulate Enter key at end of empty content
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should add a new step
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(2);
  });
});
