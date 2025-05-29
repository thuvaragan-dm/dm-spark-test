import { useMemo, useState } from "react";
import {
  VscEdit,
  VscFileCode,
  VscGlobe,
  VscRobot,
  VscSearch,
  VscTrash,
  VscVerifiedFilled,
} from "react-icons/vsc";
import { z } from "zod";
import { EWorkerAgent, workerAgentKey } from "../../api/workerAgents/config";
import { WorkerAgentParams } from "../../api/workerAgents/types";
import { useCreateWorkerAgent } from "../../api/workerAgents/useCreateWorkerAgent";
import { useDeleteWorkerAgent } from "../../api/workerAgents/useDeleteWorkerAgent";
import { useGetWorkerAgents } from "../../api/workerAgents/useGetWorkerAgents";
import { useUpdateWorkerAgent } from "../../api/workerAgents/useUpdateWorkerAgent";
import { CreateWorkerAgentSchema } from "../../api/workerAgents/WorkerAgentSchema";
import {
  Button,
  ButtonVariants,
  ButtonWithLoader,
} from "../../components/Button";
import CodeEditor from "../../components/CodeEditor";
import ErrorMessage from "../../components/Forms/ErrorMessage";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import Label from "../../components/Forms/Label";
import TextArea from "../../components/Forms/TextArea";
import Modal from "../../components/modal";
import Spinner from "../../components/Spinner";
import Tooltip from "../../components/tooltip";
import { cn } from "../../utilities/cn";
import InputGroup from "../../components/Forms/InputGroup";

type AgentItem = {
  id: string;
  name: string;
  description: string;
  http_endpoint: string;
  payload_schema?: Record<string, any> | string | null;
  verification_token?: string;
};

