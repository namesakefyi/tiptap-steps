import {
  type JSONContent,
  Node,
  findChildren,
  findParentNode,
  mergeAttributes,
} from "@tiptap/core";

const ALLOWED_TITLE_TYPES = ["paragraph", "heading"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    steps: {
      toggleSteps: () => ReturnType;
    };
  }
}

export interface StepsOptions {
  HTMLAttributes: Record<string, any>;
}

export const Steps = Node.create<StepsOptions>({
  name: "steps",
  group: "steps",
  content: "stepItem+",
  inline: false,
  defining: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "ol[data-type='steps']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "ol",
      mergeAttributes(
        { "data-type": "steps" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      toggleSteps:
        () =>
        ({ chain: chainCommand, state }) => {
          const range = state.selection.$from.blockRange(state.selection.$to);
          if (!range) return false;

          const steps = findParentNode((node) => node.type.name === "steps")(
            state.selection,
          );

          const slice = state.doc.slice(range.start, range.end);
          const selectedContent =
            slice.content.size > 0 ? slice.toJSON().content : [];

          // If we're inside a steps list, toggling will remove the list items
          if (steps) {
            const selectedStepItems = findChildren(
              steps.node,
              (node) => node.type.name === "stepItem",
            ).filter((stepItem) => {
              return (
                stepItem.pos >= range.start - 1 &&
                stepItem.pos + stepItem.node.content.size <= range.end
              );
            });

            // If nothing is in the selection, run the default removeStep command
            if (selectedStepItems.length === 0) {
              return chainCommand().removeStep().run();
            }

            // If we have selected step items, remove them all
            if (selectedStepItems.length > 0) {
              // First collect all content that needs to be preserved
              const contentToPreserve: JSONContent[] = [];

              for (const stepItem of selectedStepItems) {
                const title = stepItem.node.firstChild;
                const content = stepItem.node.lastChild;

                if (!title || !content) continue;

                const hasTitle = title.textContent.length > 0;
                if (hasTitle) {
                  contentToPreserve.push({
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: title.textContent }],
                  });
                }

                // Add the step content
                const stepContent = content.content.toJSON();
                if (stepContent && stepContent.length > 0) {
                  contentToPreserve.push(...stepContent);
                }
              }

              // Now perform the operations
              return chainCommand()
                .deleteRange({
                  from: Math.max(0, range.start - 1),
                  to: range.end,
                })
                .insertContentAt(
                  Math.max(0, range.start - 1),
                  contentToPreserve,
                )
                .run();
            }
          }

          // If there is not parent step container, create steps
          let titleToInsert = "";
          let contentToInsert: JSONContent[] = [];

          // Try to get a title from the selected content
          const [firstNode, ...remainingNodes] = selectedContent;

          if (firstNode?.type && ALLOWED_TITLE_TYPES.includes(firstNode.type)) {
            titleToInsert = firstNode.content?.[0]?.text || "";
            contentToInsert = remainingNodes;
          } else {
            contentToInsert = selectedContent;
          }

          return chainCommand()
            .deleteRange({ from: range.start, to: range.end })
            .insertStep({ title: titleToInsert, content: contentToInsert })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-s": () => this.editor.commands.toggleSteps(),
    };
  },
});
