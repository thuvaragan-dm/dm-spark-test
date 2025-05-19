import * as RadixAvatar from "@radix-ui/react-avatar";
import { ComponentProps } from "react";
import { CustomSlottedComponent } from "../types/type-utils";
import { cn } from "../utilities/cn";

interface IAvatar extends ComponentProps<"img"> {
  Fallback: CustomSlottedComponent<"div">;
}
const Avatar = ({ src, alt, Fallback, className }: IAvatar) => {
  return (
    <RadixAvatar.Root className="shrink-0">
      <RadixAvatar.Image
        className={cn(
          `aspect-square h-full w-full rounded-full object-cover`,
          className,
        )}
        src={src}
        alt={alt || "image"}
      />
      <RadixAvatar.Fallback delayMs={600}>
        <Fallback />
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};

interface IFallback extends ComponentProps<"div"> {
  children: React.ReactNode;
}
const Fallback = ({ children, className }: IFallback) => {
  return (
    <div
      className={cn(
        "bg-secondary text-primary flex size-10 items-center justify-center rounded-full text-sm font-medium tracking-wider uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
};

Avatar.displayName = "Avatar";
export default Object.assign(Avatar, {
  Fallback,
});