const ViewWorkerAgents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, _setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(25);
  const [isRegisterWorkerAgentOpen, setIsRegisterWorkerAgentOpen] =
    useState(false);

  const [agentToEdit, setAgentToEdit] = useState<AgentItem | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<AgentItem | null>(null);

  const workerAgentOptions = useMemo<WorkerAgentParams>(() => {
    return {
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    };
  }, [searchQuery, page, records_per_page]);

  const { data: registeredAgents, isPending: isRegisteredAgentsLoading } =
    useGetWorkerAgents(workerAgentOptions) as {
      data?: { items: AgentItem[]; meta?: any };
      isPending: boolean;
    };

  const { mutateAsync: createWorkerAgent } = useCreateWorkerAgent({
    invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_ALL]],
  });

  const { mutate: updateWorkerAgent } = useUpdateWorkerAgent({
    invalidateQueryKey: [
      workerAgentKey[EWorkerAgent.FETCH_ALL],
      workerAgentOptions,
    ],
  });

  const { mutate: deleteWorkerAgent } = useDeleteWorkerAgent({
    invalidateQueryKey: [
      workerAgentKey[EWorkerAgent.FETCH_ALL],
      workerAgentOptions,
    ],
  });

  const handleOpenEditModal = (agent: AgentItem) => {
    setAgentToEdit(agent);
  };

  const handleCloseEditModal = () => {
    setAgentToEdit(null);
  };

  const handleOpenDeleteModal = (agent: AgentItem) => {
    setAgentToDelete(agent);
  };

  const handleCloseDeleteModal = () => {
    setAgentToDelete(null);
  };

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      {registeredAgents && registeredAgents.items.length <= 0 && <></>}

      <header className="dark:bg-primary-dark sticky top-0 z-[999] flex w-full items-center justify-between border-b border-gray-300 bg-white px-5 py-3 dark:border-white/10">
        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
          Worker agents
        </h4>
        <Modal
          title="Register worker agent"
          desktopClassName="w-full sm:max-w-lg"
          description={`Lorem ipsum dolor sit amet consectetur adipisicing elit.`}
          Trigger={() => (
            <Button
              onClick={() => setIsRegisterWorkerAgentOpen(true)}
              variant={"ghost"}
              className={
                "rounded-md bg-gray-200 px-3 py-1 text-gray-800 ring-1 ring-gray-300 ring-offset-0 hover:bg-gray-300 data-[pressed]:bg-gray-300 md:px-3 md:py-1 dark:bg-white/10 dark:text-white dark:ring-white/20 dark:hover:bg-white/20 dark:data-[pressed]:bg-white/20"
              }
            >
              Register a worker
            </Button>
          )}
          isOpen={isRegisterWorkerAgentOpen}
          setIsOpen={setIsRegisterWorkerAgentOpen}
        >
          <Form
            onSubmit={async (values) => {
              await createWorkerAgent({
                body: {
                  ...values,
                  payload_schema: values.payload_schema
                    ? JSON.parse(values.payload_schema)
                    : null,
                },
              });
              setIsRegisterWorkerAgentOpen(false);
            }}
            validationSchema={CreateWorkerAgentSchema}
            className="px-5"
          >
            {({
              register,
              watch,
              setValue,
              formState: { errors, isSubmitting },
            }) => (
              <>
                <Field>
                  <Label>Agent name</Label>
                  <Input
                    autoFocus
                    type="text"
                    placeholder="Enter agent name"
                    className="w-full"
                    data-invalid={errors.name?.message}
                    {...register("name")}
                  />
                  <ErrorMessage>{errors.name?.message}</ErrorMessage>
                </Field>
                <Field>
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Enter description"
                    className="w-full"
                    rows={2}
                    data-invalid={errors.description?.message}
                    {...register("description")}
                  />
                  <ErrorMessage>{errors.description?.message}</ErrorMessage>
                </Field>
                <Field>
                  <Label>Http Endpoint</Label>
                  <Input
                    type="text"
                    placeholder="Enter http endpoint"
                    className="w-full"
                    data-invalid={errors.http_endpoint?.message}
                    {...register("http_endpoint")}
                  />
                  <ErrorMessage>{errors.http_endpoint?.message}</ErrorMessage>
                </Field>
                <div className="mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1E1E1E]">
                  <label className="block px-2 pt-2 pb-1 text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
                    payload schema (optional)
                  </label>
                  <CodeEditor
                    className="h-44"
                    language="json"
                    value={watch("payload_schema") || ""}
                    onChange={(val) => {
                      setValue("payload_schema", val);
                    }}
                    readOnly={isSubmitting}
                    editorOptions={{
                      lineNumbers: "off",
                      padding: { top: 10 },
                      folding: false,
                    }}
                  />
                </div>
                <div className="mt-2 flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                  <Button
                    onClick={() => setIsRegisterWorkerAgentOpen(false)}
                    type="button" // Important: prevent form submission
                    className={cn(
                      ButtonVariants({ variant: "secondary" }),
                      "w-full rounded-md py-1 md:w-auto",
                    )}
                  >
                    cancel
                  </Button>
                  <ButtonWithLoader
                    type="submit"
                    isLoading={isSubmitting}
                    wrapperClass="w-full md:w-auto"
                    className={
                      "flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
                    }
                  >
                    Register
                  </ButtonWithLoader>
                </div>
              </>
            )}
          </Form>
        </Modal>
      </header>

      {!isRegisteredAgentsLoading &&
      registeredAgents &&
      registeredAgents.items.length <= 0 &&
      searchQuery.length <= 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <VscRobot className="size-24 text-gray-400 dark:text-white/30" />
          </div>

          <h2 className="mt-2 text-center text-4xl font-medium text-gray-800 dark:text-white">
            No{" "}
            <span className="text-primary dark:text-primary-500">
              Worker Agents
            </span>{" "}
            Yet?
          </h2>

          <p className="mt-1 text-center text-sm text-gray-600 dark:text-white/60">
            Get started by registering your first agent to automate repetitive
            tasks and streamline your workflows.
          </p>

          <Button
            onClick={() => setIsRegisterWorkerAgentOpen(true)}
            variant={"ghost"}
            wrapperClass="mt-5"
            className={
              "rounded-md bg-gray-200 px-3 py-1 text-gray-800 ring-1 ring-gray-300 ring-offset-0 hover:bg-gray-300 data-[pressed]:bg-gray-300 md:px-3 md:py-1 dark:bg-white/10 dark:text-white dark:ring-white/20 dark:hover:bg-white/20 dark:data-[pressed]:bg-white/20"
            }
          >
            Register Your First Worker
          </Button>
        </div>
      ) : (
        <>
          <div className="scrollbar flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-5">
            <div className="flex w-full flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center">
                <VscRobot className="size-24 text-gray-400 dark:text-white/30" />
              </div>
              <h2 className="mt-2 text-center text-4xl font-medium text-gray-800 dark:text-white">
                Smarter workflows with{" "}
                <span className="text-primary dark:text-primary-500">
                  Worker Agents
                </span>
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600 dark:text-white/60">
                Empower your team with Worker Agents handling repetitive tasks
                and accelerating project completion
              </p>
              <div className="mx-auto mt-5 w-full max-w-sm">
                <Form validationSchema={z.object({ search: z.string() })}>
                  <Field>
                    <InputGroup>
                      <VscSearch data-slot="icon" />
                      <Input
                        placeholder="Search by agent name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Field>
                </Form>
              </div>
            </div>

            {isRegisteredAgentsLoading && (
              <div className="flex flex-1 flex-col items-center justify-center">
                <Spinner className="size-4 dark:text-white" />
              </div>
            )}

            {!isRegisteredAgentsLoading &&
              registeredAgents &&
              registeredAgents?.items.length <= 0 && (
                <div className="flex w-full flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                  <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                    <VscRobot className="size-10" />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                    No worker agents found
                  </p>
                  <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                    Try adjusting your filters or reset to see all worker agents
                  </p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant={"ghost"}
                    wrapperClass="w-max"
                    className={
                      "text-primary dark:text-secondary ring-primary px-1 text-xs hover:underline md:px-1"
                    }
                  >
                    Reset filters
                  </Button>
                </div>
              )}

            {!isRegisteredAgentsLoading &&
              registeredAgents &&
              registeredAgents.items.length > 0 && (
                <div
                  className={cn(
                    "mt-10 grid w-full grid-cols-1 gap-5 gap-y-8 lg:grid-cols-2 xl:grid-cols-3 xl:gap-y-5",
                  )}
                >
                  {registeredAgents.items.map((agent: AgentItem) => (
                    <div
                      key={agent.id}
                      className={cn(
                        "relative flex w-full flex-col gap-3 rounded-xl border border-gray-300 bg-white p-3 pb-6 dark:border-white/10 dark:bg-transparent",
                      )}
                    >
                      <div className="absolute right-2 -bottom-5">
                        <div className="flex w-full items-center justify-end gap-2">
                          <Tooltip>
                            <Button
                              wrapperClass="flex items-center justify-center"
                              onClick={() => handleOpenEditModal(agent)}
                              variant={"ghost"}
                              className={
                                "dark:bg-primary-dark-foreground flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-gray-800 hover:bg-gray-100 data-[pressed]:bg-gray-100 md:p-2 dark:border-white/10 dark:text-white dark:hover:bg-[#313030] dark:data-[pressed]:bg-[#313030]"
                              }
                            >
                              <VscEdit className="size-4" />
                            </Button>
                            <Tooltip.Content placement="bottom" offset={10}>
                              <p className="text-xs text-gray-800 dark:text-white">
                                Edit
                              </p>
                              <Tooltip.Arrow />
                            </Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Button
                              onClick={() => handleOpenDeleteModal(agent)}
                              variant={"ghost"}
                              wrapperClass="flex items-center justify-center"
                              className={
                                "dark:bg-primary-dark-foreground flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-red-700 hover:bg-red-100 data-[pressed]:bg-red-100 md:p-2 dark:border-white/10 dark:text-red-700 dark:hover:bg-[#2C191A] dark:data-[pressed]:bg-[#2C191A]"
                              }
                            >
                              <VscTrash className="size-4" />
                            </Button>
                            <Tooltip.Content placement="bottom" offset={10}>
                              <p className="text-xs text-gray-800 dark:text-white">
                                Delete
                              </p>
                              <Tooltip.Arrow />
                            </Tooltip.Content>
                          </Tooltip>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "relative flex items-start justify-start gap-3",
                        )}
                      >
                        <div className="w-full">
                          <div className="flex w-full items-center justify-between gap-3">
                            <h4 className="truncate text-lg font-medium text-gray-800 dark:text-white">
                              {agent.name}
                            </h4>
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip delay={500}>
                                <Button
                                  wrapperClass="flex items-center justify-center"
                                  variant={"ghost"}
                                  className="p-1"
                                >
                                  <VscGlobe className="size-5 text-amber-700" />
                                </Button>
                                <Tooltip.Content placement="bottom" offset={10}>
                                  <div className="flex flex-col justify-center p-2">
                                    <label className="text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
                                      Https endpoint
                                    </label>
                                    <p className="text-xs break-all text-gray-800 dark:text-white">
                                      {agent.http_endpoint}
                                    </p>
                                  </div>
                                  <Tooltip.Arrow />
                                </Tooltip.Content>
                              </Tooltip>
                              <Tooltip delay={500}>
                                <Button
                                  wrapperClass="flex items-center justify-center"
                                  variant={"ghost"}
                                  className="p-1"
                                >
                                  <VscVerifiedFilled className="size-5 text-green-700" />
                                </Button>
                                <Tooltip.Content placement="bottom" offset={10}>
                                  <div className="flex flex-col justify-center p-2">
                                    <label className="text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
                                      Verification token
                                    </label>
                                    <p className="text-xs break-all text-gray-800 dark:text-white">
                                      {agent.verification_token}
                                    </p>
                                  </div>
                                  <Tooltip.Arrow />
                                </Tooltip.Content>
                              </Tooltip>
                              {agent.payload_schema &&
                                (typeof agent.payload_schema === "object" ||
                                  (typeof agent.payload_schema === "string" &&
                                    agent.payload_schema.trim() !== "")) && (
                                  <Tooltip delay={500}>
                                    <Button
                                      wrapperClass="flex rounded-none items-center justify-center"
                                      variant={"ghost"}
                                      className="p-1"
                                    >
                                      <VscFileCode className="size-5 text-pink-700" />
                                    </Button>
                                    <Tooltip.Content
                                      placement="bottom"
                                      offset={10}
                                    >
                                      <div className="w-72 overflow-hidden rounded-xl border border-white/10 bg-[#1E1E1E]">
                                        <label className="block px-2 pt-2 pb-1 text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
                                          payload schema
                                        </label>
                                        <CodeEditor
                                          language="json"
                                          value={
                                            typeof agent.payload_schema ===
                                            "string"
                                              ? agent.payload_schema
                                              : JSON.stringify(
                                                  agent.payload_schema,
                                                  null,
                                                  2,
                                                )
                                          }
                                          readOnly={true}
                                          editorOptions={{
                                            lineNumbers: "off",
                                            padding: { top: 10 },
                                            folding: false,
                                          }}
                                          className="h-44"
                                        />
                                      </div>
                                      <Tooltip.Arrow />
                                    </Tooltip.Content>
                                  </Tooltip>
                                )}
                            </div>
                          </div>
                          <p className="mt-1 line-clamp-3 text-xs text-gray-600 dark:text-white/60">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Single Edit Modal Instance */}
          {agentToEdit && (
            <Modal
              key="edit-agent-modal"
              title={"Update Worker Agent"}
              desktopClassName="w-full sm:max-w-lg"
              description={`Modify the details for agent: ${agentToEdit.name}`}
              isOpen={!!agentToEdit}
              Trigger={() => <></>}
              setIsOpen={(isOpenValue) => {
                if (!isOpenValue) {
                  handleCloseEditModal();
                }
              }}
            >
              <Form
                key={agentToEdit.id} // Ensures form re-initializes when agentToEdit changes
                onSubmit={async (values) => {
                  const formattedValues = {
                    ...values,
                    payload_schema:
                      values.payload_schema &&
                      values.payload_schema.trim() !== ""
                        ? JSON.parse(values.payload_schema)
                        : null,
                  };
                  updateWorkerAgent({
                    body: formattedValues,
                    params: { id: agentToEdit.id },
                  });
                  handleCloseEditModal();
                }}
                validationSchema={CreateWorkerAgentSchema}
                defaultValues={
                  CreateWorkerAgentSchema.safeParse({
                    ...agentToEdit,
                    payload_schema: agentToEdit.payload_schema
                      ? JSON.stringify(agentToEdit.payload_schema, null, 2)
                      : "",
                  }).success
                    ? CreateWorkerAgentSchema.safeParse({
                        ...agentToEdit,
                        payload_schema: agentToEdit.payload_schema
                          ? JSON.stringify(agentToEdit.payload_schema, null, 2)
                          : "",
                      }).data
                    : undefined
                }
                className="px-5"
              >
                {({
                  register,
                  watch,
                  setValue,
                  formState: { errors, isSubmitting },
                }) => (
                  <>
                    <Field>
                      <Label>Agent name</Label>
                      <Input
                        autoFocus
                        type="text"
                        placeholder="Enter agent name"
                        className="w-full"
                        data-invalid={errors.name?.message}
                        {...register("name")}
                      />
                      <ErrorMessage>{errors.name?.message}</ErrorMessage>
                    </Field>
                    <Field>
                      <Label>Description</Label>
                      <TextArea
                        placeholder="Enter description"
                        className="w-full"
                        rows={2}
                        data-invalid={errors.description?.message}
                        {...register("description")}
                      />
                      <ErrorMessage>{errors.description?.message}</ErrorMessage>
                    </Field>
                    <Field>
                      <Label>Http Endpoint</Label>
                      <Input
                        type="text"
                        placeholder="Enter http endpoint"
                        className="w-full"
                        data-invalid={errors.http_endpoint?.message}
                        {...register("http_endpoint")}
                      />
                      <ErrorMessage>
                        {errors.http_endpoint?.message}
                      </ErrorMessage>
                    </Field>
                    <div className="mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1E1E1E]">
                      <label className="block px-2 pt-2 pb-1 text-[0.6rem] font-medium tracking-widest text-gray-600 uppercase dark:text-white/60">
                        payload schema (optional)
                      </label>
                      <CodeEditor
                        className="h-44"
                        language="json"
                        value={watch("payload_schema") || ""}
                        onChange={(val) => setValue("payload_schema", val)}
                        readOnly={isSubmitting}
                        editorOptions={{
                          lineNumbers: "off",
                          padding: { top: 10 },
                          folding: false,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex w-full flex-col items-center justify-end gap-3 py-5 md:flex-row">
                      <Button
                        onClick={handleCloseEditModal}
                        type="button"
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
                        Save
                      </ButtonWithLoader>
                    </div>
                  </>
                )}
              </Form>
            </Modal>
          )}

          {/* Single Delete Modal Instance */}
          {agentToDelete && (
            <Modal
              key="delete-agent-modal"
              title="Delete worker agent?"
              desktopClassName="w-full max-w-md"
              description={`This will permanently delete agent: ${agentToDelete.name}. This action cannot be undone.`}
              isOpen={!!agentToDelete}
              Trigger={() => <></>}
              setIsOpen={(isOpenValue) => {
                if (!isOpenValue) {
                  handleCloseDeleteModal();
                }
              }}
            >
              <p className="px-5 pt-2 text-sm text-gray-600 dark:text-white/70">
                Are you sure you want to proceed?
              </p>
              <div className="mt-4 flex w-full flex-col items-center justify-end gap-3 px-5 pb-5 md:flex-row">
                <Button
                  onClick={handleCloseDeleteModal}
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
                    deleteWorkerAgent({ params: { id: agentToDelete.id } });
                    handleCloseDeleteModal();
                  }}
                >
                  Yes, delete agent
                </Button>
              </div>
            </Modal>
          )}
        </>
      )}
    </section>
  );
};

export default ViewWorkerAgents;
