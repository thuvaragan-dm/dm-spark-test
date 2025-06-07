import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMDXComponents } from "../mdx-components";

interface MDRendererProps {
  markdownContent?: string;
  components?: Record<string, React.ComponentType<any>>; // Changed unknown to any for broader compatibility
}

export default function MDRenderer({
  markdownContent,
  components,
}: MDRendererProps) {
  // Get the default set of components, allowing overrides from the 'components' prop
  const mdxComponents = useMDXComponents(components || {});

  // Memoize the rendered output to prevent rerenders if markdownContent or components don't change
  return useMemo(() => {
    if (!markdownContent) {
      return null;
    }
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Enable GFM features
        components={mdxComponents} // Pass the custom components
      >
        {markdownContent}
      </ReactMarkdown>
    );
  }, [markdownContent, mdxComponents]);
}
