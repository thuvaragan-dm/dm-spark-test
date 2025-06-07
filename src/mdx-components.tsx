import React from "react";
import CodeBlock from "./components/CodeBlock";

// Define a type for the components mapping that react-markdown expects
// It's a mapping from HTML tag name (or custom component name) to a React component.
type ReactMarkdownComponents = {
  [key: string]: React.ElementType<any>; // Using ElementType for flexibility
};

export function useMDXComponents(
  components?: ReactMarkdownComponents,
): ReactMarkdownComponents {
  return {
    h1: ({ node: _node, ...props }) => (
      <h1
        className="mt-8 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
        {...props}
      />
    ),
    h2: ({ node: _node, ...props }) => (
      <h2
        className="mt-6 mb-3 text-2xl font-bold text-gray-800 dark:text-white"
        {...props}
      />
    ),
    p: ({ node: _node, ...props }) => (
      <p
        className="my-4 text-base leading-7 text-gray-800 dark:text-white"
        {...props}
      />
    ),
    pre: ({ node: _node, children, ...props }) => (
      // The CodeBlock component itself might render a <pre> tag.
      // If CodeBlock doesn't render a <pre>, you'd wrap it here:
      // <pre className="your-pre-styles" {...props}>{children}</pre>
      // For now, assuming CodeBlock handles the <pre> or is styled to fit.
      <div {...props}>{children}</div> // Simple div wrapper for the 'pre' element from markdown
    ),
    code: ({ node: _node, inline, className, children, ...props }) => {
      if (inline) {
        // Handle inline code (e.g., `code`)
        return (
          <code
            className="rounded-sm bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-700"
            {...props}
          >
            {children}
          </code>
        );
      }
      // Handle block code
      // Assuming CodeBlock path is correct relative to this file.
      // If mdx-components.tsx is in src/ and CodeBlock is in src/components/CodeBlock.tsx
      // the import at the top should be './components/CodeBlock'
      return (
        <CodeBlock className={className} {...props}>
          {String(children)}
        </CodeBlock>
      );
    },
    ul: ({ node: _node, ...props }) => (
      <ul
        className="my-4 list-inside list-disc space-y-2 text-gray-800 dark:text-white"
        {...props}
      />
    ),
    ol: ({ node: _node, ...props }) => (
      <ol
        className="my-4 list-inside list-decimal space-y-2 text-gray-800 dark:text-white"
        {...props}
      />
    ),
    blockquote: ({ node: _node, ...props }) => (
      <blockquote
        className="my-4 border-l-4 border-gray-300 bg-gray-50 py-1 pl-4 text-gray-600 italic dark:border-white/10 dark:text-white/60"
        {...props}
      />
    ),
    img: ({ node: _node, ...props }) => (
      <img
        {...props}
        alt={props.alt || "chat image"} // Provide a default alt if not present
        className="my-4 max-w-full rounded-md shadow-sm"
      />
    ),
    table: ({ node: _node, ...props }) => (
      <div className="scrollbar my-6 overflow-x-auto">
        <table
          className="w-full border-collapse border border-gray-200 dark:border-gray-700"
          {...props}
        />
      </div>
    ),
    th: ({ node: _node, isHeader: _isHeader, ...props }) => (
      <th
        className="border border-gray-200 bg-gray-100 p-3 text-left font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        {...props}
      />
    ),
    td: ({ node: _node, isHeader: _isHeader, ...props }) => (
      <td
        className="border border-gray-200 p-3 text-gray-800 dark:border-gray-600 dark:text-white"
        {...props}
      />
    ),
    div: ({ node: _node, isHeader: _isHeader, ...props }) => (
      <div className="my-5 text-gray-800 dark:text-white" {...props} />
    ),
    // Spread any additional components passed in, allowing overrides
    ...(components || {}),
  };
}
