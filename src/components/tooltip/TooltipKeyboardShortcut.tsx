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
            <kbd
              key={idx}
              className="rounded-md bg-gray-200 px-1.5 py-1 text-xs text-gray-800 uppercase dark:bg-white/10 dark:text-white"
            >
              {shortcut}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
};

export const COMMAND_KEY =
  window.electronAPI.osPlatform === "darwin" ? "⌘" : "ctrl";

export default TooltipKeyboardShortcut;
