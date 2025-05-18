import { create } from "zustand";
import { useAuthStore } from "./authStore"; // Import the auth store
import { useAgentStore } from "./agentStore"; // Import the auth store
import { Source, Suggestion } from "../api/messages/types";

// Define the structure for the state data
interface StreamData {
  message: string;
  sources: Source[];
  suggestedVideos: string[];
  suggestedQuestions: Suggestion[];
}

// Define the structure of the Zustand store
interface StreamStore {
  states: {
    isStreamLoading: boolean;
    isStreamActive: boolean;
    streamData: StreamData;
  };
  actions: {
    // **** Modify startStream signature ****
    startStream: (message: string) => void; // No longer takes accessToken or agentId
    stopStream: () => void;
    // Internal helper actions (optional, but can clean up listeners)
    _updateStreamData: (updater: (prevData: StreamData) => StreamData) => void;
    _setLoading: (isLoading: boolean) => void;
    _setActive: (isActive: boolean) => void;
  };
}

// Internal variable to hold the EventSource instance (not part of the store's state)
let eventSourceInstance: EventSource | null = null;

const useStreamStore = create<StreamStore>()((set, get) => ({
  states: {
    isStreamLoading: false,
    isStreamActive: false,
    streamData: {
      message: "",
      sources: [],
      suggestedVideos: [],
      suggestedQuestions: [],
    },
  },
  actions: {
    // --- Internal State Updaters ---
    _setLoading: (isLoading) =>
      set((state) => ({
        states: { ...state.states, isStreamLoading: isLoading },
      })),
    _setActive: (isActive) =>
      set((state) => ({
        states: { ...state.states, isStreamActive: isActive },
      })),
    _updateStreamData: (updater) =>
      set((state) => ({
        states: {
          ...state.states,
          streamData: updater(state.states.streamData),
        },
      })),

    // --- Stop Stream Action ---
    stopStream: () => {
      if (eventSourceInstance) {
        console.log("Closing EventSource connection (Zustand).");
        eventSourceInstance.close();
        eventSourceInstance = null;
      }
      get().actions._setActive(false);
      get().actions._setLoading(false);
    },

    // --- Start Stream Action ---
    // **** Updated startStream implementation ****
    startStream: (message) => {
      // Takes only message now
      const { stopStream, _setActive, _setLoading, _updateStreamData } =
        get().actions;

      // --- Get dependencies directly from other stores ---
      // Use getState() which synchronously reads the current state
      const { accessToken } = useAuthStore.getState().states;
      const { selectedAgent } = useAgentStore.getState().states;
      const agentId = selectedAgent?.id;
      // ----------------------------------------------------

      // Ensure any previous stream is stopped
      if (eventSourceInstance) {
        stopStream();
      }

      // Reset state for the new request
      _updateStreamData(() => ({
        message: "",
        sources: [],
        suggestedVideos: [],
        suggestedQuestions: [],
      }));
      _setLoading(true);
      _setActive(false);

      // --- Check dependencies ---
      if (!accessToken) {
        console.error(
          "Cannot start stream: Access token is missing (checked in store)."
        );
        _setLoading(false); // Stop loading state
        return; // Exit the function
      }
      if (!agentId) {
        console.error(
          "Cannot start stream: Agent ID is missing (checked in store)."
        );
        _setLoading(false); // Stop loading state
        return; // Exit the function
      }
      // -------------------------

      const query = encodeURIComponent(message);
      const url = `/api/stream?q=${query}&agent_id=${agentId}&token=${accessToken}`;

      console.log(
        "Initializing EventSource (Zustand with internal deps):",
        url
      );
      try {
        const es = new EventSource(url);
        eventSourceInstance = es; // Store the instance internally

        // --- Event Listeners ---
        es.onopen = () => {
          console.log("EventSource connection opened (Zustand).");
          _setLoading(false);
          _setActive(true);
        };

        es.onerror = (event) => {
          console.error("EventSource error (Zustand):", event);
          if (es.readyState === EventSource.CLOSED) {
            console.log(
              "EventSource closed due to error or completion (Zustand)."
            );
          }
          stopStream(); // Clean up on error
        };

        es.addEventListener("status", (event: MessageEvent) => {
          const data = event.data.trim();
          console.log("Status event (Zustand):", data);
          if (data === "done") {
            console.log("Stream finished (status: done) (Zustand).");
            stopStream();
          }
        });

        es.addEventListener("message", (event: MessageEvent) => {
          const data = event.data;
          _updateStreamData((prev) => ({
            ...prev,
            message: prev.message + data,
          }));
        });

        // Generic handler for JSON array data (no changes needed here)
        const handleJsonArrayEvent = <T>(
          eventName: string,
          key: keyof StreamData
        ) => {
          // ... (implementation remains the same) ...
          es.addEventListener(eventName, (event: MessageEvent) => {
            const rawData = event.data.trim();
            if (!rawData) return;

            try {
              // Assuming the data is always a JSON array string
              const parsedData = JSON.parse(rawData) as T[];
              if (Array.isArray(parsedData)) {
                _updateStreamData((prev) => {
                  const currentArray = prev[key] as T[]; // Assert type
                  return {
                    ...prev,
                    [key]: [...currentArray, ...parsedData],
                  };
                });
              } else {
                console.error(
                  `Error parsing ${eventName}: Expected an array, received:`,
                  parsedData,
                  "Raw data:",
                  rawData
                );
              }
            } catch (e) {
              console.error(
                `Error parsing ${eventName} (Zustand):`,
                e,
                "Raw data:",
                rawData
              );
            }
          });
        };

        handleJsonArrayEvent<Source>("sources", "sources");
        handleJsonArrayEvent<string>("suggested_videos", "suggestedVideos");
        handleJsonArrayEvent<Suggestion>(
          "suggested_questions",
          "suggestedQuestions"
        );
      } catch (error) {
        console.error("Failed to create EventSource:", error);
        stopStream(); // Ensure cleanup if constructor fails
      }
    },
  },
}));

export const useStream = () => useStreamStore((state) => state.states);
export const useStreamActions = () => useStreamStore((state) => state.actions);
