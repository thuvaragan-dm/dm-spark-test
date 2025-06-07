import { Radio, RadioGroup } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdEditNote } from "react-icons/md";
import {
  VscDebugDisconnect,
  VscLock,
  VscSearch,
  VscServer,
} from "react-icons/vsc";
import { z, ZodObject, ZodTypeAny } from "zod";
import { CreateMCPConnectionSchema } from "../../api/mcp/MCPSchema";
import {
  AvailableMCPConnection,
  AvailableMCPConnectionParams,
  ConnectedMCPConnectionItem,
  ConnectedMCPGroup,
} from "../../api/mcp/types";
import { useCreateMCPConnection } from "../../api/mcp/useCreateMCPConnection";
import { useGetAvailableMCPConnections } from "../../api/mcp/useGetAvailableMCPConnections";
import {
  Button,
  ButtonVariants,
  ButtonWithLoader,
} from "../../components/Button";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import Label from "../../components/Forms/Label";
import TextArea from "../../components/Forms/TextArea";
import MCPConnectionIcon, {
  AvailableMCPProviders,
} from "../../components/MCPConnectionIcon";
import Modal from "../../components/modal";
import SlidingContainer from "../../components/SlidingContainer";
import Spinner from "../../components/Spinner";
import Tabs from "../../components/Tabs";
import Tooltip from "../../components/tooltip";
import { useAuth, useAuthActions } from "../../store/authStore";
import { cn } from "../../utilities/cn";
import Switch from "../../components/Forms/Switch";
import { useGetConnectedMCPConnections } from "../../api/mcp/useGetConnectedMCPConnections";
import { useUpdateMCPConnection } from "../../api/mcp/useUpdateMCPConnection";
import { EMCP, mcpKey } from "../../api/mcp/config";
import { AxiosError } from "axios";
import { useDeleteMCPConnection } from "../../api/mcp/useDeleteMCPConnection";
import { useToggleMCPConnectionStatus } from "../../api/mcp/useToggleMCPConnectionStatus";

