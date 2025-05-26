import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";

interface ITooltipKeyboardShortcut extends ComponentProps<"div"> {
  title: string;
  shortcuts?: string[];
}

const TooltipKeyboardShortcut = ({
  title,
  shortcuts,
  className,
  ...props
}: ITooltipKeyboardShortcut) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-gray-800 select-none dark:text-white",
        className,
      )}
      {...props}
    >
      <p className="text-center text-sm">{title}</p>

      {shortcuts && shortcuts.length > 0 && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {shortcuts.map((shortcut, idx) => (
            <pre
              key={idx}
              className="flex size-5 items-center justify-center rounded-sm bg-gray-200 text-sm font-medium shadow-sm dark:bg-white/10"
            >
              {shortcut}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
};

export const COMMAND_KEY =
  window.electronAPI.osPlatform === "darwin" ? "⌘" : "ctrl";

export default TooltipKeyboardShortcut;
