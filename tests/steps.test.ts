import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createBasicStep,
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

  it("creates steps from selected content", () => {
    // Insert some content
    editor.commands.insertContent([
      createParagraph("Title"),
      createParagraph("Content 1"),
      createParagraph("Content 2"),
    ]);

    // Select all content
    editor.commands.selectAll();

    // Convert to steps
    editor.commands.setSteps();

    // Check that steps were created
    const steps = getSteps(editor);
    expect(steps.length).toBe(1);

    // Check that step items were created
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(1);

    // Check that title was extracted
    const stepTitles = getStepTitles(editor);
    expect(stepTitles[0].node.textContent).toBe("Title");

    // Check that content was preserved
    const stepContents = getStepContents(editor);
    expect(stepContents[0].node.textContent).toBe("Content 1Content 2");
  });

  it("creates empty steps when no content is selected", () => {
    // Convert to steps
    editor.commands.setSteps();

    // Check that steps were created
    const steps = getSteps(editor);
    expect(steps.length).toBe(1);

    // Check that step items were created
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(1);

    // Check that title is empty
    const stepTitles = getStepTitles(editor);
    expect(stepTitles[0].node.textContent).toBe("");

    // Check that content is empty
    const stepContents = getStepContents(editor);
    expect(stepContents[0].node.textContent).toBe("");
  });

  it("converts steps back to paragraphs", () => {
    // Create steps
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

    // Convert back to paragraphs
    editor.commands.unsetSteps();

    // Check that steps were removed
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);

    // Check that paragraphs were created
    const doc = editor.state.doc;
    expect(doc.firstChild?.type.name).toBe("paragraph");
    expect(doc.firstChild?.textContent).toBe("Title");

    // Check that content was preserved
    expect(doc.lastChild?.type.name).toBe("paragraph");
    expect(doc.lastChild?.textContent).toBe("Content");
  });

  it("handles errors gracefully in unsetSteps", () => {
    // No steps exist
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);

    // Try to unset steps when no steps exist (should fail gracefully)
    const result = editor.commands.unsetSteps();
    expect(result).toBe(false);

    // Confirm that steps are still not created
    const stepsAfterUnset = getSteps(editor);
    expect(stepsAfterUnset.length).toBe(0);
  });
});
