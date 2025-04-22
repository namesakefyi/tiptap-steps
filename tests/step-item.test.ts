import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import { getStepItems, getStepTitles, getSteps, newEditor } from "./utils";

describe("StepItem", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("creates a step item with title and content", () => {
    editor.commands.toggleSteps();
    const stepItems = getStepItems(editor);
    expect(stepItems).toHaveLength(1);
    expect(stepItems[0].node.childCount).toBe(2);
    expect(stepItems[0].node.firstChild?.type.name).toBe("stepTitle");
    expect(stepItems[0].node.lastChild?.type.name).toBe("stepContent");
  });

  it("adds a new step after the current step", () => {
    editor.commands.toggleSteps();
    editor.commands.insertStep();

    const steps = getSteps(editor);
    expect(steps).toHaveLength(1);

    const stepItems = getStepItems(editor);
    expect(stepItems).toHaveLength(2);

    for (const step of stepItems) {
      expect(step.node.type.name).toBe("stepItem");
      expect(step.node.childCount).toBe(2);
      expect(step.node.firstChild?.type.name).toBe("stepTitle");
      expect(step.node.lastChild?.type.name).toBe("stepContent");
    }
  });

  it("deletes entire steps node when deleting last empty step", () => {
    // Create a steps node with one step
    editor.commands.toggleSteps();

    // Delete the step
    const didDelete = editor.commands.removeStep();
    expect(didDelete).toBe(true);

    const json = editor.getJSON();

    // Two paragraphs remain /shrug
    expect(json.content).toHaveLength(2);
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content).toBeUndefined();
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content).toBeUndefined();
  });

  it("adds a new step at the end of the list", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Get initial step count
    const initialStepItems = getStepItems(editor);
    expect(initialStepItems.length).toBe(1);

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("First Step");

    // Add a new step
    editor.commands.insertStep();

    // Check that a new step was added
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(2);

    // Check that focus moved to the new step title
    const newStepTitles = getStepTitles(editor);
    expect(editor.state.selection.$from.pos).toBe(newStepTitles[1].pos + 1);
  });

  it("adds a new step before the current step", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Get initial step count
    const initialStepItems = getStepItems(editor);
    expect(initialStepItems.length).toBe(1);

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Add a title
    editor.commands.insertContent("First Step");

    // Add a new step before
    editor.commands.insertStep({ before: true });

    // Check that a new step was added
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(2);

    // Check that focus moved to the new step title
    const newStepTitles = getStepTitles(editor);
    expect(editor.state.selection.$from.pos).toBe(newStepTitles[0].pos + 1);
  });

  it("deletes an empty step", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Get initial step count
    const initialStepItems = getStepItems(editor);
    expect(initialStepItems.length).toBe(1);

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Delete the step
    editor.commands.removeStep();

    // Check that the step was deleted
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(0);
  });

  it("deletes the entire steps list when deleting the last empty step", () => {
    // Create a steps node with a step item
    editor.commands.toggleSteps();

    // Get initial step count
    const initialStepItems = getStepItems(editor);
    expect(initialStepItems.length).toBe(1);

    // Focus at the start of the step title
    const stepTitles = getStepTitles(editor);
    editor.commands.focus(stepTitles[0].pos);

    // Delete the step
    editor.commands.removeStep();

    // Check that the steps node was deleted
    const steps = editor.state.doc.content.content.filter(
      (node) => node.type.name === "steps",
    );
    expect(steps.length).toBe(0);
  });
});
