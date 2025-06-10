import * as HoverCard from "@radix-ui/react-hover-card";
import { useEffect, useState } from "react";
import { Focusable } from "react-aria-components";
import { IoGrid } from "react-icons/io5";
import { VscNewFile, VscRobot, VscServer } from "react-icons/vsc";
import { Link, useLocation, useParams } from "react-router-dom";
import Avatar from "../../../components/Avatar";
import Tooltip from "../../../components/tooltip";
import { COMMAND_KEY } from "../../../components/tooltip/TooltipKeyboardShortcut";
import { useAgent, useAgentActions } from "../../../store/agentStore";
import { useChatInputActions } from "../../../store/chatInputStore";
import { cn } from "../../../utilities/cn";
import {
  addAgentToRecentlySelected,
  getRecentlySelectedAgents,
  StoredAgent,
} from "./manageRecentlySelectedAgents";
import { SidebarWrapper } from "./sidebarWrapper";
import AllThreads from "./threads/AllThreads";

const Sidebar = () => {
  const { pathname: path } = useLocation();
  const param = useParams<{ agentPath: string }>();
  const { agents } = useAgent();
  const { setSelectedAgent } = useAgentActions();
  const { reset } = useChatInputActions();
  const [recentlySelectedAgents, setRecentlySelectedAgents] = useState<
    StoredAgent[]
  >([]);

  useEffect(() => {
    const handleGetRecentlySelectedAgents = async () => {
      const loadedAgents = await getRecentlySelectedAgents();

      if (loadedAgents.length <= 0) {
        setRecentlySelectedAgents(agents.slice(0, 4));
        return;
      }

      setRecentlySelectedAgents(loadedAgents);
    };

    handleGetRecentlySelectedAgents();
  }, [param, agents]);

  return (
    <SidebarWrapper>
      <div className="dark:bg-primary-dark relative flex h-full flex-1 flex-col overflow-hidden border-r border-gray-300 bg-white dark:border-white/10">
        <header
          className={cn(
            "sticky top-0 z-[999] flex items-center justify-between overflow-x-hidden px-3 pt-3 pb-0",
          )}
        >
          <div className="">
            <h3 className="font-gilroy text-xl text-gray-800 dark:text-white">
              Deepmodel
            </h3>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Link
                  to={"/"}
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

        <div className="scrollbar mt-2 flex max-h-80 w-full flex-col space-y-1 overflow-x-hidden overflow-y-auto px-3">
          <p className="mb-3 overflow-hidden text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-white/50">
            Available agents
          </p>

          <div className="flex flex-col">
            {recentlySelectedAgents
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((agent) => (
                <HoverCard.Root key={agent.id}>
                  <HoverCard.Trigger asChild>
                    <Link
                      to={`/chat/${agent.path}`}
                      onClick={() => {
                        reset();
                        const selectedAgent = agents.find(
                          (ag) => ag.path === agent.path,
                        );
                        if (selectedAgent) {
                          setSelectedAgent(selectedAgent);
                          addAgentToRecentlySelected(selectedAgent);
                        }
                      }}
                      key={agent.id}
                      className={cn(
                        "-mx-1 flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-lg px-1.5 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5",
                        {
                          "dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary/20 bg-primary text-white":
                            param && param.agentPath === agent.path,
                        },
                      )}
                    >
                      <div className="aspect-square size-6 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/10 dark:border-white/5">
                        <Avatar
                          Fallback={() => (
                            <Avatar.Fallback className="bg-secondary size-6 rounded-md text-xs">
                              {agent.name[0]} {agent.name[1]}
                            </Avatar.Fallback>
                          )}
                          className="relative z-10 flex aspect-square size-6 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner md:p-0"
                          src={agent.avatar || ""}
                        />
                      </div>

                      <div className="w-full truncate text-left">
                        <p className="truncate text-sm font-medium">
                          {agent.name}
                        </p>
                      </div>
                    </Link>
                  </HoverCard.Trigger>

                  <HoverCard.Portal>
                    <HoverCard.Content
                      side="right"
                      sideOffset={2}
                      className="relative flex w-80 flex-col rounded-lg border border-gray-300 bg-white p-1 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="relative flex flex-col p-3">
                        <div className="aspect-square size-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10 dark:border-white/5">
                          <Avatar
                            Fallback={() => (
                              <Avatar.Fallback className="bg-secondary size-12 rounded-full text-xs">
                                {agent.name[0]} {agent.name[1]}
                              </Avatar.Fallback>
                            )}
                            className="relative z-10 flex aspect-square size-12 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner md:p-0"
                            src={agent.avatar || ""}
                          />
                        </div>

                        <h3 className="mt-2 text-base font-medium text-gray-800 dark:text-white">
                          {agent.name}
                        </h3>

                        <p className="mt-2 text-xs text-gray-600 dark:text-white/60">
                          {agent.description}
                        </p>
                      </div>

                      <HoverCard.Arrow
                        className="fill-white dark:fill-[#262626]"
                        asChild
                      >
                        <svg
                          width="20"
                          height="10"
                          viewBox="0 0 24 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="2" />
                          <path
                            d="M24 1C18 1 17 11 12 11C7 11 6 0.999999 8.74228e-07 0.999999"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            className="fill-white stroke-gray-300 dark:fill-[#262626] dark:stroke-white/10"
                          />
                        </svg>
                      </HoverCard.Arrow>
                    </HoverCard.Content>
                  </HoverCard.Portal>
                </HoverCard.Root>
              ))}

            <Link
              to={"/explore"}
              className={cn(
                "-mx-1 flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-lg px-1.5 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5",
                {
                  "dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary/20 bg-primary text-white":
                    path.includes("/explore"),
                },
              )}
            >
              <div className="from-primary-500 to-primary-900 flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white">
                <IoGrid className="size-4" />
              </div>

              <div className="w-full truncate text-left">
                <p className="truncate text-sm font-medium">
                  Explore other agents
                </p>
              </div>
            </Link>
            <Link
              to={"/worker-agents"}
              className={cn(
                "-mx-1 flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-lg px-1.5 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5",
                {
                  "dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary/20 bg-primary text-white":
                    path.includes("/worker-agents"),
                },
              )}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <VscRobot className="size-4" />
              </div>

              <div className="w-full truncate text-left">
                <p className="truncate text-sm font-medium">Worker Agents</p>
              </div>
            </Link>

            <Link
              to={"/mcp"}
              className={cn(
                "-mx-1 flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-lg px-1.5 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5",
                {
                  "dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary/20 bg-primary text-white":
                    path.includes("/mcp"),
                },
              )}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-600 to-amber-800 text-white">
                <VscServer className="size-4" />
              </div>

              <div className="w-full truncate text-left">
                <p className="truncate text-sm font-medium">MCP Servers</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-2 w-full overflow-hidden border-t border-gray-300 pb-2 dark:border-white/10"></div>

        <div className="scrollbar w-full flex-1 overflow-x-hidden overflow-y-auto px-5 pr-3">
          <AllThreads />
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default Sidebar;
