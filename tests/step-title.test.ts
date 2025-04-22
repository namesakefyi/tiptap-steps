import type { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import {
  createBasicStep,
  getStepContents,
  getStepItems,
  getStepTitles,
  getSteps,
  newEditor,
} from "./utils";

describe("StepTitle", () => {
  it("renders with correct HTML attributes", () => {
    const editor = newEditor();
    editor.commands.toggleSteps();
    const stepTitles = getStepTitles(editor);
    expect(stepTitles[0].node.type.name).toBe("stepTitle");
  });

  it("handles Enter key at end of title", () => {
    const editor = newEditor();
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
    const editor = newEditor();
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
    const editor = newEditor();

    // Create steps
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that a paragraph was inserted above steps
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[1].type).toBe("steps");
  });

  it("handles Enter key at start of non-first step title with content", () => {
    const editor = newEditor();

    // Create steps with content
    editor.commands.toggleSteps();
    editor.commands.focus("end");
    editor.commands.insertContent("Step 1 content");

    // Add a second step
    editor.commands.insertStep();
    editor.commands.focus("end");
    editor.commands.insertContent("Step 2 content");

    // Focus at the start of the second step title
    const stepItems = getStepItems(editor);
    const secondStepTitle = getStepTitles(editor)[1];
    editor.commands.focus(secondStepTitle.pos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that a new step was inserted before the current step
    const updatedStepItems = getStepItems(editor);
    expect(updatedStepItems.length).toBe(3);
  });

  it("handles Enter key at end of last empty step", () => {
    const editor = newEditor();

    // Create steps
    editor.commands.insertContent(
      createBasicStep("Test Title", "Test Content"),
    );

    editor.commands.insertStep();

    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(2);

    // Focus at the end of the second step title
    const stepTitles = getStepTitles(editor);
    const secondTitlePos = stepTitles[1].pos + 1;
    editor.commands.focus(secondTitlePos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    const steps = getSteps(editor);
    expect(steps.length).toBe(1);

    const stepItemsAfter = getStepItems(editor);
    expect(stepItemsAfter.length).toBe(1);

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("steps");
    expect(json.content?.[1].type).toBe("paragraph");
  });

  it("handles Enter key at end of title text", () => {
    const editor = newEditor();

    // Create steps with title
    editor.commands.insertContent(
      createBasicStep("Step title", "Step content"),
    );

    // Focus at the end of the title text
    const stepTitles = getStepTitles(editor);
    const endOfTitle = stepTitles[0].pos + stepTitles[0].node.content.size;
    editor.commands.focus(endOfTitle);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that cursor moved to content
    const stepContents = getStepContents(editor);
    const startOfStepContent = stepContents[0].pos;

    expect(editor.state.selection.to).toEqual(startOfStepContent + 2);
  });

  it("handles Enter key in middle of title text", () => {
    const editor = newEditor();

    // Create steps with title
    editor.commands.insertContent(
      createBasicStep("Step title text", "Step content"),
    );

    // Focus in the middle of the title text
    const stepTitles = getStepTitles(editor);
    const middleOfTitle = stepTitles[0].pos + 5; // Position after "Step"
    editor.commands.focus(middleOfTitle);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    const stepTitlesAfterEnter = getStepTitles(editor);
    expect(stepTitlesAfterEnter[0].node.textContent).toBe("Step");

    const stepContentsAfterEnter = getStepContents(editor);
    expect(stepContentsAfterEnter[0].node.textContent).toBe(
      " title textStep content",
    );
  });

  it("handles Backspace key at start of title", () => {
    const editor = newEditor();

    // Create steps
    editor.commands.toggleSteps();

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Simulate Backspace key press
    editor.view.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace" }),
    );

    // Check that the step was removed
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);
  });
});
