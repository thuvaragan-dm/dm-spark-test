import LoginImage from "../assets/login.jpg";
import { Button } from "../components/Button";

const NotSupported = () => {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-30 bg-black/30 mask-l-from-10%"></div>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <img
          src={LoginImage}
          alt="Login Background"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-50 grid w-full flex-1 grid-cols-7 overflow-hidden p-10">
        <div className="col-span-4"></div>
        {/* form */}
        <div className="items-start-safe scrollbar col-span-3 flex w-full flex-1 flex-col justify-center-safe overflow-y-auto pl-20">
          <h1 className="w-full text-4xl font-medium text-balance text-white @6xl:text-5xl">
            Version Not Supported
          </h1>

          <p className="mt-5 max-w-sm text-base text-white/80">
            This version of Spark is not supported. Please update to the latest
          </p>

          <div className="mt-10 w-full max-w-xs">
            <Button
              onClick={() => {
                window.electronAPI.downloadUpdate();
              }}
              wrapperClass=" w-full"
              className={"w-full"}
            >
              Download latest version
            </Button>
          </div>
        </div>
        {/* form */}
      </div>
    </div>
  );
};

export default NotSupported;
// Compare this snippet from src/app/ConfigurationsLayout.tsx:
