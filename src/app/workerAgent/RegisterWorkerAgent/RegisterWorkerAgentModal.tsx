import { useNavigate } from "react-router-dom";
import { EWorkerAgent, workerAgentKey } from "../../../api/workerAgents/config";
import { WorkerAgentInput } from "../../../api/workerAgents/types";
import { useRegisterWorkerAgent } from "../../../api/workerAgents/useRegisterWorkerAgent";
import { RegisterWorkerAgentSchema } from "../../../api/workerAgents/WorkerAgentSchema";
import {
  FormStep,
  FormSteps,
  MultiStepForm,
} from "../../../components/Forms/MultiStepForm";
import Modal from "../../../components/modal";
import {
  useWorkerAgent,
  useWorkerAgentActions,
} from "../../../store/workerAgentStore";
import { authArrayToObject } from "../../../utilities/transformAuthData";
import BasicInformationForm from "./BasicInformationForm";
import SecretsForm from "./SecretsForm";
import StepIndicator from "./StepIndicator";
import StructureInformationForm from "./StructureInformationForm";
import { toast } from "sonner";
import Success from "../../../components/alerts/Success";
import { AxiosError } from "axios";

const RegisterWorkerAgentModal = () => {
  const navigate = useNavigate();
  const { isRegisterWorkerAgentModalOpen } = useWorkerAgent();
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();

  const { mutateAsync: registerWorkerAgent } = useRegisterWorkerAgent({
    invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_ALL]],
  });

  return (
    <Modal
      title={"Registering your worker agent"}
      description="Connect and configure your agent to start handling tasks seamlessly."
      desktopClassName="w-full min-h-[40rem] sm:max-w-lg relative flex flex-col"
      isOpen={isRegisterWorkerAgentModalOpen}
      Trigger={() => <></>}
      setIsOpen={setIsRegisterWorkerAgentModalOpen}
    >
      <MultiStepForm
        validationSchema={RegisterWorkerAgentSchema}
        onSubmit={async (values, goto, methods) => {
          try {
            const formattedAuthData = authArrayToObject(values.agent_secrets);

            const convertedPayloadSchema = values.payload_schema
              ? JSON.parse(values.payload_schema)
              : {};

            const updatedBody: WorkerAgentInput = {
              ...values,
              payload_schema: convertedPayloadSchema,
              agent_secrets: formattedAuthData,
            };

            await registerWorkerAgent({
              body: updatedBody,
            });

            toast.custom((t) => (
              <Success
                t={t}
                title={`Registered ${values.name}`}
                description={`We have successfully registered your ${values.name} worker agent.`}
              />
            ));

            navigate("/worker-agents/all");

            setIsRegisterWorkerAgentModalOpen(false);
          } catch (error) {
            const err = error as AxiosError;

            if (err.response?.status === 409) {
              goto(0),
                methods.setError("name", {
                  message: "An agent with this name already exists.",
                });
            }
          }
        }}
        className="flex w-full flex-1 flex-col overflow-hidden"
        formOptions={{
          mode: "onTouched",
        }}
      >
        <StepIndicator />
        <FormSteps>
          <FormStep>
            <BasicInformationForm />
          </FormStep>
          <FormStep>
            <StructureInformationForm />
          </FormStep>
          <FormStep>
            <SecretsForm />
          </FormStep>
        </FormSteps>
      </MultiStepForm>
    </Modal>
  );
};

export default RegisterWorkerAgentModal;
