import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { IoAdd, IoEye, IoEyeOff } from "react-icons/io5";
import { VscTrash } from "react-icons/vsc";
import { RegisterWorkerAgentSchema } from "../../../api/workerAgents/WorkerAgentSchema";
import { Button, ButtonWithLoader } from "../../../components/Button";
import Field from "../../../components/Forms/Field";
import Input from "../../../components/Forms/Input";
import InputGroup from "../../../components/Forms/InputGroup";
import Label from "../../../components/Forms/Label";
import { useMultiStepForm } from "../../../components/Forms/MultiStepForm";
import { useWorkerAgentActions } from "../../../store/workerAgentStore";
import ErrorMessage from "../../../components/Forms/ErrorMessage";

// Helper component to display error messages

const SecretsForm = () => {
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
  const { methods, prevStep } =
    useMultiStepForm<typeof RegisterWorkerAgentSchema>();

  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    name: "agent_secrets",
    control,
  });

  const [showSecret, setShowSecret] = useState<null | number>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar flex flex-1 flex-col overflow-y-auto px-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white">
          Add worker secrets
        </h3>
        <p className="text-xs text-gray-600 dark:text-white/60">
          The hidden protocols behind the ones who keep everything running.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex w-full items-start justify-between gap-3"
            >
              <div className="flex flex-1 gap-4">
                <Field>
                  <Label>Name</Label>
                  <Input
                    id={`agent_secrets.${index}.key`}
                    type="text"
                    placeholder="e.g. GITHUB_TOKEN"
                    className="w-full"
                    inputClass="uppercase"
                    data-invalid={!!errors.agent_secrets?.[index]?.key}
                    {...register(`agent_secrets.${index}.key`)}
                  />
                  <ErrorMessage>
                    {errors.agent_secrets?.[index]?.key?.message}
                  </ErrorMessage>
                </Field>

                <Field>
                  <Label>Value</Label>
                  <InputGroup>
                    <Input
                      type={showSecret === index ? "text" : "password"}
                      placeholder="Your Secret"
                      className="w-full"
                      data-invalid={!!errors.agent_secrets?.[index]?.value}
                      {...register(`agent_secrets.${index}.value`)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                      <Button
                        variant="ghost"
                        className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                        onPress={() =>
                          setShowSecret((prev) =>
                            prev === null
                              ? index
                              : prev !== index
                                ? index
                                : null,
                          )
                        }
                      >
                        {showSecret === index ? (
                          <IoEye className="h-5 w-5 shrink-0" />
                        ) : (
                          <IoEyeOff className="h-5 w-5 shrink-0" />
                        )}
                      </Button>
                    </div>
                  </InputGroup>

                  <ErrorMessage>
                    {errors.agent_secrets?.[index]?.value?.message}
                  </ErrorMessage>
                </Field>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(index)}
                className="mt-11 text-white/50 hover:text-red-500"
                aria-label="Remove secret"
              >
                <VscTrash className="size-5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex w-full items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => append({ key: "", value: "" })}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-600 hover:underline dark:text-white"
          >
            <IoAdd className="size-4" />{" "}
            {watch("agent_secrets") && watch("agent_secrets")!.length > 0
              ? "Add another secret"
              : "Add secret"}
          </Button>
        </div>
      </div>

      <div className="mt-5 flex w-full items-center justify-between gap-3 border-t border-white/10 px-5 pt-5 pb-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsRegisterWorkerAgentModalOpen(false)}
          wrapperClass="w-full md:w-auto"
          className="flex w-full items-center justify-center rounded-md border border-gray-300 px-2 py-[--spacing(1.3)] text-white/60 hover:text-white md:px-2 md:py-[--spacing(1.2)] dark:border-white/60"
        >
          Cancel
        </Button>

        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            wrapperClass="w-full md:w-auto"
            className="flex w-full items-center justify-center rounded-md border border-gray-300 px-2 py-[--spacing(1.3)] text-white/60 hover:text-white md:px-2 md:py-[--spacing(1.2)] dark:border-white/60"
          >
            Back
          </Button>

          <ButtonWithLoader
            isLoading={isSubmitting}
            wrapperClass="w-full md:w-auto"
            className="flex w-full items-center justify-center rounded-md px-3 py-1.5 [--border-highlight-radius:var(--radius-md)]"
            type="submit"
          >
            Register
          </ButtonWithLoader>
        </div>
      </div>
    </div>
  );
};

export default SecretsForm;
