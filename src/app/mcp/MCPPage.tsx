import { Navigate } from "react-router-dom";
import { useGetConnectedMCPServers } from "../../api/mcp/useGetConnectedMCPServers";
import Spinner from "../../components/Spinner";

const MCPPage = () => {
  const { data: connections, isPending: isConnectionsLoading } =
    useGetConnectedMCPServers({
      page: 1,
      records_per_page: 20,
      search: "",
    });

  if (isConnectionsLoading) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (connections && connections.items.length > 0) {
    return <Navigate to={"/mcp/connections"} />;
  }

  if (connections && connections.items.length <= 0) {
    return <Navigate to={"/mcp/templates"} />;
  }

  return (
    <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Spinner className="size-5 dark:text-white" />
      </div>
    </section>
  );
};

export default MCPPage;
