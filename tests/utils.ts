import { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Italic from "@tiptap/extension-italic";
import Bold from "@tiptap/extension-bold";
import Text from "@tiptap/extension-text";
import { Steps, StepItem, StepTitle, StepContent } from "../src";
import { findChildren } from "@tiptap/core";

export const findNodesByType = (editor: Editor, nodeType: string) => {
	return findChildren(editor.state.doc, (node) => node.type.name === nodeType);
};

export const getSteps = (editor: Editor) => findNodesByType(editor, "steps");
export const getStepItems = (editor: Editor) =>
	findNodesByType(editor, "stepItem");
export const getStepTitles = (editor: Editor) =>
	findNodesByType(editor, "stepTitle");
export const getStepContents = (editor: Editor) =>
	findNodesByType(editor, "stepContent");

// Helper to create a new editor with all required extensions
export function newEditor() {
	return new Editor({
		extensions: [
			Document.extend({
				content: "(block | steps)+",
			}),
			Text,
			Paragraph,
			Italic,
			Bold,
			Steps,
			StepItem,
			StepTitle,
			StepContent,
		],
	});
}

// Helper to create a basic step structure
export function createBasicStep(title: string, content: string): JSONContent {
	return {
		type: "steps",
		content: [
			{
				type: "stepItem",
				content: [
					{
						type: "stepTitle",
						content: [{ type: "text", text: title }],
					},
					{
						type: "stepContent",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: content }],
							},
						],
					},
				],
			},
		],
	};
}

// Helper to create a paragraph
export function createParagraph(text: string): JSONContent {
	return {
		type: "paragraph",
		content: [{ type: "text", text }],
	};
}
