import { Radio, RadioGroup } from "@headlessui/react";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { IoCheckmarkCircle } from "react-icons/io5";
import { VscLock } from "react-icons/vsc";
import { z, ZodTypeAny } from "zod";
import { EMCP, mcpKey } from "../../api/mcp/config";
import { CreateMCPConnectionSchema } from "../../api/mcp/MCPSchema";
import { AuthMethod, AvailableMCPConnection } from "../../api/mcp/types";
import { useCreateMCPConnection } from "../../api/mcp/useCreateMCPConnection";
import { Button, ButtonWithLoader } from "../../components/Button";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import Label from "../../components/Forms/Label";
import TextArea from "../../components/Forms/TextArea";
import Modal from "../../components/modal";
import Spinner from "../../components/Spinner";
import { useAuth, useAuthActions } from "../../store/authStore";
import { useAppConfig } from "../../store/configurationStore";
import generateLabel from "../../utilities/generateLabel";

interface FormFieldDefinition {
  name: string;
  label: string;
  required: boolean;
  type: "text" | "password";
}

interface ConnectionModalProps {
  selectedMCPConnection: AvailableMCPConnection;
  setSelectedMCPConnection: Dispatch<
    SetStateAction<AvailableMCPConnection | null>
  >;
  isConnectionsModalOpen: boolean;
  setIsConnectionsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const ConnectionModal = ({
  selectedMCPConnection,
  setSelectedMCPConnection,
  isConnectionsModalOpen,
  setIsConnectionsModalOpen,
}: ConnectionModalProps) => {
  const { apiUrl } = useAppConfig();
  const { MCP } = useAuth();
  const { setMCP } = useAuthActions();

  const [selectedConnectionMethod, setSelectedConnectionMethod] =
    useState<AuthMethod | null>(null);
  const [oAuthFlowTriggered, setOAuthFlowTriggered] = useState(false);
  const [rootFormMethod, setRootFormMethod] =
    useState<UseFormReturn<any> | null>(null);
  const [dynamicFormFields, setDynamicFormFields] = useState<
    FormFieldDefinition[]
  >([]);
  const [dynamicValidationSchema, setDynamicValidationSchema] = useState(
    z.object({}),
  );

  const { mutateAsync: createMCPConnection } = useCreateMCPConnection({
    invalidateQueryKey: [mcpKey[EMCP.FETCH_AVAILABLE]],
  });

  useEffect(() => {
    if (selectedMCPConnection) {
      setSelectedConnectionMethod(selectedMCPConnection.auth_method[0]);
    } else {
      setSelectedConnectionMethod(null);
    }
  }, [selectedMCPConnection]);

  useEffect(() => {
    if (
      !selectedMCPConnection ||
      !selectedConnectionMethod ||
      selectedConnectionMethod === "OAUTH2"
    ) {
      setDynamicFormFields([]);
      setDynamicValidationSchema(z.object({}));
      return;
    }

    const getConfigKey = (method: AuthMethod) => {
      switch (method) {
        case "OAUTH2":
          return "OAuth2Config";
        case "API_TOKEN":
          return "APITokenConfig";
        case "BASIC_AUTH":
          return "BasicAuthConfig";
        case "CUSTOM":
          return "CustomConfig";
        default:
          return null;
      }
    };

    const configKey = getConfigKey(selectedConnectionMethod);
    if (!configKey) {
      setDynamicFormFields([]);
      setDynamicValidationSchema(z.object({}));
      return;
    }

    const credentialConfig = selectedMCPConnection.credentials.find(
      (cred) => configKey in cred,
    ) as { [K in typeof configKey]?: any };

    if (credentialConfig && credentialConfig[configKey]) {
      const currentCredentialsDesc = credentialConfig[configKey];
      const fields: FormFieldDefinition[] = [];
      const schemaShape: Record<string, ZodTypeAny> = {};

      for (const [key, valueInResponse] of Object.entries(
        currentCredentialsDesc,
      )) {
        const isRequired = valueInResponse !== null;
        const label = generateLabel(key);

        const fieldType =
          key.toLowerCase().includes("token") ||
          key.toLowerCase().includes("secret") ||
          key.toLowerCase().includes("key") ||
          key.toLowerCase().includes("password")
            ? "password"
            : "text";

        fields.push({
          name: key,
          label,
          required: isRequired,
          type: fieldType,
        });

        if (isRequired) {
          let schema = z
            .string({ required_error: `${label} is required.` })
            .trim()
            .min(1, `${label} is required.`);

          if (key.toLowerCase().includes("email")) {
            schema = schema.email({ message: "Invalid email address." });
          }
          schemaShape[key] = schema;
        } else {
          if (key.toLowerCase().includes("email")) {
            schemaShape[key] = z
              .string()
              .email({ message: "Invalid email address." })
              .or(z.literal(""))
              .optional();
          } else {
            schemaShape[key] = z.string().optional();
          }
        }
      }

      setDynamicFormFields(fields);
      setDynamicValidationSchema(z.object(schemaShape));
    } else {
      setDynamicFormFields([]);
      setDynamicValidationSchema(z.object({}));
    }
  }, [selectedMCPConnection, selectedConnectionMethod]);

  const handleOAuthFlow = async () => {
    if (!rootFormMethod) return;

    const { trigger } = rootFormMethod;
    const isValid = await trigger("name");

    if (isValid) {
      const providerName = selectedMCPConnection?.name
        .toLowerCase()
        .split(" ")
        .join("-");
      const githubMCPUrl = `${apiUrl}/${providerName}-mcp-login`;

      if (window.electronAPI?.send) {
        window.electronAPI.send("open-external-url", githubMCPUrl);
      } else {
        window.open(githubMCPUrl, "_blank");
      }
      setOAuthFlowTriggered(true);
    } else {
      rootFormMethod.setFocus("name");
    }
  };

  const handleDynamicFormSubmit = async (data: Record<string, any>) => {
    if (!rootFormMethod) return;

    const { trigger, watch, setError, setFocus } = rootFormMethod;
    const isValid = await trigger("name");

    if (!isValid) {
      setFocus("name");
      return;
    }

    const safeData = CreateMCPConnectionSchema.safeParse(data);

    if (safeData.success) {
      try {
        await createMCPConnection({
          params: {
            name: watch("name"),
            description: watch("description"),
            auth_method: selectedConnectionMethod || "OAUTH2",
            service_provider: selectedMCPConnection?.service_provider || "",
          },
          body: safeData.data,
        });

        setMCP(null);
        setOAuthFlowTriggered(false);
        setIsConnectionsModalOpen(false);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response?.status === 409) {
          setError("name", {
            message: "The name you entered already exists.",
          });
          setFocus("name");
        }
      }
    }
  };

