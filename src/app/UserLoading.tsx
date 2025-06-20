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

      {/* logo */}
      <div className="absolute right-0 bottom-0 z-50 flex w-min items-center justify-center gap-2 p-5">
        <div className="bg-primary w-min rounded-full stroke-white p-1 text-white">
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 227 228"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 124.669c0 56.279 45.623 91.36 101.902 91.36 56.278 0 101.901-45.623 101.901-101.901S176.448 12.227 113.902 12.227c-43.572 0-88.001-5.742-88.001 40.532 0 46.275-4.275 75.51 54.268 24.122 63.249-55.518 109.631 37.247 73.79 73.088-35.841 35.841-78.007 0-78.007 0"
              stroke="currentColor"
              strokeWidth={22.033}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="">
          <p className="text-[0.5rem] text-white">Powered by</p>
          <h2 className="font-gilroy text-base/tight font-medium text-white">
            DeepModel
          </h2>
        </div>
      </div>
      {/* logo */}
    </div>
  );
};

export default UserLoading;
