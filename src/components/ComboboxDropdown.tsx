import {
  Combobox as Cb,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect } from "react";
import { VscClose, VscSearch } from "react-icons/vsc";
import useMeasure from "react-use-measure";
import { CustomSlottedComponent } from "../types/type-utils";
import { cn } from "../utilities/cn";
import { GroupResult } from "../utilities/groupBy";
import { Button } from "./Button";
import Dropdown from "./dropdown";
import Spinner from "./Spinner";

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
  children: ReactNode;
}

const ComboboxDropdown = <T extends { id: string }>({
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
  children,
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
    <Dropdown open={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Button asChild className="flex p-0 md:p-0">
        {children}
      </Dropdown.Button>

      <Dropdown.Menu
        align="end"
        side="top"
        className="dark:from-primary-dark-foreground dark:to-primary-dark rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
      >
        <Cb
          as="div"
          onChange={(selected: T) => {
            if (selected) {
              onSelect(selected);
            }
          }}
          className={"relative flex max-h-96 min-h-72 w-full flex-col"}
        >
          <div
            className={cn(
              "flex w-full items-center justify-between gap-4 border-gray-300 px-3 dark:border-[#3C3B3B]",
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
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.7 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)", scale: 0.7 }}
                className="absolute inset-x-0 top-10 bottom-0 flex flex-1 flex-col items-center justify-center py-5"
              >
                <Spinner className="size-4 dark:text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <ComboboxOptions
            static
            className={cn(
              "scrollbar flex flex-1 flex-col space-y-5 overflow-y-auto text-sm",
            )}
          >
            <motion.div
              animate={{ height }}
              transition={{ type: "spring", damping: 18 }}
              className="flex flex-1 flex-col"
            >
              <div ref={ref} className="flex w-full flex-1 flex-col">
                <AnimatePresence mode="popLayout">
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.01 } }}
                      className="mt-2 px-1"
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
                      className="flex flex-1 flex-col"
                    >
                      <div className="mt-2 flex w-full flex-1 flex-col items-center justify-center p-1 text-gray-800 dark:text-white">
                        No results found!
                      </div>
                    </motion.div>
                  )}

                  {!query &&
                    searchResults.length <= 0 &&
                    !isLoading &&
                    EmptyState && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.01 } }}
                        className="flex flex-1 flex-col"
                      >
                        <EmptyState />
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          </ComboboxOptions>
        </Cb>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ComboboxDropdown;
