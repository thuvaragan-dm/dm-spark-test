import { ComponentProps } from "react";
import { Focusable } from "react-aria-components";
import { HiOutlineShare, HiOutlineUser } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../../components/Button";
import Tooltip from "../../../components/tooltip";
import { usePromptAction } from "../../../store/promptStore";
import { cn } from "../../../utilities/cn";
import { SidebarWrapper } from "./sidebarWrapper";

const Sidebar = () => {
  const { setIsCreatePromptDrawerOpen } = usePromptAction();
  return (
    <SidebarWrapper>
      <div className="dark:bg-primary-dark relative flex h-full flex-1 flex-col overflow-hidden border-r border-gray-300 bg-white dark:border-white/10">
        <header
          className={cn(
            "sticky top-0 z-[999] flex items-center justify-between overflow-x-hidden px-3 pt-3 pb-0 pl-5",
          )}
        >
          <div className="shrink-0">
            <h3 className="font-gilroy text-xl text-gray-800 dark:text-white">
              Spark
            </h3>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Button
                  variant={"ghost"}
                  onClick={() => setIsCreatePromptDrawerOpen(true)}
                  className={
                    "hover:bg-secondary/60 bg-secondary dark:bg-primary/30 dark:hover:bg-primary/50 flex shrink-0 items-center justify-start gap-1 rounded-lg p-1 px-2 text-xs leading-0 text-white md:p-1 md:px-2 dark:text-white"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                      fill="currentColor"
                    />
                  </svg>

                  <p className="text-sm">New</p>
                </Button>
              </Focusable>

              <Tooltip.Content placement="right" offset={10}>
                <Tooltip.Shorcut title="Add new prompt" />
                <Tooltip.Arrow className={"-mt-1"} />
              </Tooltip.Content>
            </Tooltip>
            {/* new chat button */}
          </div>
        </header>

        <div className="mt-3 w-full overflow-hidden border-t border-gray-300 pb-2 dark:border-white/10"></div>

        <div className="scrollbar flex w-full flex-1 flex-col overflow-x-hidden overflow-y-auto px-2">
          {/* links goes here */}
          <NavLink to="/prompts/all">
            <svg
              viewBox="0 0 24 24"
              className="size-4.5 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.938 1a.687.687 0 01.687.688v.687h.688a.687.687 0 010 1.375h-.688v.688a.687.687 0 11-1.375 0V3.75h-.688a.687.687 0 010-1.375h.688v-.688A.687.687 0 0120.938 1zM3.063 18.875a.687.687 0 01.687.688v.687h.688a.687.687 0 110 1.375H3.75v.688a.687.687 0 01-1.375 0v-.688h-.688a.687.687 0 110-1.375h.688v-.688a.687.687 0 01.688-.687zM8.563 1c-.893 0-1.547.705-1.703 1.455a5.706 5.706 0 01-1.533 2.872c-.982.983-2.117 1.375-2.87 1.532C1.708 7.014 1 7.67 1 8.565c.001.894.707 1.546 1.456 1.701a5.684 5.684 0 012.87 1.532 5.715 5.715 0 011.533 2.874c.157.746.81 1.453 1.704 1.453.893 0 1.548-.707 1.704-1.456a5.68 5.68 0 011.53-2.87 5.694 5.694 0 012.872-1.533c.75-.155 1.456-.808 1.456-1.704 0-.893-.705-1.548-1.456-1.703a5.693 5.693 0 01-2.87-1.532 5.707 5.707 0 01-1.531-2.872C10.111 1.705 9.457 1 8.563 1zm-.688 17.875v-1.453c.452.11.923.11 1.375 0v1.453a2.75 2.75 0 002.75 2.75h6.875a2.75 2.75 0 002.75-2.75V12a2.75 2.75 0 00-2.75-2.75H17.42a2.88 2.88 0 000-1.375h1.455A4.125 4.125 0 0123 12v6.875A4.125 4.125 0 0118.875 23H12a4.125 4.125 0 01-4.125-4.125zM12 16.812a.687.687 0 01.688-.687h4.124a.687.687 0 110 1.375h-4.125a.687.687 0 01-.687-.688zm.688-3.437a.687.687 0 100 1.375h6.187a.687.687 0 100-1.375h-6.188z"
                fill="currentColor"
              />
            </svg>
            All Prompts
          </NavLink>
          <NavLink to="/prompts/created-by-you">
            <HiOutlineUser className="size-4.5 shrink-0" />
            Created by you
          </NavLink>
          <NavLink to="/prompts/shared-with-you">
            <HiOutlineShare className="size-4.5 shrink-0" />
            Shared with you
          </NavLink>
        </div>
      </div>
    </SidebarWrapper>
  );
};

interface INavlink extends ComponentProps<typeof Link> {}
const NavLink = ({ to, children }: INavlink) => {
  const { pathname } = useLocation();
  return (
    <Link
      to={to}
      className={cn(
        "flex w-full shrink-0 items-center justify-start gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap text-gray-800 dark:text-white",
        "hover:bg-gray-200 dark:hover:bg-white/5",
        {
          "bg-secondary dark:bg-primary/30 hover:bg-secondary dark:hover:bg-primary/30 text-white dark:text-white":
            pathname.includes(to.toString()),
        },
      )}
    >
      {children}
    </Link>
  );
};

export default Sidebar;
