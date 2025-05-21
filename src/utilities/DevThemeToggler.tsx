import { useThemeActions } from "../store/themeStore";

export const DevThemeToggler = () => {
  const { setMode } = useThemeActions();

  return (
    <div className="absolute top-0 left-0 isolate z-[9999999999] mt-8 ml-10 flex items-center justify-center gap-5 opacity-0 hover:opacity-100">
      <button
        onClick={() => setMode("system")}
        className="text-xs text-gray-800 hover:underline dark:text-white"
      >
        system
      </button>
      <button
        onClick={() => setMode("light")}
        className="text-xs text-gray-800 hover:underline dark:text-white"
      >
        light
      </button>
      <button
        onClick={() => setMode("dark")}
        className="text-xs text-gray-800 hover:underline dark:text-white"
      >
        dark
      </button>
    </div>
  );
};