  return (
    <Modal
      key={selectedMCPConnection?.service_provider || "create-connection-modal"}
      title={`Connect with ${selectedMCPConnection?.name || "Provider"}`}
      description="Set up integration with the tool before configuring the server."
      desktopClassName="w-full sm:max-w-lg relative"
      isOpen={isConnectionsModalOpen}
      Trigger={() => <></>}
      setIsOpen={(isOpen) => {
        setIsConnectionsModalOpen(isOpen);
        if (!isOpen) {
          setSelectedMCPConnection(null);
          setOAuthFlowTriggered(false);
          setDynamicFormFields([]);
          setDynamicValidationSchema(z.object({}));
        }
      }}
    >
      <AnimatePresence>
        {oAuthFlowTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[99] flex flex-col items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
          >
            <div className="bg-primary/50 dark:bg-primary/30 dark:text-primary w-min rounded-full p-5 text-white">
              {MCP?.access_token ? (
                <Spinner className="size-8 text-white" />
              ) : (
                <VscLock className="size-8" />
              )}
            </div>
            <h3 className="mt-3 text-lg font-medium text-white">
              {MCP?.access_token
                ? "Almost There!"
                : "Complete Authentication in Browser window"}
            </h3>
            <p className="mt-1 text-center text-xs text-balance text-white/60">
              {MCP?.access_token
                ? "We're just confirming your authentication with the provider and getting things ready for you. Hang tight!"
                : "We've opened a new browser window for you to securely sign in with your chosen provider. Please complete the authentication process there. This page will update automatically once you're done."}
            </p>
            {!MCP?.access_token && (
              <div className="mt-5 flex items-center justify-start gap-1 text-xs text-white">
                <p>Didn't see a new tab?</p>
                <Button
                  variant="ghost"
                  onClick={handleOAuthFlow}
                  className="text-secondary rounded-none p-0 text-xs hover:underline md:p-0"
                >
                  Try again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex w-full flex-1 flex-col px-5">
        <Form
          setFormMethod={setRootFormMethod}
          validationSchema={z.object({
            name: z
              .string({ required_error: "Connection name is required" })
              .min(1, "Connection name is required"),
            description: z.string().optional(),
          })}
          formOptions={{ mode: "onChange" }}
        >
          {({ register, formState: { errors } }) => (
            <>
              <Field>
                <Label>Connection name</Label>
                <Input
                  placeholder="Enter connection name"
                  className="w-full"
                  data-invalid={errors.name}
                  {...register("name")}
                />
                <ErrorMessage>{errors.name?.message}</ErrorMessage>
              </Field>
              <Field>
                <Label>Description (optional)</Label>
                <TextArea
                  rows={2}
                  placeholder="Enter description"
                  className="w-full"
                  data-invalid={errors.description}
                  {...register("description")}
                />
                <ErrorMessage>{errors.description?.message}</ErrorMessage>
              </Field>
            </>
          )}
        </Form>

        {selectedMCPConnection?.auth_method.length > 1 && (
          <>
            <label className="text-sm font-medium text-gray-800 dark:text-white">
              Authentication Method
            </label>
            <RadioGroup
              value={selectedConnectionMethod}
              onChange={setSelectedConnectionMethod}
              aria-label="Authentication Methods"
              className="mt-3 space-y-2"
              id="auth_method_selection"
            >
              {selectedMCPConnection.auth_method.map((method) => (
                <Radio
                  key={method}
                  value={method}
                  className="group dark:data-checked:bg-primary/10 data-checked:bg-secondary/40 data-checked:border-primary/70 relative flex cursor-pointer rounded-lg border border-gray-300 bg-gray-100 px-5 py-4 text-gray-800 shadow-md transition focus:not-data-focus:outline-none data-focus:outline data-focus:outline-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:data-focus:outline-white/20"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="text-sm/6 font-semibold text-gray-800 dark:text-white">
                        {generateLabel(method)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-white/60">
                        Connect using{" "}
                        {method === "OAUTH2" ? "OAuth 2.0" : "an API Token/Key"}
                        .
                      </p>
                    </div>
                    <IoCheckmarkCircle className="text-primary size-5 opacity-0 transition group-data-checked:opacity-100 dark:text-white" />
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </>
        )}

        {selectedMCPConnection?.auth_method.length === 1 &&
          selectedConnectionMethod && (
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-800 dark:text-white">
                Authentication Method
              </label>
              <p className="mt-1 rounded-md bg-gray-100 p-3 text-sm text-gray-700 dark:bg-white/10 dark:text-white/80">
                {generateLabel(selectedConnectionMethod)}
              </p>
            </div>
          )}

        <div className="mt-5 flex w-full flex-col">
          <p className="mb-2 text-[0.65rem] text-gray-600 dark:text-white/60">
            Clicking "Connect" will create an integration named "mcp-server" and
            immediately start the account connection process.
          </p>

          {selectedConnectionMethod === "OAUTH2" && (
            <div className="w-full">
              <div className="flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsConnectionsModalOpen(false)}
                  className="w-full rounded-md py-1 md:w-auto"
                >
                  Cancel
                </Button>
                <ButtonWithLoader
                  type="button"
                  onClick={handleOAuthFlow}
                  wrapperClass="w-full md:w-auto"
                  className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
                >
                  Connect & Continue
                </ButtonWithLoader>
              </div>
            </div>
          )}

          {selectedConnectionMethod &&
            selectedConnectionMethod !== "OAUTH2" && (
              <>
                {dynamicFormFields.length > 0 ? (
                  <Form
                    key={selectedConnectionMethod}
                    onSubmit={handleDynamicFormSubmit}
                    validationSchema={dynamicValidationSchema}
                  >
                    {({ register, formState: { errors, isSubmitting } }) => (
                      <>
                        {dynamicFormFields.map((field) => (
                          <Field key={field.name}>
                            <Label>
                              {field.label}
                              {!field.required && (
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  {" "}
                                  (Optional)
                                </span>
                              )}
                            </Label>
                            <Input
                              type={field.type}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="w-full"
                              data-invalid={
                                !!(errors as Record<string, any>)[field.name]
                              }
                              {...(register as (name: string) => any)(
                                field.name,
                              )}
                            />
                            <ErrorMessage>
                              {(errors as Record<string, any>)[
                                field.name
                              ]?.message?.toString()}
                            </ErrorMessage>
                          </Field>
                        ))}

                        <div className="flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                          <Button
                            type="button"
                            onClick={() => setIsConnectionsModalOpen(false)}
                            variant="secondary"
                            className="w-full rounded-md py-1 md:w-auto"
                          >
                            Cancel
                          </Button>
                          <ButtonWithLoader
                            type="submit"
                            isLoading={isSubmitting}
                            wrapperClass="w-full md:w-auto"
                            className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
                          >
                            Connect & Continue
                          </ButtonWithLoader>
                        </div>
                      </>
                    )}
                  </Form>
                ) : (
                  <p className="py-5 text-center text-sm text-gray-500 dark:text-white/60">
                    This connection method does not require additional fields.
                    Click "Connect & Continue" to proceed.
                  </p>
                )}
              </>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default ConnectionModal;
