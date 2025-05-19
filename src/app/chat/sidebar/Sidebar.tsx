import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { IoCreateOutline, IoGrid } from "react-icons/io5";
import { Link, useLocation, useParams } from "react-router-dom";
import Avatar from "../../../components/Avatar";
import { Button } from "../../../components/Button";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useAgent, useAgentActions } from "../../../store/agentStore";
import { useChatInputActions } from "../../../store/chatInputStore";
import { useSidebar, useSidebarActions } from "../../../store/sidebarStore";
import capitalizeFirstLetter from "../../../utilities/capitalizeFirstLetter";
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
  const { isSidebarExpanded, isSidebarVisible } = useSidebar();
  const { setIsSidebarExpanded, setIsSidebarVisible } = useSidebarActions();
  const isMd = useBreakpoint("md");
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
    <>
      <SidebarWrapper>
        <div className="dark:bg-primary-dark relative flex h-full flex-1 flex-col overflow-visible border-r border-gray-300 bg-white dark:border-white/10">
          <header
            className={cn(
              "sticky top-5 z-[999] flex items-center justify-between overflow-x-hidden px-3 pt-3 pb-0",
            )}
          >
            {/* sidebar toggle button */}
            <Button
              variant={"ghost"}
              className={
                "text-primary dark:text-secondary flex items-center justify-start gap-2 rounded-lg p-2 text-xs leading-0 md:p-1"
              }
              onClick={() => {
                if (isMd) {
                  setIsSidebarExpanded((pv) => !pv);
                } else {
                  setIsSidebarVisible((pv) => !pv);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M14.7 2c1.966 0 3.523 0 4.742.157 1.253.162 2.269.502 3.07 1.27.8.768 1.155 1.741 1.324 2.943C24 7.54 24 9.032 24 10.917v2.166c0 1.885 0 3.378-.164 4.546-.169 1.202-.524 2.176-1.324 2.944-.801.767-1.817 1.108-3.07 1.27-1.22.157-2.776.157-4.743.157H9.327a.86.86 0 01-.077-.002c-1.48-.004-2.699-.027-3.692-.155-1.253-.162-2.269-.503-3.07-1.27-.8-.768-1.155-1.742-1.324-2.944C1 16.46 1 14.968 1 13.083v-2.166c0-1.885 0-3.379.164-4.547.169-1.202.524-2.175 1.324-2.943.801-.768 1.817-1.108 3.07-1.27C6.551 2.029 7.77 2.005 9.25 2a.847.847 0 01.078 0H14.699zm-4.607 1.538h4.546c2.04 0 3.489.002 4.59.144 1.075.138 1.695.399 2.148.833.452.434.724 1.029.869 2.06.147 1.055.15 2.443.15 4.4v2.05c0 1.956-.003 3.346-.15 4.4-.145 1.031-.417 1.626-.87 2.06-.452.434-1.072.694-2.148.833-1.1.141-2.548.143-4.589.143h-4.546V3.538zM8.488 20.455c-1.106-.01-1.987-.043-2.717-.137-1.075-.139-1.695-.4-2.148-.833-.452-.434-.724-1.029-.869-2.06-.147-1.054-.15-2.444-.15-4.4v-2.05c0-1.957.003-3.345.15-4.4.145-1.031.417-1.626.87-2.06.452-.434 1.072-.695 2.148-.833.728-.094 1.61-.126 2.716-.137v16.91z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            {/* sidebar toggle button */}

            <div className="flex items-center justify-end">
              {/* new chat button */}
              <Link
                to={"/"}
                className={
                  "text-primary dark:text-secondary flex items-center justify-start gap-2 rounded-lg p-2 text-xs leading-0 md:p-1"
                }
                onClick={() => {
                  reset();
                }}
              >
                <IoCreateOutline className="size-6" />
              </Link>
              {/* new chat button */}
            </div>
          </header>

          <div className="mt-8 max-h-72 w-full overflow-y-auto px-3">
            {/* Selected agent always shown on top */}
            {recentlySelectedAgents
              .filter((agent) => agent.path === param.agentPath)
              .map((agent) => (
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
                    "dark:hover:bg-primary-dark-foreground -mx-1 flex items-center justify-start gap-2 rounded-xl px-2 py-2 hover:bg-gray-100",
                    {
                      "dark:bg-primary-dark-foreground bg-gray-100":
                        param && param.agentPath === agent.path,
                    },
                  )}
                >
                  <div className="bg-secondary size-8 shrink-0 rounded-full">
                    <Avatar
                      Fallback={() => (
                        <Avatar.Fallback className="bg-secondary size-8 text-xs">
                          {agent.name[0]} {agent.name[1]}
                        </Avatar.Fallback>
                      )}
                      className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-8 w-full shrink-0 items-center justify-center overflow-hidden rounded-full object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                      src={agent.avatar || ""}
                    />
                  </div>

                  <div className="w-full truncate text-left">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                      {agent.name}
                    </p>
                    <p className="truncate text-xs text-gray-600 dark:text-white/60">
                      {capitalizeFirstLetter(agent.description)}
                    </p>
                  </div>
                </Link>
              ))}

            {recentlySelectedAgents
              .filter((agent) => agent.path !== param.agentPath)
              .map((agent) => (
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
                    "dark:hover:bg-primary-dark-foreground -mx-1 flex items-center justify-start gap-2 rounded-xl px-2 py-2 hover:bg-gray-100",
                    {
                      "dark:bg-primary-dark-foreground bg-gray-100":
                        param && param.agentPath === agent.path,
                    },
                  )}
                >
                  <div className="bg-secondary size-8 shrink-0 rounded-full">
                    <Avatar
                      Fallback={() => (
                        <Avatar.Fallback className="bg-secondary size-8 text-xs">
                          {agent.name[0]} {agent.name[1]}
                        </Avatar.Fallback>
                      )}
                      className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-8 w-full shrink-0 items-center justify-center overflow-hidden rounded-full object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                      src={agent.avatar || ""}
                    />
                  </div>

                  <div className="w-full truncate text-left">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                      {agent.name}
                    </p>
                    <p className="truncate text-xs text-gray-600 dark:text-white/60">
                      {capitalizeFirstLetter(agent.description)}
                    </p>
                  </div>
                </Link>
              ))}

            <Link
              to={"/explore"}
              className={cn(
                "dark:hover:bg-primary-dark-foreground -mx-1 flex items-center justify-start gap-2 rounded-xl px-2 py-2 hover:bg-gray-100",
                {
                  "dark:bg-primary-dark-foreground bg-gray-100":
                    path.includes("agents/explore"),
                },
              )}
            >
              <div className="from-primary-700 to-primary-900 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white">
                <IoGrid className="size-4" />
              </div>

              <div className="w-full truncate text-left">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                  Explore other agents
                </p>
                <p className="truncate text-xs text-gray-600 dark:text-white/60">
                  Lorem ipsum dolor sit amet.
                </p>
              </div>
            </Link>
          </div>

          <div className="scrollbar mt-5 w-full flex-1 overflow-x-hidden overflow-y-auto px-5 pr-3">
            <AllThreads />
          </div>
        </div>
      </SidebarWrapper>

      {/* desktop sidebar closed state */}
      <AnimatePresence>
        {!isSidebarExpanded && (
          <motion.div
            initial={"visible"}
            animate={"visible"}
            exit={"hidden"}
            variants={{
              visible: {
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                filter: "blur(10px)",
                opacity: 0,
              },
            }}
            className="absolute top-0 left-0 z-[9999999] mt-8 ml-3 hidden items-start justify-start gap-2 md:flex"
          >
            {/* sidebar toggle button */}
            <Button
              variant={"ghost"}
              className={
                "text-primary dark:text-secondary flex items-center justify-start gap-2 rounded-lg p-2 text-xs leading-0 md:p-1"
              }
              onClick={() => {
                setIsSidebarExpanded((pv) => !pv);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M14.7 2c1.966 0 3.523 0 4.742.157 1.253.162 2.269.502 3.07 1.27.8.768 1.155 1.741 1.324 2.943C24 7.54 24 9.032 24 10.917v2.166c0 1.885 0 3.378-.164 4.546-.169 1.202-.524 2.176-1.324 2.944-.801.767-1.817 1.108-3.07 1.27-1.22.157-2.776.157-4.743.157H9.327a.86.86 0 01-.077-.002c-1.48-.004-2.699-.027-3.692-.155-1.253-.162-2.269-.503-3.07-1.27-.8-.768-1.155-1.742-1.324-2.944C1 16.46 1 14.968 1 13.083v-2.166c0-1.885 0-3.379.164-4.547.169-1.202.524-2.175 1.324-2.943.801-.768 1.817-1.108 3.07-1.27C6.551 2.029 7.77 2.005 9.25 2a.847.847 0 01.078 0H14.699zm-4.607 1.538h4.546c2.04 0 3.489.002 4.59.144 1.075.138 1.695.399 2.148.833.452.434.724 1.029.869 2.06.147 1.055.15 2.443.15 4.4v2.05c0 1.956-.003 3.346-.15 4.4-.145 1.031-.417 1.626-.87 2.06-.452.434-1.072.694-2.148.833-1.1.141-2.548.143-4.589.143h-4.546V3.538zM8.488 20.455c-1.106-.01-1.987-.043-2.717-.137-1.075-.139-1.695-.4-2.148-.833-.452-.434-.724-1.029-.869-2.06-.147-1.054-.15-2.444-.15-4.4v-2.05c0-1.957.003-3.345.15-4.4.145-1.031.417-1.626.87-2.06.452-.434 1.072-.695 2.148-.833.728-.094 1.61-.126 2.716-.137v16.91z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            {/* sidebar toggle button */}

            {/* new chat button */}
            <Button
              variant={"ghost"}
              className={
                "text-primary dark:text-secondary flex items-center justify-start gap-2 rounded-lg p-2 text-xs leading-0 md:p-1"
              }
              onClick={() => {}}
            >
              <IoCreateOutline className="-mt-0.5 size-6" />
            </Button>
            {/* new chat button */}
          </motion.div>
        )}
      </AnimatePresence>
      {/* desktop sidebar closed state */}

      {/* mobile sidebar closed state */}
      <AnimatePresence>
        {!isSidebarVisible && (
          <motion.div
            initial={"visible"}
            animate={"visible"}
            exit={"hidden"}
            variants={{
              visible: {
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                filter: "blur(10px)",
                opacity: 0,
              },
            }}
            className="absolute top-0 left-0 z-[9999999] flex items-start justify-start gap-2 p-3 md:hidden"
          >
            {/* sidebar toggle button */}
            <Button
              variant={"ghost"}
              className={
                "text-primary dark:text-secondary flex items-center justify-start gap-2 rounded-lg p-2 text-xs leading-0 md:p-1"
              }
              onClick={() => {
                setIsSidebarVisible((pv) => !pv);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M14.7 2c1.966 0 3.523 0 4.742.157 1.253.162 2.269.502 3.07 1.27.8.768 1.155 1.741 1.324 2.943C24 7.54 24 9.032 24 10.917v2.166c0 1.885 0 3.378-.164 4.546-.169 1.202-.524 2.176-1.324 2.944-.801.767-1.817 1.108-3.07 1.27-1.22.157-2.776.157-4.743.157H9.327a.86.86 0 01-.077-.002c-1.48-.004-2.699-.027-3.692-.155-1.253-.162-2.269-.503-3.07-1.27-.8-.768-1.155-1.742-1.324-2.944C1 16.46 1 14.968 1 13.083v-2.166c0-1.885 0-3.379.164-4.547.169-1.202.524-2.175 1.324-2.943.801-.768 1.817-1.108 3.07-1.27C6.551 2.029 7.77 2.005 9.25 2a.847.847 0 01.078 0H14.699zm-4.607 1.538h4.546c2.04 0 3.489.002 4.59.144 1.075.138 1.695.399 2.148.833.452.434.724 1.029.869 2.06.147 1.055.15 2.443.15 4.4v2.05c0 1.956-.003 3.346-.15 4.4-.145 1.031-.417 1.626-.87 2.06-.452.434-1.072.694-2.148.833-1.1.141-2.548.143-4.589.143h-4.546V3.538zM8.488 20.455c-1.106-.01-1.987-.043-2.717-.137-1.075-.139-1.695-.4-2.148-.833-.452-.434-.724-1.029-.869-2.06-.147-1.054-.15-2.444-.15-4.4v-2.05c0-1.957.003-3.345.15-4.4.145-1.031.417-1.626.87-2.06.452-.434 1.072-.695 2.148-.833.728-.094 1.61-.126 2.716-.137v16.91z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            {/* sidebar toggle button */}
          </motion.div>
        )}
      </AnimatePresence>
      {/* mobile sidebar closed state */}
    </>
  );
};

export default Sidebar;
