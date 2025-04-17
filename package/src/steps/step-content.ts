import { Node, findParentNode, mergeAttributes } from "@tiptap/core";

export interface StepContentOptions {
	HTMLAttributes: Record<string, string>;
	placeholder?: string;
}

export const StepContent = Node.create<StepContentOptions>({
	name: "stepContent",
	content: "block+",
	defining: true,
	selectable: false,

	parseHTML() {
		return [
			{
				tag: "div[data-type='step-content']",
				priority: 500,
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(
				{
					"data-type": "step-content",
					"data-placeholder": "Add step instructions…",
				},
				this.options.HTMLAttributes,
				HTMLAttributes,
			),
			0,
		];
	},

	addKeyboardShortcuts() {
		return {
			Enter: ({ editor }) => {
				const { state } = editor;
				const { selection } = state;
				const { $anchor } = selection;

				const stepContent = findParentNode(
					(node) => node.type.name === "stepContent",
				)(state.selection);

				// If no step content found, ignore
				if (!stepContent) return false;

				// If we're not in step content, ignore
				if ($anchor.parent.type.name !== "stepContent") return false;

				// If cursor is not at the end of the content, ignore
				if ($anchor.pos !== stepContent.pos + stepContent.node.nodeSize - 1)
					return false;

				// If the selected node has text, ignore
				if ($anchor.node().textContent.length > 0) return false;

				// Otherwise, we're at the end of the content with an empty line,
				// so delete the empty line and add a new step
				return editor.chain().joinTextblockBackward().addStep().run();
			},

			Backspace: ({ editor }) => {
				const { state } = editor;
				const { selection } = state;
				const { $to } = selection;

				const stepContent = findParentNode(
					(node) => node.type.name === "stepContent",
				)(state.selection);
				if (!stepContent) return false;

				// If we're not in step content, ignore
				if ($to.parent.type.name !== "stepContent") return false;

				// If we're not at the start of the content, ignore
				if ($to.pos !== stepContent.pos + 1) return false;

				// Find the step item and title
				const stepItem = findParentNode(
					(node) => node.type.name === "stepItem",
				)(state.selection);
				if (!stepItem) return false;

				// Get the first child of step item (the title)
				const stepTitle = stepItem.node.firstChild;
				if (!stepTitle || stepTitle.type.name !== "stepTitle") return false;

				// Focus at the end of the title
				return editor
					.chain()
					.focus(stepItem.pos + 1)
					.run();
			},
		};
	},
});
