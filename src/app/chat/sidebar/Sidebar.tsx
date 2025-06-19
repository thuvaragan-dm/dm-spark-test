import { Focusable } from "react-aria-components";
import { VscNewFile } from "react-icons/vsc";
import { Link } from "react-router-dom";
import Tooltip from "../../../components/tooltip";
import { COMMAND_KEY } from "../../../components/tooltip/TooltipKeyboardShortcut";
import { useChatInputActions } from "../../../store/chatInputStore";
import { cn } from "../../../utilities/cn";
import { SidebarWrapper } from "./sidebarWrapper";
import AllThreads from "./threads/AllThreads";

const Sidebar = () => {
  const { reset } = useChatInputActions();

  return (
    <SidebarWrapper>
      <div className="dark:bg-primary-dark relative flex h-full flex-1 flex-col overflow-hidden border-r border-gray-300 bg-white dark:border-white/10">
        <header
          className={cn(
            "sticky top-0 z-[999] flex items-center justify-between overflow-x-hidden px-3 pt-3 pb-0",
          )}
        >
          <div className="shrink-0">
            <h3 className="font-gilroy text-xl text-gray-800 dark:text-white">
              Spark
            </h3>
            <p className="shrink-0 text-[0.5rem] text-gray-500 dark:text-white/50">
              Powered By Deepmodel
            </p>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Link
                  to={"/home/chat"}
                  className={
                    "text-primary hover:bg-secondary/50 flex shrink-0 items-center justify-start gap-2 rounded-lg p-1 text-xs leading-0 md:p-1 dark:text-white dark:hover:bg-white/10"
                  }
                  onClick={() => {
                    reset();
                  }}
                >
                  <VscNewFile className="size-5" />
                </Link>
              </Focusable>

              <Tooltip.Content placement="right" offset={10}>
                <Tooltip.Shorcut
                  title="New chat"
                  shortcuts={[COMMAND_KEY, "n"]}
                />
                <Tooltip.Arrow className={"-mt-1"} />
              </Tooltip.Content>
            </Tooltip>
            {/* new chat button */}
          </div>
        </header>

        <div className="mt-3 w-full overflow-hidden border-t border-gray-300 pb-2 dark:border-white/10"></div>

        <div className="scrollbar w-full flex-1 overflow-x-hidden overflow-y-auto px-5 pr-3">
          <AllThreads />
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default Sidebar;
