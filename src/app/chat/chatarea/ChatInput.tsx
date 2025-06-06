import { AnimatePresence, motion } from "motion/react";
import { ComponentProps, Fragment, useRef, useState } from "react";
import {
  IoArrowUpOutline,
  IoCloudUpload,
  IoDocument,
  IoLogoMarkdown,
  IoStop,
} from "react-icons/io5";
import { useDeleteDocument } from "../../../api/document/useDeleteDocument";
import { Button } from "../../../components/Button";
import Dropdown from "../../../components/dropdown";
import { useAgent } from "../../../store/agentStore";
import {
  useChatInput,
  useChatInputActions,
} from "../../../store/chatInputStore";
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
  const { selectedAgent } = useAgent();

  const [openAttachment, setOpenAttachment] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { query, files } = useChatInput();
  const { setQuery, setFiles } = useChatInputActions();

  const submit = () => {
    if (query.length > 0) {
      handleSubmit(query);
      setQuery("");
      setFiles([]);
    }
  };

  return (
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

      <p className="max-w-xl truncate p-2 text-xs text-gray-600 dark:text-white/60">
        <span className="font-bold">{selectedAgent?.name}</span> |{" "}
        <span className="dark:text-white/50">{selectedAgent?.description}</span>
      </p>

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
            if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
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
                      "bg-primary dark:bg-secondary dark:text-primary dark:hover:bg-secondary/90 hover:bg-primary data-[pressed]:bg-primary text-white":
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
    <div className="group relative">
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
      <div className="absolute top-0 right-0 z-20 m-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Button
          onClick={() => {
            if (fileData) {
              deleteFile({
                params: {
                  id: fileData.id,
                },
              });
            }
            onDelete && onDelete(file.name);
          }}
          variant={"ghost"}
          className={
            "rounded-full text-gray-600 hover:text-gray-800 dark:text-white/60 dark:hover:text-white"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
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
          className="aspect-square size-16 overflow-hidden rounded-xl border object-cover shadow-inner"
        />
      )}
    </div>
  );
};
