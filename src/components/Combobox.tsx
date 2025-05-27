import {
  Combobox as Cb,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { VscClose, VscSearch } from "react-icons/vsc";
import useMeasure from "react-use-measure";
import { CustomSlottedComponent } from "../types/type-utils";
import { cn } from "../utilities/cn";
import { GroupResult } from "../utilities/groupBy";
import { Button } from "./Button";
import Dialog from "./dialog";
import Spinner from "./Spinner";
import { COMMAND_KEY } from "./tooltip/TooltipKeyboardShortcut";

interface ICombobox<T> {
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  EmptyState?: CustomSlottedComponent<"div">;
  searchResults: T[];
  onSelect: (result: T) => void;
  Option: CustomSlottedComponent<typeof ComboboxOption, { optionValue: T }>;
  placeholder: string;
}

const Combobox = <T extends { id: string }>({
  isLoading = false,
  isOpen,
  setIsOpen,
  query,
  setQuery,
  EmptyState,
  searchResults,
  onSelect,
  Option,
  placeholder,
}: ICombobox<T>) => {
  const [ref, { height }] = useMeasure();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery("");
      }, 300);
    }
  }, [isOpen, setQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} hideOverlay>
      <Dialog.Content
        contentContainerClassName="items-start mt-1.5 px-5 md:px-0"
        className="dark:bg-primary-dark-foreground -mr-[--spacing(7.8)] w-full max-w-[32.5rem] origin-top overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-300 backdrop-blur-md dark:ring-[#3C3B3B]"
      >
        <Dialog.Title className="sr-only">Chat Search box</Dialog.Title>
        <Dialog.Description className="sr-only">
          You can start typing here to search across your chat history
        </Dialog.Description>

        <Cb
          as="div"
          onChange={(selected: T) => {
            if (selected) {
              onSelect(selected);
            }
          }}
          className={"flex max-h-96 w-full flex-col"}
        >
          <div
            className={cn(
              "flex w-full items-center justify-between gap-4 border-gray-300 px-5 dark:border-[#3C3B3B]",
              { "border-b-[1px]": query.length > 0 },
            )}
          >
            <div className="flex w-full items-center justify-start gap-4">
              <VscSearch className="size-5 flex-shrink-0 text-gray-500 dark:text-white" />

              <ComboboxInput
                value={query}
                autoFocus
                autoComplete="off"
                className="w-full border-0 bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-white/40"
                placeholder={placeholder}
                displayValue={(result: GroupResult) => result?.name}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-1">
              {query.length <= 0 ? (
                <>
                  <kbd className="rounded-md bg-gray-200 px-1.5 py-1 text-xs text-gray-800 uppercase dark:bg-white/10 dark:text-white">
                    {COMMAND_KEY}
                  </kbd>
                  <kbd className="rounded-md bg-gray-200 px-1.5 py-1 text-xs text-gray-800 uppercase dark:bg-white/10 dark:text-white">
                    k
                  </kbd>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setQuery("");
                    }}
                    variant={"ghost"}
                    wrapperClass="flex items-center justify-center"
                    className={
                      "text-xs text-gray-600 hover:text-gray-800 hover:underline dark:text-white/60 dark:hover:text-white"
                    }
                  >
                    Clear
                  </Button>

                  <span className="mx-1 h-5 border-l-2 border-gray-300 dark:border-white/10" />

                  <Button
                    onClick={() => {
                      setQuery("");
                      setIsOpen(false);
                    }}
                    variant={"ghost"}
                    wrapperClass="flex items-center justify-center"
                    className={
                      "text-xs text-gray-600 hover:text-gray-800 hover:underline dark:text-white/60 dark:hover:text-white"
                    }
                  >
                    <VscClose className="size-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.7 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)", scale: 0.7 }}
              >
                <Spinner className="size-4 dark:text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <ComboboxOptions
            static
            className={cn(
              "scrollbar flex-1 space-y-5 overflow-y-auto text-sm",
              {
                "mb-2": searchResults.length > 0,
              },
            )}
          >
            <motion.div
              animate={{ height }}
              transition={{ type: "spring", damping: 18 }}
            >
              <div ref={ref} className="w-full">
                <AnimatePresence mode="popLayout">
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.01 } }}
                      className="mt-2 px-5"
                    >
                      {searchResults.map((result) => (
                        <Option key={result.id} optionValue={result} />
                      ))}
                    </motion.div>
                  )}

                  {query && searchResults.length <= 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.01 } }}
                    >
                      <div className="flex w-full flex-col items-center justify-center p-5">
                        {EmptyState ? <EmptyState /> : "No results found!"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </ComboboxOptions>

          <div className="flex items-center justify-end border-t border-gray-300 bg-gray-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/3">
            <p className="text-xs text-gray-500 dark:text-white/70">
              Not the results you expected?{" "}
              <span className="dark:text-secondary text-primary cursor-pointer hover:underline">
                Give feedback
              </span>{" "}
              or{" "}
              <span className="dark:text-secondary text-primary cursor-pointer hover:underline">
                Learn more
              </span>
            </p>
          </div>
        </Cb>
      </Dialog.Content>
    </Dialog>
  );
};

export default Combobox;
