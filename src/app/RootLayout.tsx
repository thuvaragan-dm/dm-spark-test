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
import { PromptParams } from "../api/prompt/types";

const RootLayout = () => {
  const { pathname: path } = useLocation();
  const { config, showAnnouncement, apiUrl } = useAppConfig();
  const { setShowAnnouncement } = useAppConfigActions();
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser, logout, setMCP } = useAuthActions();
  const { isLoading, isOpen, query, recentOptions } = useCombobox();
  const { setIsOpen, setQuery, addRecentOption } = useComboboxActions();
  const { setIsCreatePromptDrawerOpen } = usePromptAction();
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
  const { setQuery: setChatQuery } = useChatInputActions();

  const promptsEnabled = !!apiUrl && !!accessToken;
  const promptOption = useMemo<PromptParams>(() => {
    const match = query.match(/Ask: Use Prompt (.*)/);
    return {
      search: match ? match[1] : query,
      page: 1,
      records_per_page: 20,
    };
  }, [query]);

  const { data: prompts } = useGetPrompts(promptOption, {
    enabled: promptsEnabled,
  });

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
  const navigate = useNavigate();

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
          navigate("/home/chat?prompt=true");
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
            {/* center controls */}
            <div className="flex h-full w-full items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
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
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
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
                      className={
                        "app-region-no-drag flex w-full cursor-pointer items-center justify-start gap-2 rounded-md bg-white/15 px-2 py-1 text-sm font-light tracking-wide text-white/50"
                      }
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
                {/* sidebar toggle button */}
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
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
                {/* sidebar toggle button */}
              </div>
            </div>
            {/* center controls */}

            {/* far right controls */}
            {/* <div className=""></div> */}
            {/* far right controls */}
          </div>
        )}
      </nav>

      {!accessToken && !user && <Login />}

      {accessToken && !user && <UserLoading />}

      {/* Main content */}
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
                      {anouncement && anouncement.cta && (
                        <Button
                          onClick={() => {
                            if (window.electronAPI && window.electronAPI.send) {
                              window.electronAPI.send(
                                "open-external-url",
                                anouncement.cta.link,
                              );
                            }
                          }}
                          variant={"ghost"}
                          className={
                            "text-primary rounded-lg bg-white p-3 py-1.5 hover:bg-white/90 data-[pressed]:bg-white/90 md:p-3 md:py-1.5 dark:bg-white dark:hover:bg-white/90 dark:data-[pressed]:bg-white/90"
                          }
                        >
                          {anouncement.cta.name}
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setShowAnnouncement(false);
                        }}
                        variant={"ghost"}
                        className={
                          "rounded-lg bg-transparent p-1.5 text-white hover:bg-white/5 data-[pressed]:bg-white/90 md:p-1.5 dark:bg-transparent dark:hover:bg-white/5 dark:data-[pressed]:bg-white/5"
                        }
                      >
                        <VscClose className="size-6" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-1.5 flex h-full w-full items-start justify-start overflow-hidden">
              {/* side panel */}
              <div className="mt-3 flex h-full w-20 flex-col items-center justify-between overflow-hidden pb-4">
                <div className="flex flex-1 flex-col items-center justify-start gap-3">
                  {/* logo */}
                  <div className="mb-2 aspect-square w-min rounded-xl bg-white/10 text-white">
                    <img
                      src={icon}
                      alt="Spark Logo"
                      className="size-12 object-cover"
                    />
                  </div>
                  {/* logo */}

                  {/* navigation links */}
                  <Link
                    to={"/home/chat"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                    to={"/memory"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                    to={"/worker-agents/all"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                    to={"/mcp"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                          <path
                            d="M19.923 11.406l1.365 1.375h.001l-1.366-1.375zm-7.52 7.469l1.363 1.378.003-.003-1.365-1.375zm-.003.34l-1.394 1.346.007.008.008.007 1.379-1.361zm.004.004l-1.38 1.361.007.007.006.006 1.367-1.374zm1.544 1.535l-1.367 1.374.004.004 1.363-1.378zm.014 1.018l1.38 1.362.01-.011.011-.012-1.4-1.338zm-.013.014l1.362 1.378.009-.008.008-.009-1.379-1.361zm-1.04 0l-1.365 1.375.003.003 1.362-1.378zm-1.544-1.533l1.365-1.376-.006-.005-1.36 1.38zm0-2.41l1.36 1.381.005-.006-1.365-1.375zm7.52-7.47l-1.362-1.379L17.52 9l1.366 1.374zm.04-3.055l-1.4 1.34.002.003 1.398-1.343zm-.04-.042l1.4-1.34-.03-.031-.033-.031-1.337 1.402zm-.044-.042l-1.361 1.38.012.011.012.012 1.337-1.403zm-3.116-.002L14.367 5.85l-.008.007 1.366 1.375zm-6.193 6.155v1.938h.799l.567-.564-1.366-1.374zm-.003 0v-1.938h-.81l-.57.576 1.38 1.362zm-.084.085l1.362 1.378.008-.008.009-.009-1.38-1.361zm-1.04 0L7.04 14.848l.002.002 1.363-1.378zm-.013-1.018l-1.38-1.362-.01.01-.01.011 1.4 1.34zm.013-.014l-1.366-1.374-.007.006-.007.007 1.38 1.361zm6.281-6.24l-1.364-1.377-.002.002L14.686 6.2zm.035-3.057L13.32 4.48l.007.008 1.395-1.346zm-.037-.039l1.402-1.338-.02-.021-.021-.02-1.361 1.38zm-1.56-.642V4.4 2.461zm-1.559.642l-1.36-1.38-.006.005 1.367 1.375zm-8.311 8.26l1.36 1.38.006-.005-1.366-1.375zm-1.04 0L.853 12.74l.002.002 1.36-1.38zM2.2 10.345L.888 8.919l-.046.042-.043.045L2.2 10.345zm.015-.014l1.313 1.426.027-.025.026-.026-1.366-1.375zm8.313-8.262L9.168.689l-.006.005 1.366 1.375zm5.195 0l-1.36 1.38 1.36-1.38zm1.04 3.097l-1.919-.274-.366 2.56 2.56-.368-.275-1.918zm3.117 1.033l-1.363 1.378.004.004 1.359-1.382zm.044.043l1.36-1.38-.001-.002-1.36 1.382zm-2.122 3.054L16.437 7.92v.001l1.365 1.375zm.013-1.018l1.4-1.34-.01-.011-.011-.01-1.38 1.36zm-.013-.014l1.38-1.36-.01-.01-.008-.008-1.362 1.378zm-1.04 0l-1.363-1.378-.003.004 1.366 1.375zm-6.149 6.108l1.361 1.38.005-.005-1.366-1.375zm-1.559.642v-1.938 1.938zm-1.559-.642l1.361-1.38-1.36 1.38zm0-3.097l1.361 1.38.005-.005-1.366-1.375zm6.15-6.109l-1.363-1.378-.003.003 1.366 1.375zm.014-1.018l1.401-1.339-.043-.045-.045-.042-1.313 1.426zm-.014-.013l-1.362 1.378.024.024.025.023 1.313-1.425zm-.52-.215v1.938V3.92zm-.52.215l-1.363-1.379-.004.004 1.366 1.375zm-6.148 6.107l1.36 1.38.006-.005-1.366-1.375zm-1.076 2.58H3.443h1.938zm1.076 2.582l1.36-1.38-1.36 1.38zm5.197 0l1.36 1.38.005-.005-1.365-1.375zm8.34-4.069l-1.367-1.374-.071.071 1.367 1.374 1.366 1.374.071-.07-1.366-1.375zm-.071.071l-1.366-1.375-7.52 7.469 1.367 1.375 1.365 1.375 7.52-7.469-1.366-1.375zm-7.52 7.469l-1.362-1.379a2.18 2.18 0 00-.475.701l1.785.755 1.785.755c-.086.203-.211.39-.37.546l-1.362-1.378zm-.052.077l-1.785-.755c-.11.262-.168.542-.172.825l1.938.022 1.938.022c-.003.22-.048.438-.134.64l-1.785-.754zm-.019.092l-1.938-.022c-.003.283.049.564.153.828l1.802-.714 1.802-.713c.081.205.122.423.119.643l-1.938-.022zm.017.092l-1.802.714c.105.264.26.506.46.711l1.393-1.346 1.393-1.347c.156.16.277.35.358.555l-1.802.713zm.05.079l-1.378 1.361.003.004 1.38-1.361 1.379-1.362-.004-.004-1.38 1.362zm.005.004l-1.367 1.374 1.544 1.535 1.367-1.374 1.366-1.374-1.544-1.536-1.366 1.375zm1.544 1.535l-1.363 1.378a1.211 1.211 0 01-.36-.845l1.938-.027 1.937-.027a2.665 2.665 0 00-.79-1.857l-1.362 1.378zm.214.506l-1.937.027a1.21 1.21 0 01.336-.853l1.401 1.338 1.401 1.34a2.665 2.665 0 00.737-1.879l-1.938.027zm-.2.512l-1.38-1.361-.012.013 1.38 1.362 1.378 1.361.013-.013-1.379-1.361zm-.013.014l-1.362-1.379a1.2 1.2 0 01.842-.345v3.876c.708 0 1.383-.28 1.882-.774l-1.362-1.378zm-.52.214v-1.938c.32 0 .621.127.842.345l-1.362 1.379-1.362 1.378a2.678 2.678 0 001.882.774V22zm-.52-.214l1.365-1.376-1.544-1.533-1.365 1.376-1.366 1.375 1.545 1.533 1.365-1.375zm-1.544-1.533l1.36-1.381a.256.256 0 01.056.084l-1.788.746-1.789.746c.186.444.457.848.801 1.186l1.36-1.381zm-.372-.551l1.788-.746a.23.23 0 01.019.092H8.924c0 .48.095.956.28 1.4l1.789-.746zm-.131-.654H12.8a.24.24 0 01-.019.092l-1.788-.746-1.789-.746a3.64 3.64 0 00-.28 1.4h1.938zm.13-.654l1.79.746a.257.257 0 01-.058.084l-1.36-1.38-1.359-1.382a3.619 3.619 0 00-.8 1.186l1.788.746zm.373-.55l1.365 1.374 7.52-7.47-1.365-1.375L17.519 9 10 16.469l1.366 1.374zm7.52-7.47l1.361 1.378a4.113 4.113 0 001.221-2.872l-1.938-.026-1.938-.025a.237.237 0 01-.068.165l1.362 1.38zm.644-1.52l1.938.026a4.114 4.114 0 00-1.144-2.904l-1.398 1.342-1.398 1.343c.04.04.065.1.064.168l1.938.025zm-.604-1.536l1.4-1.34-.04-.041-1.4 1.34-1.4 1.339.04.042 1.4-1.34zm-.04-.042l1.337-1.402-.044-.042-1.337 1.402-1.337 1.403.044.042 1.337-1.403zm-.044-.042l1.36-1.38a4.158 4.158 0 00-2.916-1.2l-.001 1.938-.002 1.938c.07 0 .14.027.198.084l1.36-1.38zm-1.557-.642l.001-1.938a4.16 4.16 0 00-2.918 1.196l1.358 1.382 1.359 1.381a.282.282 0 01.198-.083l.002-1.938zm-1.559.64L14.36 5.857l-6.193 6.155 1.366 1.375 1.366 1.374 6.193-6.155-1.366-1.374zm-6.193 6.155v-1.938h-.003v3.876h.003v-1.938zm-.003 0l-1.38-1.362-.083.085 1.379 1.362 1.379 1.361.084-.085-1.379-1.361zm-.084.085l-1.362-1.379c.22-.218.522-.345.842-.345v3.876c.708 0 1.383-.28 1.882-.774l-1.362-1.378zm-.52.214v-1.938c.319 0 .62.127.842.345l-1.362 1.379-1.363 1.378c.5.494 1.175.774 1.883.774v-1.938zm-.52-.214l1.364-1.376c.229.227.355.531.36.845l-1.938.024-1.938.025c.009.695.289 1.364.787 1.858l1.365-1.376zm-.214-.507l1.937-.024a1.21 1.21 0 01-.337.853l-1.4-1.34-1.399-1.34a2.665 2.665 0 00-.74 1.876l1.939-.025zm.2-.511l1.38 1.361.013-.013-1.38-1.362-1.379-1.361-.013.013 1.38 1.361zm.014-.014l1.365 1.375 6.282-6.241-1.366-1.375-1.366-1.375-6.281 6.242 1.366 1.374zm6.281-6.24l1.364 1.376a4.12 4.12 0 00.066-5.778l-1.395 1.345-1.395 1.346a.244.244 0 01-.004.334L14.686 6.2zm.035-3.057l1.402-1.337-.037-.04-1.402 1.338-1.402 1.338.037.04 1.402-1.339zm-.037-.039l1.36-1.38a4.158 4.158 0 00-2.92-1.2V4.4c.07 0 .141.027.199.084l1.36-1.38zm-1.56-.642V.523a4.158 4.158 0 00-2.92 1.2l1.361 1.38 1.362 1.38a.282.282 0 01.198-.084V2.461zm-1.559.642L10.2 1.728l-8.311 8.26 1.366 1.375 1.366 1.375 8.311-8.26-1.365-1.375zm-8.311 8.26l-1.36-1.38c.22-.218.521-.344.84-.344v3.876c.707 0 1.381-.28 1.88-.772l-1.36-1.38zm-.52.214V9.639c.319 0 .62.126.841.344l-1.36 1.38-1.36 1.38a2.674 2.674 0 001.88.772v-1.938zm-.52-.214l1.364-1.378c.229.227.355.531.36.845L2 10.857l-1.938.027c.01.695.291 1.363.79 1.857l1.363-1.378zM2 10.857l1.938-.027c.004.313-.114.62-.336.853L2.2 10.345.8 9.005a2.665 2.665 0 00-.738 1.879L2 10.857zm.2-.512l1.313 1.425.015-.013-1.313-1.426L.902 8.906l-.014.013L2.2 10.345zm.015-.014l1.366 1.375 8.313-8.263-1.366-1.374L9.162.694.849 8.957l1.366 1.374zm8.313-8.262l1.36 1.38c.336-.33.78-.511 1.237-.511V-.938A5.638 5.638 0 009.167.69l1.36 1.38zM13.125 1v1.938c.458 0 .902.18 1.237.511l1.36-1.38 1.361-1.38a5.637 5.637 0 00-3.958-1.627V1zm2.598 1.069l-1.36 1.38c.375.37.558.907.482 1.443l1.918.274 1.918.274A5.567 5.567 0 0017.083.69l-1.36 1.38zm1.04 3.097l.276 1.918a1.749 1.749 0 011.478.493l1.363-1.378 1.363-1.378a5.624 5.624 0 00-4.756-1.573l.276 1.918zm3.117 1.033L18.52 7.58l.044.043 1.359-1.382 1.359-1.382-.045-.043-1.358 1.382zm.044.043l-1.36 1.38c.153.152.277.333.363.535L20.71 7.4l1.784-.758a5.538 5.538 0 00-1.21-1.78l-1.36 1.38zM20.71 7.4l-1.783.757c.086.203.132.421.135.643L21 8.774l1.937-.026a5.577 5.577 0 00-.443-2.106L20.71 7.4zM21 8.774l-1.938.026c.003.222-.037.441-.118.646l1.804.71 1.803.709a5.578 5.578 0 00.386-2.117L21 8.774zm-.252 1.381l-1.804-.709c-.08.205-.2.39-.349.545l1.398 1.343 1.397 1.343a5.545 5.545 0 001.161-1.812l-1.803-.71zm-2.946-.859l1.364 1.376a2.664 2.664 0 00.788-1.858l-1.938-.024-1.938-.025c.004-.314.13-.618.36-.845l1.364 1.376zm.214-.506l1.938.024a2.665 2.665 0 00-.74-1.877l-1.4 1.34-1.399 1.341a1.211 1.211 0 01-.337-.853l1.938.025zm-.201-.512l1.379-1.362-.013-.013-1.38 1.362-1.378 1.36.013.014 1.379-1.361zm-.013-.014l1.362-1.378a2.678 2.678 0 00-1.882-.774v3.876c-.32 0-.621-.127-.842-.345l1.362-1.379zm-.52-.214V6.112c-.708 0-1.383.28-1.883.774l1.363 1.378 1.362 1.379a1.198 1.198 0 01-.842.345V8.05zm-.52.214L15.396 6.89l-6.148 6.107 1.365 1.375 1.366 1.375 6.148-6.108-1.365-1.374zm-6.149 6.108l-1.36-1.38a.282.282 0 01-.199.084v3.876a4.157 4.157 0 002.92-1.2l-1.36-1.38zm-1.559.642v-1.938a.282.282 0 01-.198-.083l-1.36 1.38-1.362 1.379a4.158 4.158 0 002.92 1.2v-1.938zm-1.559-.642l1.361-1.38a.225.225 0 01-.05-.073l-1.788.745-1.789.745c.21.503.517.96.905 1.343l1.361-1.38zm-.477-.708l1.789-.745a.247.247 0 01-.02-.095H4.913c0 .544.108 1.083.317 1.585l1.789-.745zm-.168-.84h1.938c0-.034.007-.066.019-.096l-1.79-.745-1.788-.745a4.124 4.124 0 00-.317 1.586H6.85zm.168-.84l1.789.744a.224.224 0 01.049-.073l-1.36-1.38-1.362-1.38a4.1 4.1 0 00-.905 1.343l1.789.745zm.477-.709l1.366 1.375 6.15-6.11-1.366-1.374-1.366-1.375-6.15 6.11 1.366 1.374zm6.15-6.109l1.363 1.378c.498-.494.78-1.162.79-1.857l-1.939-.027-1.937-.027c.004-.314.13-.618.36-.845l1.363 1.378zm.214-.506l1.938.027a2.664 2.664 0 00-.737-1.878l-1.4 1.339-1.401 1.338a1.211 1.211 0 01-.336-.853l1.937.027zm-.2-.512l1.313-1.426-.014-.013-1.313 1.426-1.313 1.425.014.013 1.313-1.425zm-.014-.013l1.362-1.379a2.678 2.678 0 00-1.882-.774v3.876c-.32 0-.621-.127-.842-.345l1.362-1.378zm-.52-.215V1.982c-.708 0-1.383.28-1.883.774l1.362 1.379 1.363 1.378a1.198 1.198 0 01-.842.345V3.92zm-.52.215L11.237 2.76 5.093 8.867l1.365 1.375 1.366 1.375 6.147-6.108-1.366-1.374zm-6.148 6.107l-1.36-1.38a5.54 5.54 0 00-1.224 1.814l1.788.746 1.789.746c.086-.206.211-.392.367-.545l-1.36-1.38zm-.796 1.18l-1.788-.746c-.284.68-.43 1.41-.43 2.147H7.32c0-.226.045-.449.131-.655l-1.789-.746zm-.28 1.4H3.443c0 .738.146 1.468.43 2.148l1.788-.746 1.789-.746a1.702 1.702 0 01-.13-.655H5.38zm.28 1.402l-1.788.745c.283.68.7 1.298 1.224 1.815l1.36-1.38 1.36-1.38a1.664 1.664 0 01-.367-.546l-1.789.746zm.796 1.18l-1.36 1.38a5.639 5.639 0 003.958 1.627v-3.876c-.457 0-.902-.18-1.237-.512l-1.36 1.38zm2.599 1.069v1.938a5.639 5.639 0 003.958-1.627l-1.36-1.38-1.36-1.38c-.336.33-.78.51-1.239.51v1.939zm2.598-1.07l1.365 1.376 6.149-6.108-1.366-1.375-1.366-1.375-6.148 6.108 1.366 1.375z"
                            fill="currentColor"
                            mask="url(#a)"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      MCP
                    </span>
                  </Link>

                  <Link
                    to={"/blueprints"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                    to={"/bootcamp"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                    to={"/prompts/all"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
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
                  {/* navigation links */}
                </div>

                {/* user details */}
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
                        className={"max-w-40"}
                        placement="right"
                        offset={10}
                      >
                        <h3 className="text-sm text-gray-800 dark:text-white">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Tooltip.Arrow className={"-mt-1.5"} />
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
                            src={user?.original_profile_picture_url || ""}
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
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                      >
                        Profile
                      </Dropdown.Item>

                      <Dropdown.Divider className="mt-2 mb-1 dark:border-white/10" />
                      <Dropdown.Item
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                        onSelect={() => {
                          logout();
                        }}
                      >
                        Sign out of Spark
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {/* user details */}
              </div>
              {/* side panel */}

              {/* content panel */}
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
              {/* content panel */}
            </div>
          </section>

          <SettingsModal
            isOpen={isSettingsModalOpen}
            setIsOpen={setIsSettingsModalOpen}
          />
        </>
      )}
      {/* Main content */}
    </main>
  );
};

export default RootLayout;
