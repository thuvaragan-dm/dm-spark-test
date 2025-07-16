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
    code: ({ node: _node, inline, className, children, ...props }) => {
      if (inline) {
        // Handle inline code (e.g., `code`)
        return (
          <code
            className="my-1 rounded-sm bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-700"
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
    pre: ({ node: _node, children, ...props }) => {
      return (
        <code className="bg-gray-100 p-0 dark:bg-white/10" {...props}>
          {children}
        </code>
      );
    },
    // Spread any additional components passed in, allowing overrides
    ...(components || {}),
  };
}
