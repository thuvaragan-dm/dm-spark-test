import { useEffect, useState } from "react";
import { VscAdd, VscEdit, VscTrash } from "react-icons/vsc";
import { EPrompt, promptKey } from "../../api/prompt/config";
import { CreatePromptSchema } from "../../api/prompt/PromptSchema";
import { useGetCategories } from "../../api/prompt/useGetCategories";
import { useUpdatePrompt } from "../../api/prompt/useUpdatePrompt";
import { Button, ButtonWithLoader } from "../../components/Button";
import CodeEditor from "../../components/CodeEditor";
import { Drawer } from "../../components/drawer";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import Label from "../../components/Forms/Label";
import Switch from "../../components/Forms/Switch";
import Grid from "../../components/patterns/Grid";
import Spinner from "../../components/Spinner";
import { usePrompt, usePromptAction } from "../../store/promptStore";
import { cn } from "../../utilities/cn";
import { AnimatePresence, motion } from "motion/react";
import Dropdown from "../../components/dropdown";
import Modal from "../../components/modal";
import { useDeletePrompt } from "../../api/prompt/useDeletePrompt";

const UpdatePromptDrawer = () => {
  const { isUpdatePromptDrawerOpen, newCategoryName, selectedPromptForEdit } =
    usePrompt();
  const { setIsUpdatePromptDrawerOpen, setNewCategoryName } = usePromptAction();

  const { data: categories, isPending: isCategoriesLoading } =
    useGetCategories();

  const [isAddNewCategoryTriggered, setIsAddNewCategoryTriggered] =
    useState(false);

  const promptsOptions = {
    search: "",
    page: 1,
    records_per_page: 20,
  };

  const { mutateAsync: updatePrompt } = useUpdatePrompt({
    invalidateQueryKey: [promptKey[EPrompt.FETCH_ALL], promptsOptions],
  });

  const [isEditEnabled, setIsEditEnabled] = useState(false);

  useEffect(() => {
    if (!isUpdatePromptDrawerOpen) {
      setIsEditEnabled(false);
    }
  }, [isUpdatePromptDrawerOpen]);

  const [refershEditor, setRefershEditor] = useState(0);

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { mutateAsync: deletePrompt } = useDeletePrompt({
    invalidateQueryKey: [promptKey[EPrompt.FETCH_ALL], promptsOptions],
  });

  return (
    <Drawer
      shouldScaleBackground
      open={isUpdatePromptDrawerOpen}
      onOpenChange={setIsUpdatePromptDrawerOpen}
    >
      {selectedPromptForEdit && (
        <Drawer.Content
          className={cn("mt-auto flex h-full max-h-[100vh] flex-col")}
        >
          <div className="dark:bg-primary-dark flex h-full flex-1 flex-col overflow-hidden rounded-t-2xl">
            <div className="dark:from-primary-dark-foreground dark:to-primary-dark relative flex flex-1 flex-col overflow-hidden rounded-t-[calc(var(--radius-2xl)-(--spacing(1.5)))] bg-gradient-to-b from-gray-100 to-white">
              {/* pattern */}
              <Grid
                width={30}
                height={30}
                x={-6}
                y={-6}
                squares={[
                  [1, 1],
                  [12, 3],
                  [6, 4],
                ]}
                strokeDasharray={"4 2"}
                className={cn(
                  "inset-0 h-40 [mask-image:linear-gradient(180deg,white,transparent)] opacity-20",
                )}
              />
              {/* pattern */}
              <Drawer.Header className="flex w-full items-center justify-between p-5 text-left">
                <div className="w-full max-w-md">
                  <Drawer.Title className="truncate">
                    Update Prompt
                  </Drawer.Title>
                  <Drawer.Description className="mt-1 text-xs">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Minus perspiciatis enim natus odio doloremque tempora.
                  </Drawer.Description>
                </div>

                <div className="flex items-center justify-end gap-5">
                  {!isEditEnabled && (
                    <Button
                      onClick={() => setIsEditEnabled(true)}
                      variant={"ghost"}
                      className={
                        "rounded-lg border border-white px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 md:px-3 md:py-1.5"
                      }
                    >
                      Edit
                    </Button>
                  )}

                  <Dropdown
                    open={isContextMenuOpen}
                    onOpenChange={setIsContextMenuOpen}
                  >
                    <Dropdown.Button
                      className={cn(
                        "cursor-pointer rounded-full border border-white p-1 text-white hover:bg-white/10",
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
                      align="end"
                      side="bottom"
                      alignOffset={-4}
                      sideOffset={5}
                      className="dark:bg-primary-dark/60 w-44 rounded-xl bg-gray-100/60 p-1 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
                    >
                      <Dropdown.Item
                        color="rgb(220,38,38)"
                        highlightColor="rgba(220,38,38,0.2)"
                        className="inline-flex w-full items-center gap-2 rounded-[calc(var(--radius-xl)-(--spacing(1)))] py-1.5 text-red-600 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-600"
                        onSelect={() => {
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <VscTrash className="size-5" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Drawer.Header>

              <div className="scrollbar scrollbar flex flex-1 flex-col overflow-hidden">
                <Form
                  validationSchema={CreatePromptSchema}
                  defaultValues={selectedPromptForEdit}
                  onSubmit={async (values) => {
                    await updatePrompt({
                      body: values,
                      params: {
                        prompt_id: selectedPromptForEdit.id,
                      },
                    });

                    setIsUpdatePromptDrawerOpen(false);
                  }}
                  className="flex flex-1 items-start justify-start overflow-hidden"
                >
                  {({
                    register,
                    setValue,
                    watch,
                    trigger,
                    reset,
                    formState: { errors, isSubmitting },
                  }) => (
                    <>
                      {/* right section */}
                      <div className="scrollbar flex h-full w-full flex-1 flex-col overflow-y-auto border-r border-gray-300 dark:border-white/10">
                        <CodeEditor
                          key={refershEditor}
                          className="flex h-full flex-1 flex-col rounded-none"
                          language="plaintext"
                          value={watch("prompt")}
                          onChange={(val) => {
                            setValue("prompt", val || "");
                          }}
                          editorOptions={{
                            lineNumbers: "off",
                            padding: { top: 10 },
                            folding: false,
                            fontSize: 16,
                            wordWrap: "on",
                            readOnly: !isEditEnabled,
                          }}
                        />
                      </div>

                      <AnimatePresence mode="popLayout">
                        {isEditEnabled && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "16rem", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="dark:bg-primary-dark-foreground flex h-full flex-col overflow-hidden border-l border-gray-300 bg-gray-200 dark:border-white/10"
                          >
                            <div className="flex flex-1 shrink-0 flex-col space-y-3 overflow-y-auto px-5">
                              <Field>
                                <Label>Prompt Name</Label>
                                <Input
                                  placeholder="Enter agent name"
                                  data-invalid={!!errors.name?.message}
                                  {...register("name")}
                                />
                                <ErrorMessage>
                                  {errors.name?.message}
                                </ErrorMessage>
                              </Field>

                              <div className="mb-5 flex flex-col">
                                <div className="">
                                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    Select a category that best fits your prompt
                                  </p>
                                  {errors.category?.message && (
                                    <ErrorMessage className="">
                                      {errors.category?.message}
                                    </ErrorMessage>
                                  )}
                                </div>

                                {isCategoriesLoading && (
                                  <div className="flex h-10 w-full items-center justify-center">
                                    <Spinner className="size-4" />
                                  </div>
                                )}

                                {!isCategoriesLoading && categories && (
                                  <div className="flex flex-col">
                                    <div className="mt-3 flex flex-wrap items-start justify-start gap-3">
                                      {!isAddNewCategoryTriggered && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIsAddNewCategoryTriggered(true);
                                          }}
                                          className={cn(
                                            "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-500 px-3 py-1.5 text-xs text-gray-600 hover:border-gray-600 dark:border-white/50 dark:text-white dark:hover:border-white",
                                            {
                                              "bg-primary dark:bg-primary/5 dark:text-primary dark:border-primary border-primary hover:border-primary dark:hover:border-primary text-white":
                                                newCategoryName.length > 0 &&
                                                watch("category") ===
                                                  newCategoryName,
                                            },
                                          )}
                                        >
                                          {!newCategoryName ? (
                                            <span className="flex items-center justify-start gap-2">
                                              <VscAdd className="size-3" />
                                              Add new category
                                            </span>
                                          ) : (
                                            <span className="flex items-center justify-start gap-2">
                                              {newCategoryName}
                                              <VscEdit className="size-3" />
                                            </span>
                                          )}
                                        </button>
                                      )}

                                      {isAddNewCategoryTriggered && (
                                        <input
                                          autoFocus
                                          type="text"
                                          placeholder="enter category"
                                          onBlur={() => {
                                            setValue(
                                              "category",
                                              newCategoryName.trim(),
                                            );
                                            setIsAddNewCategoryTriggered(false);
                                            trigger("category");
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              setValue(
                                                "category",
                                                newCategoryName.trim(),
                                              );
                                              setIsAddNewCategoryTriggered(
                                                false,
                                              );
                                              trigger("category");
                                            }
                                          }}
                                          value={newCategoryName}
                                          onChange={(e) =>
                                            setNewCategoryName(e.target.value)
                                          }
                                          className="w-[--spacing(36.4)] rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-0 dark:border-white dark:text-white dark:placeholder:text-white/50"
                                        />
                                      )}
                                      {categories.map((category, idx) => (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setValue("category", category);
                                            trigger("category");
                                          }}
                                          key={idx}
                                          className={cn(
                                            "cursor-pointer rounded-lg border border-gray-500 px-3 py-1.5 text-xs text-gray-600 hover:border-gray-600 dark:border-white/50 dark:text-white dark:hover:border-white",
                                            {
                                              "bg-primary dark:bg-primary/5 dark:text-primary dark:border-primary border-primary hover:border-primary dark:hover:border-primary text-white":
                                                watch("category") === category,
                                            },
                                          )}
                                        >
                                          {category}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Field>
                                <Switch
                                  value={
                                    watch("is_workspace_shared") ? "t" : ""
                                  }
                                  onChange={(val) => {
                                    setValue("is_workspace_shared", val);
                                  }}
                                  switchClass="group-data-[selected]:bg-green-600"
                                  className={
                                    "flex-row-reverse gap-3 rounded-lg border border-gray-300 p-1.5 pl-3 dark:border-white/10"
                                  }
                                >
                                  <div className="">
                                    <p className="text-xs text-gray-600 dark:text-white/60">
                                      Share with your workspace
                                    </p>
                                  </div>
                                </Switch>
                              </Field>
                            </div>

                            <div className="px-5 pb-5">
                              {errors.prompt?.message && (
                                <ErrorMessage className="">
                                  Prompt is empty
                                </ErrorMessage>
                              )}
                              <ButtonWithLoader
                                type="submit"
                                isLoading={isSubmitting}
                                wrapperClass="mt-3 w-full"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-white [--border-highlight-radius:var(--radius-lg)]"
                              >
                                Update prompt
                              </ButtonWithLoader>

                              <Button
                                onClick={() => {
                                  reset();
                                  setRefershEditor((pv) => pv + 1);
                                  setIsEditEnabled(false);
                                }}
                                variant={"ghost"}
                                wrapperClass="flex w-full"
                                className={
                                  "mt-2 flex w-full items-center justify-center text-gray-600 hover:underline dark:text-white/60"
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* right section */}
                    </>
                  )}
                </Form>

                <Modal
                  key="delete-prompt-modal"
                  title="Delete prompt?"
                  desktopClassName="w-full max-w-md"
                  description={`This will permanently delete ${selectedPromptForEdit.name}.`}
                  isOpen={isDeleteModalOpen}
                  Trigger={() => <></>}
                  setIsOpen={setIsDeleteModalOpen}
                >
                  <p className="px-5 pt-2 text-sm text-gray-600 dark:text-white/70">
                    Are you sure you want to proceed?
                  </p>
                  <div className="mt-5 flex w-full flex-col items-center justify-end gap-3 px-5 pb-5 md:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsDeleteModalOpen(false)}
                      wrapperClass="w-full md:w-auto"
                      className="flex w-full items-center justify-center rounded-md px-3 py-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      wrapperClass="w-full md:w-auto"
                      className="w-full rounded-md py-1 [--border-highlight-radius:var(--radius-sm)] md:w-auto"
                      variant={"danger"}
                      onClick={() => {
                        deletePrompt({
                          params: {
                            id: selectedPromptForEdit.id,
                          },
                        });
                        setIsDeleteModalOpen(false);
                        setIsUpdatePromptDrawerOpen(false);
                      }}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        </Drawer.Content>
      )}
    </Drawer>
  );
};

export default UpdatePromptDrawer;
