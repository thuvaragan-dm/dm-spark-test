import { Dispatch, ReactNode, SetStateAction } from "react";

import { IoClose } from "react-icons/io5";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { CustomSlottedComponent } from "../../types/type-utils";
import { cn } from "../../utilities/cn";
import { Button } from "../Button";
import Dialog from "../dialog";
import { Drawer } from "../drawer";
import Grid from "../patterns/Grid";

interface IModal {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  showClose?: boolean;
  Trigger: CustomSlottedComponent<"button">;
  desktopClassName?: string;
  mobileClassName?: string;
}
const Modal = ({
  isOpen,
  setIsOpen,
  children,
  Trigger,
  title,
  description,
  showClose = false,
  desktopClassName,
  mobileClassName,
}: IModal) => {
  const isMd = useBreakpoint("md");

  return (
    <>
      {isMd ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Trigger />
          <Dialog.Content
            className={cn(
              "dark:bg-primary-dark flex max-h-dvh flex-col rounded-2xl border border-gray-300 bg-white p-1.5 sm:max-w-[425px] dark:border-white/10",
              desktopClassName,
            )}
          >
            <div className="dark:from-primary-dark-foreground relative flex flex-1 flex-col overflow-hidden rounded-[calc(var(--radius-2xl)-(--spacing(1.5)))] bg-gradient-to-b from-gray-100">
              {/* pattern */}
              <Grid
                width={30}
                height={30}
                x={-6}
                y={-6}
                squares={[
                  [1, 1],
                  [12, 3],
                  [6, 4],
                ]}
                strokeDasharray={"4 2"}
                className={cn(
                  "inset-0 h-40 [mask-image:linear-gradient(180deg,white,transparent)] opacity-20",
                )}
              />
              {/* pattern */}

              {(title || description) && (
                <Dialog.Header className="relative p-5">
                  {title && <Dialog.Title>{title}</Dialog.Title>}
                  {description && (
                    <Dialog.Description className={"max-w-md"}>
                      {description}
                    </Dialog.Description>
                  )}
                  {showClose && (
                    <div className="absolute top-5 right-5">
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant={"ghost"}
                        wrapperClass="flex items-center justify-center -mt-2"
                        className={
                          "dark:ring-offset-primary-dark-foreground shrink-0 rounded-full border bg-gray-100 p-0.5 ring-gray-300 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-0.5 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:data-[pressed]:bg-white/20"
                        }
                      >
                        <IoClose className="size-4" />
                      </Button>
                    </div>
                  )}
                </Dialog.Header>
              )}

              <div className="scrollbar scrollbar flex h-full flex-1 flex-col overflow-y-auto">
                {children}
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      ) : (
        <Drawer shouldScaleBackground open={isOpen} onOpenChange={setIsOpen}>
          <Trigger />
          <Drawer.Content
            className={cn(
              "mt-auto flex h-min max-h-[80dvh] flex-col",
              mobileClassName,
            )}
          >
            <div className="dark:bg-primary-dark flex h-full flex-1 flex-col overflow-hidden rounded-t-2xl border border-gray-300 bg-white p-1.5 dark:border-white/10">
              <div className="dark:from-primary-dark-foreground dark:to-primary-dark relative flex flex-1 flex-col overflow-hidden rounded-[calc(var(--radius-2xl)-(--spacing(1.5)))] bg-gradient-to-b from-gray-100 to-white">
                {/* pattern */}
                <Grid
                  width={30}
                  height={30}
                  x={-6}
                  y={-6}
                  squares={[
                    [1, 1],
                    [12, 3],
                    [6, 4],
                  ]}
                  strokeDasharray={"4 2"}
                  className={cn(
                    "inset-0 h-40 [mask-image:linear-gradient(180deg,white,transparent)] opacity-20",
                  )}
                />
                {/* pattern */}
                {(title || description) && (
                  <Drawer.Header className="p-5 text-left">
                    {title && <Drawer.Title>{title}</Drawer.Title>}
                    {description && (
                      <Drawer.Description className="max-w-md">
                        {description}
                      </Drawer.Description>
                    )}
                  </Drawer.Header>
                )}
                <div className="scrollbar scrollbar flex flex-1 flex-col overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer>
      )}
    </>
  );
};

export default Modal;
