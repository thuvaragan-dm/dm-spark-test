import { InfiniteData } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoReader } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useStickToBottom } from "use-stick-to-bottom";
import { documentKey, EDocument } from "../../../api/document/config";
import { useUploadDocument } from "../../../api/document/useUploadDocument";
import { EMessage, messageKey } from "../../../api/messages/config";
import {
  EnumSender,
  Message,
  MessageParams,
} from "../../../api/messages/types";
import { useCreateMessage } from "../../../api/messages/useCreateMessage";
import { useGetInfiniteMessages } from "../../../api/messages/useGetInfiniteMessages";
import queryClient from "../../../api/queryClient";
import { EThread, threadKey } from "../../../api/thread/config";
import { useCreateThread } from "../../../api/thread/useCreateThread";
import Spinner from "../../../components/Spinner";
import useAppendToSearchQuery from "../../../hooks/useAppendToSearchQuery";
import useFileUpload from "../../../hooks/useFileUpload";
import { useAgent } from "../../../store/agentStore";
import { useAuth } from "../../../store/authStore";
import {
  useChatInput,
  useChatInputActions,
} from "../../../store/chatInputStore";
import { useStreamManager } from "../../../store/streamStore";
import sleep from "../../../utilities/sleep";
import ChatInput from "./ChatInput";
import ChatResponse from "./ChatResponse";
import ChatZeroState from "./ChatZeroState";
import UserMessage from "./UserMessage";

