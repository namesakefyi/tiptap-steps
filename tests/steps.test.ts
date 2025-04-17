import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createParagraph,
  getStepContents,
  getStepItems,
  getStepTitles,
  getSteps,
  newEditor,
} from "./utils";

describe("Steps", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("creates empty step when no content is selected", () => {
    editor.commands.setSteps();

    const steps = getSteps(editor);
    expect(steps).toBeDefined();

    const stepItems = getStepItems(editor);
    expect(stepItems).toHaveLength(1);
    expect(stepItems[0].node.childCount).toBe(2); // title and content

    const stepContents = getStepContents(editor);
    expect(stepContents).toHaveLength(1);
    expect(stepContents[0].node.childCount).toBe(1); // empty paragraph in content
  });

  it("converts selected paragraph to step title", () => {
    editor.commands.insertContent(createParagraph("This will be title"));
    editor.commands.selectAll();
    editor.commands.setSteps();

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.type.name).toBe("stepTitle");
    expect(stepTitles[0].node.textContent).toBe("This will be title");
  });

  it("converts multiple paragraphs to step content", () => {
    // Insert multiple paragraphs
    editor.commands.insertContent([
      createParagraph("First paragraph"),
      createParagraph("Second paragraph"),
    ]);

    editor.commands.selectAll();
    editor.commands.setSteps();

    // First paragraph becomes the title
    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.type.name).toBe("stepTitle");
    expect(stepTitles[0].node.textContent).toBe("First paragraph");

    // Second paragraph becomes the content
    const stepContents = getStepContents(editor);
    expect(stepContents).toHaveLength(1);
    expect(stepContents[0].node.type.name).toBe("stepContent");
    expect(stepContents[0].node.textContent).toBe("Second paragraph");
  });

  it("toggles steps on and off", () => {
    editor.commands.insertContent(createParagraph("Test content"));
    editor.commands.selectAll();

    editor.commands.toggleSteps();
    const stepsAfterToggleOn = getSteps(editor);
    expect(stepsAfterToggleOn).toHaveLength(1);

    editor.commands.toggleSteps();
    const jsonAfterToggleOff = editor.getJSON();
    expect(jsonAfterToggleOff.content?.[0].type).toBe("paragraph");
  });

  it("renders with correct HTML attributes", () => {
    editor.commands.setSteps();

    const html = editor.getHTML();
    expect(html).toMatch(/ol data-type="steps"/);
    expect(html).toMatch(/li data-type="step-item"/);
    expect(html).toMatch(/div data-type="step-title"/);
    expect(html).toMatch(/div data-type="step-content"/);
  });

  it("toggles steps", () => {
    editor.commands.insertContent(createParagraph("Test content"));
    editor.commands.selectAll();
    editor.commands.toggleSteps();

    const steps = getSteps(editor);
    expect(steps).toHaveLength(1);

    const stepItems = getStepItems(editor);
    expect(stepItems).toHaveLength(1);

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.textContent).toBe("Test content");
  });

  it("converts an empty paragraph to steps", () => {
    editor.commands.insertContent(createParagraph(""));
    editor.commands.selectAll();
    editor.commands.setSteps();

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.textContent).toBe("");
  });

  it("converts formatted paragraph to step title", () => {
    editor.commands.insertContent([
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Example title in bold",
          },
        ],
      },
    ]);

    editor.commands.selectAll();
    editor.commands.setSteps();

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.textContent).toBe("Example title in bold");
  });

  it("handles unsetting steps with empty title and content", () => {
    editor.commands.setSteps();
    editor.commands.unsetSteps();

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
  });

  it("handles unsetting steps with empty title and non-empty content", () => {
    editor.commands.setSteps();
    editor.commands.focus("end");
    editor.commands.insertContent("Step content");
    editor.commands.unsetSteps();

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content?.[0].text).toBe("Step content");
  });
});
