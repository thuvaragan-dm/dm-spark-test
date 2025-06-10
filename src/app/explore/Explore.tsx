import { useMemo, useState } from "react";
import { IoGrid } from "react-icons/io5";
import { VscCommentDiscussion, VscSearch } from "react-icons/vsc";
import { z } from "zod";
import { Agent, AgentParams } from "../../api/agent/types";
import { useGetAgents } from "../../api/agent/useGetAgents";
import Avatar from "../../components/Avatar";
import { Button } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { useChatInputActions } from "../../store/chatInputStore";
import { cn } from "../../utilities/cn";
import { useAgentActions } from "../../store/agentStore";
import { addAgentToRecentlySelected } from "../chat/sidebar/manageRecentlySelectedAgents";
import { Link } from "react-router-dom";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [records_per_page, _setRecords_per_page] = useState(25);
  const { reset } = useChatInputActions();

  const { setSelectedAgent } = useAgentActions();

  const agentsOptions = useMemo<AgentParams>(() => {
    return {
      search: searchQuery,
      page,
      records_per_page: records_per_page,
    };
  }, [searchQuery, page, records_per_page]);

  const { data: agents, isPending: isAgentsLoading } =
    useGetAgents(agentsOptions);

  const handleReset = () => {
    setPage(1);
    setSearchQuery("");
    reset();
  };

  const handleSelectAgent = (agent: Agent) => {
    reset();

    setSelectedAgent(agent);
    addAgentToRecentlySelected(agent);
  };

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="dark:bg-primary-dark sticky top-0 z-[999] flex w-full items-center justify-between border-b border-gray-300 bg-white px-5 py-3 dark:border-white/10">
        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
          Explore other agents
        </h4>
      </header>

      <div className="scrollbar flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-5">
        <div className="flex w-full flex-col items-center justify-center px-5 py-16">
          <div className="flex items-center justify-center">
            <IoGrid className="size-24 text-gray-400 dark:text-white/30" />
          </div>
          <h2 className="mt-2 text-center text-4xl font-medium text-gray-800 dark:text-white">
            Discover More with{" "}
            <span className="text-primary dark:text-primary-500">
              Additional Agents
            </span>
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600 dark:text-white/60">
            Unlock a range of specialized agents beyond the sidebar for diverse
            tasks
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

        <div className="flex flex-1 flex-col">
          {isAgentsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center p-5">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isAgentsLoading && agents && (
            <>
              {agents.items.length > 0 && (
                <>
                  <div className="flex flex-1 flex-col">
                    <div
                      className={cn(
                        "mt-10 grid w-full grid-cols-1 gap-5 gap-y-8 px-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-10 xl:gap-y-10",
                      )}
                    >
                      {agents.items.map((agent) => (
                        <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-gray-300 dark:border-white/10">
                          <div className="flex w-full flex-1 items-start justify-start gap-3 p-3">
                            <div className="aspect-square size-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10 dark:border-white/5">
                              <Avatar
                                Fallback={() => (
                                  <Avatar.Fallback className="bg-secondary size-12 rounded-full text-xs">
                                    {agent.name[0]} {agent.name[1]}
                                  </Avatar.Fallback>
                                )}
                                className="relative z-10 flex aspect-square size-12 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner md:p-0"
                                src={agent.avatar || ""}
                              />
                            </div>
                            <div className="">
                              <h3 className="text-base font-medium text-gray-800 dark:text-white">
                                {agent.name}
                              </h3>

                              <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                                {agent.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end bg-gray-200 p-3 dark:bg-white/5">
                            <Link
                              to={`/chat/${agent.path}`}
                              onClick={() => handleSelectAgent(agent)}
                              className={
                                "dark:bg-primary-dark-foreground dark:hover:bg-primary-dark-foreground/80 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 p-2 text-sm font-medium hover:bg-white md:p-2 dark:border-white/10 dark:text-white"
                              }
                            >
                              <VscCommentDiscussion className="size-5" />
                              <p>Chat</p>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex w-full items-center justify-end px-5">
                    <Pagination
                      currentPage={page}
                      numberOfPages={Math.ceil(agents.total / records_per_page)}
                      setCurrentPage={setPage}
                    />
                  </div>
                </>
              )}

              {agents.items.length <= 0 && (
                <div className="flex w-full flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                  <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                    <IoGrid className="size-10" />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                    No agents found
                  </p>

                  <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                    Try adjusting your filters or reset to see all agents
                  </p>
                  <Button
                    onClick={handleReset}
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
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Explore;
