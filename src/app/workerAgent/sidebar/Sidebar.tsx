import { ComponentProps } from "react";
import { Focusable } from "react-aria-components";
import { HiOutlineShare, HiOutlineUser } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../../components/Button";
import Tooltip from "../../../components/tooltip";
import { useWorkerAgentActions } from "../../../store/workerAgentStore";
import { cn } from "../../../utilities/cn";
import { SidebarWrapper } from "./sidebarWrapper";

const Sidebar = () => {
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
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
            <p className="shrink-0 text-[0.5rem] text-gray-500 dark:text-white/50">
              Powered By Deepmodel
            </p>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Button
                  variant={"ghost"}
                  onClick={() => setIsRegisterWorkerAgentModalOpen(true)}
                  className={
                    "hover:bg-secondary/60 bg-secondary dark:bg-primary/30 dark:hover:bg-primary/50 flex shrink-0 items-center justify-start gap-1 rounded-lg p-1 px-2 text-xs leading-0 text-white md:p-1 md:px-2 dark:text-white"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.005 14.295c2.386 1.032 4.07 3.576 4.07 6.545 0 .675-.502 1.235-1.136 1.235h-3.585V19.5c0-.656-.483-1.175-1.068-1.175H9.714c-.585 0-1.068.519-1.068 1.175v2.575H5.061c-.634 0-1.136-.56-1.136-1.235 0-2.97 1.684-5.513 4.07-6.545l.041-.018.246.185A6.352 6.352 0 0012 15.675a6.35 6.35 0 003.718-1.213l.246-.185.04.018zm-5.719 5.13c.362 0 .646.322.646.7v1.95H9.64v-1.95c0-.379.284-.7.646-.7zm3.428 0c.173 0 .34.076.46.208a.73.73 0 01.186.492.73.73 0 01-.186.492.624.624 0 01-.46.208.623.623 0 01-.46-.208.73.73 0 01-.186-.492.73.73 0 01.187-.492.623.623 0 01.459-.208zM12 1.925c2.367 0 4.394 1.547 5.291 3.76.607.082 1.07.642 1.07 1.315v2.5c0 .673-.463 1.232-1.07 1.313-.897 2.214-2.924 3.762-5.291 3.762-2.367 0-4.395-1.547-5.292-3.761-.607-.082-1.068-.641-1.068-1.314V7c0-.673.461-1.233 1.068-1.314C7.605 3.472 9.633 1.925 12 1.925zm-2.286 3.9c-.899 0-1.639.8-1.639 1.8v.625c0 2.035 1.508 3.675 3.354 3.675h1.142c1.846 0 3.354-1.64 3.354-3.675v-.625c0-1-.74-1.8-1.639-1.8H9.714zm.572 1.412c.158 0 .293.113.333.272l.203.787.718.223c.154.046.25.196.25.356 0 .16-.097.31-.25.355v.001l-.718.222-.203.788a.348.348 0 01-.333.272.344.344 0 01-.314-.215l-.02-.057-.204-.788-.717-.222a.365.365 0 01-.249-.356c0-.16.096-.31.25-.356l.716-.223.204-.787.02-.057a.344.344 0 01.314-.215z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth={0.15}
                    />
                  </svg>
                  <p className="text-sm">New</p>
                </Button>
              </Focusable>

              <Tooltip.Content placement="right" offset={10}>
                <Tooltip.Shorcut title="Add new connection" />
                <Tooltip.Arrow className={"-mt-1"} />
              </Tooltip.Content>
            </Tooltip>
            {/* new chat button */}
          </div>
        </header>

        <div className="mt-3 w-full overflow-hidden border-t border-gray-300 pb-2 dark:border-white/10"></div>

        <div className="scrollbar flex w-full flex-1 flex-col overflow-x-hidden overflow-y-auto px-2">
          {/* links goes here */}
          <NavLink to="/worker-agents/all">
            <svg
              viewBox="0 0 24 24"
              className="size-4.5 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.005 14.295c2.386 1.032 4.07 3.576 4.07 6.545 0 .675-.502 1.235-1.136 1.235h-3.585V19.5c0-.656-.483-1.175-1.068-1.175H9.714c-.585 0-1.068.519-1.068 1.175v2.575H5.061c-.634 0-1.136-.56-1.136-1.235 0-2.97 1.684-5.513 4.07-6.545l.041-.018.246.185A6.352 6.352 0 0012 15.675a6.35 6.35 0 003.718-1.213l.246-.185.04.018zm-5.719 5.13c.362 0 .646.322.646.7v1.95H9.64v-1.95c0-.379.284-.7.646-.7zm3.428 0c.173 0 .34.076.46.208a.73.73 0 01.186.492.73.73 0 01-.186.492.624.624 0 01-.46.208.623.623 0 01-.46-.208.73.73 0 01-.186-.492.73.73 0 01.187-.492.623.623 0 01.459-.208zM12 1.925c2.367 0 4.394 1.547 5.291 3.76.607.082 1.07.642 1.07 1.315v2.5c0 .673-.463 1.232-1.07 1.313-.897 2.214-2.924 3.762-5.291 3.762-2.367 0-4.395-1.547-5.292-3.761-.607-.082-1.068-.641-1.068-1.314V7c0-.673.461-1.233 1.068-1.314C7.605 3.472 9.633 1.925 12 1.925zm-2.286 3.9c-.899 0-1.639.8-1.639 1.8v.625c0 2.035 1.508 3.675 3.354 3.675h1.142c1.846 0 3.354-1.64 3.354-3.675v-.625c0-1-.74-1.8-1.639-1.8H9.714zm.572 1.412c.158 0 .293.113.333.272l.203.787.718.223c.154.046.25.196.25.356 0 .16-.097.31-.25.355v.001l-.718.222-.203.788a.348.348 0 01-.333.272.344.344 0 01-.314-.215l-.02-.057-.204-.788-.717-.222a.365.365 0 01-.249-.356c0-.16.096-.31.25-.356l.716-.223.204-.787.02-.057a.344.344 0 01.314-.215z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={0.15}
              />
            </svg>
            All worker agents
          </NavLink>
          <NavLink to="/worker-agents/created-by-you">
            <HiOutlineUser className="size-4.5 shrink-0" />
            Created by you
          </NavLink>
          <NavLink to="/worker-agents/shared-with-you">
            <HiOutlineShare className="size-4.5 shrink-0" />
            Shared with you
          </NavLink>
        </div>
      </div>
    </SidebarWrapper>
  );
};

interface INavlink extends ComponentProps<typeof Link> {}
const NavLink = ({ to, children }: INavlink) => {
  const { pathname } = useLocation();
  return (
    <Link
      to={to}
      className={cn(
        "flex w-full shrink-0 items-center justify-start gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap text-gray-800 dark:text-white",
        "hover:bg-gray-200 dark:hover:bg-white/5",
        {
          "bg-secondary dark:bg-primary/30 hover:bg-secondary dark:hover:bg-primary/30 text-white dark:text-white":
            pathname.includes(to.toString()),
        },
      )}
    >
      {children}
    </Link>
  );
};

export default Sidebar;
