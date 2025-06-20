import { useParams } from "react-router-dom";
import mcpBannerImage from "../../assets/mcp_banner.png";
import { Button } from "../../components/Button";
import MCPConnectionIcon, {
  AvailableMCPProviders,
} from "../../components/MCPConnectionIcon";

const MCPDetails = () => {
  const { service_provider } = useParams<{ service_provider: string }>();
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

      <div className="mt-5 flex w-full items-end justify-between px-5">
        <div className="flex items-start justify-start gap-3">
          <div className="rounded-lg border border-gray-300 bg-white p-1 shadow-lg">
            <MCPConnectionIcon
              className="size-6"
              icon={service_provider as AvailableMCPProviders}
            />
          </div>

          <div className="w-full max-w-sm">
            <h3 className="text-3xl font-medium text-gray-800 dark:text-white">
              {service_provider}
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Temporibus, ex libero. Deserunt quas in sapiente.
            </p>
          </div>
        </div>

        <Button
          wrapperClass="w-full md:w-auto"
          className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
        >
          Connect
        </Button>
      </div>

      <div className="scrollbar mt-5 flex flex-1 flex-col space-y-5 overflow-y-auto p-5 pt-0">
        <div className="flex w-full flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Overview
          </h3>

          <p className="mt-2 text-sm/6 text-gray-700 dark:text-white/80">
            Connect your Supabase projects to AI assistants like Cursor and
            Claude. Manage tables, fetch configurations, and query data
            seamlessly with your AI tools. Enhance your development workflow by
            integrating AI capabilities directly into your Supabase projects
          </p>
        </div>

        <div className="flex w-full flex-col rounded-2xl bg-white p-5 dark:bg-white/5">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Tools
          </h3>

          <div className="mt-2 flex w-full flex-col space-y-3">
            {/* list of tools */}
            {Array.from(Array(15).keys()).map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-300 p-3 dark:border-white/10"
              >
                <h4 className="text-base font-medium text-gray-800 dark:text-white">
                  List Tables
                </h4>
                <p className="text-xs text-gray-600 dark:text-white/60">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Aperiam, qui?
                </p>
              </div>
            ))}
            {/* list of tools */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MCPDetails;
