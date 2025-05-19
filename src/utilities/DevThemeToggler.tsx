import { useThemeActions } from "../store/themeStore";

export const DevThemeToggler = () => {
  const { setMode } = useThemeActions();

  return (
    <div className="absolute top-0 right-0 z-[99999] m-2 flex items-center justify-center gap-5 opacity-0 hover:opacity-100">
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
