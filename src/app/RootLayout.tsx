import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth, useAuthActions } from "../store/authStore";
import Login from "./Login";

//test for changesets.
const RootLayout = () => {
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser } = useAuthActions();
  useEffect(() => {
    window.electronAPI.onTokenReceived((token) => {
      setAccessToken(token);
      refetchUser();
    });
  }, [setAccessToken, refetchUser]);

  return (
    <main className="@container relative flex h-dvh w-full flex-col font-sans">
      <nav className="app-region-drag dark:bg-primary-dark-foreground absolute inset-x-0 top-0 w-full bg-gray-100 py-3.5"></nav>

      <section className="dark:from-primary-dark-foreground dark:to-primary-dark flex w-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
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

        {accessToken && user && <Outlet />}
      </section>
    </main>
  );
};

export default RootLayout;
