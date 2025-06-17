import { Source, Suggestion, Video } from "../../../api/messages/types";

export interface StreamDataAccumulator {
  message: string;
  sources: Source[];
  suggestedQuestions: Suggestion[];
  suggestedVideos: Video[];
  files: File[];
}

export type StreamStatus = "idle" | "loading" | "streaming" | "done" | "error";
export type StreamEndReason = "completed" | "interrupted_by_user" | "error";

export type MessageHandlerEventMap = {
  status: (
    status: StreamStatus,
    botMessageId: string | null,
    error?: string,
  ) => void;
  messageChunk: (botMessageId: string, chunk: string) => void;
  sources: (botMessageId: string, sources: Source[]) => void;
  suggestions: (botMessageId: string, suggestions: Suggestion[]) => void;
  suggestedVideos: (botMessageId: string, videos: Video[]) => void;
  // New event to signal stream conclusion with all data
  streamConcluded: (
    botMessageId: string,
    finalData: Readonly<StreamDataAccumulator>,
    reason: StreamEndReason,
  ) => void;
};

export class MessageHandler {
  public readonly threadId: string;
  private readonly agentId: string;
  private readonly accessToken: string;
  private readonly baseApiUrl: string;
  private eventSource: EventSource | null = null;

  private currentStreamData: StreamDataAccumulator;
  private currentStreamStatus: StreamStatus = "idle";
  private currentBotMessageIdForStream: string | null = null;
  private streamInterruptionSource: "none" | "user" = "none";

  private listeners: {
    [K in keyof MessageHandlerEventMap]?: Array<(...args: unknown[]) => void>;
  } = {};

  constructor(
    threadId: string,
    agentId: string,
    accessToken: string,
    apiUrl: string,
  ) {
    // Added accessToken to constructor signature
    this.threadId = threadId;
    this.agentId = agentId;
    this.accessToken = accessToken; // Use passed accessToken
    this.baseApiUrl = apiUrl; // Assuming apiUrl is globally available or correctly imported

    this.currentStreamData = this.getInitialStreamData();
  }

  private getInitialStreamData(): StreamDataAccumulator {
    return {
      message: "",
      sources: [],
      suggestedQuestions: [],
      suggestedVideos: [],
      files: [],
    };
  }

