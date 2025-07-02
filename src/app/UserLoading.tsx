import LoginImage from "../assets/login.jpg";
import Spinner from "../components/Spinner";

const UserLoading = () => {
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

      <div className="@container relative z-50 grid w-full flex-1 grid-cols-2 overflow-hidden p-10">
        <div className="w-full"></div>
        {/* form */}
        <div className="scrollbar flex w-full flex-1 flex-col items-end-safe justify-center-safe overflow-y-auto">
          <div className="flex w-full max-w-sm flex-col">
            <div className="flex w-full items-center justify-start gap-5">
              <h1 className="shrink-0 text-4xl font-medium text-balance text-white">
                Initializing Spark
              </h1>
              <div className="flex w-min items-center justify-center">
                <Spinner className="size-5 text-white" />
              </div>
            </div>

            <p className="mt-5 max-w-sm text-base text-white/80">
              Spark is getting ready to assist you. This may take a moment.
            </p>
          </div>
        </div>
        {/* form */}
      </div>
    </div>
  );
};

export default UserLoading;
