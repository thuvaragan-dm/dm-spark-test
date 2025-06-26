import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { WorkerAgentParams } from "../../api/workerAgents/types";
import { useGetWorkerAgents } from "../../api/workerAgents/useGetWorkerAgents";
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

const AllWorkerAgents = () => {
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
    useGetWorkerAgents(workerAgentsOptions);

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
            No Worker Agents Available Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-base text-balance text-gray-600 dark:text-white/60">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
            corporis eligendi eius accusantium
          </p>

          <Button
            onClick={() => setIsRegisterWorkerAgentModalOpen(true)}
            className={
              "mt-5 flex w-full items-center justify-center rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:w-auto"
            }
          >
            Add new worker agent
          </Button>
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
                      d="M16.005 14.295c2.386 1.032 4.07 3.576 4.07 6.545 0 .675-.502 1.235-1.136 1.235h-3.585V19.5c0-.656-.483-1.175-1.068-1.175H9.714c-.585 0-1.068.519-1.068 1.175v2.575H5.061c-.634 0-1.136-.56-1.136-1.235 0-2.97 1.684-5.513 4.07-6.545l.041-.018.246.185A6.352 6.352 0 0012 15.675a6.35 6.35 0 003.718-1.213l.246-.185.04.018zm-5.719 5.13c.362 0 .646.322.646.7v1.95H9.64v-1.95c0-.379.284-.7.646-.7zm3.428 0c.173 0 .34.076.46.208a.73.73 0 01.186.492.73.73 0 01-.186.492.624.624 0 01-.46.208.623.623 0 01-.46-.208.73.73 0 01-.186-.492.73.73 0 01.187-.492.623.623 0 01.459-.208zM12 1.925c2.367 0 4.394 1.547 5.291 3.76.607.082 1.07.642 1.07 1.315v2.5c0 .673-.463 1.232-1.07 1.313-.897 2.214-2.924 3.762-5.291 3.762-2.367 0-4.395-1.547-5.292-3.761-.607-.082-1.068-.641-1.068-1.314V7c0-.673.461-1.233 1.068-1.314C7.605 3.472 9.633 1.925 12 1.925zm-2.286 3.9c-.899 0-1.639.8-1.639 1.8v.625c0 2.035 1.508 3.675 3.354 3.675h1.142c1.846 0 3.354-1.64 3.354-3.675v-.625c0-1-.74-1.8-1.639-1.8H9.714zm.572 1.412c.158 0 .293.113.333.272l.203.787.718.223c.154.046.25.196.25.356 0 .16-.097.31-.25.355v.001l-.718.222-.203.788a.348.348 0 01-.333.272.344.344 0 01-.314-.215l-.02-.057-.204-.788-.717-.222a.365.365 0 01-.249-.356c0-.16.096-.31.25-.356l.716-.223.204-.787.02-.057a.344.344 0 01.314-.215z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth={0.15}
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

export default AllWorkerAgents;