  public on<K extends keyof MessageHandlerEventMap>(
    event: K,
    listener: MessageHandlerEventMap[K],
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener as (...args: unknown[]) => void);
    return () => this.off(event, listener);
  }

  public off<K extends keyof MessageHandlerEventMap>(
    event: K,
    listener: MessageHandlerEventMap[K],
  ): void {
    const eventListeners = this.listeners[event];
    if (!eventListeners) {
      return;
    }
    this.listeners[event] = eventListeners.filter(
      (l) => l !== (listener as (...args: unknown[]) => void),
    );
    if (this.listeners[event]?.length === 0) {
      delete this.listeners[event];
    }
  }

  private emit<K extends keyof MessageHandlerEventMap>(
    event: K,
    ...args: Parameters<MessageHandlerEventMap[K]>
  ): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listenerCallback) => {
        const typedListener = listenerCallback as MessageHandlerEventMap[K];
        // eslint-disable-next-line prefer-spread -- Needed because 'args' can be a union of tuples, which TS cannot spread directly (TS2556)
        (typedListener as (this: null, ...params: unknown[]) => void).apply(
          null,
          args,
        );
      });
    }
  }

  private setStreamStatus(status: StreamStatus, error?: string): void {
    // Prevent re-triggering if already in a terminal state with the same status
    if (
      this.currentStreamStatus === status &&
      (status === "done" || status === "error")
    ) {
      return;
    }
    const oldStatus = this.currentStreamStatus;
    this.currentStreamStatus = status;
    this.emit("status", status, this.currentBotMessageIdForStream, error);

    if (
      (status === "done" || status === "error") &&
      oldStatus !== "done" &&
      oldStatus !== "error"
    ) {
      this.cleanupEventSource();
      this.handleStreamEnd(); // Call the new function here
    }
  }

  private cleanupEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      // console.log(`MessageHandler: EventSource closed for thread ${this.threadId}`);
    }
  }

  private handleStreamEnd(): void {
    if (this.currentBotMessageIdForStream) {
      let endReason: StreamEndReason;

      if (this.currentStreamStatus === "error") {
        endReason = "error";
      } else if (this.currentStreamStatus === "done") {
        if (this.streamInterruptionSource === "user") {
          endReason = "interrupted_by_user";
        } else {
          endReason = "completed"; // Natural completion
        }
      } else {
        // This case should ideally not be reached if setStreamStatus logic is correct.
        // Log a warning and default to 'error' to ensure streamConcluded is still emitted.
        console.warn(
          `MessageHandler: handleStreamEnd called with unexpected status: ${this.currentStreamStatus}. Defaulting endReason to 'error'.`,
        );
        endReason = "error";
      }

      this.emit(
        "streamConcluded",
        this.currentBotMessageIdForStream,
        { ...this.currentStreamData }, // Send a snapshot
        endReason,
      );
    }
    this.streamInterruptionSource = "none";
  }

  public startStreaming(
    userQuery: string,
    botMessageIdToUpdate: string,
    files?: File[],
  ): void {
    if (this.eventSource) {
      this.stopStreaming();
    }

    this.currentStreamData = this.getInitialStreamData();
    if (files) {
      this.currentStreamData.files = files;
    }

    this.currentBotMessageIdForStream = botMessageIdToUpdate;
    this.streamInterruptionSource = "none";
    this.setStreamStatus("loading");

    const query = encodeURIComponent(userQuery);
    const token = this.accessToken || "";
    if (!token) {
      console.error(
        "MessageHandler: Access token is missing. Cannot start stream.",
      );
      this.setStreamStatus("error", "Access token missing.");
      this.currentBotMessageIdForStream = null;
      return;
    }
    const streamUrl = `${this.baseApiUrl}/copilots/${this.agentId}/ask?query=${query}&access_token=${token}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.setStreamStatus("streaming");
      };

      this.eventSource.onerror = (event) => {
        console.error(
          `MessageHandler: EventSource error for ${this.currentBotMessageIdForStream}:`,
          event,
        );
        const errorMessage =
          this.eventSource?.readyState === EventSource.CLOSED &&
          this.currentStreamStatus !== "done" &&
          this.currentStreamStatus !== "error"
            ? "Stream connection closed unexpectedly."
            : "A network or other error occurred with the stream.";
        this.setStreamStatus("error", errorMessage);
      };

      this.eventSource.addEventListener("message", (event: MessageEvent) => {
        if (
          !this.currentBotMessageIdForStream ||
          this.currentStreamStatus === "done" ||
          this.currentStreamStatus === "error"
        )
          return;
        const chunk = event.data as string;
        this.currentStreamData.message += chunk;
        this.emit("messageChunk", this.currentBotMessageIdForStream, chunk);
      });

      const createSseDataHandler =
        <TData>(
          dataField: keyof Pick<
            StreamDataAccumulator,
            "sources" | "suggestedQuestions" | "suggestedVideos"
          >,
          eventName: keyof Pick<
            MessageHandlerEventMap,
            "sources" | "suggestions" | "suggestedVideos"
          >,
        ) =>
        (event: MessageEvent) => {
          if (
            !this.currentBotMessageIdForStream ||
            this.currentStreamStatus === "done" ||
            this.currentStreamStatus === "error"
          )
            return;
          try {
            const parsedData = JSON.parse(event.data) as TData[];
            if (!Array.isArray(this.currentStreamData[dataField])) {
              (this.currentStreamData[dataField] as TData[]) = [];
            }
            (this.currentStreamData[dataField] as TData[]).push(...parsedData);
            this.emit(
              eventName as any,
              this.currentBotMessageIdForStream!,
              parsedData,
            );
          } catch (e) {
            console.error(
              `MessageHandler: Error parsing ${eventName} for ${this.currentBotMessageIdForStream}:`,
              e,
              "Data:",
              event.data,
            );
          }
        };

      this.eventSource.addEventListener(
        "sources",
        createSseDataHandler<Source>("sources", "sources"),
      );
      this.eventSource.addEventListener(
        "suggested_questions",
        createSseDataHandler<Suggestion>("suggestedQuestions", "suggestions"),
      );
      this.eventSource.addEventListener(
        "suggested_videos",
        createSseDataHandler<Video>("suggestedVideos", "suggestedVideos"),
      );

      this.eventSource.addEventListener("status", (event: MessageEvent) => {
        if ((event.data as string).trim().toLowerCase() === "done") {
          if (
            this.currentStreamStatus !== "done" &&
            this.currentStreamStatus !== "error"
          ) {
            this.setStreamStatus("done");
          }
        }
      });
    } catch (error) {
      console.error(
        `MessageHandler: Failed to initialize EventSource for ${this.currentBotMessageIdForStream}:`,
        error,
      );
      this.setStreamStatus("error", "Failed to start stream.");
      this.currentBotMessageIdForStream = null;
    }
  }

  public stopStreaming(): void {
    const wasStreamingOrLoading =
      this.currentStreamStatus === "streaming" ||
      this.currentStreamStatus === "loading";

    if (this.eventSource || wasStreamingOrLoading) {
      this.streamInterruptionSource = "user";
    }

    if (this.eventSource) {
      this.cleanupEventSource();
      if (wasStreamingOrLoading) {
        this.setStreamStatus("done");
      }
    } else if (wasStreamingOrLoading) {
      this.setStreamStatus("done");
    }

    this.currentBotMessageIdForStream = null;
  }

  /**
   * Resets the MessageHandler to its initial state.
   * Stops any active stream, clears current data, and resets status.
   */
  public reset(): void {
    // console.log(`MessageHandler: Resetting handler for thread ${this.threadId}`);

    // Stop any ongoing stream. This will also handle cleanupEventSource
    // and potentially call handleStreamEnd if a stream was active.
    this.stopStreaming();

    // Reset internal state variables
    this.currentStreamData = this.getInitialStreamData();
    this.streamInterruptionSource = "none";

    // Explicitly set bot message ID to null after stopping, as stopStreaming handles it.
    // this.currentBotMessageIdForStream = null; // This is already done by stopStreaming

    // Set status to idle and emit event.
    // Check if already idle to avoid redundant status emission if stopStreaming didn't change it to done/error
    if (this.currentStreamStatus !== "idle") {
      this.currentStreamStatus = "idle"; // Set directly before emit
      this.emit("status", "idle", null); // Emit idle status with null botMessageId
    } else if (this.currentBotMessageIdForStream !== null) {
      // If status was already idle but there was a lingering bot ID (shouldn't happen with proper stopStreaming)
      this.emit("status", "idle", null);
    }
    // Ensure currentBotMessageIdForStream is null if it wasn't cleared by stopStreaming for some reason
    this.currentBotMessageIdForStream = null;
  }

  public getCurrentStreamData(): Readonly<StreamDataAccumulator> {
    return { ...this.currentStreamData };
  }

  public getCurrentStreamStatus(): Readonly<StreamStatus> {
    return this.currentStreamStatus;
  }

  public getCurrentBotMessageIdForStream(): string | null {
    return this.currentBotMessageIdForStream;
  }
}
