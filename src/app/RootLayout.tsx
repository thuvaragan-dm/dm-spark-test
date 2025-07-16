import { ComboboxOption } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Focusable } from "react-aria-components";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import {
  VscClose,
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscSearch,
} from "react-icons/vsc";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetPrompts } from "../api/prompt/useGetPrompts";
import icon from "../assets/icon.png";
import Avatar from "../components/Avatar";
import { Button } from "../components/Button";
import Combobox from "../components/Combobox";
import Dropdown from "../components/dropdown";
import Tooltip from "../components/tooltip";
import { COMMAND_KEY } from "../components/tooltip/TooltipKeyboardShortcut";
import { useAppHistory } from "../hooks/useAppHistory";
import { useAuth, useAuthActions } from "../store/authStore";
import { useChatInputActions } from "../store/chatInputStore";
import { useCombobox, useComboboxActions } from "../store/comboboxStore";
import { useAppConfig, useAppConfigActions } from "../store/configurationStore";
import { usePromptAction } from "../store/promptStore";
import { useSidebar, useSidebarActions } from "../store/sidebarStore";
import { useWorkerAgentActions } from "../store/workerAgentStore";
import { cn } from "../utilities/cn";
import fuzzySearch from "../utilities/fuzzySearch";
import Login from "./Login";
import { SettingsModal } from "./Settings";
import UserLoading from "./UserLoading";

