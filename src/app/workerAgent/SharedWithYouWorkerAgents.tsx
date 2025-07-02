import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { WorkerAgentParams } from "../../api/workerAgents/types";
import { useGetSharedWithYouWorkerAgents } from "../../api/workerAgents/useGetSharedWithYouWorkerAgents";
import workerAgentsBannerImage from "../../assets/worker_agents_banner.jpg";
import workerAgentsFullBannerImage from "../../assets/worker_agents_full_banner.jpg";
import Avatar from "../../components/Avatar";
import { Button } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { useWorkerAgentActions } from "../../store/workerAgentStore";

const SharedWithYouWorkerAgents = () => {
  const { setIsRegisterWorkerAgentModalOpen } = useWorkerAgentActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const workerAgentsOptions = useMemo<WorkerAgentParams>(
    () => ({
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page],
  );

  const { data: workerAgents, isPending: isWorkerAgentsLoading } =
    useGetSharedWithYouWorkerAgents(workerAgentsOptions);

  if (searchQuery.length <= 0 && isWorkerAgentsLoading) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (searchQuery.length <= 0 && workerAgents && workerAgents.total <= 0) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <header className="relative flex h-full w-full flex-1 shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
          <div className="absolute inset-0 z-10">
            <img
              className="h-full w-full object-cover object-center"
              src={workerAgentsFullBannerImage}
              alt="Academy banner image"
            />
          </div>
        </header>

        <div className="mt-5 flex h-52 w-full flex-col items-center justify-center pb-5">
          <h3 className="text-4xl font-medium text-gray-800 dark:text-white">
            No Shared Worker Agents Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-base text-balance text-gray-600 dark:text-white/60">
            Worker agents are specialists. Spark inteliigently delegate tasks to the best best worker agent.
          </p>

          {/*
          <Button
            onClick={() => setIsRegisterWorkerAgentModalOpen(true)}
            className={
              "mt-5 flex w-full items-center justify-center rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:w-auto"
            }
          >
            Add new worker agent
          </Button>
          */
          }
        </div>
      </section>
    );
  }

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/20"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={workerAgentsBannerImage}
            alt="Academy banner image"
          />
        </div>
        <div className="relative z-30 flex flex-col">
          <h1 className="text-center text-5xl font-medium text-white">
            All worker agents
          </h1>
          <p className="mt-2 text-center text-base text-white/80">
            Deploy your custom agents seamlessly within your Spark workspace
          </p>
        </div>
      </header>

      <div className="mt-5 flex w-full flex-1 flex-col overflow-hidden p-1">
        <div className="mx-auto w-full max-w-2xl">
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
          {isWorkerAgentsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isWorkerAgentsLoading &&
            workerAgents &&
            workerAgents.items.length > 0 && (
              <>
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                  <div className="grid grid-cols-2 gap-5">
                    {workerAgents.items.map((agent, idx) => (
                      <Link
                        key={idx}
                        to={`/worker-agents/details/${agent.id}`}
                        className="flex items-start justify-start gap-3 rounded-xl border border-gray-300 p-3 dark:border-white/10"
                      >
                        {/* icon */}
                        <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                          <Avatar
                            Fallback={() => (
                              <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs text-white dark:text-white">
                                {agent.name?.[0]} {agent.name?.[1]}
                              </Avatar.Fallback>
                            )}
                            className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                            src={agent.agent_avatar_url || ""}
                          />
                        </div>
                        {/* icon */}

                        <div className="flex w-full flex-col">
                          <div className="flex w-full items-center justify-between gap-3">
                            <h3 className="max-w-52 truncate text-base font-medium text-gray-800 dark:text-white">
                              {agent.name}
                            </h3>

                            <VscArrowRight className="size-4 shrink-0 text-gray-800 dark:text-white" />
                          </div>

                          <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                            {agent.description}
                          </p>

                          {agent.category && (
                            <div className="mt-2 flex flex-wrap items-start justify-start gap-3">
                              <span className="w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                                {agent.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-2xl items-center justify-end px-5">
                  <Pagination
                    currentPage={page}
                    numberOfPages={Math.ceil(
                      workerAgents.total / records_per_page,
                    )}
                    setCurrentPage={setPage}
                  />
                </div>
              </>
            )}

          {!isWorkerAgentsLoading &&
            workerAgents &&
            workerAgents?.items.length <= 0 &&
            searchQuery.length > 0 && (
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.711 11.517A3.215 3.215 0 008.5 8.305h-.041a3.217 3.217 0 00-3.17 3.213 3.217 3.217 0 003.17 3.213H8.5a3.222 3.222 0 003.212-3.214zm-2.916 1.992a2.014 2.014 0 11-.002-3.984 2.014 2.014 0 01.002 3.984z"
                      fill="currentColor"
                    />
                    <path
                      d="M19.913 17.004c-.019-.002-.041-.002-.06-.002h-.54c.003-.006.009-.01.012-.014a9.57 9.57 0 00.588-.943 9.471 9.471 0 001.142-4.529A9.519 9.519 0 0011.536 2C6.288 2 2.02 6.269 2.02 11.517a9.433 9.433 0 001.73 5.47c.004.006.01.01.013.015h-.6A2.224 2.224 0 001 19.221v.551c0 1.224.995 2.22 2.22 2.22h16.633c1.224 0 2.22-.996 2.22-2.22v-.552a2.22 2.22 0 00-2.16-2.217zM15.989 6.511a.599.599 0 01.848.03 7.248 7.248 0 011.97 4.976 7.31 7.31 0 01-.295 2.065.6.6 0 01-.747.405.602.602 0 01-.405-.746 6.035 6.035 0 00.247-1.725 6.05 6.05 0 00-1.646-4.156.601.601 0 01.028-.849zM4.56 16.042a8.257 8.257 0 01-1.339-4.525c0-4.585 3.732-8.317 8.317-8.317a8.151 8.151 0 012.935.535 8.318 8.318 0 00-4.415 3.909 4.208 4.208 0 012.615 3.873 4.205 4.205 0 01-2.615 3.87c.117.223.245.441.384.655h8.077c-.04.06-.388.604-.618.96H5.213c-.18-.261-.607-.889-.654-.96zm16.313 3.731a1.02 1.02 0 01-1.02 1.02H3.22a1.02 1.02 0 01-1.02-1.02v-.552c0-.561.459-1.02 1.02-1.02h16.634c.561 0 1.02.459 1.02 1.02v.552z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No worker agents found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all worker agents
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

export default SharedWithYouWorkerAgents;
