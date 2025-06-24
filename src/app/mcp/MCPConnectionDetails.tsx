import { useMemo, useState } from "react";
import { VscTrash } from "react-icons/vsc";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { EMCP, mcpKey } from "../../api/mcp/config";
import { MCPTemplateDetailParams, MCPToolsParams } from "../../api/mcp/types";
import { useDeleteMCPConnection } from "../../api/mcp/useDeleteMCPConnection";
import { useGetMCPConnectionDetails } from "../../api/mcp/useGetMCPConnectionDetails ";
import { useGetMCPTools } from "../../api/mcp/useGetMCPTools";
import mcpBannerImage from "../../assets/mcp_banner.png";
import { Button } from "../../components/Button";
import Dropdown from "../../components/dropdown";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Switch from "../../components/Forms/Switch";
import MCPConnectionIcon, {
  AvailableMCPProviders,
} from "../../components/MCPConnectionIcon";
import Modal from "../../components/modal";
import Spinner from "../../components/Spinner";
import { cn } from "../../utilities/cn";
import { useUpdateMCPConnection } from "../../api/mcp/useUpdateMCPConnection";
import { Pagination } from "../../components/Pagination";
import ReConnectionModal from "./ReConnectionModal";
import { useGetMCPTemplateDetails } from "../../api/mcp/useGetMCPTemplateDetails";

