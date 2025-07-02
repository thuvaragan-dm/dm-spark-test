import { ComboboxOption } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { ComponentProps, Fragment, useMemo, useRef, useState } from "react";
import {
  IoArrowUpOutline,
  IoCloudUpload,
  IoDocument,
  IoLogoMarkdown,
  IoStop,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDeleteDocument } from "../../../api/document/useDeleteDocument";
import { Prompt, PromptParams } from "../../../api/prompt/types";
import { useGetPrompts } from "../../../api/prompt/useGetPrompts";
import { Button } from "../../../components/Button";
import ComboboxDropdown from "../../../components/ComboboxDropdown";
import Dropdown from "../../../components/dropdown";
import {
  useChatInput,
  useChatInputActions,
} from "../../../store/chatInputStore";
import { usePromptAction } from "../../../store/promptStore";
import capitalizeFirstLetter from "../../../utilities/capitalizeFirstLetter";
import { cn } from "../../../utilities/cn";

interface IChatInput extends ComponentProps<"textarea"> {
  handleSubmit: (query: string) => void;
  openExplorer: () => void;
  isLoading: boolean;
  isFileUploadLoading: boolean;
  stopStreaming: () => void;
}

const ChatInput = ({
  handleSubmit,
  openExplorer,
  placeholder,
  isLoading,
  isFileUploadLoading,
  stopStreaming,
}: IChatInput) => {
  const navigate = useNavigate();
  const { setIsCreatePromptDrawerOpen } = usePromptAction();
  const [openAttachment, setOpenAttachment] = useState(false);
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { query, files } = useChatInput();
  const { setQuery, setFiles, reset } = useChatInputActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [page] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const promptsOptions = useMemo<PromptParams>(
    () => ({
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page],
  );

  const { data: prompts, isPending: isPromptsLoading } =
    useGetPrompts(promptsOptions);

  const submit = () => {
    if (query.length > 0 && !isLoading && !isFileUploadLoading) {
      handleSubmit(query);
      reset();
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          "flex h-full w-full flex-col rounded-xl border border-gray-200 bg-white p-1 dark:border-white/10 dark:bg-white/5",
          {
            "ring-secondary dark:ring-primary/20 border-transparent ring-[2px]":
              query.length > 0,
          },
        )}
      >
        <AnimatePresence>
          {files && files.length > 0 && (
            <motion.div
              initial="close"
              animate="open"
              exit="close"
              className="scrollbar flex w-full items-start justify-start gap-5 overflow-x-auto p-2"
            >
              {files.map((file) => (
                <Fragment key={file.name}>
                  <AnimatePresence>
                    <motion.div
                      variants={{
                        open: { opacity: 1 },
                        close: { opacity: 0 },
                      }}
                      className=""
                    >
                      <File
                        isLoading={isFileUploadLoading}
                        key={file.name}
                        file={file}
                        onDelete={(name) => {
                          setFiles &&
                            setFiles((pv) => pv.filter((f) => f.name !== name));
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex h-full flex-1 items-end rounded-[calc(var(--radius-xl)-(--spacing(1)))] border border-gray-200 shadow-sm dark:border-white/10">
          <div className="flex h-full items-end pb-1">
            <Dropdown open={openAttachment} onOpenChange={setOpenAttachment}>
              <Dropdown.Button className="hover:text-primary data-[state=open]:text-primary cursor-pointer rounded-full p-2 text-gray-600 md:p-2 dark:text-white/60 dark:hover:text-white dark:data-[state=open]:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                >
                  <path
                    fill="currentColor"
                    d="M12 22.998c-1.81.041-3.562-.595-4.875-1.77C5.813 20.052 5.05 18.435 5 16.729V5.544c.034-1.233.584-2.404 1.53-3.255a5.116 5.116 0 013.522-1.288 5.117 5.117 0 013.528 1.284c.95.852 1.501 2.024 1.535 3.259V16.74a2.87 2.87 0 01-.975 1.96 3.22 3.22 0 01-2.134.797 3.22 3.22 0 01-2.134-.798 2.87 2.87 0 01-.975-1.959V6.413c0-.292.123-.572.341-.778.22-.206.516-.322.825-.322.31 0 .606.116.825.322.22.206.342.486.342.778V16.74a.725.725 0 00.258.462.81.81 0 00.518.185.81.81 0 00.518-.185.725.725 0 00.258-.462V5.544a2.42 2.42 0 00-.855-1.7 2.721 2.721 0 00-1.875-.643 2.72 2.72 0 00-1.868.647 2.42 2.42 0 00-.85 1.696v11.185a4.147 4.147 0 001.441 2.944A4.665 4.665 0 0012 20.797a4.665 4.665 0 003.225-1.125 4.147 4.147 0 001.442-2.944V5.544c0-.292.123-.572.341-.778.22-.206.516-.322.825-.322.31 0 .607.116.825.322.22.206.342.486.342.778v11.185c-.049 1.706-.813 3.323-2.125 4.499-1.313 1.175-3.066 1.811-4.875 1.77z"
                  />
                </svg>
              </Dropdown.Button>

              <Dropdown.Menu
                align="start"
                className="dark:from-primary-dark-foreground dark:to-primary-dark rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
              >
                <Dropdown.Item
                  onSelect={() => {
                    openExplorer();
                  }}
                  className="flex items-center gap-2 dark:text-white/80 dark:data-[highlighted]:text-white"
                >
                  <IoCloudUpload className="size-5" />
                  <span>Upload from computer</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <textarea
            ref={textAreaRef}
            className="scrollbar field-sizing-content max-h-[25dvh] w-full resize-none overflow-y-auto py-3 pr-2 text-sm text-gray-800 [word-wrap:break-word] focus:outline-none dark:text-white"
            placeholder={placeholder}
            rows={1}
            value={query}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.shiftKey
              ) {
                e.preventDefault();
                submit();
              }

              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                setQuery(textAreaRef?.current?.value + "\n");
              }
            }}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          ></textarea>

          <div className="mb-px flex h-full items-end justify-center gap-1 p-1">
            <ComboboxDropdown<Prompt>
              isOpen={isPromptsOpen}
              setIsOpen={setIsPromptsOpen}
              placeholder="Prompts Search"
              query={searchQuery}
              setQuery={setSearchQuery}
              isLoading={isPromptsLoading}
              onSelect={(option) => {
                setQuery(option.prompt);
                setIsPromptsOpen(false);
              }}
              Option={({ optionValue }) => (
                <ComboboxOption
                  key={optionValue.id}
                  className={
                    "dark:data-[focus]:bg-primary/30 data-[focus]:bg-primary -mx-1 cursor-pointer rounded-lg px-3 py-1.5 text-gray-800 data-[focus]:text-white dark:text-white"
                  }
                  value={optionValue}
                >
                  <div className="flex flex-shrink-0 items-center justify-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>{optionValue.name}</span>
                  </div>
                </ComboboxOption>
              )}
              EmptyState={() => (
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                  <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-8 shrink-0"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                    No Prompts Created Yet
                  </p>
                  <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                    Click the button below to create your first prompt
                  </p>
                  <div
                    role="button"
                    onClick={() => {
                      navigate("/prompts/all");
                      setIsCreatePromptDrawerOpen(true);
                    }}
                    className={
                      "text-primary dark:text-secondary ring-primary mt-5 cursor-pointer px-1 text-xs hover:underline md:px-1"
                    }
                  >
                    Create prompt
                  </div>
                </div>
              )}
              searchResults={prompts?.items || []}
            >
              <Button
                onClick={() => setIsPromptsOpen(true)}
                variant={"ghost"}
                wrapperClass="w-min flex"
                className="hover:text-primary data-[state=open]:text-primary cursor-pointer rounded-full p-2 text-gray-600 md:p-2 dark:text-white/60 dark:hover:text-white dark:data-[state=open]:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </ComboboxDropdown>

            <AnimatePresence initial={false} mode="popLayout">
              {!isLoading && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(5px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(5px)" }}
                  className=""
                >
                  <Button
                    onClick={() => submit()}
                    variant={"unstyled"}
                    disabled={query.length <= 0 || isFileUploadLoading}
                    className={cn(
                      "rounded-[calc(var(--radius-xl)-(--spacing(1)))] p-2 md:p-2",
                      {
                        "bg-secondary dark:bg-secondary text-primary hover:bg-secondary/80 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-gray-800":
                          query.length <= 0 || isFileUploadLoading,
                        "bg-primary dark:bg-secondary dark:hover:bg-secondary/90 hover:bg-primary data-[pressed]:bg-primary text-white dark:text-white":
                          query.length > 0,
                      },
                    )}
                  >
                    <IoArrowUpOutline className="size-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false} mode="popLayout">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(5px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(5px)" }}
                  className=""
                >
                  <Button
                    onClick={() => stopStreaming()}
                    variant={"unstyled"}
                    className={cn(
                      "rounded-[calc(var(--radius-xl)-(--spacing(1)))] p-2 md:p-2",
                      {
                        "bg-secondary dark:bg-secondary text-primary hover:bg-secondary/80 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-gray-800":
                          query.length <= 0 || isFileUploadLoading,
                        "bg-primary dark:bg-secondary dark:text-primary dark:hover:bg-secondary/90 hover:bg-primary data-[pressed]:bg-primary text-white":
                          query.length > 0,
                      },
                    )}
                  >
                    <IoStop className="size-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[0.65rem] text-gray-600 dark:text-white/60">
        Conversations are private. might make mistakes
      </p>
    </div>
  );
};

export default ChatInput;

interface IFile extends ComponentProps<"div"> {
  file: File;
  onDelete?: (name: string) => void;
  isLoading?: boolean;
}

const File = ({ file, onDelete, isLoading = false }: IFile) => {
  const { fileData } = useChatInput();
  const { mutateAsync: deleteFile } = useDeleteDocument({});
  return (
    <div className="group relative min-w-16 shrink-0">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 overflow-hidden rounded-xl"
          >
            <div className="bg-primary/20 dark:bg-primary/50 h-full w-full animate-pulse"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* delete button */}
      <div
        className={cn(
          "absolute top-0 right-0 z-20 m-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          { hidden: isLoading },
        )}
      >
        <Button
          onClick={() => {
            if (fileData && fileData.get(file.name)) {
              deleteFile({
                params: {
                  id: fileData.get(file.name)?.id || "",
                },
              });
            }
            onDelete && onDelete(file.name);
          }}
          variant={"ghost"}
          className={
            "relative rounded-full text-gray-600 hover:text-gray-800 dark:text-white/60 dark:hover:text-white"
          }
        >
          <div className="absolute -inset-0.5 z-10 rounded-full bg-black/50"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-20 size-5"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 011.06 0L12 10.94l1.97-1.97a.75.75 0 011.06 1.06L13.06 12l1.97 1.97a.75.75 0 01-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 01-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 010-1.06"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
      {/* delete button */}

      {!file.type.includes("image") ? (
        <div className="relative flex h-16 max-w-sm min-w-56 items-center justify-start gap-2 rounded-xl border border-gray-300 p-1 dark:border-white/10">
          <div className="bg-primary flex aspect-square h-full items-center justify-center rounded-lg p-1 text-white">
            {file.type.includes("application") && (
              <IoDocument className="size-9" />
            )}
            {file.type.includes("markdown") && (
              <IoLogoMarkdown className="size-9" />
            )}
            {file.type.includes("image") && <IoDocument className="size-9" />}
          </div>

          <div className="truncate">
            <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">
              {capitalizeFirstLetter(file.name)}
            </p>
            <p className="text-xs tracking-wide text-gray-600 uppercase dark:text-white/60">
              {file.type.split("application/")[1]}
            </p>
          </div>
        </div>
      ) : (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="aspect-square size-16 shrink-0 overflow-hidden rounded-xl border object-cover shadow-inner"
        />
      )}
    </div>
  );
};
