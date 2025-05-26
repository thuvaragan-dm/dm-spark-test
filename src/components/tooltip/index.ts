import TooltipArrow from "./TooltipArrow";
import TooltipContent from "./TooltipContent";
import TooltipKeyboardShortcut from "./TooltipKeyboardShortcut";
import TooltipRoot from "./TooltipRoot";

export default Object.assign(TooltipRoot, {
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Shorcut: TooltipKeyboardShortcut,
});
