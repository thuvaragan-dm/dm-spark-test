import { Source, Suggestion, Video } from "../../../api/messages/types";

export interface HandlerInfo {
  type: string;
  name: string;
  confidence: number;
}

export interface StreamDataAccumulator {
  message: string;
  sources: Source[];
  suggestedQuestions: Suggestion[];
  suggestedVideos: Video[];
  files: File[];
  handlerInfo: HandlerInfo | null;
  threadName: string | null;
  thinking: string;
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
  thinkingChunk: (botMessageId: string, chunk: string) => void;
  sources: (botMessageId: string, sources: Source[]) => void;
  suggestions: (botMessageId: string, suggestions: Suggestion[]) => void;
  suggestedVideos: (botMessageId: string, videos: Video[]) => void;
  handlerSelected: (botMessageId: string, handlerInfo: HandlerInfo) => void;
  threadName: (botMessageId: string, threadName: string) => void;
  streamConcluded: (
    botMessageId: string,
    finalData: Readonly<StreamDataAccumulator>,
    reason: StreamEndReason,
  ) => void;
};

export class MessageHandler {
  public readonly threadId: string;
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

  // --- MODIFICATION: Buffering and batching logic ---
  private thinkingBuffer: string[] = [];
  private messageBuffer: string[] = [];
  private flushHandle: number | null = null;
  // --- End of modification ---

  constructor(threadId: string, accessToken: string, apiUrl: string) {
    this.threadId = threadId;
    this.accessToken = accessToken;
    this.baseApiUrl = apiUrl;
    this.currentStreamData = this.getInitialStreamData();
  }

