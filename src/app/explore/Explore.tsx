import { Link } from "react-router-dom";
import { toast } from "sonner";
import Error from "../../components/alerts/Error";
import Information from "../../components/alerts/Information";
import Success from "../../components/alerts/Success";
import Warning from "../../components/alerts/Warning";
import { Button } from "../../components/Button";

const Explore = () => {
  return (
    <div className="dark:bg-primary-dark-foreground flex w-full flex-1 flex-col items-center justify-center bg-gray-100">
      <div className="">
        <h1 className="text-center text-2xl text-gray-800 dark:text-white">
          Explore Agents
        </h1>
        <p className="text-center text-sm text-gray-600 dark:text-white/60">
          This where you can select other agents.
        </p>
        <p className="text-center text-sm text-gray-600 dark:text-white/60">
          Under construction, please check back later.
        </p>

        <div className="mt-5 flex w-full items-center justify-center">
          <Link
            to="/"
            className="text-sm text-gray-800 hover:underline dark:text-white"
          >
            Go back
          </Link>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Success
                  t={t}
                  title="Success"
                  description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, ullam?"
                />
              ),
              { duration: Infinity },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Information
                  t={t}
                  title="Information"
                  description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, ullam?"
                />
              ),
              { duration: Infinity },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Information
        </Button>
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Warning
                  t={t}
                  title="Warning"
                  description="Lorem ipsum dolor sit"
                />
              ),
              { duration: Infinity },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Warning
        </Button>
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Error
                  t={t}
                  title="Error"
                  description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, ullam?"
                />
              ),
              { duration: Infinity },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Error
        </Button>
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Information
                  t={t}
                  title={`Downloading update`}
                  description="Please wait while we download the update."
                  Custom={() => (
                    <div className="mt-2 flex w-full items-center justify-between gap-2">
                      <div className="relative h-3 w-full rounded-full bg-gray-200 dark:bg-white/10">
                        <div
                          style={{ width: `${20}%` }}
                          className="absolute inset-y-0 left-0 m-0.5 animate-pulse rounded-full bg-green-500"
                        ></div>
                      </div>
                      <p className="shrink-0 text-xs font-medium whitespace-nowrap text-gray-600 dark:text-white/60">
                        {20}%
                      </p>
                    </div>
                  )}
                />
              ),
              {
                id: "update-progress-toast",
                duration: Infinity,
              },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Progress
        </Button>
        <Button
          onClick={() =>
            toast.custom(
              (t) => (
                <Information
                  t={t}
                  title={`Update Available: v1.0.1`}
                  description="A new version is ready to download."
                  Custom={() => (
                    <div className="mt-3 flex w-full items-center justify-end gap-2">
                      <Button
                        className={
                          "rounded-md px-2 py-1 text-xs md:px-2 md:py-1"
                        }
                        variant={"secondary"}
                      >
                        Later
                      </Button>
                      <Button
                        onClick={() => {}}
                        className={
                          "rounded-md bg-blue-700 px-2 py-1 text-xs text-white ring-blue-700 hover:bg-blue-600 data-[pressed]:bg-blue-600 md:px-2 md:py-1 dark:bg-blue-700"
                        }
                        variant={"ghost"}
                      >
                        Download now
                      </Button>
                    </div>
                  )}
                />
              ),
              {
                id: "update-available-toast",
                duration: Infinity,
              },
            )
          }
          variant={"ghost"}
          className={
            "rounded-none p-0 text-gray-800 hover:underline dark:text-white"
          }
        >
          Version Update
        </Button>
      </div>
    </div>
  );
};

export default Explore;
