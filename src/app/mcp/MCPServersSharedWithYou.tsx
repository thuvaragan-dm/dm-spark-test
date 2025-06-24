import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useGetSharedWithYouMCPServers } from "../../api/mcp/useGetSharedWithYouMCPServers";
import mcpBannerImage from "../../assets/mcp_banner.png";
import mcpFullBannerImage from "../../assets/mcp_full_banner.jpg";
import { Button, ButtonVariants } from "../../components/Button";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import MCPConnectionIcon, {
  AvailableMCPProviders,
} from "../../components/MCPConnectionIcon";
import { Pagination } from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import { cn } from "../../utilities/cn";

const MCPServersSharedWithYou = () => {
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
    useGetSharedWithYouMCPServers(AvailableMCPConnectionOptions);

  if (searchQuery.length <= 0 && isConnectionsLoading) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      </section>
    );
  }

  if (searchQuery.length <= 0 && connections && connections.total <= 0) {
    return (
      <section className="dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-hidden bg-gray-100">
        <header className="relative flex h-full w-full flex-1 shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
          <div className="absolute inset-0 z-20 bg-black/50"></div>
          <div className="absolute inset-0 z-10">
            <img
              className="h-full w-full object-cover object-center"
              src={mcpFullBannerImage}
              alt="Academy banner image"
            />
          </div>
        </header>

        <div className="mt-5 flex h-52 w-full flex-col items-center justify-center pb-5">
          <h3 className="text-4xl font-medium text-gray-800 dark:text-white">
            No MCP Server Available Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-base text-balance text-gray-600 dark:text-white/60">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
            corporis eligendi eius accusantium
          </p>

          <Link
            to="/mcp/templates"
            className={cn(
              ButtonVariants({ variant: "primary" }),
              "mt-5 flex w-full items-center justify-center rounded-md py-1.5 [--border-highlight-radius:var(--radius-md)] md:w-auto",
            )}
          >
            Add new MCP Server
          </Link>
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
            src={mcpBannerImage}
            alt="Academy banner image"
          />
        </div>
        <div className="relative z-30 flex flex-col">
          <h1 className="text-center text-5xl font-medium text-white">
            MCP Servers Shared with you
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
          {isConnectionsLoading && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Spinner className="size-5 dark:text-white" />
            </div>
          )}

          {!isConnectionsLoading &&
            connections &&
            connections.items.length > 0 && (
              <>
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                  <div className="grid grid-cols-2 gap-5">
                    {connections.items.map((connection, idx) => (
                      <Link
                        key={idx}
                        to={`/mcp/details/connection/${connection.id}`}
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

                            <VscArrowRight className="size-4 text-gray-800 dark:text-white" />
                          </div>

                          <p className="mt-1 text-xs text-gray-600 dark:text-white/60">
                            {connection.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-start justify-start gap-3">
                            <span className="w-min rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider text-gray-800 shadow dark:bg-white/10 dark:text-white">
                              {connection.category}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-2xl items-center justify-end px-5">
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
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <svg
                    className="size-16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="a" fill="#fff">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.1 12.351l-.064.064-6.728 6.757a.218.218 0 00-.063.154.222.222 0 00.06.154l.004.003 1.381 1.39a.661.661 0 01.013.921l-.012.012a.658.658 0 01-.93 0l-1.382-1.387a1.523 1.523 0 01-.45-1.09 1.553 1.553 0 01.45-1.09l6.729-6.758c.362-.362.57-.856.576-1.375a1.981 1.981 0 00-.54-1.39l-.036-.037-.04-.038a1.975 1.975 0 00-1.393-.581c-.52 0-1.021.207-1.395.578l-5.54 5.569h-.003l-.075.077a.658.658 0 01-.93 0 .66.66 0 01-.012-.921l.011-.012 5.62-5.647a1.99 1.99 0 00.032-2.766l-.033-.035a1.975 1.975 0 00-1.395-.581c-.522 0-1.022.208-1.395.58l-7.437 7.474a.658.658 0 01-.93 0 .66.66 0 01-.013-.921l.013-.012 7.438-7.476A3.292 3.292 0 0112.954 3c.868 0 1.702.347 2.324.967.73.728 1.077 1.77.93 2.802a3.276 3.276 0 012.79.935l.04.039c.299.298.538.654.703 1.047a3.324 3.324 0 01-.642 3.56m-1.96-1.844a.66.66 0 00.011-.921l-.011-.012a.658.658 0 00-.931 0l-5.501 5.526c-.374.372-.874.58-1.395.58a1.975 1.975 0 01-1.973-1.982 1.996 1.996 0 01.578-1.4l5.502-5.528a.66.66 0 00.013-.921l-.013-.012a.658.658 0 00-.93 0l-5.5 5.526a3.26 3.26 0 00-.713 1.068 3.325 3.325 0 000 2.534A3.293 3.293 0 009.313 17c.868 0 1.702-.347 2.324-.967l5.502-5.526z"
                      />
                    </mask>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.1 12.351l-.064.064-6.728 6.757a.218.218 0 00-.063.154.222.222 0 00.06.154l.004.003 1.381 1.39a.661.661 0 01.013.921l-.012.012a.658.658 0 01-.93 0l-1.382-1.387a1.523 1.523 0 01-.45-1.09 1.553 1.553 0 01.45-1.09l6.729-6.758c.362-.362.57-.856.576-1.375a1.981 1.981 0 00-.54-1.39l-.036-.037-.04-.038a1.975 1.975 0 00-1.393-.581c-.52 0-1.021.207-1.395.578l-5.54 5.569h-.003l-.075.077a.658.658 0 01-.93 0 .66.66 0 01-.012-.921l.011-.012 5.62-5.647a1.99 1.99 0 00.032-2.766l-.033-.035a1.975 1.975 0 00-1.395-.581c-.522 0-1.022.208-1.395.58l-7.437 7.474a.658.658 0 01-.93 0 .66.66 0 01-.013-.921l.013-.012 7.438-7.476A3.292 3.292 0 0112.954 3c.868 0 1.702.347 2.324.967.73.728 1.077 1.77.93 2.802a3.276 3.276 0 012.79.935l.04.039c.299.298.538.654.703 1.047a3.324 3.324 0 01-.642 3.56m-1.96-1.844a.66.66 0 00.011-.921l-.011-.012a.658.658 0 00-.931 0l-5.501 5.526c-.374.372-.874.58-1.395.58a1.975 1.975 0 01-1.973-1.982 1.996 1.996 0 01.578-1.4l5.502-5.528a.66.66 0 00.013-.921l-.013-.012a.658.658 0 00-.93 0l-5.5 5.526a3.26 3.26 0 00-.713 1.068 3.325 3.325 0 000 2.534A3.293 3.293 0 009.313 17c.868 0 1.702-.347 2.324-.967l5.502-5.526z"
                      fill="currentColor"
                    />
                    <path
                      d="M19.036 12.415l1.373 1.368.001-.001-1.374-1.367zm-6.728 6.757l1.37 1.371.004-.003-1.373-1.368zm-.003.308l-1.401 1.339.007.007.007.008 1.387-1.354zm.004.003l-1.387 1.354.006.007.006.006 1.375-1.367zm1.381 1.39l-1.374 1.366.004.004 1.37-1.37zm.013.921l1.387 1.354.01-.011.012-.012-1.41-1.33zm-.012.012l1.37 1.37.009-.008.008-.008-1.387-1.354zm-.93 0l-1.373 1.368.003.003 1.37-1.371zm-1.382-1.387l1.373-1.368-.006-.005-1.367 1.373zm0-2.18l1.367 1.374.006-.006-1.373-1.368zm6.729-6.758l-1.37-1.372-.004.004 1.374 1.368zm.035-2.764l-1.408 1.331.003.003 1.405-1.334zm-.035-.038l1.408-1.332-.031-.033-.032-.03-1.345 1.395zm-.04-.038L16.7 10.012l.012.012.012.012 1.345-1.395zm-2.788-.003l-1.366-1.374-.007.007 1.373 1.367zm-5.54 5.569v1.938h.805l.568-.571-1.373-1.367zm-.003 0v-1.938H8.92l-.57.584 1.386 1.354zm-.075.077l1.37 1.37.008-.008.009-.008-1.387-1.354zm-.93 0l-1.373 1.368.003.003 1.37-1.37zm-.012-.921l-1.387-1.354-.01.01-.01.011 1.407 1.333zm.011-.012l-1.373-1.367-.007.006-.006.007 1.386 1.354zm5.62-5.647L12.98 6.335l-.002.002 1.374 1.367zm.032-2.766l-1.41 1.33.008.008 1.402-1.338zm-.033-.035l1.409-1.33-.02-.022-.02-.02-1.37 1.372zm-1.395-.581V6.26 4.322zm-1.395.58l-1.37-1.371-.004.005 1.374 1.367zm-7.437 7.474l1.368 1.373.005-.006-1.373-1.367zm-.93 0l-1.37 1.37.002.002 1.368-1.372zm-.013-.921l-1.32-1.419-.046.043-.042.045 1.408 1.33zm.013-.012l1.32 1.418.028-.025.026-.026-1.374-1.367zm7.438-7.476L9.262 2.595l-.006.005 1.374 1.367zm4.648 0L13.91 5.34l1.368-1.373zm.93 2.802l-1.918-.271-.362 2.562 2.56-.373-.28-1.918zm2.79.935l-1.37 1.37.003.004 1.367-1.374zm.04.039l1.367-1.373-.002-.001-1.366 1.374zm-1.9 2.763l-1.372-1.369v.002l1.373 1.367zm.012-.921l1.407-1.333-.01-.01-.01-.011-1.387 1.354zm-.011-.012l1.386-1.354-.008-.009-.009-.008-1.37 1.37zm-.931 0l-1.37-1.371-.004.003 1.374 1.368zm-5.501 5.526l1.368 1.372.005-.005-1.373-1.367zm-1.395.58v-1.938 1.939zm-1.395-.58l1.368-1.372-1.368 1.372zm0-2.803l1.368 1.373.005-.005-1.373-1.368zm5.502-5.527l-1.37-1.37-.003.003 1.373 1.367zm.013-.921l1.408-1.33-.042-.046-.046-.042-1.32 1.418zm-.013-.012l-1.37 1.37.024.025.025.023 1.321-1.418zm-.465-.194V7.58 5.642zm-.466.194l-1.37-1.37-.003.003 1.373 1.367zm-5.5 5.526l1.368 1.373.006-.006-1.374-1.367zm-.963 2.335H4.087h1.938zm.963 2.335l1.368-1.373-1.368 1.373zm4.65 0l1.367 1.372.006-.005-1.374-1.367zm7.462-3.68l-1.375-1.367-.063.064 1.374 1.366 1.374 1.367.064-.065-1.374-1.366zm-.064.063l-1.373-1.367-6.728 6.757 1.373 1.367 1.374 1.368 6.727-6.757-1.373-1.368zm-6.728 6.757l-1.37-1.37c-.2.2-.357.436-.464.693l1.788.747 1.788.748a1.719 1.719 0 01-.372.553l-1.37-1.37zm-.046.07l-1.788-.747a2.161 2.161 0 00-.167.808l1.938.023 1.937.021a1.72 1.72 0 01-.132.643l-1.788-.748zm-.018.084l-1.937-.023a2.16 2.16 0 00.148.813l1.805-.707 1.804-.707c.081.206.12.426.118.645l-1.938-.021zm.016.083l-1.805.707c.102.259.254.498.449.703l1.401-1.339 1.401-1.339c.157.164.277.355.358.561l-1.804.707zm.045.071l-1.387 1.354.004.003 1.386-1.354 1.387-1.353-.003-.004-1.387 1.354zm.004.003l-1.374 1.367 1.381 1.39 1.374-1.367 1.374-1.367-1.381-1.39-1.374 1.367zm1.381 1.39l-1.37 1.37a1.277 1.277 0 01-.376-.885l1.938-.027 1.938-.027a2.599 2.599 0 00-.76-1.801l-1.37 1.37zm.192.458l-1.938.027a1.276 1.276 0 01.35-.895l1.409 1.331 1.409 1.33a2.6 2.6 0 00.708-1.82l-1.938.027zm-.18.463l-1.386-1.354-.011.012 1.386 1.354 1.387 1.354.012-.012-1.387-1.354zm-.01.012l-1.37-1.37a1.28 1.28 0 01.904-.374v3.876c.694 0 1.352-.278 1.835-.761l-1.37-1.371zm-.466.194v-1.938c.347 0 .67.14.904.373l-1.37 1.371-1.37 1.37a2.594 2.594 0 001.836.762V22zm-.465-.194l1.373-1.368-1.382-1.387-1.373 1.368-1.373 1.368 1.382 1.387 1.373-1.368zm-1.382-1.387l1.367-1.373a.417.417 0 01.092.136l-1.792.739-1.791.739c.174.423.43.808.757 1.133l1.367-1.374zm-.333-.498l1.792-.74c.02.049.03.099.03.148H8.99c0 .456.09.909.264 1.331l1.791-.74zm-.117-.592h1.938c0 .05-.01.1-.03.148l-1.79-.74-1.792-.739a3.49 3.49 0 00-.264 1.331h1.938zm.117-.591l1.792.739a.416.416 0 01-.092.136l-1.367-1.374-1.367-1.373a3.46 3.46 0 00-.757 1.132l1.791.74zm.333-.499l1.373 1.367 6.729-6.758-1.373-1.367-1.374-1.368-6.728 6.759 1.373 1.367zm6.729-6.758l1.369 1.371a3.916 3.916 0 001.145-2.72l-1.938-.026-1.938-.025a.059.059 0 01-.004.022c-.002.005-.004.007-.004.006l1.37 1.372zm.576-1.375l1.938.025a3.92 3.92 0 00-1.073-2.749l-1.405 1.335-1.406 1.334.005.008a.059.059 0 01.003.022l1.938.025zm-.54-1.39l1.408-1.331-.036-.038-1.408 1.332L16.7 10.01l.036.038 1.409-1.331zm-.036-.037l1.345-1.396-.04-.038-1.345 1.396-1.345 1.395.04.038 1.345-1.395zm-.04-.038l1.369-1.372a3.913 3.913 0 00-2.76-1.147l-.002 1.938-.002 1.938a.02.02 0 01.008.001.06.06 0 01.018.013l1.37-1.371zm-1.393-.581l.001-1.938a3.911 3.911 0 00-2.762 1.142l1.367 1.374 1.366 1.374a.058.058 0 01.018-.013.02.02 0 01.008-.001l.002-1.938zm-1.395.578l-1.373-1.367-5.542 5.569 1.374 1.367 1.373 1.367 5.542-5.569-1.373-1.367zM9.74 14.207v-1.938h-.003v3.876h.003v-1.938zm-.003 0L8.35 12.853l-.076.077 1.387 1.354 1.387 1.354.075-.077-1.387-1.354zm-.075.077l-1.37-1.37a1.28 1.28 0 01.905-.374v3.876c.694 0 1.352-.278 1.835-.761l-1.37-1.37zm-.465.194V12.54c.346 0 .67.14.904.373l-1.37 1.371-1.37 1.37a2.594 2.594 0 001.836.762v-1.938zm-.466-.194l1.373-1.368c.24.241.37.56.374.886l-1.938.024-1.938.024c.009.67.276 1.32.757 1.803l1.372-1.369zm-.191-.458l1.938-.024c.004.324-.117.646-.351.893L8.72 13.363 7.313 12.03a2.6 2.6 0 00-.71 1.82l1.937-.024zm.18-.463l1.386 1.354.012-.012L8.73 13.35l-1.386-1.354-.012.012 1.387 1.354zm.011-.012l1.374 1.367 5.62-5.647-1.373-1.367-1.374-1.367-5.62 5.647L8.73 13.35zm5.62-5.647l1.373 1.368a3.928 3.928 0 00.062-5.471l-1.403 1.337-1.402 1.338a.02.02 0 01.004.007.064.064 0 01.004.022.06.06 0 01-.004.023.02.02 0 01-.005.007l1.372 1.369zm.032-2.766l1.41-1.33-.034-.035-1.41 1.33-1.409 1.33.034.035 1.41-1.33zm-.033-.035l1.368-1.372a3.913 3.913 0 00-2.763-1.147V6.26a.02.02 0 01.008.002c.004.001.01.005.018.013l1.369-1.372zm-1.395-.581V2.384a3.913 3.913 0 00-2.764 1.147l1.369 1.372 1.368 1.372a.058.058 0 01.019-.013.02.02 0 01.008-.002V4.322zm-1.395.58l-1.374-1.366-7.437 7.473 1.374 1.367 1.373 1.367 7.437-7.473-1.373-1.367zm-7.437 7.474l-1.368-1.372a1.28 1.28 0 01.903-.372v3.875c.693 0 1.35-.277 1.833-.758l-1.368-1.373zm-.465.193v-1.938c.346 0 .67.14.903.373l-1.368 1.372-1.368 1.373c.483.48 1.14.758 1.833.758V12.57zm-.465-.193l1.37-1.37c.242.24.371.56.376.885L3 11.918l-1.938.027c.01.67.277 1.319.76 1.801l1.37-1.37zM3 11.918l1.938-.027c.004.325-.116.647-.35.894l-1.409-1.33-1.408-1.331a2.6 2.6 0 00-.709 1.82L3 11.919zm.18-.463l1.32 1.418.013-.012-1.32-1.418-1.322-1.418-.012.011 1.32 1.419zm.012-.012l1.374 1.367 7.438-7.476-1.374-1.367L9.256 2.6l-7.438 7.476 1.374 1.367zm7.438-7.476l1.368 1.373c.264-.263.608-.402.956-.402V1.062a5.23 5.23 0 00-3.692 1.533l1.368 1.372zM12.954 3v1.938c.348 0 .692.139.956.402l1.368-1.373 1.368-1.372a5.23 5.23 0 00-3.692-1.533V3zm2.324.967L13.91 5.34c.293.292.442.722.38 1.158l1.919.271 1.919.272a5.244 5.244 0 00-1.482-4.446l-1.368 1.372zm.93 2.802l.28 1.918c.407-.06.829.077 1.14.387l1.37-1.37 1.37-1.37a5.214 5.214 0 00-4.438-1.482l.279 1.917zm2.79.935L17.63 9.078l.04.04 1.366-1.375 1.367-1.374-.04-.04-1.366 1.375zm.04.039l-1.369 1.373c.12.118.217.262.285.425l1.787-.751 1.787-.75a5.198 5.198 0 00-1.123-1.67l-1.368 1.373zm.703 1.047l-1.787.75c.069.163.105.34.108.52L20 10.032l1.938-.025a5.263 5.263 0 00-.41-1.969l-1.787.751zM20 10.033l-1.938.026a1.4 1.4 0 01-.094.522l1.806.703 1.806.702c.245-.63.367-1.303.358-1.979L20 10.034zm-.226 1.25l-1.806-.702a1.33 1.33 0 01-.274.434l1.405 1.335 1.404 1.335a5.205 5.205 0 001.077-1.699l-1.806-.703zm-2.636-.777l1.373 1.368a2.598 2.598 0 00.757-1.802l-1.938-.024-1.938-.025c.004-.325.134-.644.374-.886l1.373 1.369zm.192-.458l1.938.024a2.6 2.6 0 00-.71-1.82L17.15 9.585l-1.407 1.332a1.277 1.277 0 01-.35-.894l1.937.025zm-.18-.463l1.387-1.354-.012-.012-1.386 1.354-1.387 1.353.011.012 1.387-1.353zm-.011-.012l1.37-1.371a2.596 2.596 0 00-1.836-.761v3.876c-.346 0-.67-.14-.904-.373l1.37-1.371zm-.466-.194V7.44c-.694 0-1.352.278-1.835.76l1.37 1.372 1.37 1.37a1.28 1.28 0 01-.905.374V9.379zm-.465.194l-1.374-1.368-5.5 5.526 1.373 1.368 1.373 1.367 5.501-5.526-1.373-1.367zm-5.501 5.526l-1.369-1.372a.058.058 0 01-.018.013.02.02 0 01-.008.002v3.875a3.913 3.913 0 002.763-1.146l-1.368-1.372zm-1.395.58v-1.938a.02.02 0 01-.008-.001.058.058 0 01-.019-.013l-1.368 1.372-1.369 1.372a3.913 3.913 0 002.764 1.146V15.68zm-1.395-.58l1.368-1.373-.004-.006-1.791.738-1.792.738c.196.476.484.91.85 1.275l1.369-1.372zm-.427-.641l1.791-.738a.06.06 0 01-.004-.023H5.401c0 .514.1 1.024.297 1.5l1.792-.74zm-.15-.76h1.937c0-.01.002-.017.004-.023l-1.791-.738-1.792-.738a3.935 3.935 0 00-.296 1.498h1.937zm.15-.76l1.791.737.004-.007-1.368-1.372-1.369-1.372a3.896 3.896 0 00-.85 1.275l1.792.738zm.427-.642l1.373 1.368 5.502-5.527-1.373-1.368-1.373-1.367-5.503 5.527 1.374 1.367zm5.502-5.527l1.37 1.37c.483-.482.75-1.13.76-1.8L13.61 6.31l-1.938-.027c.005-.325.134-.644.376-.885l1.37 1.37zm.192-.458l1.938.027a2.6 2.6 0 00-.709-1.82l-1.408 1.33-1.409 1.33a1.276 1.276 0 01-.35-.894l1.938.027zm-.18-.463l1.321-1.418-.012-.012-1.321 1.418-1.32 1.418.012.012 1.32-1.418zm-.012-.012l1.37-1.37a2.596 2.596 0 00-1.835-.762V7.58c-.347 0-.67-.14-.905-.373l1.37-1.371zm-.465-.194V3.704a2.6 2.6 0 00-1.836.761l1.37 1.371 1.37 1.37a1.28 1.28 0 01-.904.374V5.642zm-.466.194l-1.373-1.367-5.5 5.526 1.373 1.367 1.374 1.367 5.5-5.526-1.374-1.367zm-5.5 5.526L5.621 9.989a5.2 5.2 0 00-1.137 1.702l1.792.739 1.792.738c.068-.165.167-.312.288-.433l-1.368-1.373zm-.712 1.068l-1.792-.74a5.263 5.263 0 00-.397 2.007h3.876c0-.183.036-.363.105-.529l-1.792-.738zm-.25 1.267h-1.94c0 .688.135 1.37.397 2.006l1.792-.739 1.792-.739a1.388 1.388 0 01-.105-.528H6.025zm.25 1.267l-1.792.74a5.198 5.198 0 001.137 1.7l1.367-1.372 1.368-1.373a1.323 1.323 0 01-.288-.434l-1.792.74zm.712 1.068L5.62 17.404a5.23 5.23 0 003.693 1.533v-3.876c-.349 0-.693-.139-.957-.402l-1.368 1.373zm2.325.967v1.938a5.23 5.23 0 003.692-1.533l-1.368-1.372-1.368-1.373a1.355 1.355 0 01-.956.402V17zm2.324-.967l1.374 1.367 5.5-5.526-1.372-1.367-1.374-1.367-5.501 5.526 1.373 1.367z"
                      fill="currentColor"
                      mask="url(#a)"
                    />
                  </svg>
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

export default MCPServersSharedWithYou;
