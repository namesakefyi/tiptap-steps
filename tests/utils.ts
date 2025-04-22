import { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { findChildren } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import { StepContent, StepItem, StepTitle, Steps } from "../src";

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
      StarterKit.configure({
        document: false,
      }),
      Document.extend({
        content: "(block | steps)+",
      }),
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
