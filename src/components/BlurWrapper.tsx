import { AnimatePresence, motion } from "framer-motion";
import { MotionComponent } from "../types/type-utils";

interface IBlurWrapper extends MotionComponent<"div"> {
  Key?: null | undefined | string | number;
  blur?: number;
}

const BlurWrapper = ({ Key, children, blur = 5, ...rest }: IBlurWrapper) => {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={Key}
        initial={{ filter: `blur(${blur}px)`, opacity: 0 }}
        animate={{ filter: "blur(0)", opacity: 1 }}
        exit={{ filter: `blur(${blur}px)`, opacity: 0 }}
        {...rest}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default BlurWrapper;
