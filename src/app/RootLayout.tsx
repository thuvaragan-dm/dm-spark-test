import { ComboboxOption } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { Focusable } from "react-aria-components";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import {
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscSearch,
} from "react-icons/vsc";
import { Outlet, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { Button } from "../components/Button";
import Combobox from "../components/Combobox";
import Dropdown from "../components/dropdown";
import Tooltip from "../components/tooltip";
import { COMMAND_KEY } from "../components/tooltip/TooltipKeyboardShortcut";
import { useAppHistory } from "../hooks/useAppHistory";
import { useAuth, useAuthActions } from "../store/authStore";
import { useCombobox, useComboboxActions } from "../store/comboboxStore";
import { useSidebar, useSidebarActions } from "../store/sidebarStore";
import { cn } from "../utilities/cn";
import Login from "./Login";

const RootLayout = () => {
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser, logout } = useAuthActions();
  useEffect(() => {
    window.electronAPI.onTokenReceived((token) => {
      setAccessToken(token);
      refetchUser();
    });
  }, [setAccessToken, refetchUser]);

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
  }

  const defaultSearchOptions: ComboboxResult[] = useMemo(
    () => [
      {
        id: "1",
        name: "toggle: sidebar",
      },
      {
        id: "2",
        name: "toggle: searchbar",
      },
      {
        id: "3",
        name: "settings: user preferences",
      },
    ],
    [],
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

  return (
    <main className="from-primary-darker to-primary-darker-2 @container relative flex h-dvh w-full flex-col bg-linear-to-br/decreasing font-sans">
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
                    <IoArrowBack className="size-5" />
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
                    <IoArrowForward className="size-5" />
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
                      <p>Deepmodel Search...</p>
                    </button>
                  </Focusable>

                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Search Deepmodel"
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
                      <VscLayoutSidebarLeft className="size-5" />
                    ) : (
                      <VscLayoutSidebarLeftOff className="size-5" />
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

      {accessToken && !user && (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <div className="bg-primary relative w-min rounded-full p-2 text-white dark:bg-black/10 dark:text-white/50">
            <div className="absolute -inset-1 animate-spin rounded-full bg-gradient-to-b from-[#EDEEF1] from-20% to-transparent dark:from-[#1C1C1C]"></div>
            <svg
              className="size-8"
              fill="none"
              viewBox="0 0 227 228"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 124.669c0 56.279 45.623 91.36 101.902 91.36 56.278 0 101.901-45.623 101.901-101.901S176.448 12.227 113.902 12.227c-43.572 0-88.001-5.742-88.001 40.532 0 46.275-4.275 75.51 54.268 24.122 63.249-55.518 109.631 37.247 73.79 73.088-35.841 35.841-78.007 0-78.007 0"
                stroke="currentColor"
                strokeWidth={22.033}
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="mt-2 text-center text-base font-medium tracking-wide text-gray-800 dark:text-white">
            Getting Your Workspace Ready
          </h2>
          <p className="text-center text-xs text-gray-500 dark:text-white/50">
            We're currently loading your profile and settings.
          </p>
        </div>
      )}

      {/* Main content */}
      {accessToken && user && (
        <section className="mt-10 flex w-full flex-1 flex-col overflow-hidden">
          <div className="mb-1.5 flex h-full w-full items-start justify-start overflow-hidden">
            {/* side panel */}
            <div className="flex h-full w-20 flex-col items-center justify-between overflow-hidden pb-4">
              <div className="flex flex-1 flex-col items-center justify-start gap-3">
                {/* logo */}
                <div className="bg-primary w-min rounded-xl p-2 text-white">
                  <svg
                    className="size-8"
                    fill="none"
                    viewBox="0 0 227 228"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 124.669c0 56.279 45.623 91.36 101.902 91.36 56.278 0 101.901-45.623 101.901-101.901S176.448 12.227 113.902 12.227c-43.572 0-88.001-5.742-88.001 40.532 0 46.275-4.275 75.51 54.268 24.122 63.249-55.518 109.631 37.247 73.79 73.088-35.841 35.841-78.007 0-78.007 0"
                      stroke="currentColor"
                      strokeWidth={22.033}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {/* logo */}
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
                              <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs">
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
                          Fallback={() => (
                            <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs">
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
                    <Dropdown.Item className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white">
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white">
                      Preferences
                    </Dropdown.Item>

                    <Dropdown.Divider className="mt-2 mb-1 dark:border-white/10" />
                    <Dropdown.Item
                      className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                      onSelect={() => {
                        logout();
                      }}
                    >
                      Sign out of Deepmodel
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
                placeholder="Deepmodel Search"
                query={query}
                setQuery={setQuery}
                isLoading={isLoading}
                onSelect={(option) => {
                  console.log({ option });
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
      )}
      {/* Main content */}
    </main>
  );
};

export default RootLayout;
