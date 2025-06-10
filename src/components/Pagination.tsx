import { ComponentProps, useCallback } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { cn } from "../utilities/cn";
import { Button } from "./Button";
import Select from "./Forms/Select";
import { Field } from "@headlessui/react";
import Form from "./Forms/Form";
import { z } from "zod";

interface IPageBtnProps {
  page: number;
  onClick: () => void;
  currentPage: number;
}

// Component for individual page buttons
const PageBtn = ({ page, onClick, currentPage }: IPageBtnProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "text-primary ring-primary ring-offset-secondary dark:ring-offset-primary-dark-foreground data-[pressed]:text-primary min-w-9 rounded-[calc(0.75rem-0.25rem)] bg-transparent p-1.5 text-sm ring-offset-0 hover:bg-white/50 data-[pressed]:bg-white/60 md:p-1.5 dark:text-white dark:ring-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/20 dark:data-[pressed]:text-white",
        {
          "bg-primary dark:bg-primary hover:bg-primary dark:hover:bg-primary text-white dark:text-white":
            page === currentPage,
        },
      )}
    >
      {page}
    </Button>
  );
};

interface IPaginationProps extends ComponentProps<"div"> {
  numberOfPages: number; // Total number of pages
  currentPage: number; // Current active page
  setCurrentPage: (page: number) => void; // Function to update the current page
  hideButtons?: boolean; // Optionally hide the next/previous buttons
  maxVisiblePages?: number; // Max number of pages to show without truncation (default: 10)
  truncationThreshold?: number; // Number of pages before/after current page to show before truncating (default: 5)
}

