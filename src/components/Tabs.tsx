import { motion } from "motion/react";
import { ComponentProps, useId, useState } from "react";
import { CustomSlottedComponent } from "../types/type-utils";
import { cn } from "../utilities/cn";

export type Tab = {
  id: number;
  Label: string | CustomSlottedComponent<"div">;
};

interface ITabs extends ComponentProps<"div"> {
  tabs: Tab[];
  activeTab: number;
  setActiveTab: (tab: number) => void;
  buttonClass?: string;
  bubbleClass?: string;
  bubbleBorderRadius?: string;
}

const Tabs = ({
  tabs,
  activeTab,
  setActiveTab,
  buttonClass,
  bubbleClass,
  bubbleBorderRadius = "99999px",
  className,
}: ITabs) => {
  const id = useId();
  const [clicked, setClicked] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setClicked(true)}
      onTouchStart={() => setClicked(true)}
      onTouchEnd={() => setClicked(false)}
      onMouseLeave={() => setClicked(false)}
      className={cn("bg-secondary flex space-x-1", className)}
    >
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
          }}
          data-active={activeTab === tab.id}
          className={cn(
            "text-primary ring-secondary relative px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2",
            buttonClass,
            { "text-primary": activeTab === tab.id },
            { "hover:text-primary/80": activeTab !== tab.id },
          )}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {activeTab === tab.id && (
            <motion.span
              key={clicked ? "t" : "f"}
              layoutId={clicked ? id : undefined}
              className={cn(
                "absolute inset-0 z-10 rounded-md bg-white shadow",
                bubbleClass,
              )}
              style={{
                borderRadius: bubbleBorderRadius,
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-20 flex-shrink-0 whitespace-nowrap">
            {typeof tab.Label === "function" ? <tab.Label /> : tab.Label}
          </span>
        </button>
      ))}
    </motion.div>
  );
};

export default Tabs;
