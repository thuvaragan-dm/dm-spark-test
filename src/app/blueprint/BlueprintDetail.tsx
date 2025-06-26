import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useGetBlueprint } from "../../api/blueprint/useGetBlueprint";
import blueprintsBannerImage from "../../assets/blueprints_banner.jpg";
import Avatar from "../../components/Avatar";
import { ButtonWithLoader } from "../../components/Button";
import { MermaidDiagram } from "../../components/MermaidDiagram";
import Spinner from "../../components/Spinner";
import { useRegisterWorkerAgent } from "../../api/workerAgents/useRegisterWorkerAgent";
import { EWorkerAgent, workerAgentKey } from "../../api/workerAgents/config";
import { WorkerAgentOrigin } from "../../api/workerAgents/types";
import { useCallback } from "react";
import { toast } from "sonner";
import Success from "../../components/alerts/Success";

const BlueprintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: blueprint, isPending: isBlueprintLoading } = useGetBlueprint({
    id: id || "",
  });

  const { mutateAsync: registerWorkerAgent, isPending: isRegisterLoading } =
    useRegisterWorkerAgent({
      invalidateQueryKey: [workerAgentKey[EWorkerAgent.FETCH_ALL]],
    });

  const handleThisBlueprint = useCallback(async () => {
    if (blueprint) {
      const wa = await registerWorkerAgent({
        body: {
          origin: WorkerAgentOrigin.BLUEPRINT,
          name: blueprint.name,
          category: blueprint.category,
          description: blueprint.description,
          overview: blueprint.overview,
          github_reference_link: blueprint.github_reference,
          agent_secrets: blueprint.agent_secrets_config,
          http_endpoint: "",
        },
      });

      toast.custom((t) => (
        <Success
          t={t}
          title={`Bluepring forked!`}
          description={`We have successfully forked blueprint.`}
        />
      ));

      navigate(`/worker-agents/details/${wa.id}`);
    }
  }, [blueprint, registerWorkerAgent, navigate]);

  return (
    <section className="dark:bg-primary-dark-foreground flex w-full flex-1 flex-col overflow-hidden bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/50"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={blueprintsBannerImage}
            alt="Academy banner image"
          />
        </div>
      </header>

      {isBlueprintLoading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5" />
        </div>
      )}

      {!isBlueprintLoading && blueprint && (
        <>
          <div className="mt-5 flex w-full items-end justify-between px-5">
            <div className="flex items-start justify-start gap-3">
              <div className="aspect-square size-16 shrink-0 overflow-hidden rounded-xl">
                <Avatar
                  src={blueprint.agent_avatar_url || ""}
                  alt="Agent image"
                  className="flex aspect-square size-16 w-full shrink-0 items-center justify-center rounded-none object-cover"
                  Fallback={() => (
                    <Avatar.Fallback className="bg-secondary size-16 rounded-none text-xs text-white dark:text-white">
                      {blueprint.name?.[0]} {blueprint.name?.[1]}
                    </Avatar.Fallback>
                  )}
                />
              </div>

              <div className="w-full max-w-sm">
                <h3 className="text-3xl font-medium text-gray-800 dark:text-white">
                  {blueprint.name}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                  {blueprint.description}
                </p>
                <div className="mt-2 flex items-center justify-start gap-3">
                  <span className="w-min shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
                    {blueprint.category}
                  </span>

                  <p className="text-[0.65rem] text-gray-600 dark:text-white/60">
                    Last Updated{" "}
                    {format(new Date(blueprint.created_at), "do MMMM, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <ButtonWithLoader
                isLoading={isRegisterLoading}
                onClick={() => handleThisBlueprint()}
                className={
                  "rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:py-1.5"
                }
              >
                Use this Blueprint
              </ButtonWithLoader>
            </div>
          </div>

          <div className="scrollbar mt-10 flex w-full flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col space-y-5 p-5">
              <div className="flex w-full flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Overview
                </h3>

                <p className="mt-2 text-sm/6 text-gray-700 dark:text-white/80">
                  {blueprint.overview}
                </p>
              </div>

              {blueprint.workflow_graph && (
                <div className="flex min-h-[40dvh] w-full flex-1 flex-col overflow-hidden rounded-2xl bg-white p-5 dark:bg-white/5">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Workflow graph
                  </h3>

                  <div className="scrollbar mt-5 flex w-full flex-1 justify-start overflow-auto rounded-xl">
                    <div className="min-w-full">
                      <MermaidDiagram>
                        {blueprint.workflow_graph}
                      </MermaidDiagram>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default BlueprintDetail;