const Pagination = ({
  numberOfPages,
  currentPage,
  setCurrentPage,
  className,
  hideButtons = false,
  maxVisiblePages = 10,
  truncationThreshold = 5,
}: IPaginationProps) => {
  // Function to navigate to the next page
  const handleNext = useCallback(() => {
    setCurrentPage(Math.min(numberOfPages, currentPage + 1));
  }, [currentPage, numberOfPages, setCurrentPage]);

  // Function to navigate to the previous page
  const handlePrevious = useCallback(() => {
    setCurrentPage(Math.max(1, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  // Function to render page buttons based on the current pagination state
  const renderPageButtons = () => {
    // If total pages are less than max visible, show all page buttons
    if (numberOfPages <= maxVisiblePages) {
      return Array.from({ length: numberOfPages }, (_, index) => (
        <PageBtn
          key={index}
          page={index + 1}
          currentPage={currentPage}
          onClick={() => setCurrentPage(index + 1)}
        />
      ));
    }

    // Arrays for the start, middle, and end parts of the pagination
    const startPages = Array.from(
      { length: truncationThreshold },
      (_, index) => (
        <PageBtn
          key={index}
          page={index + 1}
          currentPage={currentPage}
          onClick={() => setCurrentPage(index + 1)}
        />
      ),
    );

    const endPages = Array.from({ length: truncationThreshold }, (_, index) => (
      <PageBtn
        key={numberOfPages - index}
        page={numberOfPages - truncationThreshold + index + 1}
        currentPage={currentPage}
        onClick={() =>
          setCurrentPage(numberOfPages - truncationThreshold + index + 1)
        }
      />
    ));

    const middlePages = Array.from(
      { length: truncationThreshold },
      (_, index) => (
        <PageBtn
          key={currentPage - truncationThreshold + index}
          page={currentPage - truncationThreshold + index + 2}
          currentPage={currentPage}
          onClick={() =>
            setCurrentPage(currentPage - truncationThreshold + index + 2)
          }
        />
      ),
    );

    // Case 1: When current page is close to the start, show first few pages directly
    if (currentPage < truncationThreshold) {
      return (
        <>
          {startPages}
          <span className="p-1.5 text-sm text-gray-800 select-none">...</span>
          {endPages}
        </>
      );
    }

    // Case 2: When current page is close to the end, show last few pages directly
    if (currentPage > numberOfPages - truncationThreshold) {
      return (
        <>
          {startPages}
          <span className="p-1.5 text-sm text-gray-800 select-none">...</span>
          {endPages}
        </>
      );
    }

    // Case 3: When current page is in the middle, show first, middle, and last parts
    return (
      <>
        {startPages.slice(0, 1)}
        <span className="p-1.5 text-sm text-gray-800 select-none">...</span>
        {middlePages}
        <span className="p-1.5 text-sm text-gray-800 select-none">...</span>
        {endPages.slice(-1)}
      </>
    );
  };

  // Only render the pagination if there's more than 1 page
  if (numberOfPages > 1) {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {/* Previous Button */}
        {!hideButtons && (
          <Button
            variant="ghost"
            className="bg-secondary text-primary ring-primary hover:bg-secondary/90 data-[pressed]:bg-secondary p-3 disabled:bg-gray-200 disabled:text-gray-400 md:p-3 dark:bg-white dark:hover:bg-white/90 dark:disabled:bg-white/20 dark:data-[pressed]:bg-white/90"
            disabled={currentPage === 1}
            onClick={handlePrevious}
          >
            <IoChevronBackOutline className="size-4" />
          </Button>
        )}

        {/* Page Buttons */}
        <div className="bg-secondary flex flex-wrap items-center justify-center rounded-xl p-1 dark:bg-white/5">
          {renderPageButtons()}
        </div>

        {/* Next Button */}
        {!hideButtons && (
          <Button
            variant="ghost"
            className="bg-secondary text-primary ring-primary hover:bg-secondary/90 data-[pressed]:bg-secondary p-3 disabled:bg-gray-200 disabled:text-gray-400 md:p-3 dark:bg-white dark:hover:bg-white/90 dark:disabled:bg-white/20 dark:data-[pressed]:bg-white/90"
            onClick={handleNext}
            disabled={currentPage >= numberOfPages}
          >
            <IoChevronForwardOutline className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  // Return nothing if there's only one page
  return null;
};

const MiniPagination = ({
  currentPage,
  setCurrentPage,
  numberOfPages,
  hideButtons,
  className,
}: IPaginationProps) => {
  // Function to navigate to the next page
  const handleNext = useCallback(() => {
    setCurrentPage(Math.min(numberOfPages, currentPage + 1));
  }, [currentPage, numberOfPages, setCurrentPage]);

  // Function to navigate to the previous page
  const handlePrevious = useCallback(() => {
    setCurrentPage(Math.max(1, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      {!hideButtons && (
        <Button
          variant="ghost"
          className="bg-secondary text-primary ring-primary hover:bg-secondary/90 data-[pressed]:bg-secondary p-2 disabled:bg-gray-200 disabled:text-gray-400 md:p-2"
          onClick={handlePrevious}
        >
          <IoChevronBackOutline className="size-4" />
        </Button>
      )}

      <Form validationSchema={z.object({ page: z.string() })}>
        <Field>
          <Select
            name="page"
            value={currentPage.toString()}
            onValueChange={(value) => setCurrentPage(parseInt(value))}
            placeholder="Select a page"
            selectClass="p-1 py-0.5 gap-1 border-none rounded-md"
          >
            {Array.from({ length: numberOfPages }, (_, index) => (
              <Select.Option key={index} value={(index + 1).toString()}>
                {index + 1}
              </Select.Option>
            ))}
          </Select>
        </Field>
      </Form>

      {/* Next Button */}
      {!hideButtons && (
        <Button
          variant="secondary"
          className="bg-secondary text-primary ring-primary hover:bg-secondary/90 data-[pressed]:bg-secondary p-2 disabled:bg-gray-200 disabled:text-gray-400 md:p-2"
          onClick={handleNext}
        >
          <IoChevronForwardOutline className="size-4" />
        </Button>
      )}
    </div>
  );
};

const ResponsivePagination = ({
  numberOfPages,
  currentPage,
  setCurrentPage,
  className,
  hideButtons,
  maxVisiblePages,
  truncationThreshold,
}: IPaginationProps) => {
  return (
    <>
      <Pagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        truncationThreshold={truncationThreshold}
        maxVisiblePages={maxVisiblePages}
        hideButtons={hideButtons}
        className={cn("hidden @3xl:flex", className)}
      />

      <MiniPagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        className={cn("flex @3xl:hidden", className)}
      />
    </>
  );
};

export { MiniPagination, Pagination, ResponsivePagination };