const MCPConnectionDetails = () => {
  const navigate = useNavigate();
  const [searchQuery, _setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);
  const { connection_id } = useParams<{ connection_id: string }>();

  const { data: MCPDetails, isPending: isMCPDetailsLoading } =
    useGetMCPConnectionDetails({ connection_id: connection_id || "" });

  const mcpTemplateOptions = useMemo<MCPTemplateDetailParams>(
    () => ({ service_provider_name: MCPDetails?.service_provider || "" }),
    [MCPDetails],
  );

  const { data: MCPTemplateDetails, isPending: isTemplateLoading } =
    useGetMCPTemplateDetails(mcpTemplateOptions);

  const mcpToolsOptions = useMemo<MCPToolsParams>(
    () => ({
      service_provider_name: MCPDetails?.service_provider || "",
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page, MCPDetails],
  );

  const { data: tools, isPending: isToolsLoading } =
    useGetMCPTools(mcpToolsOptions);

  const { mutate: updateMCPConnection } = useUpdateMCPConnection({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_MCP_CONNECTION_DETAIL] + connection_id,
    ],
  });

  const [isReConnectionsModalOpen, setIsReConnectionsModalOpen] =
    useState(false);

  const [isDeleteConnectionModalOpen, setIsDeleteConnectionModalOpen] =
    useState(false);

  const { mutate: deleteMCPConnection } = useDeleteMCPConnection({
    invalidateQueryKey: [
      mcpKey[EMCP.FETCH_CONNECTED],
      {
        search: "",
        page: 1,
        records_per_page: 25,
      },
    ],
  });

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  return (
    <section className="dark:bg-primary-dark-foreground flex w-full flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/50"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={mcpBannerImage}
            alt="Academy banner image"
          />
        </div>

        <div className="absolute top-0 right-0 z-20 m-3">
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={() => setIsReConnectionsModalOpen((pv) => !pv)}
              variant={"ghost"}
              className={
                "rounded-lg border border-white px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 md:px-3 md:py-1.5"
              }
            >
              Re connect
            </Button>

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
                    setIsDeleteConnectionModalOpen(true);
                  }}
                >
                  <VscTrash className="size-5" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </header>

      {(isMCPDetailsLoading || isTemplateLoading) && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5" />
        </div>
      )}

      {!isMCPDetailsLoading && MCPDetails && MCPTemplateDetails && (
        <>
          <div className="mt-5 flex w-full items-end justify-between px-5">
            <div className="flex items-start justify-start gap-3">
              <div className="rounded-lg border border-gray-300 bg-white p-1 shadow-lg">
                <MCPConnectionIcon
                  className="size-6"
                  icon={MCPDetails.service_provider as AvailableMCPProviders}
                />
              </div>

              <div className="w-full max-w-sm">
                <h3 className="text-3xl font-medium text-gray-800 dark:text-white">
                  {MCPDetails.name}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                  {MCPDetails.overview}
                </p>
                <div className="mt-2 flex flex-wrap items-start justify-start gap-3">
                  <span className="w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider text-gray-800 shadow dark:bg-white/10 dark:text-white">
                    {MCPDetails.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <div className="rounded-full dark:border-white/10">
                <Form
                  validationSchema={z.object({
                    is_workspace_shared: z.boolean(),
                  })}
                >
                  <Field>
                    <Switch
                      value={MCPDetails.is_workspace_shared ? "t" : ""}
                      onChange={(val) => {
                        updateMCPConnection({
                          params: {
                            id: connection_id || "",
                          },
                          body: {
                            is_workspace_shared: val,
                          },
                        });
                      }}
                      switchClass="group-data-[selected]:bg-green-600"
                      className={
                        "flex-row-reverse gap-3 rounded-lg border border-gray-300 p-1.5 pl-3 dark:border-white/10"
                      }
                    >
                      <div className="">
                        <p className="text-xs text-gray-600 dark:text-white/60">
                          Share with your workspace
                        </p>
                      </div>
                    </Switch>
                  </Field>
                </Form>
              </div>
            </div>
          </div>

          <div className="scrollbar mt-8 flex flex-1 flex-col space-y-5 overflow-y-auto p-5 pt-0">
            <div className="flex w-full flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Overview
              </h3>

              <p className="mt-2 text-sm/6 text-gray-700 dark:text-white/80">
                {MCPDetails.overview}
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col rounded-2xl bg-white p-5 pb-0 dark:bg-white/5">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Tools
              </h3>

              {isToolsLoading && (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <Spinner className="size-5" />
                </div>
              )}

              {tools && !isToolsLoading && (
                <div className="flex flex-1 flex-col">
                  <div
                    className={
                      "mt-2 flex w-full flex-1 flex-col flex-wrap space-y-3"
                    }
                  >
                    {/* list of tools */}
                    {tools.items.map((tool, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-300 p-3 dark:border-white/10"
                      >
                        <h4 className="text-base font-medium text-gray-800 dark:text-white">
                          {tool.tool_name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-white/60">
                          {tool.description}
                        </p>
                      </div>
                    ))}
                    {/* list of tools */}
                  </div>

                  <div className="mt-5 flex w-full items-center justify-end">
                    <Pagination
                      currentPage={page}
                      numberOfPages={Math.ceil(tools.total / records_per_page)}
                      setCurrentPage={setPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Modal
            key="delete-mcp-connection-modal"
            title="Disconnect mcp connection?"
            desktopClassName="w-full max-w-md"
            description={`This will permanently disconnect: ${MCPDetails.name}.`}
            isOpen={isDeleteConnectionModalOpen}
            Trigger={() => <></>}
            setIsOpen={setIsDeleteConnectionModalOpen}
          >
            <p className="px-5 pt-2 text-sm text-gray-600 dark:text-white/70">
              Are you sure you want to proceed?
            </p>
            <div className="mt-5 flex w-full flex-col items-center justify-end gap-3 px-5 pb-5 md:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteConnectionModalOpen(false)}
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
                  deleteMCPConnection({
                    params: {
                      id: connection_id || "",
                      service_provider: MCPDetails.service_provider || "",
                    },
                  });
                  setIsDeleteConnectionModalOpen(false);
                  navigate("/mcp/connections");
                }}
              >
                disconnect MCP connection
              </Button>
            </div>
          </Modal>

          <ReConnectionModal
            isOpen={isReConnectionsModalOpen}
            setIsOpen={setIsReConnectionsModalOpen}
            name={MCPDetails.name}
            connectionId={MCPDetails.id}
            serviceProvider={MCPDetails.service_provider}
            authMethods={MCPTemplateDetails.auth_method}
            credentials={MCPTemplateDetails.credentials}
          />
        </>
      )}
    </section>
  );
};

export default MCPConnectionDetails;
