import { useEffect } from "react";
import { IoArrowBack, IoArrowForward, IoSearch } from "react-icons/io5";
import { VscLayoutSidebarLeft, VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { Outlet, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { Button } from "../components/Button";
import Tooltip from "../components/tooltip";
import { COMMAND_KEY } from "../components/tooltip/TooltipKeyboardShortcut";
import { useAppHistory } from "../hooks/useAppHistory";
import { useAuth, useAuthActions } from "../store/authStore";
import { useSidebar, useSidebarActions } from "../store/sidebarStore";
import { cn } from "../utilities/cn";
import Login from "./Login";
import { Focusable } from "react-aria-components";

const RootLayout = () => {
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser } = useAuthActions();
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
                      className={
                        "app-region-no-drag flex w-full cursor-pointer items-center justify-start gap-2 rounded-md bg-white/15 px-2 py-1 text-sm font-light tracking-wide text-white/50"
                      }
                    >
                      <IoSearch className="size-4" />
                      <p>Search...</p>
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
            <div className="scrollbar flex h-full w-20 flex-col items-center justify-between overflow-y-auto pb-4">
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
              </div>
              {/* user details */}
            </div>
            {/* side panel */}

            {/* content panel */}
            <div className="mr-1.5 flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10">
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
