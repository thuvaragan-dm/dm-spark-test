import { useMemo, useState } from "react";
import { VscArrowRight, VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useGetCreatedByYouMCPServers } from "../../api/mcp/useGetCreatedByYouMCPServers";
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

const MCPServersCreatedByYou = () => {
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
    useGetCreatedByYouMCPServers(AvailableMCPConnectionOptions);

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
            MCP Servers Created by you
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
                            <span className="w-min shrink-0 rounded-full bg-gray-200 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-800 shadow dark:bg-white/10 dark:text-white">
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
                    viewBox="0 0 24 24"
                    className="size-16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="a" fill="#fff">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.994 11.335l-.071.071-7.52 7.469a.237.237 0 00-.07.169.244.244 0 00.067.17l.004.005 1.544 1.535a.726.726 0 01.014 1.018l-.013.014a.74.74 0 01-1.04 0l-1.544-1.533a1.68 1.68 0 01-.503-1.205 1.697 1.697 0 01.503-1.205l7.52-7.47c.405-.4.637-.946.644-1.519a2.177 2.177 0 00-.604-1.536l-.04-.042-.044-.042a2.22 2.22 0 00-1.557-.642 2.22 2.22 0 00-1.559.64l-6.193 6.155h-.003l-.084.085a.74.74 0 01-1.04 0 .726.726 0 01-.013-1.018l.013-.014 6.281-6.24a2.182 2.182 0 00.035-3.057l-.037-.039a2.22 2.22 0 00-1.56-.642 2.22 2.22 0 00-1.559.642l-8.311 8.26a.74.74 0 01-1.04 0 .726.726 0 01-.014-1.018l.015-.014 8.313-8.262A3.7 3.7 0 0113.125 1a3.7 3.7 0 012.598 1.069 3.63 3.63 0 011.04 3.097 3.686 3.686 0 013.117 1.033l.044.043a3.64 3.64 0 01.069 5.092m-2.191-2.038a.726.726 0 00.013-1.018l-.013-.014a.74.74 0 00-1.04 0l-6.149 6.108a2.22 2.22 0 01-1.559.642 2.22 2.22 0 01-1.559-.642 2.162 2.162 0 01-.645-1.548 2.185 2.185 0 01.645-1.549l6.15-6.109a.727.727 0 00.014-1.018l-.014-.013a.74.74 0 00-1.04 0l-6.148 6.107c-.34.336-.61.737-.796 1.18a3.64 3.64 0 00.796 3.982 3.701 3.701 0 002.599 1.069c.97 0 1.902-.384 2.598-1.07l6.148-6.107z"
                      />
                    </mask>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.994 11.335l-.071.071-7.52 7.469a.237.237 0 00-.07.169.244.244 0 00.067.17l.004.005 1.544 1.535a.726.726 0 01.014 1.018l-.013.014a.74.74 0 01-1.04 0l-1.544-1.533a1.68 1.68 0 01-.503-1.205 1.697 1.697 0 01.503-1.205l7.52-7.47c.405-.4.637-.946.644-1.519a2.177 2.177 0 00-.604-1.536l-.04-.042-.044-.042a2.22 2.22 0 00-1.557-.642 2.22 2.22 0 00-1.559.64l-6.193 6.155h-.003l-.084.085a.74.74 0 01-1.04 0 .726.726 0 01-.013-1.018l.013-.014 6.281-6.24a2.182 2.182 0 00.035-3.057l-.037-.039a2.22 2.22 0 00-1.56-.642 2.22 2.22 0 00-1.559.642l-8.311 8.26a.74.74 0 01-1.04 0 .726.726 0 01-.014-1.018l.015-.014 8.313-8.262A3.7 3.7 0 0113.125 1a3.7 3.7 0 012.598 1.069 3.63 3.63 0 011.04 3.097 3.686 3.686 0 013.117 1.033l.044.043a3.64 3.64 0 01.069 5.092m-2.191-2.038a.726.726 0 00.013-1.018l-.013-.014a.74.74 0 00-1.04 0l-6.149 6.108a2.22 2.22 0 01-1.559.642 2.22 2.22 0 01-1.559-.642 2.162 2.162 0 01-.645-1.548 2.185 2.185 0 01.645-1.549l6.15-6.109a.727.727 0 00.014-1.018l-.014-.013a.74.74 0 00-1.04 0l-6.148 6.107c-.34.336-.61.737-.796 1.18a3.64 3.64 0 00.796 3.982 3.701 3.701 0 002.599 1.069c.97 0 1.902-.384 2.598-1.07l6.148-6.107z"
                      fill="currentColor"
                    />
                    <path
                      d="M19.923 11.406l1.365 1.375h.001l-1.366-1.375zm-7.52 7.469l1.363 1.378.003-.003-1.365-1.375zm-.003.34l-1.394 1.346.007.008.008.007 1.379-1.361zm.004.004l-1.38 1.361.007.007.006.006 1.367-1.374zm1.544 1.535l-1.367 1.374.004.004 1.363-1.378zm.014 1.018l1.38 1.362.01-.011.011-.012-1.4-1.338zm-.013.014l1.362 1.378.009-.008.008-.009-1.379-1.361zm-1.04 0l-1.365 1.375.003.003 1.362-1.378zm-1.544-1.533l1.365-1.376-.006-.005-1.36 1.38zm0-2.41l1.36 1.381.005-.006-1.365-1.375zm7.52-7.47l-1.362-1.379L17.52 9l1.366 1.374zm.04-3.055l-1.4 1.34.002.003 1.398-1.343zm-.04-.042l1.4-1.34-.03-.031-.033-.031-1.337 1.402zm-.044-.042l-1.361 1.38.012.011.012.012 1.337-1.403zm-3.116-.002L14.367 5.85l-.008.007 1.366 1.375zm-6.193 6.155v1.938h.799l.567-.564-1.366-1.374zm-.003 0v-1.938h-.81l-.57.576 1.38 1.362zm-.084.085l1.362 1.378.008-.008.009-.009-1.38-1.361zm-1.04 0L7.04 14.848l.002.002 1.363-1.378zm-.013-1.018l-1.38-1.362-.01.01-.01.011 1.4 1.34zm.013-.014l-1.366-1.374-.007.006-.007.007 1.38 1.361zm6.281-6.24l-1.364-1.377-.002.002L14.686 6.2zm.035-3.057L13.32 4.48l.007.008 1.395-1.346zm-.037-.039l1.402-1.338-.02-.021-.021-.02-1.361 1.38zm-1.56-.642V4.4 2.461zm-1.559.642l-1.36-1.38-.006.005 1.367 1.375zm-8.311 8.26l1.36 1.38.006-.005-1.366-1.375zm-1.04 0L.853 12.74l.002.002 1.36-1.38zM2.2 10.345L.888 8.919l-.046.042-.043.045L2.2 10.345zm.015-.014l1.313 1.426.027-.025.026-.026-1.366-1.375zm8.313-8.262L9.168.689l-.006.005 1.366 1.375zm5.195 0l-1.36 1.38 1.36-1.38zm1.04 3.097l-1.919-.274-.366 2.56 2.56-.368-.275-1.918zm3.117 1.033l-1.363 1.378.004.004 1.359-1.382zm.044.043l1.36-1.38-.001-.002-1.36 1.382zm-2.122 3.054L16.437 7.92v.001l1.365 1.375zm.013-1.018l1.4-1.34-.01-.011-.011-.01-1.38 1.36zm-.013-.014l1.38-1.36-.01-.01-.008-.008-1.362 1.378zm-1.04 0l-1.363-1.378-.003.004 1.366 1.375zm-6.149 6.108l1.361 1.38.005-.005-1.366-1.375zm-1.559.642v-1.938 1.938zm-1.559-.642l1.361-1.38-1.36 1.38zm0-3.097l1.361 1.38.005-.005-1.366-1.375zm6.15-6.109l-1.363-1.378-.003.003 1.366 1.375zm.014-1.018l1.401-1.339-.043-.045-.045-.042-1.313 1.426zm-.014-.013l-1.362 1.378.024.024.025.023 1.313-1.425zm-.52-.215v1.938V3.92zm-.52.215l-1.363-1.379-.004.004 1.366 1.375zm-6.148 6.107l1.36 1.38.006-.005-1.366-1.375zm-1.076 2.58H3.443h1.938zm1.076 2.582l1.36-1.38-1.36 1.38zm5.197 0l1.36 1.38.005-.005-1.365-1.375zm8.34-4.069l-1.367-1.374-.071.071 1.367 1.374 1.366 1.374.071-.07-1.366-1.375zm-.071.071l-1.366-1.375-7.52 7.469 1.367 1.375 1.365 1.375 7.52-7.469-1.366-1.375zm-7.52 7.469l-1.362-1.379a2.18 2.18 0 00-.475.701l1.785.755 1.785.755c-.086.203-.211.39-.37.546l-1.362-1.378zm-.052.077l-1.785-.755c-.11.262-.168.542-.172.825l1.938.022 1.938.022c-.003.22-.048.438-.134.64l-1.785-.754zm-.019.092l-1.938-.022c-.003.283.049.564.153.828l1.802-.714 1.802-.713c.081.205.122.423.119.643l-1.938-.022zm.017.092l-1.802.714c.105.264.26.506.46.711l1.393-1.346 1.393-1.347c.156.16.277.35.358.555l-1.802.713zm.05.079l-1.378 1.361.003.004 1.38-1.361 1.379-1.362-.004-.004-1.38 1.362zm.005.004l-1.367 1.374 1.544 1.535 1.367-1.374 1.366-1.374-1.544-1.536-1.366 1.375zm1.544 1.535l-1.363 1.378a1.211 1.211 0 01-.36-.845l1.938-.027 1.937-.027a2.665 2.665 0 00-.79-1.857l-1.362 1.378zm.214.506l-1.937.027a1.21 1.21 0 01.336-.853l1.401 1.338 1.401 1.34a2.665 2.665 0 00.737-1.879l-1.938.027zm-.2.512l-1.38-1.361-.012.013 1.38 1.362 1.378 1.361.013-.013-1.379-1.361zm-.013.014l-1.362-1.379a1.2 1.2 0 01.842-.345v3.876c.708 0 1.383-.28 1.882-.774l-1.362-1.378zm-.52.214v-1.938c.32 0 .621.127.842.345l-1.362 1.379-1.362 1.378a2.678 2.678 0 001.882.774V22zm-.52-.214l1.365-1.376-1.544-1.533-1.365 1.376-1.366 1.375 1.545 1.533 1.365-1.375zm-1.544-1.533l1.36-1.381a.256.256 0 01.056.084l-1.788.746-1.789.746c.186.444.457.848.801 1.186l1.36-1.381zm-.372-.551l1.788-.746a.23.23 0 01.019.092H8.924c0 .48.095.956.28 1.4l1.789-.746zm-.131-.654H12.8a.24.24 0 01-.019.092l-1.788-.746-1.789-.746a3.64 3.64 0 00-.28 1.4h1.938zm.13-.654l1.79.746a.257.257 0 01-.058.084l-1.36-1.38-1.359-1.382a3.619 3.619 0 00-.8 1.186l1.788.746zm.373-.55l1.365 1.374 7.52-7.47-1.365-1.375L17.519 9 10 16.469l1.366 1.374zm7.52-7.47l1.361 1.378a4.113 4.113 0 001.221-2.872l-1.938-.026-1.938-.025a.237.237 0 01-.068.165l1.362 1.38zm.644-1.52l1.938.026a4.114 4.114 0 00-1.144-2.904l-1.398 1.342-1.398 1.343c.04.04.065.1.064.168l1.938.025zm-.604-1.536l1.4-1.34-.04-.041-1.4 1.34-1.4 1.339.04.042 1.4-1.34zm-.04-.042l1.337-1.402-.044-.042-1.337 1.402-1.337 1.403.044.042 1.337-1.403zm-.044-.042l1.36-1.38a4.158 4.158 0 00-2.916-1.2l-.001 1.938-.002 1.938c.07 0 .14.027.198.084l1.36-1.38zm-1.557-.642l.001-1.938a4.16 4.16 0 00-2.918 1.196l1.358 1.382 1.359 1.381a.282.282 0 01.198-.083l.002-1.938zm-1.559.64L14.36 5.857l-6.193 6.155 1.366 1.375 1.366 1.374 6.193-6.155-1.366-1.374zm-6.193 6.155v-1.938h-.003v3.876h.003v-1.938zm-.003 0l-1.38-1.362-.083.085 1.379 1.362 1.379 1.361.084-.085-1.379-1.361zm-.084.085l-1.362-1.379c.22-.218.522-.345.842-.345v3.876c.708 0 1.383-.28 1.882-.774l-1.362-1.378zm-.52.214v-1.938c.319 0 .62.127.842.345l-1.362 1.379-1.363 1.378c.5.494 1.175.774 1.883.774v-1.938zm-.52-.214l1.364-1.376c.229.227.355.531.36.845l-1.938.024-1.938.025c.009.695.289 1.364.787 1.858l1.365-1.376zm-.214-.507l1.937-.024a1.21 1.21 0 01-.337.853l-1.4-1.34-1.399-1.34a2.665 2.665 0 00-.74 1.876l1.939-.025zm.2-.511l1.38 1.361.013-.013-1.38-1.362-1.379-1.361-.013.013 1.38 1.361zm.014-.014l1.365 1.375 6.282-6.241-1.366-1.375-1.366-1.375-6.281 6.242 1.366 1.374zm6.281-6.24l1.364 1.376a4.12 4.12 0 00.066-5.778l-1.395 1.345-1.395 1.346a.244.244 0 01-.004.334L14.686 6.2zm.035-3.057l1.402-1.337-.037-.04-1.402 1.338-1.402 1.338.037.04 1.402-1.339zm-.037-.039l1.36-1.38a4.158 4.158 0 00-2.92-1.2V4.4c.07 0 .141.027.199.084l1.36-1.38zm-1.56-.642V.523a4.158 4.158 0 00-2.92 1.2l1.361 1.38 1.362 1.38a.282.282 0 01.198-.084V2.461zm-1.559.642L10.2 1.728l-8.311 8.26 1.366 1.375 1.366 1.375 8.311-8.26-1.365-1.375zm-8.311 8.26l-1.36-1.38c.22-.218.521-.344.84-.344v3.876c.707 0 1.381-.28 1.88-.772l-1.36-1.38zm-.52.214V9.639c.319 0 .62.126.841.344l-1.36 1.38-1.36 1.38a2.674 2.674 0 001.88.772v-1.938zm-.52-.214l1.364-1.378c.229.227.355.531.36.845L2 10.857l-1.938.027c.01.695.291 1.363.79 1.857l1.363-1.378zM2 10.857l1.938-.027c.004.313-.114.62-.336.853L2.2 10.345.8 9.005a2.665 2.665 0 00-.738 1.879L2 10.857zm.2-.512l1.313 1.425.015-.013-1.313-1.426L.902 8.906l-.014.013L2.2 10.345zm.015-.014l1.366 1.375 8.313-8.263-1.366-1.374L9.162.694.849 8.957l1.366 1.374zm8.313-8.262l1.36 1.38c.336-.33.78-.511 1.237-.511V-.938A5.638 5.638 0 009.167.69l1.36 1.38zM13.125 1v1.938c.458 0 .902.18 1.237.511l1.36-1.38 1.361-1.38a5.637 5.637 0 00-3.958-1.627V1zm2.598 1.069l-1.36 1.38c.375.37.558.907.482 1.443l1.918.274 1.918.274A5.567 5.567 0 0017.083.69l-1.36 1.38zm1.04 3.097l.276 1.918a1.749 1.749 0 011.478.493l1.363-1.378 1.363-1.378a5.624 5.624 0 00-4.756-1.573l.276 1.918zm3.117 1.033L18.52 7.58l.044.043 1.359-1.382 1.359-1.382-.045-.043-1.358 1.382zm.044.043l-1.36 1.38c.153.152.277.333.363.535L20.71 7.4l1.784-.758a5.538 5.538 0 00-1.21-1.78l-1.36 1.38zM20.71 7.4l-1.783.757c.086.203.132.421.135.643L21 8.774l1.937-.026a5.577 5.577 0 00-.443-2.106L20.71 7.4zM21 8.774l-1.938.026c.003.222-.037.441-.118.646l1.804.71 1.803.709a5.578 5.578 0 00.386-2.117L21 8.774zm-.252 1.381l-1.804-.709c-.08.205-.2.39-.349.545l1.398 1.343 1.397 1.343a5.545 5.545 0 001.161-1.812l-1.803-.71zm-2.946-.859l1.364 1.376a2.664 2.664 0 00.788-1.858l-1.938-.024-1.938-.025c.004-.314.13-.618.36-.845l1.364 1.376zm.214-.506l1.938.024a2.665 2.665 0 00-.74-1.877l-1.4 1.34-1.399 1.341a1.211 1.211 0 01-.337-.853l1.938.025zm-.201-.512l1.379-1.362-.013-.013-1.38 1.362-1.378 1.36.013.014 1.379-1.361zm-.013-.014l1.362-1.378a2.678 2.678 0 00-1.882-.774v3.876c-.32 0-.621-.127-.842-.345l1.362-1.379zm-.52-.214V6.112c-.708 0-1.383.28-1.883.774l1.363 1.378 1.362 1.379a1.198 1.198 0 01-.842.345V8.05zm-.52.214L15.396 6.89l-6.148 6.107 1.365 1.375 1.366 1.375 6.148-6.108-1.365-1.374zm-6.149 6.108l-1.36-1.38a.282.282 0 01-.199.084v3.876a4.157 4.157 0 002.92-1.2l-1.36-1.38zm-1.559.642v-1.938a.282.282 0 01-.198-.083l-1.36 1.38-1.362 1.379a4.158 4.158 0 002.92 1.2v-1.938zm-1.559-.642l1.361-1.38a.225.225 0 01-.05-.073l-1.788.745-1.789.745c.21.503.517.96.905 1.343l1.361-1.38zm-.477-.708l1.789-.745a.247.247 0 01-.02-.095H4.913c0 .544.108 1.083.317 1.585l1.789-.745zm-.168-.84h1.938c0-.034.007-.066.019-.096l-1.79-.745-1.788-.745a4.124 4.124 0 00-.317 1.586H6.85zm.168-.84l1.789.744a.224.224 0 01.049-.073l-1.36-1.38-1.362-1.38a4.1 4.1 0 00-.905 1.343l1.789.745zm.477-.709l1.366 1.375 6.15-6.11-1.366-1.374-1.366-1.375-6.15 6.11 1.366 1.374zm6.15-6.109l1.363 1.378c.498-.494.78-1.162.79-1.857l-1.939-.027-1.937-.027c.004-.314.13-.618.36-.845l1.363 1.378zm.214-.506l1.938.027a2.664 2.664 0 00-.737-1.878l-1.4 1.339-1.401 1.338a1.211 1.211 0 01-.336-.853l1.937.027zm-.2-.512l1.313-1.426-.014-.013-1.313 1.426-1.313 1.425.014.013 1.313-1.425zm-.014-.013l1.362-1.379a2.678 2.678 0 00-1.882-.774v3.876c-.32 0-.621-.127-.842-.345l1.362-1.378zm-.52-.215V1.982c-.708 0-1.383.28-1.883.774l1.362 1.379 1.363 1.378a1.198 1.198 0 01-.842.345V3.92zm-.52.215L11.237 2.76 5.093 8.867l1.365 1.375 1.366 1.375 6.147-6.108-1.366-1.374zm-6.148 6.107l-1.36-1.38a5.54 5.54 0 00-1.224 1.814l1.788.746 1.789.746c.086-.206.211-.392.367-.545l-1.36-1.38zm-.796 1.18l-1.788-.746c-.284.68-.43 1.41-.43 2.147H7.32c0-.226.045-.449.131-.655l-1.789-.746zm-.28 1.4H3.443c0 .738.146 1.468.43 2.148l1.788-.746 1.789-.746a1.702 1.702 0 01-.13-.655H5.38zm.28 1.402l-1.788.745c.283.68.7 1.298 1.224 1.815l1.36-1.38 1.36-1.38a1.664 1.664 0 01-.367-.546l-1.789.746zm.796 1.18l-1.36 1.38a5.639 5.639 0 003.958 1.627v-3.876c-.457 0-.902-.18-1.237-.512l-1.36 1.38zm2.599 1.069v1.938a5.639 5.639 0 003.958-1.627l-1.36-1.38-1.36-1.38c-.336.33-.78.51-1.239.51v1.939zm2.598-1.07l1.365 1.376 6.149-6.108-1.366-1.375-1.366-1.375-6.148 6.108 1.366 1.375z"
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

export default MCPServersCreatedByYou;
