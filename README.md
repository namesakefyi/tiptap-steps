# tiptap-steps

A step-by-step guide extension for [Tiptap](https://tiptap.dev/).

![NPM Badge](https://img.shields.io/npm/v/tiptap-steps) [![CI](https://github.com/namesakefyi/tiptap-steps/actions/workflows/test.yml/badge.svg)](https://github.com/namesakefyi/tiptap-steps/actions/workflows/test.yml)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/namesakefyi/tiptap-steps/tree/main/examples/react?file=src%2FApp.tsx&title=Tiptap%20Steps%20Demo)

## Getting Started

### Installation

```zsh
npm install tiptap-steps
```

## Usage

This package is separated into 4 main extensions:

1. `Steps`: The container for an ordered list
2. `StepItem`: The container for the title and content of a single list item
3. `StepTitle`: The title for an item
4. `StepContent`: The contents for an item

In order to insert and use steps, one or more nodes within your document need to accept the `"steps"` [content type](https://tiptap.dev/docs/editor/core-concepts/schema#content).

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Steps, StepItem, StepTitle, StepContent } from "tiptap-steps";
import Document from "@tiptap/extension-document";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Document.extend({
        // Change from "block+" (default)
        content: "(block | steps)+", 
      }),
      // Pass in the steps extensions
      Steps,
      StepItem,
      StepTitle,
      StepContent
    ],
    content: "Hello world",
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
```

### Styling

If you want the steps to look like the example, add this CSS to your app:

```css
ol[data-type="steps"] {
  counter-reset: steps;
  display: flex;
  flex-direction: column;

  &:not(:first-child) {
    margin-top: 1.5rem;
  }
}

li[data-type="step-item"] {
  padding: 0;
  counter-increment: steps;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: 32px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "number title"
    "line content";

  &::before {
    all: unset;
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    grid-area: number;
    content: counter(steps);
    background-color: #00000017;
  }

  &::after {
    grid-area: line;
    width: 2px;
    height: 100%;
    margin-inline: auto;
    background-color: #0000000F;
    content: "";
  }

  &:last-child::after {
    visibility: hidden;
  }

  &:last-child div[data-type="step-content"] {
    padding-bottom: 0.75rem;
  }
}

div[data-type="step-title"] {
  grid-area: title;
  font-size: 2rem;
  font-weight: medium;
}

div[data-type="step-content"] {
  grid-area: content;
  padding-block-end: 1.5rem;
}
```

### Placeholders

If you want to display placeholder text for the title or description, add the [Tiptap Placeholder extension](https://tiptap.dev/docs/editor/extensions/functionality/placeholder):

```zsh
npm install @tiptap/extension-placeholder
```

Then add it to your editor config:

```tsx
import Placeholder from "@tiptap/extension-placeholder";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      // ...other document extensions
      Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false, 
        placeholder: ({ node }) => {
          // Return different placeholders depending on node type
          if (node.type.name === "stepTitle") {
            return "Add a title…";
          }
    
          if (node.type.name === "stepContent") {
            return "Add instructions…";
          }
    
          return "Write something…";
        },
      }),
      // Pass in the steps extensions
      Steps,
      StepItem,
      StepTitle,
      StepContent
    ]
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
```

The placeholder is unstyled by default, so be sure to add CSS styles:

```css
div[data-type='step-title'].is-empty::before,
div[data-type='step-content'].is-empty::before {
  content: attr(data-placeholder);
  color: #00000050;
  float: left;
  height: 0;
  pointer-events: none;
}
```

Read more about the [Tiptap placeholder extension](https://tiptap.dev/docs/editor/extensions/functionality/placeholder).

