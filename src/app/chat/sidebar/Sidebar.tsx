import { Focusable } from "react-aria-components";
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
            "sticky top-0 z-[999] flex items-center justify-between overflow-x-hidden px-3 pt-3 pb-0 pl-5",
          )}
        >
          <div className="shrink-0">
            <h3 className="font-gilroy text-xl text-gray-800 dark:text-white">
              Spark
            </h3>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Link
                  to={"/home/chat"}
                  className={
                    "hover:bg-secondary/60 bg-secondary dark:bg-primary/30 dark:hover:bg-primary/50 flex shrink-0 items-center justify-start gap-2 rounded-lg p-1 px-2 text-xs leading-0 text-white md:p-1 md:px-2 dark:text-white"
                  }
                  onClick={() => {
                    reset();
                  }}
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zM3.443 12.281l.956.319 1.172 1.76v.916c0 .19.076.37.21.505l1.933 1.933v1.698a8.571 8.571 0 01-4.271-7.13zM12 20.571a8.574 8.574 0 01-1.837-.203l.408-1.225 1.29-3.223a.713.713 0 00-.07-.661l-1.007-1.513a.715.715 0 00-.595-.317H6.668l-.892-1.338 1.52-1.52h1.133V12h1.428v-1.953l2.763-4.836-1.24-.708-.61 1.068H8.81l-.774-1.163a8.471 8.471 0 016.821-.48v2.358a.714.714 0 00.714.714h1.047a.714.714 0 00.594-.318l.627-.94A8.57 8.57 0 0119.78 8.43h-2.91a.714.714 0 00-.7.574l-.516 3.193a.715.715 0 00.386.753l2.388 1.194.489 2.897A8.557 8.557 0 0112 20.571z"
                      fill="currentColor"
                    />
                  </svg>

                  <p className="text-sm">New</p>
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
