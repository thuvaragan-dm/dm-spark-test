import { cn } from "../../utilities/cn";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { IoClose, IoInformationCircle } from "react-icons/io5";
import { toast } from "sonner";
import { AlertToast } from "./types";
import Grid from "../patterns/Grid";
import { Button } from "../Button";

const Information = ({ t, title, description, Custom }: AlertToast) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { left, top } = currentTarget?.getBoundingClientRect() || {};

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  return (
    <div
      onMouseMove={handleMouseMove}
      className="dark:bg-primary-dark relative h-full min-w-full overflow-hidden rounded-xl bg-white shadow-md ring-1 shadow-blue-700/10 ring-blue-700/10 @xl:w-80"
    >
      {/* pattern */}
      <Grid
        width={20}
        height={20}
        x={-1}
        y={-1.2}
        squares={[
          [0, 4],
          [1, 1],
          [4, 2],
        ]}
        className={cn(
          "inset-0 [mask-image:radial-gradient(200px_circle_at_top_left,white,transparent)] opacity-60",
        )}
      />
      {/* pattern */}

      {/* gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-20 rounded-2xl transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(
            150px circle at ${mouseX}px ${mouseY}px,
           rgba(29, 78, 216, 0.06),
            transparent 80%
          )
        `,
        }}
      />
      <div className="relative flex items-start justify-between overflow-hidden rounded-lg">
        <div className="flex items-start justify-start gap-3 p-3 py-4">
          <div className="flex h-full flex-1 items-center justify-center rounded-lg bg-blue-700 p-1 text-white">
            <IoInformationCircle className="size-8" />
          </div>

          <div>
            <h3 className="text-base font-medium text-blue-700 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-white/70">
              {description}
            </p>
            {Custom && <Custom />}
          </div>
        </div>
        <Button
          variant={"ghost"}
          className="m-3 text-sm text-gray-500"
          onPress={() => toast.dismiss(t)}
        >
          <IoClose className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default Information;
