import { useSearchParams } from "react-router-dom";

// API and Store Imports
import { useGetInfiniteMessages } from "../../../api/messages/useGetInfiniteMessages";
import { EnumSender, MessageParams } from "../../../api/messages/types";
import { useAgent } from "../../../store/agentStore";

// Component Imports
import ChatInput from "./ChatInput";
import ChatResponse from "./ChatResponse";
import UserMessage from "./UserMessage";
import ChatZeroState from "./ChatZeroState";

// Hook Imports
import { useChatStream } from "../../../hooks/useChatStream";
import useFileUpload from "../../../hooks/useFileUpload"; // Assuming you still need this
import { useUploadDocument } from "../../../api/document/useUploadDocument";
import { documentKey, EDocument } from "../../../api/document/config";
import { useSendMessage } from "./useSendMessage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IoChevronDown, IoReader } from "react-icons/io5";
import Spinner from "../../../components/Spinner";
import { Button } from "../../../components/Button";

const NewChatArea = () => {
  const [searchParams] = useSearchParams();
  const { selectedAgent } = useAgent();
  const focusedThreadId = searchParams.get("thread");

  const chatContainerRef = useRef<HTMLUListElement>(null);
  const [isUserScroll, setIsUserScroll] = useState(false);
  const [topMessageContainer, setTopMessageContainer] = useState<string | null>(
    null,
  );

  const handleScrollToBottom = () => {
    chatContainerRef.current?.scrollBy({
      top:
        chatContainerRef.current.scrollHeight -
        chatContainerRef.current.clientHeight,
      behavior: "smooth",
    });
  };

  // --- HOOKS ---
  // Our new, clean hooks that manage all the complex state.
  const { startStream, interruptStream, isStreaming } = useChatStream({
    threadId: focusedThreadId,
    agentId: selectedAgent?.id || null,
  });

  const { sendMessage, isPreparing } = useSendMessage();

  const handleChatSubmit = async (message: string) => {
    handleScrollToBottom();
    if (message.trim().length > 0) {
      // The sendMessage hook now orchestrates everything: creating the user message,
      // handling the new thread logic, and starting the stream via the callback.

      await sendMessage(message, startStream);
    }
  };

  // --- DATA FETCHING ---
  const messageOptions: MessageParams = useMemo(
    () => ({ limit: 15, order: "desc" }),
    [],
  );
  const {
    data: messages,
    isPending: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteMessages({
    threadId: focusedThreadId || "",
    params: messageOptions,
  });

  const [files, setFiles] = useState<File[]>([]); // File upload state

  const { mutateAsync: uploadFile } = useUploadDocument({
    invalidateQueryKey: [documentKey[EDocument.FETCH_ALL]],
  });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
    isFileUploadLoading,
  } = useFileUpload({
    files,
    setFiles,
    handleFileUpload: async (file) => {
      if (!selectedAgent) return;
      await uploadFile({
        body: {
          file: file,
          shard_id: selectedAgent.shard_id,
          description: "",
        },
      });
    },
  });

  const handleScrollToLastTopMessage = useCallback(() => {
    if (topMessageContainer) {
      const element = document.getElementById(topMessageContainer);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "auto",
            block: "end",
            inline: "nearest",
          });
        }, 10);
      }
    }
  }, [topMessageContainer]);

  // Define constants for thresholds
  const SCROLL_UP_THRESHOLD_POS = 250; // Pixels from bottom (position-based)
  const WHEEL_UP_THRESHOLD_DELTA = -100; // Min negative deltaY in a single wheel event to trigger immediate flag set. Tune this value based on testing.
  const BOTTOM_TOLERANCE = 5; // Pixels close to bottom considered "at bottom"
  const isFetchingNextPageRef = useRef(false);

  // --- Handler for Wheel Events ---
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLUListElement>) => {
      const scrollableEl = chatContainerRef.current;
      if (!scrollableEl) return;

      // Check for significant upward wheel movement (negative deltaY)
      // This provides immediate feedback to stop auto-scrolling
      if (e.deltaY < WHEEL_UP_THRESHOLD_DELTA && scrollableEl.scrollTop > 0) {
        // Only set state if it's not already true
        if (!isUserScroll) {
          console.log(
            `Wheel up detected (deltaY: ${e.deltaY}) - setting isUserScroll true`,
          );
          setIsUserScroll(true);
          // If you have an auto-scroll function, you might explicitly signal it to stop here.
        }
      }
      // Note: We don't necessarily need wheel logic to set isUserScroll = false,
      // onScroll handles reaching the bottom reliably based on position.
    },
    [isUserScroll, setIsUserScroll, WHEEL_UP_THRESHOLD_DELTA],
  ); // Depend on state for check and update

  // --- Handler for Scroll Events ---
  const handleScroll = useCallback(() => {
    // Get the latest message ID for the top message logic
    const flatMessages = messages?.pages?.flat();
    if (flatMessages && flatMessages.length > 0) {
      // Use spread operator or slice to avoid potential mutation if .reverse() modifies in place
      const firstVisibleMessageId = [...flatMessages].reverse()[0]?.id;
      if (firstVisibleMessageId) {
        setTopMessageContainer(`message-container-${firstVisibleMessageId}`);
      }
    }

    const scrollableEl = chatContainerRef.current;
    if (!scrollableEl) return;

    const scrollTop = scrollableEl.scrollTop;
    const scrollHeight = scrollableEl.scrollHeight;
    const clientHeight = scrollableEl.clientHeight;
    // Ensure maxScrollHeight is not negative if content is shorter than container
    const maxScrollHeight = Math.max(0, scrollHeight - clientHeight);

    // --- Infinite Scroll Logic ---
    if (scrollTop <= 0 && hasNextPage && !isFetchingNextPageRef.current) {
      console.log("Near top, fetching next page...");
      isFetchingNextPageRef.current = true;
      setTimeout(async () => {
        try {
          await fetchNextPage();
          handleScrollToLastTopMessage();
        } catch (error) {
          console.error("Failed to fetch next page:", error);
        } finally {
          setTimeout(() => {
            isFetchingNextPageRef.current = false;
          }, 100);
        }
      }, 100);
    }

    // --- User Scroll Tracking Logic ---

    // 1. Check if user is AT or VERY NEAR the bottom. This is the ONLY place
    //    where isUserScroll is set back to FALSE.
    if (scrollTop >= maxScrollHeight - BOTTOM_TOLERANCE) {
      // Prevent unnecessary re-renders if already false
      if (isUserScroll) {
        console.log("Scrolled to bottom - setting isUserScroll false");
        setIsUserScroll(false);
      }
    }
    // 2. Check if user has scrolled up significantly FROM the bottom state (Position-based check)
    //    This acts as a fallback or secondary trigger for non-wheel/slow scrolls.
    else {
      // Only trigger true if currently false AND threshold is met
      if (
        !isUserScroll &&
        maxScrollHeight - scrollTop > SCROLL_UP_THRESHOLD_POS
      ) {
        console.log(
          "Scrolled up beyond position threshold - setting isUserScroll true",
        );
        setIsUserScroll(true);
      }
    }
    // If neither condition above is met, the isUserScroll state remains as it was.
    // It flips to true either via onWheel or the position threshold check,
    // and flips back to false ONLY when reaching the bottom via onScroll.
  }, [
    isUserScroll, // Include isUserScroll in dependencies for both handlers
    setIsUserScroll,
    hasNextPage,
    fetchNextPage,
    handleScrollToLastTopMessage,
    messages,
    setTopMessageContainer,
  ]);

  const [initialMoveToBottom, setInitialMoveToBottom] = useState(false);

  useEffect(() => {
    if (!initialMoveToBottom && messages && messages.pages.length > 0) {
      setInitialMoveToBottom(true);
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [chatContainerRef, initialMoveToBottom, messages]);

  useEffect(() => {
    setInitialMoveToBottom(false);
  }, [focusedThreadId]);

  return (
    <>
      <section
        {...getRootProps()}
        className="dark:bg-primary-dark-foreground relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gray-100 focus:outline-0"
      >
        <AnimatePresence>
          {isDragActive && (
            <motion.div className="absolute inset-0 isolate z-[999999] flex flex-col">
              <div className="relative inset-0 flex size-full flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-black/10 backdrop-blur-sm"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="dark:bg-primary-dark-foreground relative inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-200 p-10 shadow-2xl dark:border-white/20"
                >
                  <IoReader className="size-12 text-gray-400 dark:text-white/60" />
                  <h2 className="mt-2 text-xl font-medium text-gray-800 dark:text-white">
                    Drop your files here
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                    Add your files here to add it to the conversation
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CHAT STATES --- */}
        {selectedAgent && !focusedThreadId && (
          <ChatZeroState isLoading={isPreparing} />
        )}

        <AnimatePresence initial={false} mode="popLayout">
          {selectedAgent && focusedThreadId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-30 flex w-full flex-1 flex-col overflow-hidden"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {isMessagesLoading && (
                  <div className="relative z-30 flex w-full flex-1 flex-col items-center justify-center">
                    <Spinner className="size-4 dark:text-white/60" />
                  </div>
                )}
              </AnimatePresence>

              {!isMessagesLoading && (
                <ul
                  ref={chatContainerRef}
                  onWheel={handleWheel}
                  onScroll={handleScroll}
                  className="scrollbar scrollbar relative z-30 flex w-full flex-1 flex-col overflow-y-auto"
                >
                  <AnimatePresence mode="popLayout">
                    {isFetchingNextPage && (
                      <motion.div
                        initial={{ filter: "blur(10px)", opacity: 0 }}
                        animate={{ filter: "blur(0px)", opacity: 1 }}
                        exit={{ filter: "blur(10px)", opacity: 0 }}
                        className="relative"
                      >
                        <div
                          className={
                            "group relative flex items-center justify-center py-3 transition-shadow duration-500 ease-out [--bg-size:500%]"
                          }
                        >
                          <div
                            className={
                              "flex items-center gap-2 text-gray-600 dark:text-white/60"
                            }
                          >
                            <Spinner className="size-3 dark:text-white" />
                            <p className="w-full shrink-0 text-xs">
                              Loading older messages...
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-5 pb-0 md:p-10 md:pb-0">
                    {messages &&
                      messages.pages
                        .flat(1)
                        .reverse()
                        .map((message, idx) => (
                          <li
                            id={`message-container-${message.id}`}
                            key={message.id}
                            className="flex"
                          >
                            <div
                              className={`flex w-full items-end gap-2 ${
                                message.sender === EnumSender.USER
                                  ? "justify-end"
                                  : "flex-row-reverse justify-start"
                              } `}
                            >
                              {message.sender === EnumSender.USER ? (
                                <UserMessage message={message.message} />
                              ) : (
                                <ChatResponse
                                  message={message}
                                  isLast={
                                    messages.pages.flat(1).length - 1 === idx
                                  }
                                />
                              )}
                            </div>
                          </li>
                        ))}

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isPreparing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-primary dark:bg-primary-dark-foreground relative w-min rounded-full p-0.5 text-white dark:text-white/50"
                        >
                          <div className="absolute -inset-1 animate-spin rounded-full bg-gradient-to-b from-[#EDEEF1] from-20% to-transparent dark:from-[#1C1C1C]"></div>
                          <svg
                            className="size-4"
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ul>
              )}

              <AnimatePresence initial={false}>
                {isUserScroll && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-4xl items-center justify-end px-5 pb-5 md:px-10"
                  >
                    <Button
                      onClick={() => {
                        chatContainerRef.current?.scrollBy({
                          top:
                            chatContainerRef.current.scrollHeight -
                            chatContainerRef.current.clientHeight,
                          behavior: "smooth",
                        });
                      }}
                      className={
                        "dark:bg-primary-dark dark:data-[pressed]:bg-primary-dark/90 dark:hover:bg-primary-dark/90 pointer-events-auto flex items-center justify-center rounded-full border border-gray-300 bg-white p-3 text-gray-800 hover:bg-gray-100 data-[pressed]:bg-gray-100 md:p-3 dark:border-white/10 dark:text-white"
                      }
                      variant="ghost"
                    >
                      <IoChevronDown className="size-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          {(focusedThreadId || (!isPreparing && !focusedThreadId)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-30 flex w-full flex-col py-5"
            >
              <div className="relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden px-5 py-1 md:px-10">
                <input className="sr-only" type="file" {...getInputProps()} />
                <ChatInput
                  isLoading={isPreparing || isStreaming}
                  isFileUploadLoading={isFileUploadLoading}
                  openExplorer={open}
                  handleSubmit={handleChatSubmit}
                  stopStreaming={interruptStream}
                  placeholder="What do you want to know?"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default NewChatArea;
