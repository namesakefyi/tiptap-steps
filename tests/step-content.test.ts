import { expect, it, describe, beforeEach } from "vitest";
import {
	newEditor,
	getStepItems,
	getSteps,
	getStepContents,
	getStepTitles,
} from "./utils";
import type { Editor } from "@tiptap/core";

describe("StepContent", () => {
	let editor: Editor;

	beforeEach(() => {
		editor = newEditor();
	});

	it("renders with correct HTML attributes and placeholder", () => {
		editor.commands.setSteps();

		const html = editor.getHTML();
		expect(html).toMatch(/div data-type="step-content"/);
		expect(html).toMatch(/data-placeholder="Add step instructions…"/);
	});

	it("handles Backspace key at start of content", () => {
		// Create a steps node with a step item
		editor.commands.setSteps();

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
		editor.commands.focus(stepContents[0].pos + 1);

		expect(editor.state.selection.$from.parent.type.name).toBe("stepContent");

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
});
