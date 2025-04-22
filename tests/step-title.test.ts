import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getStepContents,
  getStepItems,
  getStepTitles,
  newEditor,
} from "./utils";

describe("StepTitle", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("renders with correct HTML attributes", () => {
    editor.commands.toggleSteps();

    const html = editor.getHTML();
    expect(html).toMatch(/div data-type="step-title"/);
  });

  it("handles Enter key at end of title", () => {
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    const stepTitlesAfterInsert = getStepTitles(editor);
    expect(stepTitlesAfterInsert[0].node.textContent).toBe("Title");

    // Focus at the end of the title
    const endOfTitle =
      stepTitlesAfterInsert[0].pos + stepTitlesAfterInsert[0].node.content.size;
    editor.commands.focus(endOfTitle);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should move focus to the content
    const stepContents = getStepContents(editor);
    expect(editor.state.selection.$from.pos).toBe(stepContents[0].pos + 2);
  });

  it("handles Enter key in the middle of title", () => {
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Long Title");

    // Focus in the middle of the title
    const middleOfTitle = stepTitles[0].pos + 5;
    editor.commands.focus(middleOfTitle);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should move focus to the content
    const stepContents = getStepContents(editor);
    expect(editor.state.selection.$from.pos).toBe(stepContents[0].pos + 2);

    // Should have cut the title at the cursor position
    const stepTitlesAfterEnter = getStepTitles(editor);
    expect(stepTitlesAfterEnter[0].node.textContent).toBe("Long");
  });

  it("handles Enter key at start of first step title", () => {
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should insert a paragraph above the steps
    const doc = editor.state.doc;
    expect(doc.firstChild?.type.name).toBe("paragraph");
  });

  it("handles Enter key at start of non-first step title", () => {
    editor.commands.toggleSteps();
    editor.commands.insertStep();

    // Focus at the start of the second step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[1].pos);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should add a new step before the current one
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(3);
  });

  it("handles Backspace key in step title", () => {
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Simulate Backspace key
    editor.view.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace" }),
    );

    // Should delete the step
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(0);
  });
});
