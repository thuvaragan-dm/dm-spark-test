import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MCPToolsParams } from "../../api/mcp/types";
import { useGetMCPTemplateDetails } from "../../api/mcp/useGetMCPTemplateDetails";
import { useGetMCPTools } from "../../api/mcp/useGetMCPTools";
import mcpBannerImage from "../../assets/mcp_banner.png";
import { Button } from "../../components/Button";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import NewConnectionModal from "./NewConnectionModal";

const MCPTemplateDetails = () => {
  const [searchQuery, _setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const { service_provider } = useParams<{ service_provider: string }>();

  const { data: MCPDetails, isPending: isMCPDetailsLoading } =
    useGetMCPTemplateDetails({ service_provider_name: service_provider || "" });

  const mcpToolsOptions = useMemo<MCPToolsParams>(
    () => ({
      service_provider_name: service_provider || "",
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page, service_provider],
  );

  const { data: tools, isPending: isToolsLoading } =
    useGetMCPTools(mcpToolsOptions);

  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

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
      </header>

      {isMCPDetailsLoading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5" />
        </div>
      )}

      {!isMCPDetailsLoading && MCPDetails && (
        <>
          <div className="mt-5 flex w-full items-end justify-between px-5">
            <div className="flex items-start justify-start gap-3">
              <div className="aspect-square rounded-lg border border-gray-300 bg-white p-1 shadow-lg">
                <img
                  className="w-9 object-cover"
                  alt="mcp image"
                  src={MCPDetails.mcp_logo_url}
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
                  <span className="w-min shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                    {MCPDetails.category}
                  </span>
                  {MCPDetails.auth_method.map((method) => (
                    <span
                      key={method}
                      className="w-min shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsConnectionsModalOpen((pv) => !pv)}
              wrapperClass="w-full md:w-auto"
              className="flex w-full items-center justify-center rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:w-auto"
            >
              Connect
            </Button>
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

          <NewConnectionModal
            isOpen={isConnectionsModalOpen}
            setIsOpen={setIsConnectionsModalOpen}
            name={MCPDetails.name}
            serviceProvider={MCPDetails.service_provider}
            authMethods={MCPDetails.auth_method}
            credentials={MCPDetails.credentials}
            category={MCPDetails.category}
            logo={MCPDetails.mcp_logo_url}
          />
        </>
      )}
    </section>
  );
};

export default MCPTemplateDetails;
