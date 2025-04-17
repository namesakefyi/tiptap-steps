import type { Editor } from "@tiptap/core";
import { expect, test, describe, beforeEach } from "vitest";
import { newEditor } from "./utils";

describe("Tiptap Steps Extension", () => {
	let editor: Editor;

	beforeEach(() => {
		editor = newEditor();
	});

	test("basic setup works", () => {
		expect(editor).toBeDefined();
		expect(editor.commands.setSteps).toBeDefined();
		expect(editor.commands.toggleSteps).toBeDefined();
		expect(editor.commands.addStep).toBeDefined();
		expect(editor.commands.deleteStep).toBeDefined();
	});
});
