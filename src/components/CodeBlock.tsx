import { memo } from "react";
import { Highlight, Language, themes } from "prism-react-renderer";
import CopyButton from "./CopyButton";

interface CodeBlockProps {
  className?: string;
  children: string;
}

function CodeBlock({ className, children }: CodeBlockProps) {
  const language =
    (className?.replace("language-", "") as Language | undefined) ??
    "plaintext";
  const codeToCopy = children.trim();

  return (
    <div className="relative my-5 flex w-full flex-col">
      {/* Copy Button */}
      <div className="pointer-events-none absolute inset-0 mx-5 mt-[0.4rem] mb-5">
        <div className="sticky top-0 right-0 z-[9999] flex w-full justify-end overflow-hidden">
          <CopyButton textToCopy={codeToCopy} />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-300 bg-[#1E1E1E] dark:border-white/10">
        {/* Language Header */}
        <div className="-mb-1 flex items-center justify-between border-b border-white/10 bg-[#1E1E1E] px-5 py-3 text-sm text-white capitalize">
          <span>{language}</span>
        </div>

        {/* Code Content */}
        <Highlight code={codeToCopy} language={language} theme={themes.vsDark}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`scrollbar relative overflow-x-auto rounded-b-md p-4 font-mono text-sm leading-loose text-white ${className}`}
              style={style}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

export default memo(CodeBlock);
