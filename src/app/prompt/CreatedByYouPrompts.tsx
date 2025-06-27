import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { z } from "zod";
import { useGetCreatedByYouPrompts } from "../../api/prompt/useGetCreatedByYouPrompts";
import { WorkerAgentParams } from "../../api/workerAgents/types";
import workerAgentsBannerImage from "../../assets/worker_agents_banner.jpg";
import workerAgentsFullBannerImage from "../../assets/worker_agents_full_banner.jpg";
import { Button } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { usePromptAction } from "../../store/promptStore";

const CreatedByYouPrompts = () => {
  const {
    setIsCreatePromptDrawerOpen,
    setIsUpdatePromptDrawerOpen,
    setSelectedPromptForEdit,
  } = usePromptAction();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(20);

  const promptsOptions = useMemo<WorkerAgentParams>(
    () => ({
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    }),
    [searchQuery, page, records_per_page],
  );

  const { data: prompts, isPending: isPromptsLoading } =
    useGetCreatedByYouPrompts(promptsOptions);

  if (searchQuery.length <= 0 && isPromptsLoading) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (searchQuery.length <= 0 && prompts && prompts.total <= 0) {
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
            No Prompts Available Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-base text-balance text-gray-600 dark:text-white/60">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
            corporis eligendi eius accusantium
          </p>

          <Button
            onClick={() => setIsCreatePromptDrawerOpen(true)}
            className={
              "mt-5 flex w-full items-center justify-center rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:w-auto"
            }
          >
            Add new prompt
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
            Prompts Created By You
          </h1>
          <p className="mt-2 text-center text-base text-white/80">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est
            dignissimos voluptate exercitationem.
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
          {isPromptsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isPromptsLoading && prompts && prompts.items.length > 0 && (
            <>
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                <div className="grid grid-cols-2 gap-5">
                  {prompts.items.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPromptForEdit(prompt);
                        setIsUpdatePromptDrawerOpen(true);
                      }}
                      className="flex cursor-pointer items-start justify-start gap-3 rounded-xl border border-gray-300 p-3 text-left dark:border-white/10"
                    >
                      <div className="flex w-full flex-col">
                        <div className="flex w-full items-center justify-between gap-3">
                          <h3 className="max-w-52 truncate text-base font-medium text-gray-800 dark:text-white">
                            {prompt.name}
                          </h3>

                          <VscArrowRight className="size-4 shrink-0 text-gray-800 dark:text-white" />
                        </div>

                        <p className="mt-1 line-clamp-3 text-xs text-gray-600 dark:text-white/60">
                          {prompt.prompt}
                        </p>

                        {prompt.category && (
                          <div className="mt-2 flex flex-wrap items-start justify-start gap-3">
                            <span className="w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                              {prompt.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-auto flex w-full max-w-2xl items-center justify-end px-5">
                <Pagination
                  currentPage={page}
                  numberOfPages={Math.ceil(prompts.total / records_per_page)}
                  setCurrentPage={setPage}
                />
              </div>
            </>
          )}

          {!isPromptsLoading &&
            prompts &&
            prompts?.items.length <= 0 &&
            searchQuery.length > 0 && (
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-16 shrink-0"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No Prompts found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all prompts
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

export default CreatedByYouPrompts;
