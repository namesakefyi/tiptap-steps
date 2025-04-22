import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createBasicStep,
  getStepContents,
  getStepItems,
  getStepTitles,
  getSteps,
  newEditor,
} from "./utils";

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

  it("deletes an empty step", () => {
    editor.commands.toggleSteps();
    editor.commands.insertStep();

    // Move to the second step and ensure it's selected
    editor.commands.selectAll();
    editor.commands.focus("end");

    // Delete the step
    const didDelete = editor.commands.removeStep();
    expect(didDelete).toBe(true);

    // After deletion, we should have a paragraph node
    const { state } = editor;
    const { $from } = state.selection;
    expect($from.parent.type.name).toBe("paragraph");
    expect($from.parent.childCount).toBe(0); // Empty paragraph has no content
  });

  it("does not delete a step with content", () => {
    // Create a steps node with two steps
    editor.commands.toggleSteps();
    editor.commands.insertStep();

    // Add content to the second step
    editor.commands.selectAll();
    editor.commands.focus("end");
    editor.commands.insertContent("Step content");

    // Try to delete the step
    const didDelete = editor.commands.removeStep();
    expect(didDelete).toBe(false);

    const steps = getSteps(editor);
    expect(steps).toHaveLength(1);
    expect(steps[0].node.type.name).toBe("steps");
    expect(steps[0].node.childCount).toBe(2); // Should still have two steps
  });

  it("deletes entire steps node when deleting last empty step", () => {
    // Create a steps node with one step
    editor.commands.toggleSteps();

    // Delete the step
    const didDelete = editor.commands.removeStep();
    expect(didDelete).toBe(true);

    const json = editor.getJSON();
    expect(json.content).toHaveLength(1);
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content).toBeUndefined();
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

  it("does not delete a step with content", () => {
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

    // Press enter to jump to contents
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Add content
    editor.commands.insertContent("Content");

    // Try to delete the step
    editor.commands.removeStep();

    // Check that the step was not deleted
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(1);
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
