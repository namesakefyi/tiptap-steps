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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    expect(jsonAfterToggleOff.content?.[0].type).toBe("heading");
  });

  it("renders with correct HTML attributes", () => {
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.textContent).toBe("Example title in bold");
  });

  it("converts headings to step titles", () => {
    editor.commands.insertContent([
      {
        type: "heading",
        content: [
          {
            type: "text",
            text: "Example heading",
          },
        ],
      },
    ]);

    editor.commands.selectAll();
    editor.commands.toggleSteps();

    const stepTitles = getStepTitles(editor);
    expect(stepTitles).toHaveLength(1);
    expect(stepTitles[0].node.textContent).toBe("Example heading");
  });

  it("handles unsetting steps with empty title and content", () => {
    editor.commands.toggleSteps();
    editor.commands.toggleSteps();

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
  });

  it("handles unsetting steps with empty title and non-empty content", () => {
    editor.commands.toggleSteps();
    editor.commands.focus(5);
    editor.commands.insertContent("Step content");
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

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
    editor.commands.toggleSteps();

    // Check that steps were removed
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);

    // Check that paragraphs were created
    const doc = editor.state.doc;
    expect(doc.children[0]?.type.name).toBe("heading");
    expect(doc.children[0]?.textContent).toBe("Title");

    // Check that content was preserved
    expect(doc.children[1]?.type.name).toBe("paragraph");
    expect(doc.children[1]?.textContent).toBe("Content");
  });

  // New tests for updated toggleSteps functionality
  it("converts selected content to steps with title and content", () => {
    // Insert content with a title and content
    editor.commands.insertContent([
      createParagraph("Step Title"),
      createParagraph("Step Content 1"),
      createParagraph("Step Content 2"),
    ]);

    // Select all content
    editor.commands.selectAll();

    // Toggle steps
    editor.commands.toggleSteps();

    // Check that steps were created
    const steps = getSteps(editor);
    expect(steps.length).toBe(1);

    // Check that step items were created
    const stepItems = getStepItems(editor);
    expect(stepItems.length).toBe(1);

    // Check that title was extracted
    const stepTitles = getStepTitles(editor);
    expect(stepTitles[0].node.textContent).toBe("Step Title");

    // Check that content was preserved
    const stepContents = getStepContents(editor);
    expect(stepContents[0].node.textContent).toBe(
      "Step Content 1Step Content 2",
    );
  });

  it("removes steps and preserves content when toggling off", () => {
    // Create steps with title and content
    editor.commands.insertContent(
      createBasicStep("Test Title", "Test Content"),
    );

    // Toggle steps off
    editor.commands.toggleSteps();

    // Check that steps were removed
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);

    // Check that content was preserved
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("heading");
    expect(json.content?.[0].attrs?.level).toBe(2);
    expect(json.content?.[0].content?.[0].text).toBe("Test Title");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content?.[0].text).toBe("Test Content");
  });

  it("handles removing multiple selected step items", () => {
    // Create multiple steps
    editor.commands.insertContent([
      createBasicStep("Step 1", "Content 1"),
      createBasicStep("Step 2", "Content 2"),
      createBasicStep("Step 3", "Content 3"),
    ]);

    // Select the middle step
    const stepItems = getStepItems(editor);
    editor.commands.setTextSelection({
      from: stepItems[1].pos,
      to: stepItems[1].pos + stepItems[1].node.nodeSize,
    });

    // Toggle steps to remove the selected step
    editor.commands.toggleSteps();

    // Check that only the selected step was removed
    const remainingSteps = getStepItems(editor);
    expect(remainingSteps.length).toBe(2);

    // Check that the content of the removed step was preserved
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("steps");
    expect(json.content?.[0].content?.[0].type).toBe("stepItem");
    expect(json.content?.[0].content?.[1].type).toBe("stepItem");

    // Check that the content after the steps was preserved
    expect(json.content?.[1].type).toBe("heading");
    expect(json.content?.[1].content?.[0].text).toBe("Step 2");
    expect(json.content?.[2].type).toBe("paragraph");
    expect(json.content?.[2].content?.[0].text).toBe("Content 2");
  });

  it("handles empty selection when toggling steps", () => {
    // Create steps
    editor.commands.insertContent(
      createBasicStep("Test Title", "Test Content"),
    );

    // Focus in the editor without selecting anything
    editor.commands.focus();

    // Toggle steps
    editor.commands.toggleSteps();

    // Check that steps were removed
    const steps = getSteps(editor);
    expect(steps.length).toBe(0);

    // Check that content was preserved
    const json = editor.getJSON();

    expect(json.content?.[0].type).toBe("heading");
    expect(json.content?.[0].content?.[0].text).toBe("Test Title");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content?.[0].text).toBe("Test Content");
  });
});
