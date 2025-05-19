import { Link } from "react-router-dom";

const Explore = () => {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center">
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
    </div>
  );
};

export default Explore;
