import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "../utilities/cn";
import { VscCopy } from "react-icons/vsc";

interface CopyButtonProps {
  textToCopy: string;
}

export default function CopyButton({ textToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "focus:ring-offset-primary-dark focus-visible::ring-2 pointer-events-auto flex h-8 w-20 cursor-pointer items-center gap-1 overflow-hidden rounded-full border text-xs backdrop-blur-lg select-none focus:ring-sky-500 focus:ring-offset-2 focus:outline-none",
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
            key="copy"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex size-full shrink-0 items-center justify-center gap-1"
          >
            <VscCopy className="size-4" />
            <span>Copy</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy-done"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex size-full shrink-0 items-center justify-center font-medium"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
