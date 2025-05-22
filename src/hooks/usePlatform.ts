import { useMemo } from "react";

const usePlatform = () => {
  return useMemo(() => window.electronAPI.osPlatform, []);
};

export default usePlatform;
