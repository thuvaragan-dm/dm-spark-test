import { useEffect, useRef, useState } from "react";
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

  return (
    <>
      <div className="group relative flex w-full items-center justify-center">
        {isEditable && (
          <div className="dark:bg-primary-dark-foreground absolute inset-0 z-30 -mx-2 flex items-center justify-start gap-2 rounded-lg bg-gray-100 px-2">
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
            "dark:group-hover:bg-primary-dark-foreground -ml-2 line-clamp-1 flex w-full flex-1 items-center justify-center gap-2 rounded-lg p-2 font-normal group-hover:bg-gray-100 md:p-2",
            {
              "dark:bg-primary-dark-foreground -mr-2 bg-gray-100":
                isActive || searchParams.get("thread") === id,
              "dark:bg-primary-dark-foreground bg-gray-100": isMenuOpen,
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

        {!isEditable && (
          <div className="absolute inset-y-0 right-0 -mr-2">
            <Dropdown open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Dropdown.Button
                className={cn(
                  "dark:to-primary-dark-foreground cursor-pointer rounded-r-lg bg-gradient-to-r from-transparent to-gray-100 to-30% p-2 pl-4 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-gray-800 data-[state=open]:text-gray-800 data-[state=open]:opacity-100 dark:text-white/80 dark:hover:text-white dark:data-[state=open]:text-white",
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
                className="dark:from-primary-dark dark:to-primary-dark-foreground rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
              >
                <Dropdown.Item
                  onSelect={() => {
                    setIsEditable(true);
                    setTimeout(() => {
                      inputRef?.current?.setSelectionRange(0, _name.length);
                    }, 10);
                  }}
                  className="flex items-center gap-2 dark:text-white/80 dark:data-[highlighted]:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      d="M14.36 4.079l.927-.927a3.932 3.932 0 015.561 5.561l-.927.927m-5.56-5.561s.115 1.97 1.853 3.707C17.952 9.524 19.92 9.64 19.92 9.64m-5.56-5.561l-8.522 8.52c-.577.578-.866.867-1.114 1.185a6.556 6.556 0 00-.749 1.211c-.173.364-.302.752-.56 1.526l-1.094 3.281m17.6-10.162L11.4 18.16c-.577.577-.866.866-1.184 1.114a6.554 6.554 0 01-1.211.749c-.364.173-.751.302-1.526.56l-3.281 1.094m0 0l-.802.268a1.06 1.06 0 01-1.342-1.342l.268-.802m1.876 1.876l-1.876-1.876"
                    />
                  </svg>

                  <span>Rename</span>
                </Dropdown.Item>

                <Dropdown.Item
                  color="rgb(220,38,38)"
                  highlightColor="rgba(220,38,38,0.2)"
                  className="inline-flex w-28 items-center gap-2 text-red-600 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-600"
                  onSelect={() => {
                    setIsDeleteOpen(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        d="M20.5 6h-17m15.333 2.5l-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79-.865.81-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81-.865-.809-.954-2.136-1.13-4.79l-.46-6.9"
                      />
                      <path d="M6.5 6h.11a2 2 0 001.83-1.32l.034-.103.097-.291c.083-.249.125-.373.18-.479a1.5 1.5 0 011.094-.788C9.962 3 10.093 3 10.355 3h3.29c.262 0 .393 0 .51.019a1.5 1.5 0 011.094.788c.055.106.097.23.18.479l.097.291A2 2 0 0017.5 6" />
                    </g>
                  </svg>
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
        <div className="mt-2 flex w-full flex-col items-center justify-end gap-5 px-5 pt-5 pb-5 md:flex-row">
          <Modal.Close
            autoFocus={false}
            className={cn(
              ButtonVariants({ variant: "secondary" }),
              "w-full md:w-auto",
            )}
          >
            cancel
          </Modal.Close>
          <Button
            wrapperClass="w-full md:w-auto"
            className={"w-full md:w-auto"}
            variant={"danger"}
            onClick={async () => {
              const currentThread = searchParams.get("thread");
              onDelete && onDelete(id);
              if (currentThread && currentThread === id) {
                navigate("/agents");
              }
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