  private getInitialStreamData(): StreamDataAccumulator {
    return {
      message: "",
      thinking: "",
      sources: [],
      suggestedQuestions: [],
      suggestedVideos: [],
      files: [],
      handlerInfo: null,
      threadName: null,
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
    if (!eventListeners) return;
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
        // MODIFICATION: Cast the listener to a function accepting a rest parameter
        // to resolve the TypeScript error with the spread operator.
        (listenerCallback as (...args: any[]) => void)(...args);
      });
    }
  }

  // --- MODIFICATION: Batching logic implementation ---
  private scheduleFlush(): void {
    if (this.flushHandle) return; // A flush is already scheduled.
    this.flushHandle = requestAnimationFrame(() => {
      this.flushBuffers();
      this.flushHandle = null;
    });
  }

  private flushBuffers(): void {
    // Cancel any scheduled flush since we are doing it now.
    if (this.flushHandle) {
      cancelAnimationFrame(this.flushHandle);
      this.flushHandle = null;
    }

    if (this.thinkingBuffer.length > 0) {
      const accumulatedChunk = this.thinkingBuffer.join("");
      this.thinkingBuffer = []; // Clear buffer
      this.currentStreamData.thinking += accumulatedChunk;
      if (this.currentBotMessageIdForStream) {
        this.emit(
          "thinkingChunk",
          this.currentBotMessageIdForStream,
          accumulatedChunk,
        );
      }
    }

    if (this.messageBuffer.length > 0) {
      const accumulatedChunk = this.messageBuffer.join("");
      this.messageBuffer = []; // Clear buffer
      this.currentStreamData.message += accumulatedChunk;
      if (this.currentBotMessageIdForStream) {
        this.emit(
          "messageChunk",
          this.currentBotMessageIdForStream,
          accumulatedChunk,
        );
      }
    }
  }
  // --- End of modification ---

  private setStreamStatus(status: StreamStatus, error?: string): void {
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
      this.handleStreamEnd();
    }
  }

  private cleanupEventSource(): void {
    this.flushBuffers(); // Ensure any remaining data is flushed.
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private handleStreamEnd(): void {
    this.flushBuffers(); // Final flush for any buffered data.
    if (this.currentBotMessageIdForStream) {
      let endReason: StreamEndReason;

      if (this.currentStreamStatus === "error") {
        endReason = "error";
      } else if (this.currentStreamStatus === "done") {
        endReason =
          this.streamInterruptionSource === "user"
            ? "interrupted_by_user"
            : "completed";
      } else {
        console.warn(
          `MessageHandler: handleStreamEnd called with unexpected status: ${this.currentStreamStatus}. Defaulting endReason to 'error'.`,
        );
        endReason = "error";
      }

      this.emit(
        "streamConcluded",
        this.currentBotMessageIdForStream,
        { ...this.currentStreamData },
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
    const threadId = this.threadId || "";

    if (!token) {
      console.error("MessageHandler: Access token is missing.");
      this.setStreamStatus("error", "Access token missing.");
      this.currentBotMessageIdForStream = null;
      return;
    }
    const streamUrl = `${this.baseApiUrl}/handlers/ask?query=${query}&access_token=${token}&thread_id=${threadId}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => this.setStreamStatus("streaming");

      this.eventSource.onerror = (event) => {
        console.error("EventSource error:", event);
        this.setStreamStatus("error", "A network error occurred.");
      };

      // --- MODIFICATION: Use buffering for high-frequency events ---
      this.eventSource.addEventListener("thinking", (event: MessageEvent) => {
        if (!this.currentBotMessageIdForStream) return;
        this.thinkingBuffer.push(event.data);
        this.scheduleFlush();
      });

      this.eventSource.addEventListener("message", (event: MessageEvent) => {
        if (!this.currentBotMessageIdForStream) return;
        // KEY CHANGE: If we receive a message, immediately flush any pending
        // 'thinking' chunks to prevent a visual delay.
        if (this.thinkingBuffer.length > 0) {
          this.flushBuffers();
        }
        this.messageBuffer.push(event.data);
        this.scheduleFlush();
      });
      // --- End of modification ---

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
          if (!this.currentBotMessageIdForStream) return;
          try {
            const parsedData = JSON.parse(event.data) as TData[];
            (this.currentStreamData[dataField] as TData[]).push(...parsedData);
            this.emit(
              eventName as any,
              this.currentBotMessageIdForStream!,
              parsedData,
            );
          } catch (e) {
            console.error(
              `Error parsing ${eventName}:`,
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

      this.eventSource.addEventListener(
        "handler_selected",
        (event: MessageEvent) => {
          if (!this.currentBotMessageIdForStream) return;
          try {
            const handlerInfo = JSON.parse(event.data) as HandlerInfo;
            this.currentStreamData.handlerInfo = handlerInfo;
            this.emit(
              "handlerSelected",
              this.currentBotMessageIdForStream,
              handlerInfo,
            );
          } catch (e) {
            console.error(
              "Error parsing handler_selected:",
              e,
              "Data:",
              event.data,
            );
          }
        },
      );

      this.eventSource.addEventListener(
        "thread_name",
        (event: MessageEvent) => {
          if (!this.currentBotMessageIdForStream) return;
          try {
            const data = JSON.parse(event.data) as { thread_name: string };
            this.currentStreamData.threadName = data.thread_name;
            this.emit(
              "threadName",
              this.currentBotMessageIdForStream,
              data.thread_name,
            );
          } catch (e) {
            console.error("Error parsing thread_name:", e, "Data:", event.data);
          }
        },
      );

      this.eventSource.addEventListener("status", (event: MessageEvent) => {
        if ((event.data as string).trim().toLowerCase() === "done") {
          this.setStreamStatus("done");
        }
      });
    } catch (error) {
      console.error("Failed to initialize EventSource:", error);
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

  public reset(): void {
    this.stopStreaming();
    this.currentStreamData = this.getInitialStreamData();
    this.streamInterruptionSource = "none";
    if (this.currentStreamStatus !== "idle") {
      this.currentStreamStatus = "idle";
      this.emit("status", "idle", null);
    } else if (this.currentBotMessageIdForStream !== null) {
      this.emit("status", "idle", null);
    }
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
