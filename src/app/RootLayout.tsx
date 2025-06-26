import { ComboboxOption } from "@headlessui/react";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "motion/react";
import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Focusable } from "react-aria-components";
import {
  IoArrowBack,
  IoArrowForward,
  IoCall,
  IoEye,
  IoEyeOff,
  IoImage,
  IoLockClosed,
  IoMail,
  IoPerson,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { RiPencilRulerFill, RiPencilRulerLine } from "react-icons/ri";
import {
  VscClose,
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscSearch,
} from "react-icons/vsc";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { EUser, userKey } from "../api/user/config";
import { User } from "../api/user/types";
import { useChangePassword } from "../api/user/useChangePassword";
import { useGenerateAvatar } from "../api/user/useGenerateAvatar";
import { useGetUser } from "../api/user/useGetUser";
import { ChangePasswordSchema } from "../api/user/UserSchema";
import { useUpdateUser } from "../api/user/useUpdateUser";
import icon from "../assets/icon.png";
import Avatar from "../components/Avatar";
import BlurWrapper from "../components/BlurWrapper";
import { Button, ButtonWithLoader } from "../components/Button";
import Combobox from "../components/Combobox";
import Dropdown from "../components/dropdown";
import ErrorMessage from "../components/Forms/ErrorMessage";
import Field from "../components/Forms/Field";
import Form from "../components/Forms/Form";
import Input from "../components/Forms/Input";
import InputGroup from "../components/Forms/InputGroup";
import Label from "../components/Forms/Label";
import Switch from "../components/Forms/Switch";
import Modal from "../components/modal";
import SlidingContainer from "../components/SlidingContainer";
import Spinner from "../components/Spinner";
import Tooltip from "../components/tooltip";
import { COMMAND_KEY } from "../components/tooltip/TooltipKeyboardShortcut";
import { useAppHistory } from "../hooks/useAppHistory";
import useFileUpload from "../hooks/useFileUpload";
import { useAuth, useAuthActions } from "../store/authStore";
import { useCombobox, useComboboxActions } from "../store/comboboxStore";
import { useAppConfig, useAppConfigActions } from "../store/configurationStore";
import { useSidebar, useSidebarActions } from "../store/sidebarStore";
import { cn } from "../utilities/cn";
import Login from "./Login";
import UserLoading from "./UserLoading";

enum ActiveTab {
  PROFILE = 1,
  SECURITY = 2,
  CHANGE_NAME = 3,
  CHANGE_PHONE = 4,
  CHANGE_PASSWORD = 5,
}

type Picture = {
  url: string;
};

const RootLayout = () => {
  const { pathname: path } = useLocation();
  const { config, showAnnouncement } = useAppConfig();
  const { setShowAnnouncement } = useAppConfigActions();
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser, logout, setMCP } = useAuthActions();

  useEffect(() => {
    // 1. Check for a token that might already be stored on disk.
    const initialToken = window.electronAPI.getToken();

    console.log({ initialToken });

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
  const { isLoading, isOpen, query } = useCombobox();
  const { setIsOpen, setQuery } = useComboboxActions();

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
    if (!query) return defaultSearchOptions;

    const filteredResults = defaultSearchOptions.filter((option) =>
      option.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (filteredResults.length <= 0) {
      return [
        {
          id: "default-no-results",
          name: `search: ${query}`,
        },
      ];
    }

    return filteredResults;
  }, [query, defaultSearchOptions]);

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
                        "flex items-center justify-center rounded-xl p-2 text-white group-hover:bg-white/15",
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
                    to={"/worker-agents/all"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-1 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/worker-agents") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-9"
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
                        "flex items-center justify-center rounded-xl p-1 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/mcp") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          className="size-9"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="a" fill="#fff">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M19.1 12.351l-.064.064-6.728 6.757a.218.218 0 00-.063.154.222.222 0 00.06.154l.004.003 1.381 1.39a.661.661 0 01.013.921l-.012.012a.658.658 0 01-.93 0l-1.382-1.387a1.523 1.523 0 01-.45-1.09 1.553 1.553 0 01.45-1.09l6.729-6.758c.362-.362.57-.856.576-1.375a1.981 1.981 0 00-.54-1.39l-.036-.037-.04-.038a1.975 1.975 0 00-1.393-.581c-.52 0-1.021.207-1.395.578l-5.54 5.569h-.003l-.075.077a.658.658 0 01-.93 0 .66.66 0 01-.012-.921l.011-.012 5.62-5.647a1.99 1.99 0 00.032-2.766l-.033-.035a1.975 1.975 0 00-1.395-.581c-.522 0-1.022.208-1.395.58l-7.437 7.474a.658.658 0 01-.93 0 .66.66 0 01-.013-.921l.013-.012 7.438-7.476A3.292 3.292 0 0112.954 3c.868 0 1.702.347 2.324.967.73.728 1.077 1.77.93 2.802a3.276 3.276 0 012.79.935l.04.039c.299.298.538.654.703 1.047a3.324 3.324 0 01-.642 3.56m-1.96-1.844a.66.66 0 00.011-.921l-.011-.012a.658.658 0 00-.931 0l-5.501 5.526c-.374.372-.874.58-1.395.58a1.975 1.975 0 01-1.973-1.982 1.996 1.996 0 01.578-1.4l5.502-5.528a.66.66 0 00.013-.921l-.013-.012a.658.658 0 00-.93 0l-5.5 5.526a3.26 3.26 0 00-.713 1.068 3.325 3.325 0 000 2.534A3.293 3.293 0 009.313 17c.868 0 1.702-.347 2.324-.967l5.502-5.526z"
                            />
                          </mask>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M19.1 12.351l-.064.064-6.728 6.757a.218.218 0 00-.063.154.222.222 0 00.06.154l.004.003 1.381 1.39a.661.661 0 01.013.921l-.012.012a.658.658 0 01-.93 0l-1.382-1.387a1.523 1.523 0 01-.45-1.09 1.553 1.553 0 01.45-1.09l6.729-6.758c.362-.362.57-.856.576-1.375a1.981 1.981 0 00-.54-1.39l-.036-.037-.04-.038a1.975 1.975 0 00-1.393-.581c-.52 0-1.021.207-1.395.578l-5.54 5.569h-.003l-.075.077a.658.658 0 01-.93 0 .66.66 0 01-.012-.921l.011-.012 5.62-5.647a1.99 1.99 0 00.032-2.766l-.033-.035a1.975 1.975 0 00-1.395-.581c-.522 0-1.022.208-1.395.58l-7.437 7.474a.658.658 0 01-.93 0 .66.66 0 01-.013-.921l.013-.012 7.438-7.476A3.292 3.292 0 0112.954 3c.868 0 1.702.347 2.324.967.73.728 1.077 1.77.93 2.802a3.276 3.276 0 012.79.935l.04.039c.299.298.538.654.703 1.047a3.324 3.324 0 01-.642 3.56m-1.96-1.844a.66.66 0 00.011-.921l-.011-.012a.658.658 0 00-.931 0l-5.501 5.526c-.374.372-.874.58-1.395.58a1.975 1.975 0 01-1.973-1.982 1.996 1.996 0 01.578-1.4l5.502-5.528a.66.66 0 00.013-.921l-.013-.012a.658.658 0 00-.93 0l-5.5 5.526a3.26 3.26 0 00-.713 1.068 3.325 3.325 0 000 2.534A3.293 3.293 0 009.313 17c.868 0 1.702-.347 2.324-.967l5.502-5.526z"
                            fill="currentColor"
                          />
                          <path
                            d="M19.036 12.415l1.373 1.368.001-.001-1.374-1.367zm-6.728 6.757l1.37 1.371.004-.003-1.373-1.368zm-.003.308l-1.401 1.339.007.007.007.008 1.387-1.354zm.004.003l-1.387 1.354.006.007.006.006 1.375-1.367zm1.381 1.39l-1.374 1.366.004.004 1.37-1.37zm.013.921l1.387 1.354.01-.011.012-.012-1.41-1.33zm-.012.012l1.37 1.37.009-.008.008-.008-1.387-1.354zm-.93 0l-1.373 1.368.003.003 1.37-1.371zm-1.382-1.387l1.373-1.368-.006-.005-1.367 1.373zm0-2.18l1.367 1.374.006-.006-1.373-1.368zm6.729-6.758l-1.37-1.372-.004.004 1.374 1.368zm.035-2.764l-1.408 1.331.003.003 1.405-1.334zm-.035-.038l1.408-1.332-.031-.033-.032-.03-1.345 1.395zm-.04-.038L16.7 10.012l.012.012.012.012 1.345-1.395zm-2.788-.003l-1.366-1.374-.007.007 1.373 1.367zm-5.54 5.569v1.938h.805l.568-.571-1.373-1.367zm-.003 0v-1.938H8.92l-.57.584 1.386 1.354zm-.075.077l1.37 1.37.008-.008.009-.008-1.387-1.354zm-.93 0l-1.373 1.368.003.003 1.37-1.37zm-.012-.921l-1.387-1.354-.01.01-.01.011 1.407 1.333zm.011-.012l-1.373-1.367-.007.006-.006.007 1.386 1.354zm5.62-5.647L12.98 6.335l-.002.002 1.374 1.367zm.032-2.766l-1.41 1.33.008.008 1.402-1.338zm-.033-.035l1.409-1.33-.02-.022-.02-.02-1.37 1.372zm-1.395-.581V6.26 4.322zm-1.395.58l-1.37-1.371-.004.005 1.374 1.367zm-7.437 7.474l1.368 1.373.005-.006-1.373-1.367zm-.93 0l-1.37 1.37.002.002 1.368-1.372zm-.013-.921l-1.32-1.419-.046.043-.042.045 1.408 1.33zm.013-.012l1.32 1.418.028-.025.026-.026-1.374-1.367zm7.438-7.476L9.262 2.595l-.006.005 1.374 1.367zm4.648 0L13.91 5.34l1.368-1.373zm.93 2.802l-1.918-.271-.362 2.562 2.56-.373-.28-1.918zm2.79.935l-1.37 1.37.003.004 1.367-1.374zm.04.039l1.367-1.373-.002-.001-1.366 1.374zm-1.9 2.763l-1.372-1.369v.002l1.373 1.367zm.012-.921l1.407-1.333-.01-.01-.01-.011-1.387 1.354zm-.011-.012l1.386-1.354-.008-.009-.009-.008-1.37 1.37zm-.931 0l-1.37-1.371-.004.003 1.374 1.368zm-5.501 5.526l1.368 1.372.005-.005-1.373-1.367zm-1.395.58v-1.938 1.939zm-1.395-.58l1.368-1.372-1.368 1.372zm0-2.803l1.368 1.373.005-.005-1.373-1.368zm5.502-5.527l-1.37-1.37-.003.003 1.373 1.367zm.013-.921l1.408-1.33-.042-.046-.046-.042-1.32 1.418zm-.013-.012l-1.37 1.37.024.025.025.023 1.321-1.418zm-.465-.194V7.58 5.642zm-.466.194l-1.37-1.37-.003.003 1.373 1.367zm-5.5 5.526l1.368 1.373.006-.006-1.374-1.367zm-.963 2.335H4.087h1.938zm.963 2.335l1.368-1.373-1.368 1.373zm4.65 0l1.367 1.372.006-.005-1.374-1.367zm7.462-3.68l-1.375-1.367-.063.064 1.374 1.366 1.374 1.367.064-.065-1.374-1.366zm-.064.063l-1.373-1.367-6.728 6.757 1.373 1.367 1.374 1.368 6.727-6.757-1.373-1.368zm-6.728 6.757l-1.37-1.37c-.2.2-.357.436-.464.693l1.788.747 1.788.748a1.719 1.719 0 01-.372.553l-1.37-1.37zm-.046.07l-1.788-.747a2.161 2.161 0 00-.167.808l1.938.023 1.937.021a1.72 1.72 0 01-.132.643l-1.788-.748zm-.018.084l-1.937-.023a2.16 2.16 0 00.148.813l1.805-.707 1.804-.707c.081.206.12.426.118.645l-1.938-.021zm.016.083l-1.805.707c.102.259.254.498.449.703l1.401-1.339 1.401-1.339c.157.164.277.355.358.561l-1.804.707zm.045.071l-1.387 1.354.004.003 1.386-1.354 1.387-1.353-.003-.004-1.387 1.354zm.004.003l-1.374 1.367 1.381 1.39 1.374-1.367 1.374-1.367-1.381-1.39-1.374 1.367zm1.381 1.39l-1.37 1.37a1.277 1.277 0 01-.376-.885l1.938-.027 1.938-.027a2.599 2.599 0 00-.76-1.801l-1.37 1.37zm.192.458l-1.938.027a1.276 1.276 0 01.35-.895l1.409 1.331 1.409 1.33a2.6 2.6 0 00.708-1.82l-1.938.027zm-.18.463l-1.386-1.354-.011.012 1.386 1.354 1.387 1.354.012-.012-1.387-1.354zm-.01.012l-1.37-1.37a1.28 1.28 0 01.904-.374v3.876c.694 0 1.352-.278 1.835-.761l-1.37-1.371zm-.466.194v-1.938c.347 0 .67.14.904.373l-1.37 1.371-1.37 1.37a2.594 2.594 0 001.836.762V22zm-.465-.194l1.373-1.368-1.382-1.387-1.373 1.368-1.373 1.368 1.382 1.387 1.373-1.368zm-1.382-1.387l1.367-1.373a.417.417 0 01.092.136l-1.792.739-1.791.739c.174.423.43.808.757 1.133l1.367-1.374zm-.333-.498l1.792-.74c.02.049.03.099.03.148H8.99c0 .456.09.909.264 1.331l1.791-.74zm-.117-.592h1.938c0 .05-.01.1-.03.148l-1.79-.74-1.792-.739a3.49 3.49 0 00-.264 1.331h1.938zm.117-.591l1.792.739a.416.416 0 01-.092.136l-1.367-1.374-1.367-1.373a3.46 3.46 0 00-.757 1.132l1.791.74zm.333-.499l1.373 1.367 6.729-6.758-1.373-1.367-1.374-1.368-6.728 6.759 1.373 1.367zm6.729-6.758l1.369 1.371a3.916 3.916 0 001.145-2.72l-1.938-.026-1.938-.025a.059.059 0 01-.004.022c-.002.005-.004.007-.004.006l1.37 1.372zm.576-1.375l1.938.025a3.92 3.92 0 00-1.073-2.749l-1.405 1.335-1.406 1.334.005.008a.059.059 0 01.003.022l1.938.025zm-.54-1.39l1.408-1.331-.036-.038-1.408 1.332L16.7 10.01l.036.038 1.409-1.331zm-.036-.037l1.345-1.396-.04-.038-1.345 1.396-1.345 1.395.04.038 1.345-1.395zm-.04-.038l1.369-1.372a3.913 3.913 0 00-2.76-1.147l-.002 1.938-.002 1.938a.02.02 0 01.008.001.06.06 0 01.018.013l1.37-1.371zm-1.393-.581l.001-1.938a3.911 3.911 0 00-2.762 1.142l1.367 1.374 1.366 1.374a.058.058 0 01.018-.013.02.02 0 01.008-.001l.002-1.938zm-1.395.578l-1.373-1.367-5.542 5.569 1.374 1.367 1.373 1.367 5.542-5.569-1.373-1.367zM9.74 14.207v-1.938h-.003v3.876h.003v-1.938zm-.003 0L8.35 12.853l-.076.077 1.387 1.354 1.387 1.354.075-.077-1.387-1.354zm-.075.077l-1.37-1.37a1.28 1.28 0 01.905-.374v3.876c.694 0 1.352-.278 1.835-.761l-1.37-1.37zm-.465.194V12.54c.346 0 .67.14.904.373l-1.37 1.371-1.37 1.37a2.594 2.594 0 001.836.762v-1.938zm-.466-.194l1.373-1.368c.24.241.37.56.374.886l-1.938.024-1.938.024c.009.67.276 1.32.757 1.803l1.372-1.369zm-.191-.458l1.938-.024c.004.324-.117.646-.351.893L8.72 13.363 7.313 12.03a2.6 2.6 0 00-.71 1.82l1.937-.024zm.18-.463l1.386 1.354.012-.012L8.73 13.35l-1.386-1.354-.012.012 1.387 1.354zm.011-.012l1.374 1.367 5.62-5.647-1.373-1.367-1.374-1.367-5.62 5.647L8.73 13.35zm5.62-5.647l1.373 1.368a3.928 3.928 0 00.062-5.471l-1.403 1.337-1.402 1.338a.02.02 0 01.004.007.064.064 0 01.004.022.06.06 0 01-.004.023.02.02 0 01-.005.007l1.372 1.369zm.032-2.766l1.41-1.33-.034-.035-1.41 1.33-1.409 1.33.034.035 1.41-1.33zm-.033-.035l1.368-1.372a3.913 3.913 0 00-2.763-1.147V6.26a.02.02 0 01.008.002c.004.001.01.005.018.013l1.369-1.372zm-1.395-.581V2.384a3.913 3.913 0 00-2.764 1.147l1.369 1.372 1.368 1.372a.058.058 0 01.019-.013.02.02 0 01.008-.002V4.322zm-1.395.58l-1.374-1.366-7.437 7.473 1.374 1.367 1.373 1.367 7.437-7.473-1.373-1.367zm-7.437 7.474l-1.368-1.372a1.28 1.28 0 01.903-.372v3.875c.693 0 1.35-.277 1.833-.758l-1.368-1.373zm-.465.193v-1.938c.346 0 .67.14.903.373l-1.368 1.372-1.368 1.373c.483.48 1.14.758 1.833.758V12.57zm-.465-.193l1.37-1.37c.242.24.371.56.376.885L3 11.918l-1.938.027c.01.67.277 1.319.76 1.801l1.37-1.37zM3 11.918l1.938-.027c.004.325-.116.647-.35.894l-1.409-1.33-1.408-1.331a2.6 2.6 0 00-.709 1.82L3 11.919zm.18-.463l1.32 1.418.013-.012-1.32-1.418-1.322-1.418-.012.011 1.32 1.419zm.012-.012l1.374 1.367 7.438-7.476-1.374-1.367L9.256 2.6l-7.438 7.476 1.374 1.367zm7.438-7.476l1.368 1.373c.264-.263.608-.402.956-.402V1.062a5.23 5.23 0 00-3.692 1.533l1.368 1.372zM12.954 3v1.938c.348 0 .692.139.956.402l1.368-1.373 1.368-1.372a5.23 5.23 0 00-3.692-1.533V3zm2.324.967L13.91 5.34c.293.292.442.722.38 1.158l1.919.271 1.919.272a5.244 5.244 0 00-1.482-4.446l-1.368 1.372zm.93 2.802l.28 1.918c.407-.06.829.077 1.14.387l1.37-1.37 1.37-1.37a5.214 5.214 0 00-4.438-1.482l.279 1.917zm2.79.935L17.63 9.078l.04.04 1.366-1.375 1.367-1.374-.04-.04-1.366 1.375zm.04.039l-1.369 1.373c.12.118.217.262.285.425l1.787-.751 1.787-.75a5.198 5.198 0 00-1.123-1.67l-1.368 1.373zm.703 1.047l-1.787.75c.069.163.105.34.108.52L20 10.032l1.938-.025a5.263 5.263 0 00-.41-1.969l-1.787.751zM20 10.033l-1.938.026a1.4 1.4 0 01-.094.522l1.806.703 1.806.702c.245-.63.367-1.303.358-1.979L20 10.034zm-.226 1.25l-1.806-.702a1.33 1.33 0 01-.274.434l1.405 1.335 1.404 1.335a5.205 5.205 0 001.077-1.699l-1.806-.703zm-2.636-.777l1.373 1.368a2.598 2.598 0 00.757-1.802l-1.938-.024-1.938-.025c.004-.325.134-.644.374-.886l1.373 1.369zm.192-.458l1.938.024a2.6 2.6 0 00-.71-1.82L17.15 9.585l-1.407 1.332a1.277 1.277 0 01-.35-.894l1.937.025zm-.18-.463l1.387-1.354-.012-.012-1.386 1.354-1.387 1.353.011.012 1.387-1.353zm-.011-.012l1.37-1.371a2.596 2.596 0 00-1.836-.761v3.876c-.346 0-.67-.14-.904-.373l1.37-1.371zm-.466-.194V7.44c-.694 0-1.352.278-1.835.76l1.37 1.372 1.37 1.37a1.28 1.28 0 01-.905.374V9.379zm-.465.194l-1.374-1.368-5.5 5.526 1.373 1.368 1.373 1.367 5.501-5.526-1.373-1.367zm-5.501 5.526l-1.369-1.372a.058.058 0 01-.018.013.02.02 0 01-.008.002v3.875a3.913 3.913 0 002.763-1.146l-1.368-1.372zm-1.395.58v-1.938a.02.02 0 01-.008-.001.058.058 0 01-.019-.013l-1.368 1.372-1.369 1.372a3.913 3.913 0 002.764 1.146V15.68zm-1.395-.58l1.368-1.373-.004-.006-1.791.738-1.792.738c.196.476.484.91.85 1.275l1.369-1.372zm-.427-.641l1.791-.738a.06.06 0 01-.004-.023H5.401c0 .514.1 1.024.297 1.5l1.792-.74zm-.15-.76h1.937c0-.01.002-.017.004-.023l-1.791-.738-1.792-.738a3.935 3.935 0 00-.296 1.498h1.937zm.15-.76l1.791.737.004-.007-1.368-1.372-1.369-1.372a3.896 3.896 0 00-.85 1.275l1.792.738zm.427-.642l1.373 1.368 5.502-5.527-1.373-1.368-1.373-1.367-5.503 5.527 1.374 1.367zm5.502-5.527l1.37 1.37c.483-.482.75-1.13.76-1.8L13.61 6.31l-1.938-.027c.005-.325.134-.644.376-.885l1.37 1.37zm.192-.458l1.938.027a2.6 2.6 0 00-.709-1.82l-1.408 1.33-1.409 1.33a1.276 1.276 0 01-.35-.894l1.938.027zm-.18-.463l1.321-1.418-.012-.012-1.321 1.418-1.32 1.418.012.012 1.32-1.418zm-.012-.012l1.37-1.37a2.596 2.596 0 00-1.835-.762V7.58c-.347 0-.67-.14-.905-.373l1.37-1.371zm-.465-.194V3.704a2.6 2.6 0 00-1.836.761l1.37 1.371 1.37 1.37a1.28 1.28 0 01-.904.374V5.642zm-.466.194l-1.373-1.367-5.5 5.526 1.373 1.367 1.374 1.367 5.5-5.526-1.374-1.367zm-5.5 5.526L5.621 9.989a5.2 5.2 0 00-1.137 1.702l1.792.739 1.792.738c.068-.165.167-.312.288-.433l-1.368-1.373zm-.712 1.068l-1.792-.74a5.263 5.263 0 00-.397 2.007h3.876c0-.183.036-.363.105-.529l-1.792-.738zm-.25 1.267h-1.94c0 .688.135 1.37.397 2.006l1.792-.739 1.792-.739a1.388 1.388 0 01-.105-.528H6.025zm.25 1.267l-1.792.74a5.198 5.198 0 001.137 1.7l1.367-1.372 1.368-1.373a1.323 1.323 0 01-.288-.434l-1.792.74zm.712 1.068L5.62 17.404a5.23 5.23 0 003.693 1.533v-3.876c-.349 0-.693-.139-.957-.402l-1.368 1.373zm2.325.967v1.938a5.23 5.23 0 003.692-1.533l-1.368-1.372-1.368-1.373a1.355 1.355 0 01-.956.402V17zm2.324-.967l1.374 1.367 5.5-5.526-1.372-1.367-1.374-1.367-5.501 5.526 1.373 1.367z"
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
                        {path.includes("/blueprints") ? (
                          <RiPencilRulerFill className="size-6" />
                        ) : (
                          <RiPencilRulerLine className="size-6" />
                        )}
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
                        "flex items-center justify-center rounded-xl p-1 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/bootcamp") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        <svg
                          className="size-9"
                          fill="none"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.8 17c-1.199 0-2.229-.379-3.09-1.137-.863-.758-1.368-1.712-1.515-2.863h-5.68A.503.503 0 014 12.499a.47.47 0 01.148-.356.51.51 0 01.366-.143h5.681c.06-.537.235-1.078.525-1.623A3.873 3.873 0 0111.97 9h-5.4a.503.503 0 01-.514-.501.47.47 0 01.148-.356A.509.509 0 016.571 8H14.8c1.28 0 2.373.439 3.275 1.316.902.876 1.354 1.936 1.354 3.181s-.452 2.306-1.354 3.185C17.173 16.561 16.081 17 14.8 17zm0-1c.989 0 1.836-.343 2.542-1.029.705-.686 1.058-1.51 1.058-2.471 0-.961-.353-1.785-1.058-2.471A3.516 3.516 0 0014.8 9c-.989 0-1.836.343-2.542 1.029-.705.686-1.058 1.51-1.058 2.471 0 .961.353 1.785 1.058 2.471A3.516 3.516 0 0014.8 16zm-7.2 1a.503.503 0 01-.514-.501.47.47 0 01.148-.356A.51.51 0 017.6 16h1.029a.503.503 0 01.514.501.47.47 0 01-.148.356.51.51 0 01-.366.143H7.6z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Bootcamp
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
                              src={
                                (user.is_avatar_enabled
                                  ? user.avatar_url
                                  : user?.original_profile_picture_url) || ""
                              }
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
                    console.log({ option });
                    option?.onClick?.();
                    setIsOpen(false);
                  }}
                  Option={({ optionValue }) => (
                    <ComboboxOption
                      key={optionValue.id}
                      className={
                        "dark:data-[focus]:bg-primary/30 data-[focus]:bg-primary -mx-3 cursor-pointer rounded-lg px-3 py-1.5 text-gray-800 data-[focus]:text-white dark:text-white"
                      }
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

const SettingsModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setUser } = useAuthActions();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.PROFILE);
  const [file, setFile] = useState<File[]>([]);
  const [picture, setPicture] = useState<Picture | null>();
  const { data: user, isPending: isUserLoading } = useGetUser();
  const { mutateAsync: generateAvatar, isPending: isGenerateAvatarLoading } =
    useGenerateAvatar({
      invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
    });

  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  const { getRootProps, getInputProps, open } = useFileUpload({
    files: file,
    setFiles: setFile,
    handleFileUpload: async (file) => {
      const url = URL.createObjectURL(file);
      setPicture({ url });
      setFile([]);

      const { avatar_url } = await generateAvatar({
        body: {
          uploaded_picture: file,
          regenerate_avatar: false,
        },
      });

      if (user?.is_avatar_enabled) {
        setPicture({ url: avatar_url || "" });
      }

      setUser((pv) =>
        pv
          ? {
              ...pv,
              avatar_url: avatar_url || "",
              original_profile_picture_url: url || "",
            }
          : null,
      );
    },
  });

  useEffect(() => {
    if (user && user?.avatar_url) {
      setPicture({
        url:
          (user.is_avatar_enabled
            ? user.avatar_url
            : user.original_profile_picture_url) || "",
      });
    }
  }, [user, setPicture]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      desktopClassName="w-full h-dvh sm:max-w-screen-md"
      title="Settings"
      description={"User settings"}
      showClose
      Trigger={() => <></>}
    >
      <div className="scrollbar flex w-full flex-col items-start justify-start divide-gray-300 overflow-y-auto border-t border-gray-100 px-3 pt-5 md:h-full md:flex-row md:divide-x dark:divide-white/10 dark:border-white/10">
        {/* left section */}
        <div className="flex w-full flex-col pr-3 pl-3 md:w-[25%]">
          <div className="flex w-full flex-row gap-5 md:flex-col md:gap-2">
            <Button
              variant={"ghost"}
              onClick={() => setActiveTab(ActiveTab.PROFILE)}
              wrapperClass="w-full flex -mx-2"
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary bg-gray-200 dark:text-white":
                    activeTab === ActiveTab.PROFILE ||
                    activeTab === ActiveTab.CHANGE_NAME ||
                    activeTab === ActiveTab.CHANGE_PHONE,
                },
              )}
            >
              <IoPerson className="size-6" />
              <p className="text-sm font-medium">Profile</p>
            </Button>

            <Button
              variant={"ghost"}
              wrapperClass="w-full flex -mx-2"
              onClick={() => setActiveTab(ActiveTab.SECURITY)}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary bg-gray-200 dark:text-white":
                    activeTab === ActiveTab.SECURITY ||
                    activeTab === ActiveTab.CHANGE_PASSWORD,
                },
              )}
            >
              <IoLockClosed className="size-6" />
              <p className="text-sm font-medium">Security</p>
            </Button>
          </div>
        </div>
        {/* left section */}

        {/* right section */}
        {!isUserLoading && user && (
          <div
            {...getRootProps()}
            className="mt-5 flex h-full w-full flex-1 flex-col md:mt-0 md:w-[75%] md:flex-auto md:overflow-y-auto"
          >
            <SlidingContainer
              active={activeTab}
              className="p-1 md:pr-3 md:pl-5"
            >
              {activeTab === ActiveTab.PROFILE && (
                <div className="w-full flex-1">
                  <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    Your profile picture
                  </h3>

                  <div className="mt-3 flex w-full flex-col justify-start gap-5 md:flex-row md:items-center">
                    <div className="relative aspect-square size-full overflow-hidden rounded-xl bg-gray-200 md:size-40 dark:bg-white/20">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {isGenerateAvatarLoading && (
                          <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(10px)" }}
                            className="absolute inset-0 z-20 animate-pulse rounded-xl bg-white/70 backdrop-blur-xl"
                          ></motion.div>
                        )}
                      </AnimatePresence>

                      {picture && (
                        <BlurWrapper Key={picture.url}>
                          {picture.url ? (
                            <img
                              src={picture.url}
                              className="aspect-square w-full object-cover"
                              alt="user profile picture"
                            />
                          ) : (
                            <div className="flex aspect-square w-full items-center justify-center p-5">
                              <IoPersonCircleOutline className="size-20 text-gray-500" />
                            </div>
                          )}
                        </BlurWrapper>
                      )}
                    </div>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {!isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <input
                            className="sr-only"
                            type="file"
                            {...getInputProps()}
                          />

                          <Button
                            onClick={open}
                            wrapperClass="w-max flex items-center justify-center"
                            variant={"ghost"}
                            className={
                              "flex items-center justify-start gap-3 rounded-xl border p-3 hover:bg-gray-100 data-[pressed]:bg-gray-100 md:p-3 dark:border-white/10 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10"
                            }
                          >
                            <IoImage className="text-primary size-6 flex-shrink-0" />
                            {picture?.url ? "Update picture" : "Add picture"}
                          </Button>

                          <div className="mt-3">
                            <Form
                              validationSchema={z.object({
                                keepOriginal: z.boolean(),
                              })}
                            >
                              <Field>
                                <Switch
                                  isSelected={!user.is_avatar_enabled}
                                  value={!user.is_avatar_enabled ? "t" : ""}
                                  onChange={(val) => {
                                    if (val) {
                                      setPicture({
                                        url:
                                          user.original_profile_picture_url ||
                                          "",
                                      });
                                    } else {
                                      setPicture({
                                        url: user.avatar_url || "",
                                      });
                                    }
                                    updateUser({
                                      body: {
                                        ...user,
                                        is_avatar_enabled: !val,
                                      },
                                    });
                                  }}
                                >
                                  <p className="ml-3 text-sm font-medium text-gray-800 dark:text-white">
                                    Keep the original
                                  </p>
                                </Switch>
                              </Field>
                            </Form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <div
                            className={
                              "group relative bg-white transition-shadow duration-500 ease-out [--bg-size:500%] dark:bg-transparent"
                            }
                          >
                            <span
                              className={
                                "animate-gradient from-accent via-primary-600 to-accent inline bg-gradient-to-r bg-[length:var(--bg-size)_100%] bg-clip-text text-base font-semibold text-transparent"
                              }
                            >
                              Generating a cool looking avatar for you.
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* name */}
                  <div className="mt-5">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="name"
                      >
                        Name
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_NAME)}
                        variant={"ghost"}
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        Edit
                      </Button>
                    </div>

                    <p className="mt-1 text-sm text-gray-800 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
                      Member
                    </p>
                  </div>
                  {/* name */}

                  {/* email */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <label
                      className="text-sm font-medium text-gray-800 dark:text-white"
                      htmlFor="name"
                    >
                      Email
                    </label>

                    <div className="mt-1 flex items-center justify-start gap-2">
                      <IoMail className="text-primary dark:text-secondary size-6" />
                      <p className="text-sm text-gray-800 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* email */}

                  {/* phone number */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="phone"
                      >
                        Phone
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_PHONE)}
                        variant={"ghost"}
                        wrapperClass="w-max"
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        {user.phone_number ? "Edit" : "Add number"}
                      </Button>
                    </div>
                    {user.phone_number && (
                      <div className="mt-1 flex items-center justify-start gap-2">
                        <IoCall className="text-primary dark:text-secondary size-6" />

                        <p className="text-sm text-gray-800 dark:text-white">
                          +1 {user.phone_number}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* phone number */}
                </div>
              )}

              {activeTab === ActiveTab.SECURITY && (
                <div className="w-ful h-full min-h-full flex-1">
                  <div className="flex w-full items-start justify-between gap-5">
                    <div className="">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        Change Password
                      </p>
                      <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
                        Update your password for added security. Click here to
                        change it now. Didn't request this? Contact support.
                      </p>
                    </div>

                    <Button
                      onClick={() => setActiveTab(ActiveTab.CHANGE_PASSWORD)}
                      variant={"ghost"}
                      className={
                        "text-primary dark:text-secondary text-xs hover:underline"
                      }
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === ActiveTab.CHANGE_NAME && (
                <ChangeName user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PHONE && (
                <ChangeNumber user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PASSWORD && (
                <ChangePassword setActiveTab={setActiveTab} />
              )}
            </SlidingContainer>
          </div>
        )}

        {isUserLoading && (
          <div className="flex h-full w-full items-center justify-center md:w-[75%]">
            <Spinner className="size-4" />
          </div>
        )}
        {/* right section */}
      </div>
    </Modal>
  );
};

