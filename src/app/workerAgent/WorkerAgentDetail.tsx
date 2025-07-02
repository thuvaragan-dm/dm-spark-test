import { format, formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { IoAddCircle, IoCheckmark, IoGlobeOutline } from "react-icons/io5";
import { VscTrash } from "react-icons/vsc";
import { useNavigate, useParams } from "react-router-dom";
import { EWorkerAgent, workerAgentKey } from "../../api/workerAgents/config";
import { useDeleteWorkerAgent } from "../../api/workerAgents/useDeleteWorkerAgent";
import { useGetWorkerAgent } from "../../api/workerAgents/useGetWorkerAgent";
import { useUpdateWorkerAgentAvatar } from "../../api/workerAgents/useUpdateWorkerAgentAvatar";
import workerAgentsBanner from "../../assets/worker_agents_banner.jpg";
import Avatar from "../../components/Avatar";
import { Button, ButtonWithLoader } from "../../components/Button";
import Dropdown from "../../components/dropdown";
import MCPConnectionIcon from "../../components/MCPConnectionIcon";
import { MermaidDiagram } from "../../components/MermaidDiagram";
import Modal from "../../components/modal";
import SlidingContainer from "../../components/SlidingContainer";
import Spinner from "../../components/Spinner";
import Tabs from "../../components/Tabs";
import Tooltip from "../../components/tooltip";
import useImageUpload from "../../hooks/useImageUpload";
import { cn } from "../../utilities/cn";
import copyTextToClipboard from "../../utilities/copyToClipboard";
import UpdateBasicInformation from "./updateWorkerAgents/UpdateBasicInformation";
import UpdateSecretsForm from "./updateWorkerAgents/UpdateSecretsForm";
import { usePublishWorkerAgent } from "../../api/workerAgents/usePublishWorkerAgent";
import { toast } from "sonner";
import Success from "../../components/alerts/Success";
import { useGetWorkerAgentSecrets } from "../../api/workerAgents/useGetWorkerAgentSecrets";
import { useAppConfig } from "../../store/configurationStore";

const WorkerAgentDetail = () => {
  const { apiUrl } = useAppConfig();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: workerAgent, isPending: isWorkerAgentLoading } =
    useGetWorkerAgent({ id: id || "" });

  const { mutateAsync: uploadAvatar, isPending: isAvatarLoading } =
    useUpdateWorkerAgentAvatar({
      invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_SINGLE] + id],
    });

  const { data: secrets, isLoading: isSecretsLoading } =
    useGetWorkerAgentSecrets({ worker_agent_id: id || "" });

  const {
    mutateAsync: publishWorkerAgent,
    isPending: isPublishWorkerAgentLoading,
  } = usePublishWorkerAgent({
    invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_SINGLE] + id],
  });

  const [isDeleteWorkerAgentModalOpen, setIsDeleteWorkerAgentModalOpen] =
    useState(false);

  const { mutate: deleteWorkerAgent } = useDeleteWorkerAgent({
    invalidateQueryKey: [
      workerAgentKey[EWorkerAgent.FETCH_ALL],
      {
        search: "",
        page: 1,
        records_per_page: 25,
      },
    ],
  });

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState(1);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { getRootProps, getInputProps, open } = useImageUpload({
    onDropHandle: async (file) => {
      await uploadAvatar({
        body: {
          uploaded_picture: file,
        },
        params: {
          worker_agent_id: id || "",
        },
      });
    },
  });

  return (
    <section className="dark:bg-primary-dark-foreground flex w-full flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/20"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={workerAgentsBanner}
            alt="Worker agents banner image"
          />
        </div>

        {secrets &&
          workerAgent &&
          !isWorkerAgentLoading &&
          !isSecretsLoading && (
            <div className="absolute top-0 right-0 left-0 z-20 m-3">
              <div className="flex items-center justify-end gap-3">
                {workerAgent?.http_endpoint && (
                  <div className="flex w-max max-w-sm min-w-0 shrink items-center justify-center gap-2 rounded-lg border border-white px-3 py-1.5">
                    <IoGlobeOutline className="size-4 shrink-0 text-white" />
                    <p className="shrink truncate text-xs text-white">
                      {workerAgent.http_endpoint}
                    </p>
                    <CopyButton content={workerAgent.http_endpoint} />
                  </div>
                )}

                {workerAgent?.github_metadata?.published_commit_hash &&
                  workerAgent?.github_metadata?.published_at && (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-white px-3 py-1.5">
                      <div className="rounded-full bg-white p-0.5">
                        <MCPConnectionIcon
                          icon="GitHubMCP"
                          className="size-4"
                        />
                      </div>

                      <p className="text-xs text-white">
                        {workerAgent.github_metadata.published_commit_hash.substring(
                          0,
                          7,
                        )}
                      </p>
                      <p className="text-xs text-white">&middot;</p>
                      <p className="text-xs text-white">
                        {formatDistanceToNow(
                          new Date(workerAgent.github_metadata.published_at),
                          {
                            addSuffix: true,
                          },
                        )}
                      </p>
                    </div>
                  )}

                {(!workerAgent?.github_metadata ||
                  !workerAgent?.github_metadata?.published_commit_hash) && (
                  <Button
                    onClick={() => {
                      const url = `${apiUrl}/github-worker-agent-login?blue_print_reference_link=${workerAgent.github_metadata?.github_reference_link}&worker_agent_id=${workerAgent.id}&workspace_id=${workerAgent.workspace_id}`;
                      if (window.electronAPI && window.electronAPI.send) {
                        // Send a message to the main process to open the URL
                        window.electronAPI.send("open-external-url", url);
                      }
                    }}
                    wrapperClass="w-min"
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 whitespace-nowrap [--border-highlight-radius:var(--radius-lg)]"
                  >
                    <div className="rounded-sm bg-white p-0.5 shadow-inner">
                      <MCPConnectionIcon
                        icon={"GitHubMCP"}
                        className="size-4 text-black"
                      />
                    </div>
                    Sync with your Github
                  </Button>
                )}

                <ButtonWithLoader
                  onClick={async () => {
                    await publishWorkerAgent({
                      params: {
                        worker_agent_id: id || "",
                      },
                    });

                    toast.custom((t) => (
                      <Success
                        t={t}
                        title={`Published ${workerAgent?.name}`}
                        description={`We have successfully pushlished your ${workerAgent?.name} worker agent.`}
                      />
                    ));
                  }}
                  isLoading={isPublishWorkerAgentLoading}
                  variant={"secondary"}
                  className={"rounded-lg px-3 py-1.5 md:px-3 md:py-1.5"}
                >
                  {isPublishWorkerAgentLoading ? "Publishing" : "Publish"}
                </ButtonWithLoader>

                <Dropdown
                  open={isContextMenuOpen}
                  onOpenChange={setIsContextMenuOpen}
                >
                  <Dropdown.Button
                    className={cn(
                      "cursor-pointer rounded-full border border-white p-1 text-white hover:bg-white/10",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="currentColor"
                        d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0m5.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0m7-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3"
                      />
                    </svg>
                  </Dropdown.Button>

                  <Dropdown.Menu
                    align="end"
                    side="bottom"
                    alignOffset={-4}
                    sideOffset={5}
                    className="dark:bg-primary-dark/60 w-44 rounded-xl bg-gray-100/60 p-1 shadow-xl ring-[1px] ring-gray-300 dark:ring-white/10"
                  >
                    <Dropdown.Item
                      color="rgb(220,38,38)"
                      highlightColor="rgba(220,38,38,0.2)"
                      className="inline-flex w-full items-center gap-2 rounded-[calc(var(--radius-xl)-(--spacing(1)))] py-1.5 text-red-600 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-600"
                      onSelect={() => {
                        setIsDeleteWorkerAgentModalOpen(true);
                      }}
                    >
                      <VscTrash className="size-5" />
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          )}
      </header>

      {(isWorkerAgentLoading || isSecretsLoading) && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5" />
        </div>
      )}

      {!isWorkerAgentLoading && !isSecretsLoading && workerAgent && secrets && (
        <>
          <div className="mt-5 flex w-full items-end justify-between px-5">
            <div className="flex items-start justify-start gap-3">
              <div
                {...getRootProps()}
                className={cn(
                  "bg-secondary relative size-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md",
                  {
                    "pointer-events-none animate-pulse": isAvatarLoading,
                  },
                )}
              >
                {/* upload agent avatar button */}
                <input className="sr-only" type="file" {...getInputProps()} />
                <Button
                  onClick={open}
                  wrapperClass="size-full absolute inset-0 z-30"
                  variant={"ghost"}
                  className={cn(
                    "group relative flex size-full items-center justify-center overflow-hidden rounded-none bg-transparent p-0 md:p-0",
                  )}
                >
                  <div
                    className={cn(
                      "group-hover:bg-secondary/45 absolute inset-0 z-30 bg-transparent",
                    )}
                  ></div>
                  <div
                    className={cn(
                      "absolute inset-0 z-40 flex items-center justify-center bg-transparent opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <IoAddCircle className="size-8 text-white" />
                  </div>
                </Button>

                {isAvatarLoading && (
                  <div className="absolute inset-0 z-40 flex size-full items-center justify-center">
                    <Spinner className="size-4 text-white" />
                  </div>
                )}
                {/* upload agent avatar button */}

                <div className="aspect-square size-16 shrink-0 overflow-hidden">
                  <Avatar
                    src={workerAgent.agent_avatar_url || ""}
                    alt="Agent image"
                    className="flex aspect-square size-16 w-full shrink-0 items-center justify-center rounded-none object-cover"
                    Fallback={() => (
                      <Avatar.Fallback className="bg-secondary size-16 rounded-none text-xs text-white dark:text-white">
                        {workerAgent.name?.[0]} {workerAgent.name?.[1]}
                      </Avatar.Fallback>
                    )}
                  />
                </div>
              </div>

              <div className="w-full max-w-sm">
                <h3 className="text-3xl font-medium text-gray-800 dark:text-white">
                  {workerAgent.name}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                  {workerAgent.description}
                </p>
                <div className="mt-2 flex items-center justify-start gap-3">
                  <span className="w-min shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                    {workerAgent.category}
                  </span>

                  <p className="text-[0.65rem] text-gray-600 dark:text-white/60">
                    Last Updated{" "}
                    {format(new Date(workerAgent.updated_at), "do MMMM, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <Button
                onClick={() => setIsUpdateModalOpen(true)}
                variant={"ghost"}
                className={
                  "rounded-lg border border-white px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 md:px-3 md:py-1.5"
                }
              >
                Edit
              </Button>
            </div>
          </div>

          <div className="scrollbar mt-10 flex w-full flex-1 flex-col overflow-y-auto">
            {/* tab */}
            <div className="w-min px-5">
              <Tabs
                activeTab={selectedTab}
                setActiveTab={setSelectedTab}
                tabs={[
                  {
                    id: 1,
                    Label: "Workflow",
                  },
                  {
                    id: 2,
                    Label: "Secrets",
                  },
                ]}
                className="rounded-lg bg-gray-300 p-1 dark:bg-white/10"
                bubbleBorderRadius="5px"
                buttonClass=" text-gray-600 dark:text-white/60 data-[active=true]:text-primary dark:data-[active=true]:text-gray-800"
              />
            </div>
            {/* tab */}

            <div className="flex flex-1 flex-col">
              <SlidingContainer
                active={selectedTab}
                wrapperClass="overflow-hidden"
                className="flex flex-1 flex-col overflow-hidden"
              >
                {/* workflow */}
                {selectedTab === 1 && (
                  <div className="flex flex-1 flex-col space-y-5 p-5">
                    <div className="flex w-full flex-1 flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        Overview
                      </h3>

                      <p className="mt-2 text-sm/6 text-gray-700 dark:text-white/80">
                        {workerAgent.overview}
                      </p>
                    </div>

                    {workerAgent.workflow_graph && (
                      <div className="flex min-h-[40dvh] w-full flex-1 flex-col overflow-hidden rounded-2xl bg-white p-5 dark:bg-white/5">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                          Workflow graph
                        </h3>

                        <div className="scrollbar mt-5 flex w-full flex-1 justify-start overflow-auto rounded-xl">
                          <div className="min-w-full">
                            <MermaidDiagram>
                              {workerAgent.workflow_graph}
                            </MermaidDiagram>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* workflow */}

                {/* secrets */}
                {selectedTab === 2 && (
                  <div className="flex flex-1 flex-col space-y-5 p-5">
                    <div className="flex w-full flex-1 flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        Secrets
                      </h3>

                      <p className="mt-1 text-sm/6 text-gray-700 dark:text-white/80">
                        The hidden protocols behind the ones who keep everything
                        running.
                      </p>

                      <div className="flex w-full max-w-xl flex-col">
                        <UpdateSecretsForm />
                      </div>
                    </div>
                  </div>
                )}
                {/* secrets */}
              </SlidingContainer>
            </div>
          </div>

          <Modal
            key="delete-worker-agent-modal"
            title="Delete Worker Agent?"
            desktopClassName="w-full max-w-md"
            description={`This will permanently delete: ${workerAgent.name}.`}
            isOpen={isDeleteWorkerAgentModalOpen}
            Trigger={() => <></>}
            setIsOpen={setIsDeleteWorkerAgentModalOpen}
          >
            <p className="px-5 pt-2 text-sm text-gray-600 dark:text-white/70">
              Are you sure you want to proceed?
            </p>
            <div className="mt-5 flex w-full flex-col items-center justify-end gap-3 px-5 pb-5 md:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteWorkerAgentModalOpen(false)}
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md px-3 py-1"
              >
                Cancel
              </Button>
              <Button
                wrapperClass="w-full md:w-auto"
                className="w-full rounded-md py-1 [--border-highlight-radius:var(--radius-sm)] md:w-auto"
                variant={"danger"}
                onClick={() => {
                  deleteWorkerAgent({
                    params: {
                      id: id || "",
                    },
                  });
                  setIsDeleteWorkerAgentModalOpen(false);
                  navigate("/worker-agents/all");
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </Modal>

          <Modal
            title={`Update ${workerAgent.name}`}
            description="Connect and configure your agent to start handling tasks seamlessly."
            desktopClassName="w-full min-h-[40rem] sm:max-w-lg relative flex flex-col"
            isOpen={isUpdateModalOpen}
            Trigger={() => <></>}
            setIsOpen={setIsUpdateModalOpen}
          >
            <div className="w-full px-5">
              <UpdateBasicInformation
                defaultValues={{
                  name: workerAgent.name,
                  description: workerAgent.description,
                  category: workerAgent.category || "",
                  overview: workerAgent.overview,
                }}
                isOpen={isUpdateModalOpen}
                setIsOpen={setIsUpdateModalOpen}
              />
            </div>
          </Modal>
        </>
      )}
    </section>
  );
};

const CopyButton = ({ content }: { content: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Tooltip>
      <Button
        variant={"ghost"}
        onClick={async () => {
          setIsCopied(true);
          await copyTextToClipboard(content);
          setTimeout(() => {
            setIsCopied(false);
          }, 800);
        }}
        wrapperClass="flex"
        className={cn("rounded-full p-0 md:p-0", {
          "text-green-600": isCopied,
          "text-white": !isCopied,
        })}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {!isCopied ? (
            <motion.div
              key={"copy"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 stroke-[2]"
              >
                <rect
                  x="3"
                  y="8"
                  width="13"
                  height="13"
                  rx="4"
                  stroke="currentColor"
                ></rect>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13 2.00004L12.8842 2.00002C12.0666 1.99982 11.5094 1.99968 11.0246 2.09611C9.92585 2.31466 8.95982 2.88816 8.25008 3.69274C7.90896 4.07944 7.62676 4.51983 7.41722 5.00004H9.76392C10.189 4.52493 10.7628 4.18736 11.4147 4.05768C11.6802 4.00488 12.0228 4.00004 13 4.00004H14.6C15.7366 4.00004 16.5289 4.00081 17.1458 4.05121C17.7509 4.10066 18.0986 4.19283 18.362 4.32702C18.9265 4.61464 19.3854 5.07358 19.673 5.63807C19.8072 5.90142 19.8994 6.24911 19.9488 6.85428C19.9992 7.47112 20 8.26343 20 9.40004V11C20 11.9773 19.9952 12.3199 19.9424 12.5853C19.8127 13.2373 19.4748 13.8114 19 14.2361V16.5829C20.4795 15.9374 21.5804 14.602 21.9039 12.9755C22.0004 12.4907 22.0002 11.9334 22 11.1158L22 11V9.40004V9.35725C22 8.27346 22 7.3993 21.9422 6.69141C21.8826 5.96256 21.7568 5.32238 21.455 4.73008C20.9757 3.78927 20.2108 3.02437 19.27 2.545C18.6777 2.24322 18.0375 2.1174 17.3086 2.05785C16.6007 2.00002 15.7266 2.00003 14.6428 2.00004L14.6 2.00004H13Z"
                  fill="currentColor"
                ></path>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key={"copy-done"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="shrink-0"
            >
              <IoCheckmark className="size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <Tooltip.Content placement="bottom" className={"p-1"} offset={10}>
        <p className="text-sm text-gray-800 dark:text-white">Copy</p>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  );
};

export default WorkerAgentDetail;
