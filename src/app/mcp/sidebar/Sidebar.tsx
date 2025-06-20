import { ComponentProps } from "react";
import { Focusable } from "react-aria-components";
import {
  HiOutlineServerStack,
  HiOutlineShare,
  HiOutlineTrash,
  HiOutlineUser,
} from "react-icons/hi2";
import { VscAdd } from "react-icons/vsc";
import { Link, useLocation } from "react-router-dom";
import Tooltip from "../../../components/tooltip";
import { cn } from "../../../utilities/cn";
import { SidebarWrapper } from "./sidebarWrapper";

const Sidebar = () => {
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
            <p className="shrink-0 text-[0.5rem] text-gray-500 dark:text-white/50">
              Powered By Deepmodel
            </p>
          </div>
          <div className="flex items-center justify-end gap-1">
            {/* new chat button */}
            <Tooltip>
              <Focusable>
                <Link
                  to={"/mcp"}
                  className={
                    "text-primary hover:bg-secondary/50 flex shrink-0 items-center justify-start gap-2 rounded-lg p-1 text-xs leading-0 md:p-1 dark:text-white dark:hover:bg-white/10"
                  }
                >
                  <VscAdd className="size-4" />
                  <p className="text-sm">Connect</p>
                </Link>
              </Focusable>

              <Tooltip.Content placement="right" offset={10}>
                <Tooltip.Shorcut title="Add new connection" />
                <Tooltip.Arrow className={"-mt-1"} />
              </Tooltip.Content>
            </Tooltip>
            {/* new chat button */}
          </div>
        </header>

        <div className="mt-3 w-full overflow-hidden border-t border-gray-300 pb-2 dark:border-white/10"></div>

        <div className="scrollbar flex w-full flex-1 flex-col overflow-x-hidden overflow-y-auto px-2">
          {/* links goes here */}
          <NavLink to="/mcp/connected">
            <HiOutlineServerStack className="size-4.5" />
            All Your Servers
          </NavLink>
          <NavLink to="/mcp/created-by-you">
            <HiOutlineUser className="size-4.5" />
            Created by you
          </NavLink>
          <NavLink to="/mcp/shared-with-you">
            <HiOutlineShare className="size-4.5" />
            Shared with you
          </NavLink>
          <NavLink to="/mcp/deleted">
            <HiOutlineTrash className="size-4.5" />
            Deleted
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
        "flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-white",
        "hover:bg-gray-200 dark:hover:bg-white/5",
        {
          "bg-secondary dark:bg-primary/30 text-primary hover:bg-secondary dark:hover:bg-primary/30 dark:text-white":
            pathname.includes(to.toString()),
        },
      )}
    >
      {children}
    </Link>
  );
};

export default Sidebar;
