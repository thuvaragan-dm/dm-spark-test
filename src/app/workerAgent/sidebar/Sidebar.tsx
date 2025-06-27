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
                      d="M11.711 11.517A3.215 3.215 0 008.5 8.305h-.041a3.217 3.217 0 00-3.17 3.213 3.217 3.217 0 003.17 3.213H8.5a3.222 3.222 0 003.212-3.214zm-2.916 1.992a2.014 2.014 0 11-.002-3.984 2.014 2.014 0 01.002 3.984z"
                      fill="currentColor"
                    />
                    <path
                      d="M19.913 17.004c-.019-.002-.041-.002-.06-.002h-.54c.003-.006.009-.01.012-.014a9.57 9.57 0 00.588-.943 9.471 9.471 0 001.142-4.529A9.519 9.519 0 0011.536 2C6.288 2 2.02 6.269 2.02 11.517a9.433 9.433 0 001.73 5.47c.004.006.01.01.013.015h-.6A2.224 2.224 0 001 19.221v.551c0 1.224.995 2.22 2.22 2.22h16.633c1.224 0 2.22-.996 2.22-2.22v-.552a2.22 2.22 0 00-2.16-2.217zM15.989 6.511a.599.599 0 01.848.03 7.248 7.248 0 011.97 4.976 7.31 7.31 0 01-.295 2.065.6.6 0 01-.747.405.602.602 0 01-.405-.746 6.035 6.035 0 00.247-1.725 6.05 6.05 0 00-1.646-4.156.601.601 0 01.028-.849zM4.56 16.042a8.257 8.257 0 01-1.339-4.525c0-4.585 3.732-8.317 8.317-8.317a8.151 8.151 0 012.935.535 8.318 8.318 0 00-4.415 3.909 4.208 4.208 0 012.615 3.873 4.205 4.205 0 01-2.615 3.87c.117.223.245.441.384.655h8.077c-.04.06-.388.604-.618.96H5.213c-.18-.261-.607-.889-.654-.96zm16.313 3.731a1.02 1.02 0 01-1.02 1.02H3.22a1.02 1.02 0 01-1.02-1.02v-.552c0-.561.459-1.02 1.02-1.02h16.634c.561 0 1.02.459 1.02 1.02v.552z"
                      fill="currentColor"
                    />
                  </svg>
                  <p className="text-sm">New</p>
                </Button>
              </Focusable>

              <Tooltip.Content placement="right" offset={10}>
                <Tooltip.Shorcut title="Add new worker agent" />
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
                d="M11.711 11.517A3.215 3.215 0 008.5 8.305h-.041a3.217 3.217 0 00-3.17 3.213 3.217 3.217 0 003.17 3.213H8.5a3.222 3.222 0 003.212-3.214zm-2.916 1.992a2.014 2.014 0 11-.002-3.984 2.014 2.014 0 01.002 3.984z"
                fill="currentColor"
              />
              <path
                d="M19.913 17.004c-.019-.002-.041-.002-.06-.002h-.54c.003-.006.009-.01.012-.014a9.57 9.57 0 00.588-.943 9.471 9.471 0 001.142-4.529A9.519 9.519 0 0011.536 2C6.288 2 2.02 6.269 2.02 11.517a9.433 9.433 0 001.73 5.47c.004.006.01.01.013.015h-.6A2.224 2.224 0 001 19.221v.551c0 1.224.995 2.22 2.22 2.22h16.633c1.224 0 2.22-.996 2.22-2.22v-.552a2.22 2.22 0 00-2.16-2.217zM15.989 6.511a.599.599 0 01.848.03 7.248 7.248 0 011.97 4.976 7.31 7.31 0 01-.295 2.065.6.6 0 01-.747.405.602.602 0 01-.405-.746 6.035 6.035 0 00.247-1.725 6.05 6.05 0 00-1.646-4.156.601.601 0 01.028-.849zM4.56 16.042a8.257 8.257 0 01-1.339-4.525c0-4.585 3.732-8.317 8.317-8.317a8.151 8.151 0 012.935.535 8.318 8.318 0 00-4.415 3.909 4.208 4.208 0 012.615 3.873 4.205 4.205 0 01-2.615 3.87c.117.223.245.441.384.655h8.077c-.04.06-.388.604-.618.96H5.213c-.18-.261-.607-.889-.654-.96zm16.313 3.731a1.02 1.02 0 01-1.02 1.02H3.22a1.02 1.02 0 01-1.02-1.02v-.552c0-.561.459-1.02 1.02-1.02h16.634c.561 0 1.02.459 1.02 1.02v.552z"
                fill="currentColor"
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
