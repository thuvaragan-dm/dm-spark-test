import { IoChatboxEllipses } from "react-icons/io5";

const EmptyState = () => {
  return (
    <div className="flex w-full flex-1 shrink-0 flex-col items-center justify-center whitespace-nowrap">
      <div className="flex w-min shrink-0 items-center justify-center rounded-full bg-amber-100 p-5 text-amber-800 dark:bg-amber-100/10 dark:text-amber-100">
        <IoChatboxEllipses className="size-7" />
      </div>
      <p className="mt-2 text-sm font-semibold whitespace-nowrap text-gray-800 dark:text-white">
        No threads found
      </p>
      <p className="text-center text-xs text-balance whitespace-nowrap text-gray-600 dark:text-white/60">
        Start a chat to view your threads.
      </p>
    </div>
  );
};

export default EmptyState;
