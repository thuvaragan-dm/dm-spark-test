import { Button } from "../components/Button";
import { useAppConfig } from "../store/configurationStore";
import LoginImage from "../assets/login.jpg";

const Login = () => {
  const { config } = useAppConfig();
  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden">
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
          <h1 className="w-full max-w-md text-4xl font-medium text-balance text-white @6xl:text-5xl">
            Meet Spark, your AI super Agent
          </h1>

          <p className="mt-5 max-w-sm text-base text-white/80">
            Spark works with all your AI agents and tools to get things done for
            you.
          </p>

          <div className="mt-10 w-full max-w-xs">
            <Button
              onClick={() => {
                const signInUrl = config?.version.login_url;

                if (window.electronAPI && window.electronAPI.send) {
                  // Send a message to the main process to open the URL
                  window.electronAPI.send("open-external-url", signInUrl);
                }
              }}
              wrapperClass="w-full"
              className={"w-full"}
            >
              Sign in to Spark
            </Button>
            <p className="mt-5 max-w-sm text-sm/6 text-white/60">
              We'll take you to your web browser to sign in and then bring you
              back here.
            </p>
          </div>

          <footer>
            <p className="mt-10 max-w-60 text-[0.65rem] text-white/50">
              By clicking Continue you confirm that you agree to
              Deepmodel&apos;s{" "}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const privacyUrl =
                    config?.global.resource_links.privacy_policy;
                  window.electronAPI.send("open-external-url", privacyUrl);
                }}
                className="cursor-pointer px-0.5 text-white underline"
              >
                Privacy Policy
              </a>
            </p>
          </footer>
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

export default Login;
