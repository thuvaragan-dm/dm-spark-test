// ChatResponse.tsx
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useState } from "react";
import { IoCheckmark, IoReaderOutline } from "react-icons/io5";
import { EMessage, messageKey } from "../../../api/messages/config";
import { Message, Source } from "../../../api/messages/types";
import { useAddMessageReaction } from "../../../api/messages/useAddMessageReaction";
import { useRemoveMessageReaction } from "../../../api/messages/useRemoveMessageReaction";
import { Button } from "../../../components/Button";
import Dropdown from "../../../components/dropdown";
import MDRenderer from "../../../components/MDRenderer";
import Tooltip from "../../../components/tooltip";
import { cn } from "../../../utilities/cn";
import copyTextToClipboard from "../../../utilities/copyToClipboard";

const ChatResponse = ({
  message,
  isLast,
}: {
  message: Message;
  isLast: boolean;
}) => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  return (
    <div className="group mr-auto flex h-full w-full items-start justify-start gap-2 pb-5">
      <div className="flex w-full flex-1 flex-col">
        {/* Pass the raw markdown string directly */}
        <MDRenderer markdownContent={message.message} />
        <div
          className={cn(
            "mb-5 -ml-2 flex items-center justify-start gap-1 group-hover:opacity-100 md:opacity-0",
            {
              "md:opacity-100": isLast || isSourcesOpen,
            },
          )}
        >
          <CopyButton message={message.message} />
          <LikeButton
            id={message.id}
            threadId={message.thread_id}
            isActive={message.reaction === "like"}
          />
          <DislikeButton
            id={message.id}
            threadId={message.thread_id}
            isActive={message.reaction === "dislike"}
          />
          {message.sources &&
            message.sources.length > 0 && ( // Added check for message.sources existence
              <Sources
                isOpen={isSourcesOpen}
                setIsOpen={setIsSourcesOpen}
                sources={message.sources}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatResponse;

// --- Child Components (CopyButton, LikeButton, DislikeButton, Sources) ---
// These components remain largely the same as in your provided code.
// Ensure their imports and logic are correct for your project.

const CopyButton = ({ message }: { message: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger>
        <Button
          variant={"ghost"}
          onClick={async () => {
            setIsCopied(true);
            await copyTextToClipboard(message);
            setTimeout(() => {
              setIsCopied(false);
            }, 800);
          }}
          className={cn("rounded-full p-2 md:p-2", {
            "text-green-600 hover:bg-green-600/20": isCopied,
            "text-gray-600 hover:bg-gray-300 dark:text-white/60 dark:hover:bg-white/10":
              !isCopied,
          })}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {!isCopied ? (
              <motion.div
                key={"copy"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 stroke-[2]"
                >
                  <rect
                    x="3"
                    y="8"
                    width="13"
                    height="13"
                    rx="4"
                    stroke="currentColor"
                  ></rect>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13 2.00004L12.8842 2.00002C12.0666 1.99982 11.5094 1.99968 11.0246 2.09611C9.92585 2.31466 8.95982 2.88816 8.25008 3.69274C7.90896 4.07944 7.62676 4.51983 7.41722 5.00004H9.76392C10.189 4.52493 10.7628 4.18736 11.4147 4.05768C11.6802 4.00488 12.0228 4.00004 13 4.00004H14.6C15.7366 4.00004 16.5289 4.00081 17.1458 4.05121C17.7509 4.10066 18.0986 4.19283 18.362 4.32702C18.9265 4.61464 19.3854 5.07358 19.673 5.63807C19.8072 5.90142 19.8994 6.24911 19.9488 6.85428C19.9992 7.47112 20 8.26343 20 9.40004V11C20 11.9773 19.9952 12.3199 19.9424 12.5853C19.8127 13.2373 19.4748 13.8114 19 14.2361V16.5829C20.4795 15.9374 21.5804 14.602 21.9039 12.9755C22.0004 12.4907 22.0002 11.9334 22 11.1158L22 11V9.40004V9.35725C22 8.27346 22 7.3993 21.9422 6.69141C21.8826 5.96256 21.7568 5.32238 21.455 4.73008C20.9757 3.78927 20.2108 3.02437 19.27 2.545C18.6777 2.24322 18.0375 2.1174 17.3086 2.05785C16.6007 2.00002 15.7266 2.00003 14.6428 2.00004L14.6 2.00004H13Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key={"copy-done"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="shrink-0"
              >
                <IoCheckmark className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </Tooltip.Trigger>

      <Tooltip.Content
        side="bottom"
        align="center"
        sideOffset={5}
        className="dark:bg-primary-dark pointer-events-none rounded-lg bg-gray-200 p-1 px-2 text-sm text-gray-800 dark:text-white"
      >
        Copy
      </Tooltip.Content>
    </Tooltip>
  );
};

const LikeButton = ({
  id,
  threadId,
  isActive,
}: {
  id: string;
  threadId: string;
  isActive: boolean;
}) => {
  const { mutate: addReaction } = useAddMessageReaction({
    invalidateQueryKey: [messageKey[EMessage.FETCH_ALL] + threadId || ""],
  });

  const { mutate: removeReaction } = useRemoveMessageReaction({
    invalidateQueryKey: [messageKey[EMessage.FETCH_ALL] + threadId],
  });
  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger asChild>
        <Button
          variant={"ghost"}
          onClick={async () => {
            if (!isActive) {
              addReaction({
                body: {
                  reaction_type: "like",
                },
                params: { id },
              });
            } else {
              removeReaction({
                body: {
                  reaction_type: "like",
                },
                params: { id },
              });
            }
          }}
          className={cn(
            "rounded-full stroke-gray-600 p-2 text-transparent hover:bg-gray-300 md:p-2 dark:stroke-white/60 dark:text-transparent dark:hover:bg-white/10",
            {
              "text-green-600 dark:fill-green-100 dark:stroke-green-600 dark:text-green-100":
                isActive,
            },
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 stroke-[2]"
          >
            <path
              d="M7 20H3V9h2.5A1.5 1.5 0 017 10.5V20zm0 0h9.206a3.5 3.5 0 003.413-2.724l1.187-5.222A2.5 2.5 0 0018.368 9H14.5l.614-3.685a1.988 1.988 0 00-3.686-1.313L8.432 9.244A1.5 1.5 0 017.13 10h-.215"
              fill="currentColor"
            />
          </svg>
        </Button>
      </Tooltip.Trigger>

      <Tooltip.Content
        side="bottom"
        align="center"
        sideOffset={5}
        className="dark:bg-primary-dark pointer-events-none rounded-lg bg-gray-200 p-1 px-2 text-sm text-gray-800 dark:text-white"
      >
        Love this
      </Tooltip.Content>
    </Tooltip>
  );
};

const DislikeButton = ({
  id,
  threadId,
  isActive,
}: {
  id: string;
  threadId: string;
  isActive: boolean;
}) => {
  const { mutate: addReaction } = useAddMessageReaction({
    invalidateQueryKey: [messageKey[EMessage.FETCH_ALL] + threadId || ""],
  });

  const { mutate: removeReaction } = useRemoveMessageReaction({
    invalidateQueryKey: [messageKey[EMessage.FETCH_ALL] + threadId],
  });
  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger>
        <Button
          variant={"ghost"}
          onClick={async () => {
            if (!isActive) {
              addReaction({
                body: {
                  reaction_type: "dislike",
                },
                params: { id },
              });
            } else {
              removeReaction({
                body: {
                  reaction_type: "dislike",
                },
                params: { id },
              });
            }
          }}
          className={cn(
            "rounded-full stroke-gray-600 p-2 text-transparent hover:bg-gray-300 md:p-2 dark:stroke-white/60 dark:text-transparent dark:hover:bg-white/10",
            {
              "text-amber-600 dark:fill-amber-100 dark:stroke-amber-600 dark:text-amber-100":
                isActive,
            },
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 stroke-[2]"
          >
            <path
              d="M7 4H3v11h2.5A1.5 1.5 0 007 13.5V4zm0 0h9.206a3.5 3.5 0 013.413 2.724l1.187 5.222A2.5 2.5 0 0118.368 15H14.5l.614 3.686a1.988 1.988 0 01-3.686 1.312l-2.996-5.242A1.5 1.5 0 007.13 14h-.215"
              fill="currentColor"
            />
          </svg>
        </Button>
      </Tooltip.Trigger>

      <Tooltip.Content
        side="bottom"
        align="center"
        sideOffset={5}
        className="dark:bg-primary-dark pointer-events-none rounded-lg bg-gray-200 p-1 px-2 text-sm text-gray-800 dark:text-white"
      >
        Needs improvement
      </Tooltip.Content>
    </Tooltip>
  );
};

const Sources = ({
  sources,
  isOpen,
  setIsOpen,
}: {
  sources: Source[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dropdown open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger>
          <Dropdown.Button
            // onClick={async () => {}} // onClick for Dropdown.Button might not be needed if onOpenChange handles it
            className={cn(
              "cursor-pointer rounded-full p-2 text-gray-600 hover:bg-gray-300 md:p-2 dark:text-white/60 dark:hover:bg-white/10",
            )}
          >
            <IoReaderOutline className="size-4" />
          </Dropdown.Button>
        </Tooltip.Trigger>

        <Tooltip.Content
          side="bottom"
          align="center"
          sideOffset={5}
          className="dark:bg-primary-dark pointer-events-none rounded-lg bg-gray-200 p-1 px-2 text-sm text-gray-800 dark:text-white"
        >
          Sources
        </Tooltip.Content>
      </Tooltip>

      <Dropdown.Menu
        align="start"
        className="dark:from-primary-dark-foreground dark:to-primary-dark rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
      >
        {sources.map(
          (
            sourceItem,
            idx, // Renamed 'sources' to 'sourceItem' to avoid conflict
          ) => (
            <Dropdown.Item
              key={idx}
              // onSelect={() => {}} // Add action if needed
              className="flex items-center gap-2 dark:text-white/80 dark:data-[highlighted]:text-white"
            >
              {/* Make sure sourceItem.name exists and is a string */}
              <span>{sourceItem.name}</span>
            </Dropdown.Item>
          ),
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
