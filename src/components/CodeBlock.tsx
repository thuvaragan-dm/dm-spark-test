"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../utilities/cn";

interface CodeBlockProps {
  className?: string;
  children: string;
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "plaintext";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const highlighterCustomStyle = {
    background: "var(--primary-dark)",
  };

  return (
    <div className="relative flex w-full flex-col">
      <div className="pointer-events-none absolute inset-0 mx-5 mt-[3.7rem] mb-5">
        <div className="sticky top-0 right-0 z-[9999] flex w-full justify-end overflow-hidden">
          <div
            role="button"
            onPointerDown={handleCopy}
            className={cn(
              "pointer-events-auto flex h-8 w-20 cursor-pointer items-center gap-1 overflow-hidden rounded-full border text-xs select-none",
              {
                "border-white/10 bg-white/10 text-white/50 hover:bg-white/15":
                  !copied,
                "border-green-500/10 bg-green-500/10 text-green-600 hover:bg-green-500/20":
                  copied,
              },
            )}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {!copied ? (
                <motion.div
                  key={"copy"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex size-full shrink-0 items-center justify-center gap-1 pr-3 pl-2"
                >
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={cn("size-6 fill-transparent transition-colors", {
                      "stroke-white/20": !copied,
                      "stroke-green-600": copied,
                    })}
                  >
                    <path d="M5.5 13.5v-5a2 2 0 012-2l.447-.894A2 2 0 019.737 4.5h.527a2 2 0 011.789 1.106l.447.894a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2z" />
                    <path
                      fill="none"
                      d="M12.5 6.5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2m5 0l-.447-.894a2 2 0 00-1.79-1.106h-.527a2 2 0 00-1.789 1.106L7.5 6.5m5 0l-1 1h-3l-1-1"
                    />
                  </svg>
                  <p>Copy</p>
                </motion.div>
              ) : (
                <motion.div
                  key={"copy-done"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex size-full shrink-0 items-center justify-center"
                >
                  <p>Copied!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-primary-dark flex flex-col overflow-hidden rounded-2xl border border-gray-300 dark:border-white/10">
        {/* Language Header */}
        <div className="bg-primary-dark -mb-1 flex items-center justify-between border-b border-white/10 px-5 py-3 text-sm text-white">
          <span>{language}</span>
        </div>

        {/* Code Content */}
        <SyntaxHighlighter
          language={language}
          style={coldarkDark}
          customStyle={highlighterCustomStyle}
          showLineNumbers
          className="relative overflow-x-auto rounded-b-md p-3 font-mono text-sm"
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