interface IChangeName extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeName = ({ user, setActiveTab }: IChangeName) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Name
          </p>
        </div>
      </div>

      <Form
        validationSchema={z.object({
          first_name: z
            .string({ required_error: "First name is required." })
            .trim()
            .min(1, "First name is required."),

          last_name: z
            .string({ required_error: "Last name is required." })
            .trim()
            .min(1, "Last name is required."),
        })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          first_name: user.first_name,
          last_name: user.last_name,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>First name</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.first_name}
                {...register("first_name")}
              />
              <ErrorMessage>{errors.first_name?.message}</ErrorMessage>
            </Field>

            <Field>
              <Label>Last name</Label>
              <Input
                placeholder={"Enter last name"}
                className="w-full"
                data-invalid={errors.last_name}
                {...register("last_name")}
              />
              <ErrorMessage>{errors.last_name?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangeNumber extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeNumber = ({ user, setActiveTab }: IChangeNumber) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Number
          </p>
        </div>
      </div>

      <Form
        validationSchema={z
          .object({
            phone_number: z
              .string({ required_error: "Phone number is required." })
              .min(1, "Phone number is required.")
              .nullable(),
          })
          .superRefine((data, ctx) => {
            const phoneNumber = data.phone_number;

            if (phoneNumber) {
              // Check if phone number contains spaces
              if (/\s/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must not contain spaces.",
                  path: ["phone_number"],
                });
              }

              // Check if phone number starts with '+1'
              if (phoneNumber.startsWith("+1")) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number should not start with '+1'.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number has exactly 10 digits
              if (phoneNumber.length !== 10) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must be exactly 10 digits.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number follows the valid US format
              if (!/^[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message:
                    "Invalid US phone number format (Area code and exchange code can't start with 1).",
                  path: ["phone_number"],
                });
              }
            }
          })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          phone_number: user.phone_number,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>Contact number</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.phone_number}
                {...register("phone_number")}
              />
              <ErrorMessage>{errors.phone_number?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangePassword extends ComponentProps<"div"> {
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangePassword = ({ setActiveTab }: IChangePassword) => {
  const { mutateAsync: changePassword } = useChangePassword({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.SECURITY)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Password
          </p>
          <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
            Update your password for added security. Click here to change it
            now. Didn't request this? Contact support.
          </p>
        </div>
      </div>

      <Form
        validationSchema={ChangePasswordSchema}
        className="mt-5"
        onSubmit={async (values, methods) => {
          try {
            await changePassword({
              body: values,
            });
            setActiveTab(ActiveTab.SECURITY);
          } catch (error) {
            const err = error as AxiosError;

            if (err.response?.status === 400) {
              methods.setError("current_password", {
                message: "Invalid current password",
              });
            }
          }
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <div className="flex flex-col space-y-2">
            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  className="w-full"
                  data-invalid={errors.current_password?.message}
                  {...register("current_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.current_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full"
                  data-invalid={errors.new_password?.message}
                  {...register("new_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.new_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="w-full"
                  data-invalid={errors.confirm_password?.message}
                  {...register("confirm_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.confirm_password?.message}</ErrorMessage>
            </Field>

            <div className="flex w-full justify-end">
              <ButtonWithLoader
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </ButtonWithLoader>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default RootLayout;
