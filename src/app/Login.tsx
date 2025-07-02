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

      <div className="@container relative z-50 grid w-full flex-1 grid-cols-2 overflow-hidden p-10">
        <div className="w-full"></div>
        {/* form */}
        <div className="scrollbar flex w-full flex-1 flex-col items-end-safe justify-center-safe overflow-y-auto">
          <div className="flex w-full max-w-sm flex-col">
            <h1 className="w-full max-w-md text-4xl font-medium text-balance text-white @6xl:text-5xl">
              Meet Spark, your AI super Agent
            </h1>

            <p className="mt-5 max-w-sm text-base text-white/80">
              Spark works with all your AI agents and tools to get things done
              for you.
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
                By clicking Continue you confirm that you agree to Spark&apos;s{" "}
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
        </div>
        {/* form */}
      </div>
    </div>
  );
};

export default Login;
