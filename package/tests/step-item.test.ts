import { expect, it, describe, beforeEach } from "vitest";
import { newEditor, getStepItems, getSteps } from "./utils";
import type { Editor } from "@tiptap/core";

describe("StepItem", () => {
	let editor: Editor;

	beforeEach(() => {
		editor = newEditor();
	});

	it("creates a step item with title and content", () => {
		editor.commands.setSteps();
		const stepItems = getStepItems(editor);
		expect(stepItems).toHaveLength(1);
		expect(stepItems[0].node.childCount).toBe(2);
		expect(stepItems[0].node.firstChild?.type.name).toBe("stepTitle");
		expect(stepItems[0].node.lastChild?.type.name).toBe("stepContent");
	});

	it("adds a new step after the current step", () => {
		editor.commands.setSteps();
		editor.commands.addStep();

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
		editor.commands.setSteps();
		editor.commands.addStep();

		// Move to the second step and ensure it's selected
		editor.commands.selectAll();
		editor.commands.focus("end");

		// Delete the step
		const didDelete = editor.commands.deleteStep();
		expect(didDelete).toBe(true);

		// After deletion, we should have a paragraph node
		const { state } = editor;
		const { $from } = state.selection;
		expect($from.parent.type.name).toBe("paragraph");
		expect($from.parent.childCount).toBe(0); // Empty paragraph has no content
	});

	it("does not delete a step with content", () => {
		// Create a steps node with two steps
		editor.commands.setSteps();
		editor.commands.addStep();

		// Add content to the second step
		editor.commands.selectAll();
		editor.commands.focus("end");
		editor.commands.insertContent("Step content");

		// Try to delete the step
		const didDelete = editor.commands.deleteStep();
		expect(didDelete).toBe(false);

		const steps = getSteps(editor);
		expect(steps).toHaveLength(1);
		expect(steps[0].node.type.name).toBe("steps");
		expect(steps[0].node.childCount).toBe(2); // Should still have two steps
	});

	it("deletes entire steps node when deleting last empty step", () => {
		// Create a steps node with one step
		editor.commands.setSteps();

		// Delete the step
		const didDelete = editor.commands.deleteStep();
		expect(didDelete).toBe(true);

		const json = editor.getJSON();
		expect(json.content).toHaveLength(1);
		expect(json.content?.[0].type).toBe("paragraph");
		expect(json.content?.[0].content).toBeUndefined();
	});
});
