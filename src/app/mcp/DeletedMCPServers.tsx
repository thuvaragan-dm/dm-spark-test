import { useMemo, useState } from "react";
import { HiServerStack } from "react-icons/hi2";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useGetAvailableMCPConnections } from "../../api/mcp/useGetAvailableMCPConnections";
import mcpBannerImage from "../../assets/mcp_banner.png";
import { Button } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import MCPConnectionIcon, {
  AvailableMCPProviders,
} from "../../components/MCPConnectionIcon";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";

const DeletedMCPServers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const AvailableMCPConnectionOptions = useMemo(
    () => ({
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page],
  );

  const { data: connections, isPending: isConnectionsLoading } =
    useGetAvailableMCPConnections(AvailableMCPConnectionOptions);

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/50"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={mcpBannerImage}
            alt="Academy banner image"
          />
        </div>
        <div className="relative z-30 flex flex-col">
          <h1 className="text-center text-5xl font-medium text-white">
            Deleted MCP Servers
          </h1>
          <p className="mt-2 text-center text-base text-white/80">
            Deploy your custom agents seamlessly within your Spark workspace
          </p>
        </div>
      </header>

      <div className="mx-auto mt-5 flex w-full max-w-2xl flex-1 flex-col overflow-hidden p-1">
        <div className="">
          <Form validationSchema={z.object({ search: z.string() })}>
            <Field>
              <InputGroup>
                <VscSearch data-slot="icon" />
                <Input
                  placeholder="Search for MCP connections"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Field>
          </Form>
        </div>

        <div className="scrollbar mt-5 flex w-full flex-1 flex-col overflow-y-auto pb-5">
          {isConnectionsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isConnectionsLoading &&
            connections &&
            connections.items.length > 0 && (
              <>
                <div className="flex flex-1 flex-col">
                  <div className="grid grid-cols-2 gap-5">
                    {connections.items.map((connection, idx) => (
                      <Link
                        key={idx}
                        to={`/mcp/details/${connection.service_provider}`}
                        className="flex items-start justify-start gap-3 rounded-xl border border-gray-300 p-3 dark:border-white/10"
                      >
                        {/* icon */}
                        <div className="rounded-lg border border-gray-300 bg-white p-2 shadow-lg">
                          <MCPConnectionIcon
                            icon={
                              connection.service_provider as AvailableMCPProviders
                            }
                          />
                        </div>
                        {/* icon */}

                        <div className="flex w-full flex-col">
                          <div className="flex w-full items-center justify-between">
                            <h3 className="text-base font-medium text-gray-800 dark:text-white">
                              {connection.name}
                            </h3>

                            <VscArrowRight className="size-5 text-white" />
                          </div>

                          <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Nam excepturi quod fugit
                          </p>

                          <span className="mt-2 w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider text-gray-800 shadow dark:bg-white/10 dark:text-white">
                            {connection.category}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex w-full items-center justify-end px-5">
                  <Pagination
                    currentPage={page}
                    numberOfPages={Math.ceil(
                      connections.total / records_per_page,
                    )}
                    setCurrentPage={setPage}
                  />
                </div>
              </>
            )}

          {!isConnectionsLoading &&
            connections &&
            connections?.items.length <= 0 && (
              <div className="flex w-full flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <HiServerStack className="size-10" />
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No MCP servers found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all MCP servers
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
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
        </div>
      </div>
    </section>
  );
};

export default DeletedMCPServers;