// Helper to generate readable labels from field names
const generateLabel = (fieldName: string): string => {
  if (!fieldName) return "";
  return fieldName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface FormFieldDefinition {
  name: string;
  label: string;
  required: boolean;
  type: "text" | "password"; // Can be extended
}

const Mcpconnect = () => {
  const { MCP } = useAuth();
  const { setMCP } = useAuthActions();

  const [rootFormMethod, setRootFormMethod] =
    useState<UseFormReturn<any> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, _setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(25);

  const availableMCPConnectionsOptions =
    useMemo<AvailableMCPConnectionParams>(() => {
      return {
        search: searchQuery,
        page,
        records_per_page: records_per_page,
      };
    }, [searchQuery, page, records_per_page]);

  const {
    data: availableMCPConnections,
    isPending: isAvailableConnectionsLoading,
    refetch: refetchAvailableMCPConnections,
  } = useGetAvailableMCPConnections(availableMCPConnectionsOptions);

  const {
    data: connectedMCPConnections,
    isPending: isConnectedMCPConnectionsLoading,
    refetch: refetchConnectedMCPConnections,
  } = useGetConnectedMCPConnections(availableMCPConnectionsOptions);

  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

  const [selectedMCPConnection, setSelectedMCPConnection] =
    useState<AvailableMCPConnection | null>(null);

  const [selectedConnectionMethod, setSelectedConnectionMethod] = useState<
    AvailableMCPConnection["auth_method"][number] | null
  >(null);

  const [dynamicFormFields, setDynamicFormFields] = useState<
    FormFieldDefinition[]
  >([]);
  const [dynamicValidationSchema, setDynamicValidationSchema] = useState<
    ZodObject<any>
  >(z.object({}));

  useEffect(() => {
    if (selectedMCPConnection) {
      // Default to the first available auth method
      setSelectedConnectionMethod(selectedMCPConnection.auth_method[0]);
    } else {
      setSelectedConnectionMethod(null);
    }
  }, [selectedMCPConnection]);

  useEffect(() => {
    if (
      selectedMCPConnection &&
      selectedConnectionMethod &&
      selectedConnectionMethod !== "OAUTH2"
    ) {
      const authMethodIndex = selectedMCPConnection.auth_method.indexOf(
        selectedConnectionMethod,
      );

      if (
        authMethodIndex !== -1 &&
        selectedMCPConnection.credentials &&
        selectedMCPConnection.credentials[authMethodIndex]
      ) {
        const currentCredentialsDesc =
          selectedMCPConnection.credentials[authMethodIndex];
        const fields: FormFieldDefinition[] = [];
        const schemaShape: { [key: string]: ZodTypeAny } = {};

        for (const [key, valueInResponse] of Object.entries(
          currentCredentialsDesc,
        )) {
          const isRequired = valueInResponse !== null; // null means optional
          const label = generateLabel(key);

          fields.push({
            name: key,
            label: label,
            required: isRequired,
            type:
              key.toLowerCase().includes("token") ||
              key.toLowerCase().includes("secret") ||
              key.toLowerCase().includes("key") ||
              key.toLowerCase().includes("password")
                ? "password"
                : "text",
          });

          if (isRequired) {
            schemaShape[key] = z
              .string({ required_error: `${label} is required.` })
              .trim()
              .min(1, `${label} is required.`);
          } else {
            schemaShape[key] = z.string().optional();
          }
        }
        setDynamicFormFields(fields);
        setDynamicValidationSchema(z.object(schemaShape));
      } else {
        setDynamicFormFields([]);
        setDynamicValidationSchema(z.object({}));
      }
    } else {
      // Clear fields if method is OAUTH2 or no selection, or if credentials are not in the expected format
      setDynamicFormFields([]);
      setDynamicValidationSchema(z.object({}));
    }
  }, [selectedMCPConnection, selectedConnectionMethod]);

  const [oAuthFlowTriggered, setOAuthFlowTriggered] = useState(false);

  const handleOAuthFlow = async () => {
    if (rootFormMethod) {
      const { trigger } = rootFormMethod;
      const isValid = await trigger("name");

      if (isValid) {
        const githubMCPUrl = `https://dm-api-dot-dm-development-001.uc.r.appspot.com/${selectedMCPConnection?.name.toLowerCase().split(" ").join("-")}-mcp-login`; // This might need to be dynamic based on selectedMCPConnection
        if (window.electronAPI && window.electronAPI.send) {
          window.electronAPI.send("open-external-url", githubMCPUrl);
        } else {
          // Fallback for web environment
          window.open(githubMCPUrl, "_blank");
        }
        setOAuthFlowTriggered(true);
      } else {
        rootFormMethod.setFocus("name");
      }
    }
  };

  const { mutateAsync: createMCPConnection } = useCreateMCPConnection({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_AVAILABLE],
      availableMCPConnectionsOptions,
    ],
  });

  useEffect(() => {
    const handleCreateConnection = async () => {
      try {
        await createMCPConnection({
          params: {
            name: rootFormMethod?.watch("name"),
            description: rootFormMethod?.watch("description") || "",
            auth_method: selectedConnectionMethod || "OAUTH2",
            service_provider: selectedMCPConnection?.service_provider || "",
          },
          body: {
            access_token: MCP?.accessToken,
          },
        });

        setMCP(null);
        setOAuthFlowTriggered(false);
        setIsConnectionsModalOpen(false);
      } catch (error) {
        const err = error as AxiosError;

        if (err.response?.status === 409) {
          rootFormMethod?.setError("name", {
            message: "The name you entered already exists.",
          });
        }
      }
    };

    if (MCP && MCP.accessToken && oAuthFlowTriggered) {
      if (selectedConnectionMethod) {
        handleCreateConnection();
      }
    }
  }, [
    MCP,
    oAuthFlowTriggered,
    setMCP,
    setOAuthFlowTriggered,
    selectedConnectionMethod,
    createMCPConnection,
    selectedMCPConnection,
    rootFormMethod,
  ]);

  const handleDynamicFormSubmit = async (data: Record<string, any>) => {
    if (rootFormMethod) {
      const { trigger } = rootFormMethod;
      const isValid = await trigger("name");

      const safeData = CreateMCPConnectionSchema.safeParse(data);

      if (isValid) {
        if (safeData.success) {
          try {
            await createMCPConnection({
              params: {
                name: rootFormMethod?.watch("name"),
                description: rootFormMethod?.watch("description"),
                auth_method: selectedConnectionMethod || "OAUTH2",
                service_provider: selectedMCPConnection?.service_provider || "",
              },
              body: safeData.data,
            });
          } catch (error) {
            const err = error as AxiosError;

            if (err.response?.status === 409) {
              rootFormMethod.setError("name", {
                message: "The name you entered already exists.",
              });
            }
          }
        }
      } else {
        rootFormMethod.setFocus("name");
      }
    }
  };

  const [activeConnectionsTab, setActiveConnectionsTab] = useState<number>(1);

  const [
    selectedMCPConnectionForManupulation,
    setSelectedMCPConnectionForManupulation,
  ] = useState<ConnectedMCPConnectionItem | null>(null);

  const [isEditConnectionModalOpen, setIsEditConnectionModalOpen] =
    useState(false);

  const [isDeleteConnectionModalOpen, setIsDeleteConnectionModalOpen] =
    useState(false);

  const { mutateAsync: updateMCPConnection } = useUpdateMCPConnection({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_CONNECTED],
      availableMCPConnectionsOptions,
    ],
  });

  const { mutate: deleteMCPConnection } = useDeleteMCPConnection({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_CONNECTED],
      availableMCPConnectionsOptions,
    ],
  });

  const { mutate: toggleMCPStatus } = useToggleMCPConnectionStatus({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_CONNECTED],
      availableMCPConnectionsOptions,
    ],
  });

  const [selectedMCPGroupForManuplation, setSelectedMCPGroupForManuplation] =
    useState<ConnectedMCPGroup | null>(null);

  useEffect(() => {
    if (activeConnectionsTab === 1) {
      refetchConnectedMCPConnections();
    } else {
      refetchAvailableMCPConnections();
    }
  }, [
    activeConnectionsTab,
    refetchAvailableMCPConnections,
    refetchConnectedMCPConnections,
  ]);

  return (
    <>
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <header className="dark:bg-primary-dark sticky top-0 z-[999] flex w-full items-center justify-between border-b border-gray-300 bg-white px-5 py-3 dark:border-white/10">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">
            MCP Servers
          </h4>
        </header>

        <div className="scrollbar flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="flex w-full flex-col items-center justify-center px-5 py-16">
            <div className="flex items-center justify-center">
              <VscServer className="size-24 text-gray-400 dark:text-white/30" />
            </div>
            <h2 className="mt-2 text-center text-4xl font-medium text-gray-800 dark:text-white">
              Unified Management with{" "}
              <span className="text-primary dark:text-primary-500">
                MCP Server connect
              </span>
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600 dark:text-white/60">
              Connect to and oversee your MCP servers for streamlined operations
              and centralized resource access.
            </p>
            <div className="mx-auto mt-5 w-full max-w-sm">
              <Form validationSchema={z.object({ search: z.string() })}>
                <Field>
                  <InputGroup>
                    <VscSearch data-slot="icon" />
                    <Input
                      placeholder="Search by mcp name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Field>
              </Form>
            </div>
          </div>

          {!isAvailableConnectionsLoading && (
            <div className="flex flex-1 flex-col">
              <div className="w-full px-5">
                <Tabs
                  className="w-min rounded-lg border border-gray-300 bg-transparent p-1 dark:border-white/10 dark:bg-white/5"
                  tabs={[
                    { id: 1, Label: "Your Connections" },
                    { id: 2, Label: "Other Connections" },
                  ]}
                  bubbleBorderRadius="4px"
                  buttonClass="data-[active=true]:text-primary dark:data-[active=true]:text-white data-[active=false]:hover:text-primary/80 dark:data-[active=false]:hover:text-white text-primary/80 dark:text-white/60 hover:text-primary/80 dark:hover:text-white"
                  bubbleClass="bg-secondary dark:bg-white/20"
                  activeTab={activeConnectionsTab}
                  setActiveTab={setActiveConnectionsTab}
                />
              </div>

              <SlidingContainer active={activeConnectionsTab} className="pb-5">
                {activeConnectionsTab === 1 && (
                  <>
                    {isConnectedMCPConnectionsLoading && (
                      <div className="flex flex-1 flex-col items-center justify-center p-5">
                        <Spinner className="size-5 dark:text-white" />
                      </div>
                    )}

                    {!isConnectedMCPConnectionsLoading &&
                      connectedMCPConnections && (
                        <div
                          className={cn(
                            "mt-10 grid w-full grid-cols-1 gap-5 gap-y-8 px-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-y-5",
                          )}
                        >
                          {connectedMCPConnections.items.map((connection) => (
                            <div className="flex flex-col overflow-hidden rounded-lg border border-gray-300 dark:border-white/10">
                              <div className="flex items-start justify-start gap-3 p-3">
                                <div className="dark:ring-offset-primary-dark-foreground flex aspect-square items-center justify-center rounded-md border border-gray-300 bg-white p-1 shadow-lg ring ring-gray-300 ring-offset-1 ring-offset-gray-100 dark:border-white dark:ring-white/20">
                                  <MCPConnectionIcon
                                    icon={
                                      connection.name as AvailableMCPProviders
                                    }
                                  />
                                </div>

                                <div className="w-full">
                                  <h3 className="w-full truncate text-xl font-medium text-gray-800 dark:text-white">
                                    {connection.name}
                                  </h3>

                                  <p className="text-xs text-gray-600 dark:text-white/60">
                                    Below are the list of all connected
                                    accounts.
                                  </p>

                                  <div className="mt-8 flex w-full flex-col space-y-8">
                                    {connection.connections.map((mcp) => (
                                      <div
                                        key={mcp.id}
                                        className="relative w-full flex-1 rounded-md border border-gray-300 bg-white p-2 dark:border-white/5 dark:bg-white/2"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="w-max shrink-0 rounded-sm bg-amber-100 px-1 py-2 text-[0.6rem] leading-0 tracking-wider text-amber-600 uppercase dark:bg-amber-600/10">
                                            {mcp.auth_method}
                                          </div>

                                          {/* controls */}
                                          <div className="absolute -top-5 right-2 flex items-center justify-end gap-1 rounded-md border border-gray-300 bg-white pl-1.5 dark:border-white/10 dark:bg-[#1E1E1E]">
                                            <Tooltip delay={700}>
                                              <Button
                                                onClick={() => {
                                                  setSelectedMCPConnectionForManupulation(
                                                    mcp,
                                                  );
                                                  setIsEditConnectionModalOpen(
                                                    true,
                                                  );
                                                }}
                                                wrapperClass="flex items-center justify-center"
                                                variant={"ghost"}
                                                className="rounded-sm p-0.5 hover:bg-sky-100 md:p-0.5 dark:hover:bg-sky-600/10"
                                              >
                                                <MdEditNote className="size-5 text-sky-700" />
                                              </Button>
                                              <Tooltip.Content
                                                placement="bottom"
                                                offset={10}
                                              >
                                                <p className="text-xs text-gray-800 dark:text-white">
                                                  Edit connection
                                                </p>
                                                <Tooltip.Arrow />
                                              </Tooltip.Content>
                                            </Tooltip>

                                            <Tooltip delay={700}>
                                              <Button
                                                onClick={() => {
                                                  setSelectedMCPConnectionForManupulation(
                                                    mcp,
                                                  );
                                                  setSelectedMCPGroupForManuplation(
                                                    connection,
                                                  );
                                                  setIsDeleteConnectionModalOpen(
                                                    true,
                                                  );
                                                }}
                                                wrapperClass="flex items-center justify-center"
                                                variant={"ghost"}
                                                className="rounded-sm p-1 hover:bg-red-100 md:p-1 dark:hover:bg-red-600/10"
                                              >
                                                <VscDebugDisconnect className="size-4 text-red-700" />
                                              </Button>
                                              <Tooltip.Content
                                                placement="bottom"
                                                offset={10}
                                              >
                                                <p className="text-xs text-gray-800 dark:text-white">
                                                  Disconnect
                                                </p>
                                                <Tooltip.Arrow />
                                              </Tooltip.Content>
                                            </Tooltip>

                                            <Form
                                              validationSchema={z.object({
                                                isActive: z.boolean(),
                                              })}
                                            >
                                              <Field>
                                                <Switch
                                                  onChange={(value) => {
                                                    toggleMCPStatus({
                                                      params: {
                                                        id: mcp.id,
                                                        name: connection.name,
                                                      },
                                                      body: {
                                                        enable: value,
                                                      },
                                                    });
                                                  }}
                                                  isSelected={mcp.is_active}
                                                  className={
                                                    "origin-bottom scale-[70%]"
                                                  }
                                                  switchClass="group-data-[selected]:bg-green-600"
                                                />
                                              </Field>
                                            </Form>
                                          </div>
                                          {/* controls */}
                                        </div>

                                        <h5 className="mt-2 text-xs font-medium text-gray-800 dark:text-white">
                                          {mcp.name}
                                        </h5>

                                        {mcp.description && (
                                          <p className="mt-1 text-[0.65rem] text-gray-600 dark:text-white/50">
                                            {mcp.description}
                                          </p>
                                        )}

                                        <div className="mt-3">
                                          <p className="text-[0.6rem] tracking-wider text-gray-600 uppercase dark:text-white/60">
                                            workspace id
                                          </p>
                                          <span className="rounded-sm border border-sky-300 bg-sky-100 p-0.5 text-[0.6rem] text-sky-600 dark:border-sky-300/10 dark:bg-sky-700/10">
                                            {mcp.workspace_id}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </>
                )}

                {activeConnectionsTab === 2 && (
                  <>
                    {isAvailableConnectionsLoading && (
                      <div className="flex flex-1 flex-col items-center justify-center p-5">
                        <Spinner className="size-5 dark:text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "mt-10 grid w-full grid-cols-1 gap-5 gap-y-8 px-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-y-5",
                      )}
                    >
                      {availableMCPConnections &&
                        availableMCPConnections.items.map((connection) => (
                          <div
                            key={connection.service_provider}
                            className="flex flex-col overflow-hidden rounded-lg border border-gray-300 dark:border-white/10"
                          >
                            <div className="flex items-start justify-start gap-3 p-3">
                              <div className="dark:ring-offset-primary-dark-foreground flex aspect-square items-center justify-center rounded-md border border-gray-300 bg-white p-1 shadow-lg ring ring-gray-300 ring-offset-1 ring-offset-gray-100 dark:border-white dark:ring-white/20">
                                <MCPConnectionIcon
                                  icon={
                                    connection.name
                                      .toLowerCase()
                                      .split(" ")
                                      .join("_") as AvailableMCPProviders
                                  }
                                />
                              </div>
                              <div>
                                <div className="flex w-full items-center justify-start gap-3 truncate">
                                  <h3 className="w-full truncate text-xl font-medium text-gray-800 dark:text-white">
                                    {connection.name}
                                  </h3>
                                </div>
                                <p className="mt-1 text-[0.65rem] text-gray-600 dark:text-white/50">
                                  {/* Using a placeholder description, ideally this would come from API or be more specific */}
                                  Connect to your {connection.name} account.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end border-t border-gray-300 bg-gray-200/60 p-3 dark:border-white/10 dark:bg-white/5">
                              <Button
                                onClick={() => {
                                  setSelectedMCPConnection(connection);
                                  setIsConnectionsModalOpen(true);
                                }}
                                variant={"ghost"}
                                wrapperClass="flex items-center justify-center"
                                className={
                                  "dark:bg-primary-dark-foreground dark:hover:bg-primary-dark-foreground/80 flex items-center justify-center gap-2 rounded-md border border-gray-300 p-2 hover:bg-white md:p-2 dark:border-white/10 dark:text-white"
                                }
                              >
                                <VscDebugDisconnect className="size-5" />
                                <p>Connect</p>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </SlidingContainer>
            </div>
          )}
        </div>
      </section>

      <Modal
        key={
          selectedMCPConnection?.service_provider || "create-connection-modal"
        }
        title={`Connect with ${selectedMCPConnection?.name || "Provider"}`}
        description={
          "Set up integration with the tool before configuring the server." // This description can be dynamic too
        }
        desktopClassName="w-full sm:max-w-lg relative"
        isOpen={isConnectionsModalOpen}
        Trigger={() => <></>}
        setIsOpen={(isOpen) => {
          setIsConnectionsModalOpen(isOpen);
          if (!isOpen) {
            // Reset states when modal closes
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
                {MCP && MCP.accessToken ? (
                  <Spinner className="size-8 text-white" />
                ) : (
                  <VscLock className="size-8" />
                )}
              </div>
              <h3 className="mt-3 text-lg font-medium text-white">
                {MCP && MCP.accessToken
                  ? "Almost There!"
                  : "Complete Authentication in Browser window"}
              </h3>
              <p className="mt-1 text-center text-xs text-balance text-white/60">
                {MCP && MCP.accessToken ? (
                  "We're just confirming your authentication with the provider and getting things ready for you. Hang tight!"
                ) : (
                  <span>
                    We've opened a new browser window for you to securely sign
                    in with your chosen provider. Please complete the
                    authentication process there. <br /> This page will update
                    automatically once you're done.
                  </span>
                )}
              </p>
              {!(MCP && MCP.accessToken) && (
                <div className="mt-5 flex items-center justify-start gap-1 text-xs text-white">
                  <p>Didn't see a new tab?</p>
                  <Button
                    variant={"ghost"}
                    onClick={handleOAuthFlow}
                    className={
                      "text-secondary rounded-none p-0 text-xs hover:underline md:p-0"
                    }
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
                    placeholder={"Enter connection name"}
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
                    placeholder={"Enter description"}
                    className="w-full"
                    data-invalid={errors.description}
                    {...register("description")}
                  />
                  <ErrorMessage>{errors.description?.message}</ErrorMessage>
                </Field>
              </>
            )}
          </Form>

          {selectedMCPConnection &&
            selectedMCPConnection.auth_method.length > 1 && (
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
                            {generateLabel(method)}{" "}
                            {/* Using generateLabel for display */}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-white/60">
                            {/* Placeholder description, could be dynamic */}
                            Connect using{" "}
                            {method === "OAUTH2"
                              ? "OAuth 2.0"
                              : "an API Token/Key"}
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

          {selectedMCPConnection &&
            selectedMCPConnection.auth_method.length === 1 &&
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
              Clicking "Connect" will create an integration named "mcp-server"{" "}
              and immediately start the account connection process.
            </p>

            {selectedConnectionMethod === "OAUTH2" && (
              <div className="w-full">
                <div className="flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                  <Button
                    type="button"
                    onClick={() => setIsConnectionsModalOpen(false)}
                    className={cn(
                      ButtonVariants({ variant: "secondary" }),
                      "w-full rounded-md py-1 md:w-auto",
                    )}
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
              selectedConnectionMethod !== "OAUTH2" &&
              dynamicFormFields.length > 0 && (
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
                            {field.required ? null : (
                              <span className="text-xs text-gray-500 dark:text-white/50">
                                {" "}
                                (Optional)
                              </span>
                            )}
                          </Label>
                          <Input
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full" // Added margin top for spacing
                            data-invalid={errors[field.name]}
                            {...register(field.name)}
                          />
                          <ErrorMessage>
                            {errors[field.name]?.message?.toString()}
                          </ErrorMessage>
                        </Field>
                      ))}

                      <div className="flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                        <Button
                          type="button"
                          onClick={() => setIsConnectionsModalOpen(false)}
                          className={cn(
                            ButtonVariants({ variant: "secondary" }),
                            "w-full rounded-md py-1 md:w-auto",
                          )}
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
              )}

            {selectedConnectionMethod &&
              selectedConnectionMethod !== "OAUTH2" &&
              dynamicFormFields.length === 0 && (
                <p className="py-5 text-center text-sm text-gray-500 dark:text-white/60">
                  This connection method does not require additional fields.
                  Click "Connect & Continue" to proceed.
                </p>
              )}
          </div>
        </div>
      </Modal>

      <Modal
        key={
          selectedMCPConnectionForManupulation?.service_provider + "edit" ||
          "edit-connection-modal"
        }
        title={`Edit ${selectedMCPConnectionForManupulation?.name || "Provider"}`}
        description={
          "Set up integration with the tool before configuring the server." // This description can be dynamic too
        }
        desktopClassName="w-full sm:max-w-lg relative"
        isOpen={isEditConnectionModalOpen}
        Trigger={() => <></>}
        setIsOpen={(isOpen) => {
          setIsEditConnectionModalOpen(isOpen);
          if (!isOpen) {
            setSelectedMCPConnectionForManupulation(null);
          }
        }}
      >
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
            defaultValues={{
              name: selectedMCPConnectionForManupulation?.name || "",
              description:
                selectedMCPConnectionForManupulation?.description || "",
            }}
            onSubmit={async (values, methods) => {
              try {
                await updateMCPConnection({
                  params: {
                    id: selectedMCPConnectionForManupulation?.id || "",
                  },
                  body: {
                    name: values.name,
                    description: values.description,
                  },
                });
                setIsEditConnectionModalOpen(false);
              } catch (error) {
                const err = error as AxiosError;

                if (err.response?.status === 409) {
                  methods.setError("name", {
                    message: "The name you entered already exists.",
                  });
                }
              }
            }}
          >
            {({ register, formState: { errors } }) => (
              <>
                <Field>
                  <Label>Connection name</Label>
                  <Input
                    placeholder={"Enter connection name"}
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
                    placeholder={"Enter description"}
                    className="w-full"
                    data-invalid={errors.description}
                    {...register("description")}
                  />
                  <ErrorMessage>{errors.description?.message}</ErrorMessage>
                </Field>

                <div className="flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                  <Button
                    type="button"
                    onClick={() => setIsEditConnectionModalOpen(false)}
                    className={cn(
                      ButtonVariants({ variant: "secondary" }),
                      "w-full rounded-md py-1 md:w-auto",
                    )}
                  >
                    Cancel
                  </Button>
                  <ButtonWithLoader
                    type="submit"
                    wrapperClass="w-full md:w-auto"
                    className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
                  >
                    Save connection
                  </ButtonWithLoader>
                </div>
              </>
            )}
          </Form>
        </div>
      </Modal>

      <Modal
        key="delete-mcp-connection-modal"
        title="Disconnect mcp connection?"
        desktopClassName="w-full max-w-md"
        description={`This will permanently disconnect: ${selectedMCPConnectionForManupulation?.name}.`}
        isOpen={isDeleteConnectionModalOpen}
        Trigger={() => <></>}
        setIsOpen={(isOpenValue) => {
          if (!isOpenValue) {
            setIsDeleteConnectionModalOpen(false);
            setSelectedMCPConnectionForManupulation(null);
          }
        }}
      >
        <p className="px-5 pt-2 text-sm text-gray-600 dark:text-white/70">
          Are you sure you want to proceed?
        </p>
        <div className="mt-4 flex w-full flex-col items-center justify-end gap-3 px-5 pb-5 md:flex-row">
          <Button
            onClick={() => setIsDeleteConnectionModalOpen(false)}
            type="button"
            className={cn(
              ButtonVariants({ variant: "secondary" }),
              "w-full rounded-md py-1 md:w-auto",
            )}
          >
            Cancel
          </Button>
          <Button
            wrapperClass="w-full md:w-auto"
            className="w-full rounded-md py-1 [--border-highlight-radius:var(--radius-sm)] md:w-auto"
            variant={"danger"}
            onClick={() => {
              deleteMCPConnection({
                params: {
                  id: selectedMCPConnectionForManupulation?.id || "",
                  name: selectedMCPGroupForManuplation?.name || "",
                },
              });
              setIsDeleteConnectionModalOpen(false);
              setSelectedMCPConnectionForManupulation(null);
            }}
          >
            disconnect MCP connection
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Mcpconnect;
