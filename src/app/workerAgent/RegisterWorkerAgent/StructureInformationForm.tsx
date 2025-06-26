import { RegisterWorkerAgentSchema } from "../../../api/workerAgents/WorkerAgentSchema";
import { Button } from "../../../components/Button";
import CodeEditor from "../../../components/CodeEditor";
import ErrorMessage from "../../../components/Forms/ErrorMessage";
import Field from "../../../components/Forms/Field";
import Input from "../../../components/Forms/Input";
import Label from "../../../components/Forms/Label";
import { useMultiStepForm } from "../../../components/Forms/MultiStepForm";
import { useWorkerAgentActions } from "../../../store/workerAgentStore";

const StructureInformationForm = () => {
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
  const { methods, nextStep, prevStep } =
    useMultiStepForm<typeof RegisterWorkerAgentSchema>();

  const {
    trigger,
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = methods;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar flex flex-1 flex-col overflow-y-auto px-5">
        <Field>
          <Label>Http Endpoint</Label>
          <Input
            type="text"
            placeholder="Enter http endpoint"
            className="w-full"
            data-invalid={!!errors.http_endpoint?.message}
            {...register("http_endpoint")}
          />
          <ErrorMessage>{errors.http_endpoint?.message}</ErrorMessage>
        </Field>

        <div className="mt-2 w-full flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1E1E1E]">
          <label className="block px-2 pt-2 pb-1 text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
            Input Payload Example (optional)
          </label>
          <CodeEditor
            className="flex h-64 flex-1 flex-col"
            language="json"
            value={watch("payload_schema") || ""}
            onChange={(val) => {
              setValue("payload_schema", val);
              setError("payload_schema", { message: "" });
            }}
            editorOptions={{
              lineNumbers: "off",
              padding: { top: 10 },
              folding: false,
            }}
          />
        </div>
        <ErrorMessage className="mt-2">
          {errors.payload_schema?.message}
        </ErrorMessage>
      </div>

      <div className="mt-5 flex w-full items-center justify-between gap-3 px-5 pb-5">
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

          <Button
            wrapperClass="w-full md:w-auto"
            className="flex w-full items-center justify-center rounded-md px-3 py-1.5 [--border-highlight-radius:var(--radius-md)]"
            onClick={async () => {
              const isValid = await trigger([
                "http_endpoint",
                "payload_schema",
              ]);

              try {
                JSON.parse(watch("payload_schema") || "{}");
                if (isValid) nextStep();
              } catch {
                setError("payload_schema", { message: "Invalid JSON format" });
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StructureInformationForm;
