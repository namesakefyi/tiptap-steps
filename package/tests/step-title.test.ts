import { expect, it, describe, beforeEach } from "vitest";
import { newEditor, getStepTitles, getStepContents, getSteps } from "./utils";
import type { Editor } from "@tiptap/core";

describe("StepTitle", () => {
	let editor: Editor;

	beforeEach(() => {
		editor = newEditor();
	});

	it("renders with correct HTML attributes and placeholder", () => {
		// Create a steps node with a step item
		editor.commands.setSteps();

		const html = editor.getHTML();
		expect(html).toMatch(/div data-type="step-title"/);
		expect(html).toMatch(/data-placeholder="Step title"/);
	});

	it("handles Enter key at start of first step title", () => {
		editor.commands.setSteps();
		const stepTitles = getStepTitles(editor);
		editor.commands.focus(stepTitles[0].pos);
		editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

		// Should insert a paragraph above the steps
		const json = editor.getJSON();
		expect(json.content?.[0].type).toBe("paragraph");
		expect(json.content?.[1].type).toBe("steps");
	});

	it("handles Enter key at end of title text", () => {
		// Create a steps node with a step item
		editor.commands.setSteps();

		const stepTitles = getStepTitles(editor);
		editor.commands.focus(stepTitles[0].pos);
		editor.commands.insertContent("Step Title");

		// Focus at the end of the title
		const stepTitlesAfterInsert = getStepTitles(editor);
		editor.commands.focus(
			stepTitlesAfterInsert[0].pos +
				stepTitlesAfterInsert[0].node.content.size +
				1,
		);

		// Simulate Enter key
		editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

		// Should move focus to content
		editor.commands.insertContent("Step Content");
		const parent = editor.state.selection.$from.parent;
		expect(parent.type.name).toBe("paragraph");

		const stepContents = getStepContents(editor);
		expect(stepContents[0].node.textContent).toBe("Step Content");
	});

	it("handles Enter key in middle of title text", () => {
		editor.commands.setSteps();
		editor.commands.focus("start");
		editor.commands.insertContent("Step Title");

		// Focus in the middle of the title
		editor.commands.focus(editor.state.selection.from - 5);

		// Simulate Enter key
		editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

		// Check that the title was cut
		const stepTitles = getStepTitles(editor);
		expect(stepTitles[0].node.textContent).toBe("Step ");

		// End of title should be located in step contents
		const stepContents = getStepContents(editor);
		expect(stepContents[0].node.textContent).toBe("Title");
	});

	it("handles Backspace key in step title", () => {
		editor.commands.setSteps();
		editor.commands.focus("start");

		editor.view.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Backspace" }),
		);

		// Should delete the step
		const json = editor.getJSON();
		expect(json.content?.[0].type).toBe("paragraph");

		const steps = getSteps(editor);
		expect(steps).toHaveLength(0);
	});
});
