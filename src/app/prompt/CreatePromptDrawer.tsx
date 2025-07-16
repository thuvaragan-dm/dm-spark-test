import { useState } from "react";
import { CreatePromptSchema } from "../../api/prompt/PromptSchema";
import { useGetCategories } from "../../api/prompt/useGetCategories";
import CodeEditor from "../../components/CodeEditor";
import { Drawer } from "../../components/drawer";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import Label from "../../components/Forms/Label";
import Grid from "../../components/patterns/Grid";
import Spinner from "../../components/Spinner";
import { usePrompt, usePromptAction } from "../../store/promptStore";
import { cn } from "../../utilities/cn";
import { VscAdd, VscClose, VscEdit } from "react-icons/vsc";
import Switch from "../../components/Forms/Switch";
import { Button, ButtonWithLoader } from "../../components/Button";
import { useCreatePrompt } from "../../api/prompt/useCreatePrompt";
import { EPrompt, promptKey } from "../../api/prompt/config";

const CreatePromptDrawer = () => {
  const { isCreatePromptDrawerOpen, newCategoryName } = usePrompt();
  const { setIsCreatePromptDrawerOpen, setNewCategoryName } = usePromptAction();

  const { data: categories, isPending: isCategoriesLoading } =
    useGetCategories();

  const [isAddNewCategoryTriggered, setIsAddNewCategoryTriggered] =
    useState(false);

  const { mutateAsync: createPrompt } = useCreatePrompt({
    invalidateQueryKey: [promptKey[EPrompt.FETCH_ALL]],
  });

  return (
    <Drawer
      shouldScaleBackground
      open={isCreatePromptDrawerOpen}
      onOpenChange={setIsCreatePromptDrawerOpen}
    >
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
            <div className="flex w-full items-start justify-between gap-10 p-5">
              <Drawer.Header className="w-full text-left">
                <Drawer.Title>Create Prompt</Drawer.Title>
                <Drawer.Description className="mt-1 max-w-md text-xs">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Minus perspiciatis enim natus odio doloremque tempora.
                </Drawer.Description>
              </Drawer.Header>

              <Button
                onClick={() => setIsCreatePromptDrawerOpen(false)}
                variant={"ghost"}
                className={
                  "rounded-full border border-gray-600 p-1 text-gray-600 hover:bg-gray-300 md:p-1 dark:border-white dark:text-white dark:hover:bg-white/10"
                }
              >
                <VscClose className="size-4" />
              </Button>
            </div>

            <div className="scrollbar scrollbar flex flex-1 flex-col overflow-hidden">
              <Form
                validationSchema={CreatePromptSchema}
                onSubmit={async (values) => {
                  await createPrompt({
                    body: values,
                  });

                  setIsCreatePromptDrawerOpen(false);
                }}
                className="flex flex-1 items-start justify-start overflow-hidden"
              >
                {({
                  register,
                  setValue,
                  watch,
                  trigger,
                  formState: { errors, isSubmitting },
                }) => (
                  <>
                    <div className="scrollbar flex h-full w-full flex-1 flex-col overflow-y-auto border-r border-gray-300 dark:border-white/10">
                      <CodeEditor
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
                        }}
                      />
                    </div>

                    {/* right section */}
                    <div className="flex h-full w-64 flex-col overflow-hidden border-l border-gray-300 dark:border-white/10">
                      <div className="flex flex-1 flex-col space-y-3 overflow-y-auto px-5">
                        <Field>
                          <Label>Prompt Name</Label>
                          <Input
                            placeholder="Enter prompt name"
                            data-invalid={!!errors.name?.message}
                            {...register("name")}
                          />
                          <ErrorMessage>{errors.name?.message}</ErrorMessage>
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
                                          watch("category") === newCategoryName,
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
                                        setIsAddNewCategoryTriggered(false);
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
                            value={watch("is_workspace_shared") ? "t" : ""}
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
                          Create prompt
                        </ButtonWithLoader>
                      </div>
                    </div>
                    {/* right section */}
                  </>
                )}
              </Form>
            </div>
          </div>
        </div>
      </Drawer.Content>
    </Drawer>
  );
};

export default CreatePromptDrawer;
