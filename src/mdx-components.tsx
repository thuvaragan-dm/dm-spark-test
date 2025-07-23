import React from "react";
import CodeBlock from "./components/CodeBlock";

// Define a type for the components mapping
type ReactMarkdownComponents = {
  [key: string]: React.ElementType<any>;
};

export function useMDXComponents(
  components?: ReactMarkdownComponents,
): ReactMarkdownComponents {
  return {
    // Pass through <pre> elements to let CodeBlock handle its own wrapping
    pre: ({ children }) => <>{children}</>,

    code: ({ inline, className, children, ...props }) => {
      // Handle inline code: either inline=true or no className (e.g., `queue.pop(0)`)
      if (inline || !className) {
        return (
          <code
            className="bg-primary-400/10 text-primary-300 my-1 rounded-md px-1 py-0.5 font-mono text-sm font-normal before:content-['']! after:content-['']!"
            {...props}
          >
            {String(children).replace(/^`|`$/g, "")}
          </code>
        );
      }

      // Handle fenced code blocks: className like "language-xxx"
      return (
        <CodeBlock className={className} {...props}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    },
    // Spread any additional components passed in
    ...(components || {}),
  };
}
