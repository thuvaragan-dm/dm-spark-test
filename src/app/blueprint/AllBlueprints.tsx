import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useGetBlueprints } from "../../api/blueprint/useGetBlueprints";
import { WorkerAgentParams } from "../../api/workerAgents/types";
import blueprintsBannerImage from "../../assets/blueprints_banner.jpg";
import workerAgentsFullBannerImage from "../../assets/worker_agents_full_banner.jpg";
import Avatar from "../../components/Avatar";
import { Button } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";

const AllBlueprints = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const blueprintsOptions = useMemo<WorkerAgentParams>(
    () => ({
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page],
  );

  const { data: blueprints, isPending: isBlueprintsLoading } =
    useGetBlueprints(blueprintsOptions);

  if (searchQuery.length <= 0 && isBlueprintsLoading) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (searchQuery.length <= 0 && blueprints && blueprints.total <= 0) {
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
            No Blueprints available Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-base text-balance text-gray-600 dark:text-white/60">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
            corporis eligendi eius accusantium
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/50"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={blueprintsBannerImage}
            alt="Academy banner image"
          />
        </div>
        <div className="relative z-30 flex flex-col">
          <h1 className="text-center text-5xl font-medium text-white">
            Agent Blueprints
          </h1>
          <p className="mt-2 text-center text-base text-white/80">
            Access a library of ready-made agents to simplify your workflows and
            accelerate automation.
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
          {isBlueprintsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isBlueprintsLoading &&
            blueprints &&
            blueprints.items.length > 0 && (
              <>
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                  <div className="grid grid-cols-2 gap-5">
                    {blueprints.items.map((blueprint, idx) => (
                      <Link
                        key={idx}
                        to={`/blueprints/details/${blueprint.id}`}
                        className="flex items-start justify-start gap-3 rounded-xl border border-gray-300 p-3 dark:border-white/10"
                      >
                        {/* icon */}
                        <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                          <Avatar
                            Fallback={() => (
                              <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs text-white dark:text-white">
                                {blueprint.name?.[0]} {blueprint.name?.[1]}
                              </Avatar.Fallback>
                            )}
                            className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                            src={blueprint.agent_avatar_url || ""}
                          />
                        </div>
                        {/* icon */}

                        <div className="flex w-full flex-col">
                          <div className="flex w-full items-center justify-between gap-3">
                            <h3 className="max-w-52 truncate text-base font-medium text-gray-800 dark:text-white">
                              {blueprint.name}
                            </h3>

                            <VscArrowRight className="size-4 shrink-0 text-gray-800 dark:text-white" />
                          </div>

                          <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                            {blueprint.description}
                          </p>

                          {blueprint.category && (
                            <div className="mt-2 flex flex-wrap items-start justify-start gap-3">
                              <span className="w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                                {blueprint.category}
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
                      blueprints.total / records_per_page,
                    )}
                    setCurrentPage={setPage}
                  />
                </div>
              </>
            )}

          {!isBlueprintsLoading &&
            blueprints &&
            blueprints?.items.length <= 0 &&
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
                      d="M4.212 20.999A3.238 3.238 0 011 17.774V7.43a3.229 3.229 0 016.365-.74h7.996c.051-.046 2.874-2.87 2.918-2.913l1.46-1.456a1.107 1.107 0 011.56 0l1.38 1.376c.428.43.428 1.125 0 1.555l-1.44 1.438h1.018a.743.743 0 01.742.74v12.83a.737.737 0 01-.742.74c-.016.004-18.03-.004-18.045 0zm-1.675-3.66a1.735 1.735 0 00.308 1.505c.331.428.842.676 1.382.675h17.29V8.171h-1.762l-4.045 4.038c-.296.37-1.168.142-1.565.153.011.247-.09.743.295.744h3.465a2.567 2.567 0 012.55 2.555 2.568 2.568 0 01-2.53 2.574h-7.418a.74.74 0 110-1.48h7.398a1.086 1.086 0 00-.019-2.17h-3.445a1.777 1.777 0 01-1.777-1.774v-1.233a10.368 10.368 0 01-.04-2.09l.002-.002.001-.003.003-.003v-.001l.004-.007h-.002a.743.743 0 01.137-.193l.001-.001h.001l.002-.002 1.106-1.105H7.471v7.176A1.336 1.336 0 015.32 16.4a1.762 1.762 0 00-2.784.939zm1.765-2.797c.6.01 1.184.19 1.686.516v-7.5a1.741 1.741 0 00-1.777-1.853 1.692 1.692 0 00-1.729 1.741v7.585a3.338 3.338 0 011.82-.49zm9.804-3.665l.792.05c.499-.498 4.346-4.34 4.732-4.723l-.841-.841-4.731 4.722.048.792zm5.731-6.56l.842.84.682-.68-.842-.841-.682.681z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No blueprints found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all blueprints
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

export default AllBlueprints;