const ChatArea = () => {
  const [searchParams] = useSearchParams();
  const appendToUrl = useAppendToSearchQuery();
  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom({
    initial: "smooth",
  });

  const { accessToken } = useAuth();
  const { getOrCreateHandler, clearSuggestionsAndVideos } = useStreamManager();

  const focusedThreadId = useMemo(
    () => searchParams.get("thread"),
    [searchParams],
  );

  const { selectedAgent } = useAgent();

  const { files } = useChatInput();
  const { setFiles } = useChatInputActions();

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
      await uploadFile({
        body: {
          file: file,
          shard_id: selectedAgent?.shard_id || "",
          description: "",
        },
      });
    },
  });

  const { mutateAsync: createThread } = useCreateThread({
    invalidateQueryKey: [threadKey[EThread.ALL]],
  });

  const { mutateAsync: createMessageAsync, mutate: createMessage } =
    useCreateMessage({
      invalidateQueryKey: [
        messageKey[EMessage.FETCH_ALL] + focusedThreadId || "",
      ],
    });

  const messageOptions: MessageParams = useMemo(
    () => ({
      limit: 15,
      offset: 0,
      order: "desc",
    }),
    [],
  );

  const {
    data: messages,
    isPending: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteMessages(focusedThreadId ?? "", messageOptions);

  const [isSendMessageLoading, setIsSendMessageLoading] = useState(false);

  const handleChatSubmit = useCallback(
    async (message: string) => {
      setIsSendMessageLoading(true);
      let threadId = focusedThreadId || "";

      if (!focusedThreadId) {
        const thread = await createThread({
          body: {
            copilot_id: selectedAgent?.id || "",
            title: "New Chat",
          },
        });

        threadId = thread.id;
        appendToUrl({ thread: thread.id });

        await createMessageAsync({
          body: {
            thread_id: threadId, // Use the correct threadId
            message,
            sender: EnumSender.USER,
            flag: null,
            sources: [],
          },
        });
      } else {
        createMessage({
          body: {
            thread_id: threadId,
            message,
            sender: EnumSender.USER,
            flag: null,
            sources: [],
          },
        });
      }
      clearSuggestionsAndVideos(threadId);

      queryClient.invalidateQueries({
        queryKey: [messageKey[EMessage.FETCH_ALL] + threadId],
      });

      scrollToBottom();

      await sleep(0.5);

      const handler = getOrCreateHandler(
        threadId,
        selectedAgent?.id || "",
        accessToken || "",
      );

      const botPlaceholderId = `bot-message-${threadId}-${Date.now()}`;

      const queryKey = [messageKey[EMessage.FETCH_ALL] + threadId];

      const botPlaceholder: Message = {
        id: botPlaceholderId,
        thread_id: threadId,
        message: "",
        sender: EnumSender.BOT,
        sources: [],
        flag: null,
        reaction: null,
      };

      queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
        if (!oldData || oldData.pages.length === 0) {
          return { pages: [[botPlaceholder]], pageParams: [undefined] };
        }
        // Prepend the new bot placeholder to the first page (newest messages)
        const newPages = [...oldData.pages];
        newPages[0] = [botPlaceholder, ...newPages[0]];
        return { ...oldData, pages: newPages };
      });

      handler.startStreaming(message, botPlaceholderId);

      await sleep(1.5);

      setIsSendMessageLoading(false);

      scrollToBottom();
      console.log("scrolled to bottom");
    },
    [
      focusedThreadId,
      appendToUrl,
      createMessage,
      createThread,
      selectedAgent,
      getOrCreateHandler,
      accessToken,
      createMessageAsync,
      scrollToBottom,
      clearSuggestionsAndVideos,
    ],
  );

  const handleInterupt = useCallback(() => {
    const handler = getOrCreateHandler(
      focusedThreadId || "",
      selectedAgent?.id || "",
      accessToken || "",
    );

    handler.stopStreaming();
  }, [getOrCreateHandler, focusedThreadId, accessToken, selectedAgent]);

  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // The dependencies are correct: this effect will run when loading state or messages change.
    if (!isMessagesLoading && messages && isInitialLoadRef.current) {
      console.log("Messages are loaded, enabling the onScroll handler.");
      isInitialLoadRef.current = false;
    }
  }, [isMessagesLoading, messages]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      // 1. Add the guard: If it's the initial load, do nothing.
      if (isInitialLoadRef.current) {
        return;
      }

      // 2. The e.preventDefault() has been removed.
      const { scrollTop } = e.currentTarget;

      if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        console.log("User scrolled to top, fetching older messages...");
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    // When the thread ID changes, we want to scroll to the bottom of the new thread.
    if (focusedThreadId) {
      console.log(`Thread changed to ${focusedThreadId}, scrolling to bottom.`);
      scrollToBottom();
    }
  }, [focusedThreadId, scrollToBottom]);

  const suggestions = useStreamManager((state) =>
    state.suggestions.get(focusedThreadId || ""),
  );

  const status = useStreamManager((state) =>
    state.statuses.get(focusedThreadId || ""),
  );

  return (
    <section
      {...getRootProps()}
      className="dark:bg-primary-dark-foreground scrollbar relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gray-100 focus:outline-0"
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

      {selectedAgent && !focusedThreadId && (
        <ChatZeroState isLoading={isSendMessageLoading} />
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
              <div
                ref={scrollRef}
                onWheel={handleScroll}
                className="scrollbar relative z-30 flex w-full flex-1 flex-col overflow-y-auto"
              >
                <div ref={contentRef}>
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
                                  isStreaming={
                                    status === "streaming" ||
                                    status === "loading"
                                  }
                                />
                              )}
                            </div>
                          </li>
                        ))}

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isSendMessageLoading && (
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
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="popLayout">
        {(focusedThreadId || (!isSendMessageLoading && !focusedThreadId)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-30 flex w-full flex-col py-5"
          >
            {/* suggestions */}
            <AnimatePresence>
              {suggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 10, opacity: 0, filter: "blur(10px)" }}
                  className="relative mx-auto flex w-full max-w-4xl snap-x items-center justify-center pb-2"
                >
                  {/* left gradient */}
                  <div className="dark:from-primary-dark-foreground absolute top-0 left-0 z-[99999] h-14 w-16 bg-gradient-to-r from-gray-100 to-transparent"></div>
                  {/* left gradient */}

                  <div className="scrollbar z-10 flex w-full items-center justify-start gap-5 overflow-x-auto p-1 pl-10">
                    {/* card */}
                    {suggestions.map((suggestion, idx) => (
                      <button
                        onClick={() => {
                          handleChatSubmit(suggestion.question);
                        }}
                        key={idx}
                        className="flex-shrink-0 rounded-xl border border-gray-300 bg-white p-3 ring-gray-300 hover:bg-gray-50 data-[presses]:bg-gray-100 md:p-3 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/20 dark:data-[presses]:bg-white/20"
                      >
                        <p className="text-skin-primary text-sm font-medium whitespace-nowrap">
                          {suggestion.question}
                        </p>
                      </button>
                    ))}
                    {/* card */}

                    <div className="-ml-5 h-12 w-10 flex-shrink-0"></div>
                    {/* card */}
                  </div>

                  {/* right gradient */}
                  <div className="dark:from-primary-dark-foreground absolute top-0 right-0 z-20 h-14 w-16 bg-gradient-to-l from-gray-100 to-transparent"></div>
                  {/* right gradient */}
                </motion.div>
              )}
            </AnimatePresence>
            {/* suggestions */}

            <div className="relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden px-5 py-1 md:px-10">
              <input className="sr-only" type="file" {...getInputProps()} />
              <ChatInput
                isLoading={
                  isSendMessageLoading ||
                  status === "loading" ||
                  status === "streaming"
                }
                isFileUploadLoading={isFileUploadLoading}
                openExplorer={open}
                handleSubmit={handleChatSubmit}
                stopStreaming={handleInterupt}
                placeholder="What do you want to know?"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ChatArea;
