import { useEffect, useState } from "react";
import { VscAdd, VscEdit } from "react-icons/vsc";
import { useGetCategories } from "../../../api/workerAgents/useGetCategories";
import { RegisterWorkerAgentSchema } from "../../../api/workerAgents/WorkerAgentSchema";
import { Button } from "../../../components/Button";
import ErrorMessage from "../../../components/Forms/ErrorMessage";
import Field from "../../../components/Forms/Field";
import Input from "../../../components/Forms/Input";
import Label from "../../../components/Forms/Label";
import { useMultiStepForm } from "../../../components/Forms/MultiStepForm";
import TextArea from "../../../components/Forms/TextArea";
import Spinner from "../../../components/Spinner";
import {
  useWorkerAgent,
  useWorkerAgentActions,
} from "../../../store/workerAgentStore";
import { cn } from "../../../utilities/cn";
import { WorkerAgentOrigin } from "../../../api/workerAgents/types";

const BasicInformationForm = () => {
  const { newCategoryName } = useWorkerAgent();
  const { setIsRegisterWorkerAgentModalOpen, setNewCategoryName } =
    useWorkerAgentActions();

  const { methods, nextStep } =
    useMultiStepForm<typeof RegisterWorkerAgentSchema>();

  const {
    trigger,
    register,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const { data: categories, isPending: isCategoriesLoading } =
    useGetCategories();

  const [isAddNewCategoryTriggered, setIsAddNewCategoryTriggered] =
    useState(false);

  const handleNewCategorySubmit = () => {
    setValue("category", newCategoryName.trim());
    setIsAddNewCategoryTriggered(false);
    trigger("category");
  };

  useEffect(() => {
    if (!watch("origin")) {
      setValue("origin", WorkerAgentOrigin.CUSTOM);
    }
  }, [setValue, watch]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar flex flex-1 flex-col overflow-y-auto px-5">
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
                  onBlur={handleNewCategorySubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNewCategorySubmit();
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
      </div>

      <div className="flex w-full items-center justify-between gap-3 px-5 pb-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsRegisterWorkerAgentModalOpen(false)}
          wrapperClass="w-full md:w-auto"
          className="flex w-full items-center justify-center rounded-md border border-gray-300 px-2 py-[--spacing(1.3)] text-white/60 hover:text-white md:px-2 md:py-[--spacing(1.2)] dark:border-white/60"
        >
          Cancel
        </Button>

        <Button
          wrapperClass="w-full md:w-auto"
          className="flex w-full items-center justify-center rounded-md px-3 py-1.5 [--border-highlight-radius:var(--radius-md)]"
          onClick={async () => {
            const isValid = await trigger([
              "name",
              "description",
              "overview",
              "category",
            ]);
            if (isValid) nextStep();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BasicInformationForm;
