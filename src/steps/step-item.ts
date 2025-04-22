import {
  type JSONContent,
  Node,
  findParentNode,
  mergeAttributes,
} from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import { TextSelection } from "@tiptap/pm/state";
import { canJoin } from "@tiptap/pm/transform";

// https://github.com/ueberdosis/tiptap/blob/develop/packages/core/src/commands/toggleList.ts
const joinListBackwards = (tr: Transaction): boolean => {
  const steps = findParentNode((node) => node.type.name === "steps")(
    tr.selection,
  );
  if (!steps) return true;

  const before = tr.doc.resolve(Math.max(0, steps.pos - 1)).before(steps.depth);
  if (before === undefined) return true;

  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards =
    steps.node.type === nodeBefore?.type && canJoin(tr.doc, steps.pos);
  if (!canJoinBackwards) return true;

  tr.join(steps.pos);
  return true;
};

const joinListForwards = (tr: Transaction): boolean => {
  const steps = findParentNode((node) => node.type.name === "steps")(
    tr.selection,
  );
  if (!steps) return true;

  const after = tr.doc.resolve(steps.start).after(steps.depth);
  if (after === undefined) return true;

  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards =
    steps.node.type === nodeAfter?.type && canJoin(tr.doc, after);
  if (!canJoinForwards) return true;

  tr.join(after);
  return true;
};

export interface StepItemOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  type InsertStepOptions = {
    /**
     * The title of the new step.
     */
    title?: string;

    /**
     * The content of the new step.
     */
    content?: JSONContent[];

    /**
     * Whether to add the new step before the current step.
     * @default false
     */
    before?: boolean;
  };

  interface Commands<ReturnType> {
    stepItem: {
      /**
       * Add a new step after or before the current step.
       * Optionally provide a title and content for the new step.
       */
      insertStep: (options?: InsertStepOptions) => ReturnType;

      /**
       * Remove the current step, putting contents back into the parent.
       */
      removeStep: () => ReturnType;
    };
  }
}

export const StepItem = Node.create<StepItemOptions>({
  name: "stepItem",
  group: "listItem",
  content: "stepTitle stepContent",
  inline: false,
  defining: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "li[data-type='step-item']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(
        { "data-type": "step-item" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      insertStep:
        (options) =>
        ({ state, tr, dispatch }) => {
          try {
            const shouldInsertBefore = options?.before ?? false;
            const range = state.selection.$from.blockRange(state.selection.$to);
            if (!range) return false;

            // Find if we're inside a step
            const currentStep = findParentNode(
              (node) => node.type.name === "stepItem",
            )(state.selection);

            // Calculate position once, preserving the original logic
            const positionToInsert = currentStep
              ? shouldInsertBefore
                ? currentStep.pos
                : currentStep.pos + currentStep.node.nodeSize
              : range.start;

            // Prepare content only once
            const titleToInsert =
              options?.title && options.title.length > 0
                ? [{ type: "text", text: options.title }]
                : undefined;

            const contentToInsert =
              options?.content && options.content.length > 0
                ? options.content
                : [{ type: "paragraph" }];

            const innerContent = [
              {
                type: this.name,
                content: [
                  { type: "stepTitle", content: titleToInsert },
                  { type: "stepContent", content: contentToInsert },
                ],
              },
            ];

            // Check if we need to wrap in a steps node
            const needsStepsWrapper = !findParentNode(
              (node) => node.type.name === "steps",
            )(state.selection);

            const positionToFocus = needsStepsWrapper
              ? positionToInsert + 3
              : positionToInsert + 2;

            // Create a single transaction for all operations
            if (dispatch) {
              // Insert the content
              tr.insert(
                positionToInsert,
                state.schema.nodeFromJSON(
                  needsStepsWrapper
                    ? { type: "steps", content: innerContent }
                    : innerContent[0],
                ),
              );

              // Join lists if needed
              joinListBackwards(tr);
              joinListForwards(tr);

              // Set selection
              tr.setSelection(TextSelection.create(tr.doc, positionToFocus));
            }

            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        },

      removeStep:
        () =>
        ({ state, tr, dispatch }) => {
          try {
            const steps = findParentNode((node) => node.type.name === "steps")(
              state.selection,
            );
            const stepItem = findParentNode(
              (node) => node.type.name === "stepItem",
            )(state.selection);
            if (!stepItem) return false;

            const title = stepItem.node.firstChild;
            const content = stepItem.node.lastChild;

            if (!title || !content) return false;

            const hasTitle = title.textContent.length > 0;
            const heading = hasTitle && [
              {
                type: "heading",
                attrs: {
                  level: 2,
                },
                content: [
                  {
                    type: "text",
                    text: title.textContent,
                  },
                ],
              },
            ];

            const isFirstChild = steps?.node.firstChild === stepItem.node;

            const positionToInsert = Math.max(
              0,
              // If the step is the first child, we need to
              // account for the steps list start token
              isFirstChild ? stepItem.pos - 1 : stepItem.pos,
            );
            const positionToFocus = positionToInsert;

            if (dispatch) {
              // Delete the step item
              tr.delete(stepItem.pos, stepItem.pos + stepItem.node.nodeSize);

              // Insert the preserved content
              tr.insert(
                positionToInsert,
                state.schema.nodeFromJSON([
                  ...(heading || []),
                  ...(content.content.toJSON() || []),
                ]),
              );

              // Join lists if needed
              joinListBackwards(tr);
              joinListForwards(tr);

              // Set selection
              tr.setSelection(TextSelection.create(tr.doc, positionToFocus));
            }

            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
    };
  },
});
