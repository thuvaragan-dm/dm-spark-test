import { VscInfo, VscClose } from "react-icons/vsc";
import { toast } from "sonner";
import { cn } from "../../utilities/cn";
import { Button } from "../Button";
import Grid from "../patterns/Grid";
import { AlertToast } from "./types";

const Information = ({ t, title, description, Custom }: AlertToast) => {
  return (
    <div className="dark:bg-primary-dark relative h-full w-80 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-300 @xl:w-80 dark:shadow-2xl dark:ring-white/5">
      {/* pattern */}
      <Grid
        width={20}
        height={20}
        x={-1}
        y={1.2}
        squares={[
          [0, 4],
          [1, 1],
          [4, 2],
        ]}
        className={cn(
          "inset-0 [mask-image:radial-gradient(200px_circle_at_top_left,white,transparent)] opacity-60 dark:opacity-20",
        )}
      />
      {/* pattern */}

      <div className="relative flex w-full items-start justify-between overflow-hidden rounded-lg">
        <div className="flex w-full items-start justify-start gap-2 p-3 pt-2 pb-4">
          <VscInfo className="mt-1 size-4 shrink-0 text-blue-700" />
          <div className="flex max-h-32 w-full flex-col overflow-hidden">
            <h3 className="text-base font-medium text-blue-700">{title}</h3>
            <div className="scrollbar flex flex-col overflow-y-auto">
              <p className="mt-1 text-xs text-gray-600 dark:text-white/70">
                {description}
              </p>
              {Custom && <Custom />}
            </div>
          </div>
        </div>
        <Button
          variant={"ghost"}
          wrapperClass="absolute top-0 right-0"
          className="m-2.5 text-sm text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white"
          onPress={() => toast.dismiss(t)}
        >
          <VscClose className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default Information;
