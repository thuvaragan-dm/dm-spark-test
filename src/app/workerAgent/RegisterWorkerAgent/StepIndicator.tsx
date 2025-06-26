import { RegisterWorkerAgentSchema } from "../../../api/workerAgents/WorkerAgentSchema";
import { useMultiStepForm } from "../../../components/Forms/MultiStepForm";

const StepIndicator = () => {
  const { currentStep, totalSteps } =
    useMultiStepForm<typeof RegisterWorkerAgentSchema>();
  return (
    <div className="mb-5 w-full px-5">
      <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-gray-300 dark:bg-white/10">
        <div
          style={{ width: `${(100 / totalSteps) * (currentStep + 1)}%` }}
          className="absolute inset-y-0 left-0 rounded-full bg-gray-500 transition-all duration-200 dark:bg-white"
        ></div>
      </div>

      <p className="mt-1 text-[0.65rem] text-gray-600 dark:text-white/60">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
};

export default StepIndicator;
