// src/hooks/useAppHistory.ts
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface AppHistoryControls {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  historyStack: string[];
  currentIndex: number;
}

export const useAppHistory = (): AppHistoryControls => {
  const navigate = useNavigate();
  const location = useLocation();

  // historyStack stores location.key strings provided by React Router
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  // currentIndex points to the current location's key within our historyStack
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    // React Router typically provides a 'key' for each location.
    // 'default' is often used for the initial entry if no specific key is present.
    const currentKey = location.key || "default";

    if (currentIndex === -1) {
      // Initialize the history stack with the first location key
      setHistoryStack([currentKey]);
      setCurrentIndex(0);
    } else {
      // This block handles subsequent location changes
      const existingIndexInStack = historyStack.indexOf(currentKey);

      if (existingIndexInStack !== -1) {
        // The currentKey already exists in our stack, meaning it's a back/forward navigation.
        // Update currentIndex if it has changed.
        if (currentIndex !== existingIndexInStack) {
          setCurrentIndex(existingIndexInStack);
        }
      } else {
        // The currentKey is new, meaning it's a PUSH navigation (e.g., user clicked a <Link>).
        // Truncate any "forward" history from the previous currentIndex.
        const newStack = historyStack.slice(0, currentIndex + 1);
        newStack.push(currentKey); // Add the new key
        setHistoryStack(newStack);
        setCurrentIndex(newStack.length - 1); // Update current index to the new end of the stack
      }
    }
  }, [location]);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < historyStack.length - 1;

  const goBack = useCallback(() => {
    // Directly use the current state values for the condition
    if (currentIndex > 0) {
      navigate(-1);
    }
  }, [navigate, currentIndex]); // Recreate if navigate or currentIndex changes

  const goForward = useCallback(() => {
    // Directly use the current state values for the condition
    if (currentIndex < historyStack.length - 1) {
      navigate(1);
    }
  }, [navigate, currentIndex, historyStack.length]); // Recreate if dependencies change

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    historyStack,
    currentIndex,
  };
};
