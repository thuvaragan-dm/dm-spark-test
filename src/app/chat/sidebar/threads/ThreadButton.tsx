import { useEffect, useRef, useState } from "react";
import { VscEdit, VscTrash } from "react-icons/vsc";
import {
  Link,
  LinkProps,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useGetThreadKey } from "../../../../api/thread/config";
import { useDeleteThread } from "../../../../api/thread/useDeleteThread";
import { useRenameThread } from "../../../../api/thread/useRenameThread";
import { Button, ButtonVariants } from "../../../../components/Button";
import Dropdown from "../../../../components/dropdown";
import Modal from "../../../../components/modal";
import { useChatInputActions } from "../../../../store/chatInputStore";
import { useRerendererActions } from "../../../../store/rerendererStore";
import { CustomSlottedComponent } from "../../../../types/type-utils";
import { cn } from "../../../../utilities/cn";
import { useAgent } from "../../../../store/agentStore";
import { useStreamManager } from "../../../../store/streamStore";
import { StreamStatus } from "../../chatarea/MessageHandler";
import Spinner from "../../../../components/Spinner";
import { AnimatePresence, motion } from "motion/react";

interface IThreadButton extends LinkProps {
  id: string;
  Icon: CustomSlottedComponent<"svg">;
  name: string;
  isActive?: boolean;
  onRename?: (name: string) => void;
  onDelete?: (id: string) => void;
}

const ThreadButton = ({
  id,
  name,
  to,
  isActive = false,
  onRename,
  onDelete,
  Icon,
}: IThreadButton) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedAgent } = useAgent();

  const { reset } = useChatInputActions();

  const [_name, setName] = useState(name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { setRerenderThreadList } = useRerendererActions();

  const { mutate: handleRename, error: renameError } = useRenameThread({
    invalidateQueryKey: useGetThreadKey(),
  });

  const { mutateAsync: handleDeleteThread, error: deleteError } =
    useDeleteThread({
      invalidateQueryKey: useGetThreadKey(),
    });

  useEffect(() => {
    if (renameError || deleteError) {
      setRerenderThreadList((pv) => pv + 1);
    }
  }, [renameError, deleteError, setRerenderThreadList]);

  const closeEdit = () => {
    const value = (inputRef?.current?.value ?? "").trim();
    if (value.length > 0) {
      if (value === name) {
        setIsEditable(false);
        return;
      }

      handleRename({
        params: {
          id,
        },
        body: {
          title: value,
        },
      });
      onRename && onRename(value);
      setIsEditable(false);
    }
  };

  const { getHandler } = useStreamManager();
  const handler = getHandler(id);

  const [status, setStatus] = useState<StreamStatus>("idle");

  useEffect(() => {
    if (handler) {
      handler.on("status", (status) => {
        setStatus(status);
      });
    }
  }, [handler]);

  return (
    <>
      <div className="group relative flex w-full items-center justify-center">
        {isEditable && (
          <div className="absolute inset-0 z-30 -mx-2 flex items-center justify-start gap-2 rounded-lg bg-gray-100 px-2 dark:bg-[#1C1E1E]">
            <Icon />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              className="ring-primary/10 w-full rounded-md bg-white px-2 py-1 text-sm/none text-gray-600 focus:ring-[1px] focus:outline-none dark:bg-white/10 dark:text-white"
              value={_name}
              onBlur={closeEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  closeEdit();
                }
              }}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <Link
          to={to}
          onClick={() => {
            reset();
          }}
          className={cn(
            "-ml-2 line-clamp-1 flex w-full flex-1 items-center justify-center gap-2 rounded-lg p-2 font-normal group-hover:bg-gray-100 md:p-2 dark:group-hover:bg-[#1C1E1E]",
            {
              "-mr-2 bg-gray-100 dark:bg-[#1C1E1E]":
                isActive || searchParams.get("thread") === id,
              "bg-gray-100 dark:bg-[#1C1E1E]": isMenuOpen,
              "-mr-2": isEditable,
            },
          )}
        >
          <div className="line-clamp-1 flex w-full flex-1 items-center justify-between gap-2 truncate [mask-image:linear-gradient(90deg,black_10%,black_90%,transparent)]">
            <Icon />
            <p
              className={cn(
                "line-clamp-1 w-full flex-1 text-sm text-gray-600 dark:text-white",
                `${isEditable ? "hidden" : "block"}`,
              )}
            >
              {_name}
            </p>
          </div>
        </Link>

        <AnimatePresence>
          {(status === "streaming" || status === "loading") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner className="size-4 dark:text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isEditable && (
          <div className="absolute inset-y-0 right-0 -mr-2">
            <Dropdown open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Dropdown.Button
                className={cn(
                  "cursor-pointer rounded-r-lg bg-gradient-to-r from-transparent to-gray-100 to-30% p-2 pl-4 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-gray-800 data-[state=open]:text-gray-800 data-[state=open]:opacity-100 dark:to-[#1C1E1E] dark:text-white/80 dark:hover:text-white dark:data-[state=open]:text-white",
                  {
                    "opacity-100":
                      isActive || searchParams.get("thread") === id,
                  },
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill="currentColor"
                    d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0m5.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0m7-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3"
                  />
                </svg>
              </Dropdown.Button>

              <Dropdown.Menu
                align="start"
                side="right"
                alignOffset={-4}
                sideOffset={5}
                className="dark:bg-primary-dark/60 w-44 rounded-xl bg-gray-100/60 p-1 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
              >
                <Dropdown.Item
                  onSelect={() => {
                    setIsEditable(true);
                    setTimeout(() => {
                      inputRef?.current?.setSelectionRange(0, _name.length);
                    }, 10);
                  }}
                  className="flex items-center gap-2 rounded-[calc(var(--radius-xl)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                >
                  <VscEdit className="size-4" />

                  <span>Rename</span>
                </Dropdown.Item>

                <Dropdown.Item
                  color="rgb(220,38,38)"
                  highlightColor="rgba(220,38,38,0.2)"
                  className="inline-flex w-full items-center gap-2 rounded-[calc(var(--radius-xl)-(--spacing(1)))] py-1.5 text-red-600 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-600"
                  onSelect={() => {
                    setIsDeleteOpen(true);
                  }}
                >
                  <VscTrash className="size-5" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>

      <Modal
        title="Delete chat ?"
        desktopClassName="w-full max-w-3xl"
        description={`This will delete ${_name}`}
        Trigger={() => <></>}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
      >
        <p className="px-5 text-xs text-gray-500 dark:text-white/60">
          To clear any memories from this chat, visit your{" "}
          <Link to={"#"} className="hover:underline">
            settings
          </Link>
          .
        </p>
        <div className="mt-2 flex w-full flex-col items-center justify-end gap-3 px-5 py-5 md:flex-row">
          <Modal.Close
            autoFocus={false}
            className={cn(
              ButtonVariants({ variant: "secondary" }),
              "w-full rounded-md py-1 md:w-auto",
            )}
          >
            cancel
          </Modal.Close>
          <Button
            wrapperClass="w-full md:w-auto"
            className={
              "w-full rounded-md py-1 [--border-highlight-radius:var(--radius-sm)] md:w-auto"
            }
            variant={"danger"}
            onClick={async () => {
              const currentThread = searchParams.get("thread");
              if (currentThread && currentThread === id) {
                navigate(`/chat/${selectedAgent?.path}`);
              }
              onDelete && onDelete(id);
              await handleDeleteThread({ params: { id } });
              setIsDeleteOpen(false);
            }}
          >
            delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ThreadButton;
