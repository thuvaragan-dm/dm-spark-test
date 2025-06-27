import { useEffect, useMemo, useState } from "react";
import {
  TbSortAscendingLetters,
  TbSortDescendingLetters,
} from "react-icons/tb";
import { VscCloudDownload, VscSearch } from "react-icons/vsc";
import { z } from "zod";
import { useGetAgents } from "../../api/agent/useGetAgents";
import { MemoryParams } from "../../api/memory/types";
import { useGetMemory } from "../../api/memory/useGetMemory";
import workerAgentsBannerImage from "../../assets/worker_agents_banner.jpg";
import workerAgentsFullBannerImage from "../../assets/worker_agents_full_banner.jpg";
import { Button } from "../../components/Button";
import FileIcon from "../../components/FileIcon";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import Select from "../../components/Forms/Select";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { useAgent, useAgentActions } from "../../store/agentStore";
import extractFileExtension from "../../utilities/extractFileExtension";

const Memory = () => {
  const { selectedAgent } = useAgent();
  const { setSelectedAgent } = useAgentActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(25);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: agents } = useGetAgents({
    search: "Spark",
  });

  useEffect(() => {
    if (agents && agents.items.length > 0) {
      setSelectedAgent(agents.items[0]);
    }
  }, [agents, setSelectedAgent]);

  const memoryOptions = useMemo<{ id: string; params: MemoryParams }>(
    () => ({
      id: selectedAgent?.shard_id || "",
      params: {
        search: searchQuery,
        page,
        records_per_page: records_per_page,
        signed_url: true,
        sort: `${sortField}:${sortOrder}`,
      },
    }),
    [searchQuery, page, records_per_page, sortField, sortOrder, selectedAgent],
  );

  const { data: memory, isPending: isMemoryLoading } =
    useGetMemory(memoryOptions);

  if (
    searchQuery.length <= 0 &&
    sortField === "name" &&
    sortOrder === "asc" &&
    isMemoryLoading
  ) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (searchQuery.length <= 0 && memory && memory.total <= 0) {
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
            No Memory files Available Yet
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
            Memory
          </h1>
          <p className="mt-2 text-center text-base text-white/80">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est
            dignissimos voluptate exercitationem.
          </p>
        </div>
      </header>

      <div className="mt-5 flex w-full flex-1 flex-col overflow-hidden px-5 pt-1">
        <div className="mx-auto w-full">
          <Form validationSchema={z.object({ search: z.string() })}>
            <Field>
              <InputGroup>
                <VscSearch data-slot="icon" />
                <Input
                  placeholder="Search in memory"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Field>
          </Form>

          <div className="mt-5 flex w-full items-center justify-between">
            <p className="pl-1 text-sm font-medium text-gray-800 dark:text-white">
              All Files
            </p>

            <div className="flex items-center justify-end gap-1">
              <Form validationSchema={z.object({ sort_field: z.string() })}>
                <Field>
                  <Select
                    name="sort_field"
                    placeholder="Select sort field"
                    value={sortField}
                    onChange={(val) => setSortField(val)}
                    className="min-w-32"
                  >
                    <Select.Option value="name">Name</Select.Option>
                    <Select.Option value="created_by">Created By</Select.Option>
                  </Select>
                </Field>
              </Form>

              <Button
                onClick={() =>
                  setSortOrder((pv) => (pv === "asc" ? "desc" : "asc"))
                }
                variant={"ghost"}
                className={
                  "md:p-2. rounded-lg p-2 text-gray-800 hover:bg-gray-200 dark:text-white hover:dark:bg-white/10"
                }
              >
                {sortOrder === "asc" ? (
                  <TbSortAscendingLetters className="size-6" />
                ) : (
                  <TbSortDescendingLetters className="size-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="scrollbar mt-2 flex w-full flex-1 flex-col overflow-y-auto pb-5">
          {isMemoryLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isMemoryLoading && memory && memory.items.length > 0 && (
            <>
              <div className="mx-auto flex w-full flex-1 flex-col p-1">
                <div className="mt-3 flex flex-col divide-y divide-gray-300 rounded-xl border border-gray-300 dark:divide-white/10 dark:border-white/10">
                  {memory.items.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex max-w-sm items-center justify-start gap-3 truncate">
                        <FileIcon
                          fileType={extractFileExtension(file.name) || ""}
                        />
                        <h3 className="truncate text-sm font-medium text-gray-800 dark:text-white">
                          {file.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        {file.signed_url && (
                          <a
                            href={file.signed_url}
                            download={file.name}
                            className={
                              "rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10"
                            }
                          >
                            <VscCloudDownload className="size-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto flex w-full items-center justify-end">
                <Pagination
                  currentPage={page}
                  numberOfPages={Math.ceil(memory.total / records_per_page)}
                  setCurrentPage={setPage}
                />
              </div>
            </>
          )}

          {!isMemoryLoading &&
            memory &&
            memory?.items.length <= 0 &&
            searchQuery.length > 0 && (
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <svg
                    className="size-16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15.865v2.297c0 .488-.205.955-.57 1.3-.365.344-.86.538-1.376.538H4.946a2.005 2.005 0 01-1.376-.538 1.788 1.788 0 01-.57-1.3v-2.297m18 0c0-.488-.205-.955-.57-1.3a2.006 2.006 0 00-1.376-.538H4.946c-.516 0-1.011.194-1.376.538-.365.345-.57.812-.57 1.3m18 0v-1.498c0-.226-.03-.45-.088-.669l-2.278-8.61a2.748 2.748 0 00-1.036-1.504A3.03 3.03 0 0015.802 3H8.198a3.03 3.03 0 00-1.796.584 2.749 2.749 0 00-1.036 1.504l-2.278 8.61a2.61 2.61 0 00-.088.668v1.499"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No Memory Files found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all memory files
                </p>
                <Button
                  onClick={() => {
                    setSortField("name");
                    setSortOrder("asc");
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

export default Memory;