const RootLayout = () => {
  const navigate = useNavigate();
  const { setQuery: setChatQuery } = useChatInputActions();
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
  const { pathname: path } = useLocation();
  const { config, showAnnouncement, apiUrl } = useAppConfig();
  const { setShowAnnouncement } = useAppConfigActions();
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser, logout, setMCP } = useAuthActions();
  const { setIsCreatePromptDrawerOpen } = usePromptAction();

  useEffect(() => {
    // 1. Check for a token that might already be stored on disk.
    const initialToken = window.electronAPI.getToken();

    if (initialToken && !accessToken) {
      console.log("[RootLayout] Setting initial token from storage.");
      setAccessToken(initialToken);
    }

    // 2. If we have a token but no user data, fetch the user.
    // This handles both the initial load and cases where the user state might be cleared.
    if (accessToken && !user) {
      console.log("[RootLayout] Token found, fetching user...");
      refetchUser();
    }
  }, [accessToken, user, setAccessToken, refetchUser]);

  useEffect(() => {
    const handleTokenReceived = (token: string) => {
      setAccessToken(token);
      refetchUser();
    };

    const unsubscribe = window.electronAPI.onTokenReceived(handleTokenReceived);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setAccessToken, refetchUser]);

  useEffect(() => {
    const handleTokensReceived = (tokens: Record<string, any> | null) => {
      if (!tokens) return;
      console.log({ tokens });
      setMCP(tokens);
    };

    const unsubscribe =
      window.electronAPI.onMCPTokensReceived(handleTokensReceived);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setMCP]);

  const { canGoBack, canGoForward } = useAppHistory();

  const { isSidebarExpanded } = useSidebar();
  const { setIsSidebarExpanded } = useSidebarActions();

  useEffect(() => {
    let cleanupToggleSidebarListener = () => {};

    if (window.electronAPI && window.electronAPI.onToggleSidebar) {
      cleanupToggleSidebarListener = window.electronAPI.onToggleSidebar(() => {
        setIsSidebarExpanded((prev) => !prev);
      });
    }

    return () => {
      cleanupToggleSidebarListener();
    };
  }, [setIsSidebarExpanded]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { isLoading, isOpen, query, recentOptions } = useCombobox();
  const { setIsOpen, setQuery, addRecentOption } = useComboboxActions();

  const promptsEnabled = !!apiUrl && !!accessToken;
  const { data: prompts } = useGetPrompts(
    { page: 1, records_per_page: 20 },
    { enabled: promptsEnabled },
  );

  useEffect(() => {
    let cleanupToggleSearchBarListener = () => {};

    if (window.electronAPI && window.electronAPI.onToggleSearchBar) {
      cleanupToggleSearchBarListener = window.electronAPI.onToggleSearchBar(
        () => {
          setIsOpen((prev) => !prev);
        },
      );
    }

    return () => {
      cleanupToggleSearchBarListener();
    };
  }, [setIsOpen]);

  interface ComboboxResult {
    id: string;
    name: string;
    onClick?: () => void;
  }

  const gotoSearchOptions = useMemo<ComboboxResult[]>(
    () => [
      {
        id: "goto-1",
        name: "Goto: Chat",
        onClick: () => {
          navigate("/home/chat");
        },
      },
      {
        id: "goto-2",
        name: "Goto: Memory",
        onClick: () => {
          navigate("/memory");
        },
      },
      {
        id: "goto-3",
        name: "Goto: All Worker Agents",
        onClick: () => {
          navigate("/worker-agents/all");
        },
      },
      {
        id: "goto-4",
        name: "Goto: Worker Agents Created by you",
        onClick: () => {
          navigate("/worker-agents/created-by-you");
        },
      },
      {
        id: "goto-5",
        name: "Goto: Worker Agents Shared with you",
        onClick: () => {
          navigate("/worker-agents/shared-with-you");
        },
      },
      {
        id: "goto-6",
        name: "Goto: All MCP Servers",
        onClick: () => {
          navigate("/mcp/connections");
        },
      },
      {
        id: "goto-7",
        name: "Goto: MCP Servers Created by you",
        onClick: () => {
          navigate("/mcp/created-by-you");
        },
      },
      {
        id: "goto-8",
        name: "Goto: MCP Servers Shared with you",
        onClick: () => {
          navigate("/mcp/shared-with-you");
        },
      },
      {
        id: "goto-9",
        name: "Goto: Blueprints",
        onClick: () => {
          navigate("/blueprints");
        },
      },
      {
        id: "goto-10",
        name: "Goto: Bootcamp",
        onClick: () => {
          navigate("/bootcamp");
        },
      },
      {
        id: "goto-11",
        name: "Goto: All prompts",
        onClick: () => {
          navigate("/prompts/all");
        },
      },
      {
        id: "goto-12",
        name: "Goto: Prompts Created by you",
        onClick: () => {
          navigate("/prompts/created-by-you");
        },
      },
      {
        id: "goto-13",
        name: "Goto: Prompts Shared with you",
        onClick: () => {
          navigate("/prompts/shared-with-you");
        },
      },
    ],
    [navigate],
  );

  const workerAgentRelatedOptions = useMemo<ComboboxResult[]>(
    () => [
      {
        id: "wa-1",
        name: "Worker Agent: Create new worker agent",
        onClick: () => {
          navigate("/worker-agents/all");
          setTimeout(() => {
            setIsRegisterWorkerAgentModalOpen(true);
          }, 100);
        },
      },
    ],
    [navigate, setIsRegisterWorkerAgentModalOpen],
  );

  const mcpRelatedOptions = useMemo<ComboboxResult[]>(
    () => [
      {
        id: "mcp-1",
        name: "MCP: Add new MCP Server",
        onClick: () => {
          navigate("/mcp/templates");
        },
      },
    ],
    [navigate],
  );

  const promptsRelatedOptions = useMemo<ComboboxResult[]>(
    () => [
      {
        id: "prompt-1",
        name: "Prompt: Create new prompt",
        onClick: () => {
          navigate("/prompts/all");
          setTimeout(() => {
            setIsCreatePromptDrawerOpen(true);
          }, 100);
        },
      },
    ],
    [navigate, setIsCreatePromptDrawerOpen],
  );

  const askPromptOptions = useMemo<ComboboxResult[]>(() => {
    if (prompts && prompts.items.length > 0) {
      return prompts.items.map((prompt) => ({
        id: prompt.id,
        name: `Ask: Use Prompt ${prompt.name}`,
        onClick: () => {
          navigate("/home/chat");
          setTimeout(() => {
            setChatQuery(prompt.prompt);
          }, 100);
        },
      }));
    }
    return [];
  }, [prompts, navigate, setChatQuery]);

  const defaultSearchOptions: ComboboxResult[] = useMemo(
    () => [
      {
        id: "1",
        name: "Sidebar: Toggle sidebar",
        onClick: () => {
          setIsSidebarExpanded((pv) => !pv);
        },
      },
      {
        id: "2",
        name: "Settings: Open user preferences",
        onClick: () => {
          setIsSettingsModalOpen((pv) => !pv);
        },
      },
    ],
    [setIsSidebarExpanded, setIsSettingsModalOpen],
  );

  const filteredSearchOptions = useMemo(() => {
    const combinedOptions = [
      ...gotoSearchOptions,
      ...defaultSearchOptions,
      ...askPromptOptions,
      ...workerAgentRelatedOptions,
      ...mcpRelatedOptions,
      ...promptsRelatedOptions,
    ];

    if (query) {
      const filtered = combinedOptions.filter((option) =>
        fuzzySearch(query, option.name),
      );

      if (filtered.length > 0) {
        return filtered;
      } else {
        return [
          {
            id: "ask",
            name: `Ask: ${query}`,
            onClick: () => {
              navigate(`/home/chat?trigger-submit=true`);
              setTimeout(() => {
                setChatQuery(query);
              }, 100);
            },
          },
        ];
      }
    }

    const recentOptionIds = new Set(recentOptions.map((o) => o.id));
    const otherOptions = combinedOptions.filter(
      (option) => !recentOptionIds.has(option.id),
    );
    return [...recentOptions, ...otherOptions];
  }, [
    query,
    recentOptions,
    gotoSearchOptions,
    askPromptOptions,
    workerAgentRelatedOptions,
    defaultSearchOptions,
    mcpRelatedOptions,
    promptsRelatedOptions,
    navigate,
    setChatQuery,
  ]);

  const anouncement = useMemo(
    () => config?.global?.global_announcement || config?.version?.announcement,
    [config],
  );

  return (
    <main className="from-sidepanel-start to-sidepanel-end @container relative flex h-dvh w-full flex-col bg-linear-to-br/oklch font-sans">
      <div className="app-region-drag pointer-events-none absolute inset-x-0 z-20 h-10"></div>
      <nav className="absolute inset-x-0 top-0 z-10 flex h-10 flex-col items-center justify-center bg-transparent">
        {accessToken && user && (
          <div
            className={cn(
              "relative flex w-full flex-1 items-center justify-between px-1.5",
            )}
          >
            <div className="flex h-full w-full items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className="rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    disabled={!canGoBack}
                    onClick={() => navigate(-1)}
                  >
                    <IoArrowBack className="size-6" />
                  </Button>
                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Back in history"
                      shortcuts={[COMMAND_KEY, "["]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>

                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className="rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    disabled={!canGoForward}
                    onClick={() => navigate(+1)}
                  >
                    <IoArrowForward className="size-6" />
                  </Button>
                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Forward in history"
                      shortcuts={[COMMAND_KEY, "]"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
              </div>

              <div className="w-full max-w-lg">
                <Tooltip>
                  <Focusable>
                    <button
                      onClick={() => setIsOpen((prev) => !prev)}
                      className="app-region-no-drag flex w-full cursor-pointer items-center justify-start gap-2 rounded-md bg-white/15 px-2 py-1 text-sm font-light tracking-wide text-white/50"
                    >
                      <VscSearch className="size-4" />
                      <p>Spark Search...</p>
                    </button>
                  </Focusable>
                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Search Spark"
                      shortcuts={[COMMAND_KEY, "k"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
              </div>

              <div className="flex items-center justify-start gap-1">
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className="rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    onClick={() => setIsSidebarExpanded((pv) => !pv)}
                  >
                    {isSidebarExpanded ? (
                      <VscLayoutSidebarLeft className="size-6" />
                    ) : (
                      <VscLayoutSidebarLeftOff className="size-6" />
                    )}
                  </Button>
                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Toggle sidebar"
                      shortcuts={[COMMAND_KEY, "b"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </nav>

      {!accessToken && !user && <Login />}
      {accessToken && !user && <UserLoading />}

      {accessToken && user && (
        <>
          <section className="mt-10 flex w-full flex-1 flex-col overflow-hidden">
            <AnimatePresence mode="popLayout">
              {anouncement && showAnnouncement && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full p-1.5 pt-0"
                >
                  <div className="bg-primary-600/20 dark:bg-primary-600/20 flex w-full items-center justify-between gap-10 rounded-xl p-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        {anouncement.title}
                      </h3>
                      <p className="text-xs text-white/60">
                        {anouncement.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      {anouncement?.cta && (
                        <Button
                          onClick={() => {
                            if (window.electronAPI?.send) {
                              window.electronAPI.send(
                                "open-external-url",
                                anouncement.cta.link,
                              );
                            }
                          }}
                          variant={"ghost"}
                          className="text-primary rounded-lg bg-white p-3 py-1.5 hover:bg-white/90 data-[pressed]:bg-white/90 md:p-3 md:py-1.5 dark:bg-white dark:hover:bg-white/90 dark:data-[pressed]:bg-white/90"
                        >
                          {anouncement.cta.name}
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowAnnouncement(false)}
                        variant={"ghost"}
                        className="rounded-lg bg-transparent p-1.5 text-white hover:bg-white/5 data-[pressed]:bg-white/90 md:p-1.5 dark:bg-transparent dark:hover:bg-white/5 dark:data-[pressed]:bg-white/5"
                      >
                        <VscClose className="size-6" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-1.5 flex h-full w-full items-start justify-start overflow-hidden">
              <div className="mt-3 flex h-full w-20 flex-col items-center justify-between overflow-hidden pb-4">
                <div className="flex flex-1 flex-col items-center justify-start gap-3">
                  <div className="mb-2 aspect-square w-min rounded-xl bg-white/10 text-white">
                    <img
                      src={icon}
                      alt="Spark Logo"
                      className="size-12 object-cover"
                    />
                  </div>

                  <Link
                    to="/home/chat"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/home") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          className="size-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zM3.443 12.281l.956.319 1.172 1.76v.916c0 .19.076.37.21.505l1.933 1.933v1.698a8.571 8.571 0 01-4.271-7.13zM12 20.571a8.574 8.574 0 01-1.837-.203l.408-1.225 1.29-3.223a.713.713 0 00-.07-.661l-1.007-1.513a.715.715 0 00-.595-.317H6.668l-.892-1.338 1.52-1.52h1.133V12h1.428v-1.953l2.763-4.836-1.24-.708-.61 1.068H8.81l-.774-1.163a8.471 8.471 0 016.821-.48v2.358a.714.714 0 00.714.714h1.047a.714.714 0 00.594-.318l.627-.94A8.57 8.57 0 0119.78 8.43h-2.91a.714.714 0 00-.7.574l-.516 3.193a.715.715 0 00.386.753l2.388 1.194.489 2.897A8.557 8.557 0 0112 20.571z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Home
                    </span>
                  </Link>

                  <Link
                    to="/memory"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/memory") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          className="size-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21 15.865v2.297c0 .488-.205.955-.57 1.3-.365.344-.86.538-1.376.538H4.946a2.005 2.005 0 01-1.376-.538 1.788 1.788 0 01-.57-1.3v-2.297m18 0c0-.488-.205-.955-.57-1.3a2.006 2.006 0 00-1.376-.538H4.946c-.516 0-1.011.194-1.376.538-.365.345-.57.812-.57 1.3m18 0v-1.498c0-.226-.03-.45-.088-.669l-2.278-8.61a2.748 2.748 0 00-1.036-1.504A3.03 3.03 0 0015.802 3H8.198a3.03 3.03 0 00-1.796.584 2.749 2.749 0 00-1.036 1.504l-2.278 8.61a2.61 2.61 0 00-.088.668v1.499"
                            stroke="currentColor"
                            strokeWidth={1.7}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Memory
                    </span>
                  </Link>

                  <Link
                    to="/worker-agents/all"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/worker-agents") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
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
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Agents
                    </span>
                  </Link>

                  <Link
                    to="/mcp"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/mcp") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="a" fill="#fff">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M19.994 11.335l-.071.071-7.52 7.469a.237.237 0 00-.07.169.244.244 0 00.067.17l.004.005 1.544 1.535a.726.726 0 01.014 1.018l-.013.014a.74.74 0 01-1.04 0l-1.544-1.533a1.68 1.68 0 01-.503-1.205 1.697 1.697 0 01.503-1.205l7.52-7.47c.405-.4.637-.946.644-1.519a2.177 2.177 0 00-.604-1.536l-.04-.042-.044-.042a2.22 2.22 0 00-1.557-.642 2.22 2.22 0 00-1.559.64l-6.193 6.155h-.003l-.084.085a.74.74 0 01-1.04 0 .726.726 0 01-.013-1.018l.013-.014 6.281-6.24a2.182 2.182 0 00.035-3.057l-.037-.039a2.22 2.22 0 00-1.56-.642 2.22 2.22 0 00-1.559.642l-8.311 8.26a.74.74 0 01-1.04 0 .726.726 0 01-.014-1.018l.015-.014 8.313-8.262A3.7 3.7 0 0113.125 1a3.7 3.7 0 012.598 1.069 3.63 3.63 0 011.04 3.097 3.686 3.686 0 013.117 1.033l.044.043a3.64 3.64 0 01.069 5.092m-2.191-2.038a.726.726 0 00.013-1.018l-.013-.014a.74.74 0 00-1.04 0l-6.149 6.108a2.22 2.22 0 01-1.559.642 2.22 2.22 0 01-1.559-.642 2.162 2.162 0 01-.645-1.548 2.185 2.185 0 01.645-1.549l6.15-6.109a.727.727 0 00.014-1.018l-.014-.013a.74.74 0 00-1.04 0l-6.148 6.107c-.34.336-.61.737-.796 1.18a3.64 3.64 0 00.796 3.982 3.701 3.701 0 002.599 1.069c.97 0 1.902-.384 2.598-1.07l6.148-6.107z"
                            />
                          </mask>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M19.994 11.335l-.071.071-7.52 7.469a.237.237 0 00-.07.169.244.244 0 00.067.17l.004.005 1.544 1.535a.726.726 0 01.014 1.018l-.013.014a.74.74 0 01-1.04 0l-1.544-1.533a1.68 1.68 0 01-.503-1.205 1.697 1.697 0 01.503-1.205l7.52-7.47c.405-.4.637-.946.644-1.519a2.177 2.177 0 00-.604-1.536l-.04-.042-.044-.042a2.22 2.22 0 00-1.557-.642 2.22 2.22 0 00-1.559.64l-6.193 6.155h-.003l-.084.085a.74.74 0 01-1.04 0 .726.726 0 01-.013-1.018l.013-.014 6.281-6.24a2.182 2.182 0 00.035-3.057l-.037-.039a2.22 2.22 0 00-1.56-.642 2.22 2.22 0 00-1.559.642l-8.311 8.26a.74.74 0 01-1.04 0 .726.726 0 01-.014-1.018l.015-.014 8.313-8.262A3.7 3.7 0 0113.125 1a3.7 3.7 0 012.598 1.069 3.63 3.63 0 011.04 3.097 3.686 3.686 0 013.117 1.033l.044.043a3.64 3.64 0 01.069 5.092m-2.191-2.038a.726.726 0 00.013-1.018l-.013-.014a.74.74 0 00-1.04 0l-6.149 6.108a2.22 2.22 0 01-1.559.642 2.22 2.22 0 01-1.559-.642 2.162 2.162 0 01-.645-1.548 2.185 2.185 0 01.645-1.549l6.15-6.109a.727.727 0 00.014-1.018l-.014-.013a.74.74 0 00-1.04 0l-6.148 6.107c-.34.336-.61.737-.796 1.18a3.64 3.64 0 00.796 3.982 3.701 3.701 0 002.599 1.069c.97 0 1.902-.384 2.598-1.07l6.148-6.107z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      MCP
                    </span>
                  </Link>

                  <Link
                    to="/blueprints"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/blueprints") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.212 20.999A3.238 3.238 0 011 17.774V7.43a3.229 3.229 0 016.365-.74h7.996c.051-.046 2.874-2.87 2.918-2.913l1.46-1.456a1.107 1.107 0 011.56 0l1.38 1.376c.428.43.428 1.125 0 1.555l-1.44 1.438h1.018a.743.743 0 01.742.74v12.83a.737.737 0 01-.742.74c-.016.004-18.03-.004-18.045 0zm-1.675-3.66a1.735 1.735 0 00.308 1.505c.331.428.842.676 1.382.675h17.29V8.171h-1.762l-4.045 4.038c-.296.37-1.168.142-1.565.153.011.247-.09.743.295.744h3.465a2.567 2.567 0 012.55 2.555 2.568 2.568 0 01-2.53 2.574h-7.418a.74.74 0 110-1.48h7.398a1.086 1.086 0 00-.019-2.17h-3.445a1.777 1.777 0 01-1.777-1.774v-1.233a10.368 10.368 0 01-.04-2.09l.002-.002.001-.003.003-.003v-.001l.004-.007h-.002a.743.743 0 01.137-.193l.001-.001h.001l.002-.002 1.106-1.105H7.471v7.176A1.336 1.336 0 015.32 16.4a1.762 1.762 0 00-2.784.939zm1.765-2.797c.6.01 1.184.19 1.686.516v-7.5a1.741 1.741 0 00-1.777-1.853 1.692 1.692 0 00-1.729 1.741v7.585a3.338 3.338 0 011.82-.49zm9.804-3.665l.792.05c.499-.498 4.346-4.34 4.732-4.723l-.841-.841-4.731 4.722.048.792zm5.731-6.56l.842.84.682-.68-.842-.841-.682.681z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Blueprints
                    </span>
                  </Link>

                  <Link
                    to="/bootcamp"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/bootcamp") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.6 16.36a.91.91 0 01.93.918.88.88 0 01-.271.657.918.918 0 01-.66.261H6.135a.909.909 0 01-.93-.919.88.88 0 01.27-.656.918.918 0 01.66-.262H7.6zm8.8-11.556c1.878 0 3.484.653 4.808 1.957l.24.247c1.165 1.253 1.748 2.753 1.748 4.488 0 1.85-.664 3.434-1.988 4.74-1.324 1.306-2.93 1.96-4.808 1.96-1.755 0-3.271-.563-4.538-1.691-1.222-1.09-1.955-2.454-2.198-4.086h-7.93a.909.909 0 01-.93-.92.878.878 0 01.27-.655.917.917 0 01.66-.263h7.928a6.85 6.85 0 01.745-2.24h.001a5.655 5.655 0 011.382-1.7H4.667a.909.909 0 01-.93-.92.88.88 0 01.27-.656.917.917 0 01.66-.261H16.4zm0 1.837c-1.358 0-2.516.476-3.486 1.43-.97.955-1.451 2.094-1.451 3.429s.482 2.474 1.451 3.429c.97.954 2.128 1.43 3.486 1.43 1.359 0 2.516-.476 3.486-1.43.97-.955 1.45-2.094 1.45-3.429s-.48-2.474-1.45-3.429c-.97-.954-2.127-1.43-3.486-1.43z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth={0.1}
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Bootcamp
                    </span>
                  </Link>

                  <Link
                    to="/prompts/all"
                    className="group flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/prompts") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Prompts
                    </span>
                  </Link>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <Dropdown
                    open={isUserMenuOpen}
                    onOpenChange={setIsUserMenuOpen}
                  >
                    <Tooltip delay={700}>
                      <Dropdown.Button asChild>
                        <Button
                          onClick={() => setIsUserMenuOpen((prev) => !prev)}
                          variant={"ghost"}
                          wrapperClass="flex items-center justify-center"
                          className="size-11 w-min cursor-pointer p-0 md:p-0"
                        >
                          <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                            <Avatar
                              Fallback={() => (
                                <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs text-white dark:text-white">
                                  {user?.first_name?.[0]} {user?.last_name?.[0]}
                                </Avatar.Fallback>
                              )}
                              className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                              src={user?.original_profile_picture_url || ""}
                            />
                          </div>
                        </Button>
                      </Dropdown.Button>
                      <Tooltip.Content
                        className="max-w-40"
                        placement="right"
                        offset={10}
                      >
                        <h3 className="text-sm text-gray-800 dark:text-white">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Tooltip.Arrow className="-mt-1.5" />
                      </Tooltip.Content>
                    </Tooltip>

                    <Dropdown.Menu
                      side="right"
                      align="end"
                      className="dark:bg-primary-dark-foreground w-72 rounded-lg border border-gray-300 bg-white/90 p-1 shadow-xl backdrop-blur-lg dark:border-white/10"
                      sideOffset={-10}
                    >
                      <div className="flex w-full items-center justify-start gap-3 p-3">
                        <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                          <Avatar
                            key={
                              (user.avatar_url || "") +
                              (user.original_profile_picture_url || "") +
                              user.id
                            }
                            Fallback={() => (
                              <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs text-white dark:text-white">
                                {user?.first_name?.[0]} {user?.last_name?.[0]}
                              </Avatar.Fallback>
                            )}
                            className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                            src={
                              (user.is_avatar_enabled
                                ? user.avatar_url
                                : user?.original_profile_picture_url) || ""
                            }
                          />
                        </div>

                        <div className="select-none">
                          <h3 className="text-base font-medium text-gray-800 dark:text-white">
                            {user.first_name} {user?.last_name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-white/60">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Dropdown.Divider className="my-2 dark:border-white/10" />
                      <Dropdown.Item
                        onSelect={() => setIsSettingsModalOpen(true)}
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-var(--spacing-1))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                      >
                        Profile
                      </Dropdown.Item>

                      <Dropdown.Divider className="mt-2 mb-1 dark:border-white/10" />
                      <Dropdown.Item
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-var(--spacing-1))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                        onSelect={logout}
                      >
                        Sign out of Spark
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="mr-1.5 flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10">
                <Combobox<ComboboxResult>
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  placeholder="Spark Search"
                  query={query}
                  setQuery={setQuery}
                  isLoading={isLoading}
                  onSelect={(option) => {
                    if (option && option.id !== "ask") {
                      addRecentOption(option);
                    }
                    option?.onClick?.();
                    setIsOpen(false);
                    setQuery("");
                  }}
                  Option={({ optionValue }) => (
                    <ComboboxOption
                      key={optionValue.id}
                      className="dark:data-[focus]:bg-primary/30 data-[focus]:bg-primary -mx-3 cursor-pointer rounded-lg px-3 py-1.5 text-gray-800 data-[focus]:text-white dark:text-white"
                      value={optionValue}
                    >
                      <div className="flex flex-shrink-0 items-center justify-start gap-2">
                        <VscSearch className="size-4 flex-shrink-0" />
                        <span>{optionValue.name}</span>
                      </div>
                    </ComboboxOption>
                  )}
                  searchResults={filteredSearchOptions}
                />
                <Outlet />
              </div>
            </div>
          </section>

          <SettingsModal
            isOpen={isSettingsModalOpen}
            setIsOpen={setIsSettingsModalOpen}
          />
        </>
      )}
    </main>
  );
};

export default RootLayout;
