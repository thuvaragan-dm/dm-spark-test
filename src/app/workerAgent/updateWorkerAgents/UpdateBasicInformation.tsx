import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { VscAdd, VscEdit } from "react-icons/vsc";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { EWorkerAgent, workerAgentKey } from "../../../api/workerAgents/config";
import { useGetCategories } from "../../../api/workerAgents/useGetCategories";
import { useUpdateWorkerAgent } from "../../../api/workerAgents/useUpdateWorkerAgent";
import {
  ActualUpdateWorkerAgentSchema,
  UpdateWorkerAgentSchema,
} from "../../../api/workerAgents/WorkerAgentSchema";
import { Button, ButtonWithLoader } from "../../../components/Button";
import ErrorMessage from "../../../components/Forms/ErrorMessage";
import Field from "../../../components/Forms/Field";
import Form from "../../../components/Forms/Form";
import Input from "../../../components/Forms/Input";
import Label from "../../../components/Forms/Label";
import TextArea from "../../../components/Forms/TextArea";
import Spinner from "../../../components/Spinner";
import {
  useWorkerAgent,
  useWorkerAgentActions,
} from "../../../store/workerAgentStore";
import { cn } from "../../../utilities/cn";

const UpdateBasicInformation = ({
  defaultValues,
  setIsOpen,
}: {
  defaultValues?: Omit<
    z.infer<typeof ActualUpdateWorkerAgentSchema>,
    "agent_secrets"
  >;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { id } = useParams<{ id: string }>();
  const { newCategoryName } = useWorkerAgent();
  const { setNewCategoryName } = useWorkerAgentActions();

  const { data: categories, isPending: isCategoriesLoading } =
    useGetCategories();

  const [isAddNewCategoryTriggered, setIsAddNewCategoryTriggered] =
    useState(false);

  const handleClose = () => {
    setIsAddNewCategoryTriggered(false);
    setNewCategoryName("");
    setIsOpen(false);
  };

  const { mutate: updateWorkerAgent } = useUpdateWorkerAgent({
    invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_SINGLE] + id],
  });

  useEffect(() => {
    return () => {
      setIsAddNewCategoryTriggered(false);
      setNewCategoryName("");
    };
  }, [setIsAddNewCategoryTriggered, setNewCategoryName]);

  return (
    <Form
      validationSchema={UpdateWorkerAgentSchema}
      onSubmit={(values) => {
        updateWorkerAgent({
          body: values,
          params: {
            id: id || "",
          },
        });
        handleClose();
      }}
      defaultValues={defaultValues}
    >
      {({
        setValue,
        trigger,
        register,
        formState: { errors, isSubmitting },
        watch,
      }) => (
        <>
          <Field>
            <Label>Agent Name</Label>
            <Input
              placeholder="Enter agent name"
              data-invalid={!!errors.name?.message}
              {...register("name")}
            />
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          </Field>

          <Field>
            <Label>Description</Label>
            <TextArea
              rows={3}
              placeholder="Enter agent description"
              data-invalid={!!errors.description?.message}
              {...register("description")}
            />
            <ErrorMessage>{errors.description?.message}</ErrorMessage>
          </Field>

          <Field>
            <Label>Overview</Label>
            <TextArea
              rows={3}
              placeholder="Enter agent overview"
              data-invalid={!!errors.overview?.message}
              {...register("overview")}
            />
            <ErrorMessage>{errors.overview?.message}</ErrorMessage>
          </Field>

          <div className="">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Select a category that best fits your worker agent
            </p>

            {isCategoriesLoading && (
              <div className="flex h-10 w-full items-center justify-center">
                <Spinner className="size-4" />
              </div>
            )}

            {!isCategoriesLoading && categories && (
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
                      setValue("category", newCategoryName.trim());
                      setIsAddNewCategoryTriggered(false);
                      trigger("category");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setValue("category", newCategoryName.trim());
                        setIsAddNewCategoryTriggered(false);
                        trigger("category");
                      }
                    }}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
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
            )}

            <ErrorMessage className="mt-2">
              {errors.category?.message}
            </ErrorMessage>
          </div>

          <div className="flex w-full items-center justify-between gap-3 pb-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose()}
              wrapperClass="w-full md:w-auto"
              className="flex w-full items-center justify-center rounded-md border border-gray-300 px-2 py-[--spacing(1.3)] text-white/60 hover:text-white md:px-2 md:py-[--spacing(1.2)] dark:border-white/60"
            >
              Cancel
            </Button>

            <ButtonWithLoader
              type="submit"
              isLoading={isSubmitting}
              wrapperClass="w-full md:w-auto"
              className="flex w-full items-center justify-center rounded-md px-3 py-1.5 [--border-highlight-radius:var(--radius-md)]"
            >
              Save
            </ButtonWithLoader>
          </div>
        </>
      )}
    </Form>
  );
};

export default UpdateBasicInformation;
