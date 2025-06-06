import { useCallback, useEffect, useRef, useState } from "react";
import { Source, Suggestion } from "../../../api/messages/types";
import { useAgent } from "../../../store/agentStore";
import { useAuth } from "../../../store/authStore";
import { apiUrl } from "../../../api/variables";

export type StreamData = {
  message: string;
  sources: Source[];
  suggestedVideos: string[];
  suggestedQuestions: Suggestion[];
};

export interface StreamControl {
  isStreamLoading: boolean;
  isStreamActive: boolean;
  isStreamDone: boolean;
  streamData: StreamData;
  startStream: (message: string, agentId?: string) => void;
  stopStream: () => void;
  resetStream: () => void;
}

const useStream = (): StreamControl => {
  const { selectedAgent } = useAgent();
  const { accessToken } = useAuth();

  // State for stream status and data
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isStreamDone, setIsStreamDone] = useState(false);
  const [streamData, setStreamData] = useState<StreamData>({
    message: "",
    sources: [],
    suggestedVideos: [],
    suggestedQuestions: [],
  });

  // Ref to hold the EventSource instance
  const eventSourceRef = useRef<EventSource | null>(null);

  // --- Stop Stream Function ---
  // Memoized function to stop the stream and clean up
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("Closing EventSource connection.");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreamActive(false);
    setIsStreamLoading(false);
    setIsStreamDone(true);
    // Optionally reset streamData here if desired upon manual stop
    // setStreamData({ message: "", sources: [], suggestedVideos: [], suggestedQuestions: [] });
  }, []); // Dependencies remain the same

  // --- Start Stream Function ---
  // Memoized function to start the stream
  const startStream = useCallback(
    (message: string, agentId?: string) => {
      // Ensure any previous stream is stopped before starting a new one
      if (eventSourceRef.current) {
        stopStream();
      }

      // Reset stream data and flags for the new request
      setStreamData({
        message: "",
        sources: [],
        suggestedVideos: [],
        suggestedQuestions: [],
      });
      setIsStreamLoading(true);
      setIsStreamActive(false); // Ensure active is false until 'open' event
      setIsStreamDone(false); // Reset done flag for new stream

      const finalAgentId = agentId || selectedAgent?.id || "";
      // Use encodeURIComponent for better handling of special characters
      const query = encodeURIComponent(message);
      const url = `${apiUrl}/copilots/${finalAgentId}/ask?query=${query}&access_token=${accessToken}`;

      console.log("Initializing EventSource:", url);
      const es = new EventSource(url);
      eventSourceRef.current = es;

      // --- Event Listeners ---

      es.onopen = () => {
        console.log("EventSource connection opened.");
        setIsStreamLoading(false); // Loading finished when connection opens
        setIsStreamActive(true);
        // setIsStreamDone(false); // Already set to false at start
      };

      es.onerror = (event) => {
        console.error("EventSource error:", event);
        // Check if the error indicates closure or a real error
        if (es.readyState === EventSource.CLOSED) {
          console.log("EventSource closed due to error or completion.");
        } else {
          console.error("EventSource encountered an error (e.g., network).");
          // Optionally show an error message to the user
        }
        stopStream(); // Clean up state (incl. setting isStreamDone=true) and ref on any error
      };

      es.addEventListener("status", (event: MessageEvent) => {
        const data = event.data.trim();
        console.log("Status event:", data);
        if (data === "done") {
          console.log("Stream finished (status: done).");
          stopStream(); // Use the cleanup function (which sets isStreamDone=true)
        }
        // Handle other potential status updates if needed
      });

      es.addEventListener("message", (event: MessageEvent) => {
        const data = event.data; // SSE standard usually doesn't need trim here unless server adds whitespace
        // Ensure we are still active before processing messages (safety check)
        if (eventSourceRef.current) {
          setStreamData((prev) => ({
            ...prev,
            message: prev.message + data,
          }));
        }
      });

      // Generic handler for JSON array data to reduce repetition
      const handleJsonArrayEvent = <T>(
        eventName: string,
        key: keyof StreamData, // Use StreamData type for key safety
        parser: (data: string) => T[],
      ) => {
        es.addEventListener(eventName, (event: MessageEvent) => {
          // Ensure we are still active before processing events (safety check)
          if (!eventSourceRef.current) return;

          const rawData = event.data.trim();
          if (!rawData) return; // Ignore empty data chunks

          try {
            const parsedData = parser(rawData);
            // Ensure we always update with an array
            if (Array.isArray(parsedData)) {
              setStreamData((prev) => {
                // Type assertion needed because key is dynamic, but safer with keyof StreamData
                const currentArray = prev[key] as T[];
                return {
                  ...prev,
                  [key]: [...currentArray, ...parsedData],
                };
              });
            } else {
              console.error(
                `Error processing ${eventName}: Expected an array, received:`,
                parsedData,
                "Raw data:",
                rawData,
              );
            }
          } catch (e) {
            console.error(
              `Error parsing ${eventName}:`,
              e,
              "Raw data:",
              rawData,
            );
          }
        });
      };

      // Define parsers for each type
      const parseSources = (data: string): Source[] => JSON.parse(data);
      const parseVideos = (data: string): string[] => JSON.parse(data);
      const parseSuggestions = (data: string): Suggestion[] => JSON.parse(data);

      handleJsonArrayEvent<Source>("sources", "sources", parseSources);
      handleJsonArrayEvent<string>(
        "suggested_videos",
        "suggestedVideos",
        parseVideos,
      );
      handleJsonArrayEvent<Suggestion>(
        "suggested_questions",
        "suggestedQuestions",
        parseSuggestions,
      );
    },
    [selectedAgent, stopStream, accessToken], // stopStream is memoized and stable
  );

  // --- Cleanup Effect ---
  // Ensure the stream is closed when the component unmounts
  useEffect(() => {
    // Return the cleanup function
    return () => {
      stopStream(); // Calls the memoized stopStream which handles state updates
    };
  }, [stopStream]); // Dependency: the stable stopStream function

  const resetStream = () => {
    setIsStreamActive(false);
    setIsStreamLoading(false);
    setIsStreamDone(false);
  };

  // Return the state and control functions
  return {
    isStreamLoading,
    isStreamActive,
    isStreamDone,
    streamData,
    startStream,
    stopStream,
    resetStream,
  };
};

export default useStream;
