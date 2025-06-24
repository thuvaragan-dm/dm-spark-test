import { format } from "date-fns";
import { useMemo, useState } from "react";
import { IoVideocamOutline } from "react-icons/io5";
import { VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useGetBootcamp } from "../../api/bootcamp/useGetBootcamp";
import bootcamp from "../../assets/bootcamp.jpg";
import Field from "../../components/Forms/Field";
import Form from "../../components/Forms/Form";
import Input from "../../components/Forms/Input";
import InputGroup from "../../components/Forms/InputGroup";
import Spinner from "../../components/Spinner";
import { Button } from "../../components/Button";

const Bootcamp = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: catalogData, isPending: isCatalogLoading } = useGetBootcamp();

  const filteredCatalog = useMemo(() => {
    if (!searchQuery) {
      return catalogData?.catalog;
    }

    if (!catalogData) {
      return [];
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    // 1. Map over each category.
    return (
      catalogData.catalog
        .map((category) => {
          // 2. Filter the courses within each category.
          const filteredCourses = category.courses.filter((course) => {
            const nameMatch = course.name
              .toLowerCase()
              .includes(lowercasedQuery);
            const descriptionMatch = course.description
              .toLowerCase()
              .includes(lowercasedQuery);
            return nameMatch || descriptionMatch;
          });

          // Return a new category object with the filtered courses.
          return {
            ...category,
            courses: filteredCourses,
          };
        })
        // 3. Filter out any categories that have no matching courses left.
        .filter((category) => category.courses.length > 0)
    );
  }, [catalogData, searchQuery]);

  return (
    <section className="scrollbar dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-y-auto bg-gray-100">
      <header className="relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden dark:mask-b-from-80% dark:mask-b-to-100%">
        <div className="absolute inset-0 z-20 bg-black/50"></div>
        <div className="absolute inset-0 z-10">
          <img
            className="h-full w-full object-cover object-center"
            src={bootcamp}
            alt="Bootcamp banner image"
          />
        </div>
        <h1 className="relative z-30 text-5xl font-medium text-white">
          Bootcamp
        </h1>
      </header>

      {!isCatalogLoading && filteredCatalog && (
        <div className="mb-5 flex flex-1 flex-col">
          <div className="dark:bg-primary-dark-foreground sticky top-0 z-[999999] w-full bg-gray-100 px-5 py-5">
            <Form validationSchema={z.object({ search: z.string() })}>
              <Field>
                <InputGroup>
                  <VscSearch data-slot="icon" />
                  <Input
                    placeholder="Search for tutorials, courses, or articles"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Field>
            </Form>
          </div>

          {filteredCatalog && filteredCatalog.length > 0 && (
            <div className="mt-8 flex flex-col space-y-20 pl-5">
              {filteredCatalog.map((catalog) => (
                <div key={catalog.category}>
                  <h2 className="line-clamp-1 text-xl font-medium text-gray-800 dark:text-white">
                    {catalog.category}
                  </h2>
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-white/60">
                    {catalog.category_desription}
                  </p>

                  <ul className="hide-scrollbar mt-5 flex items-start justify-start gap-5 overflow-x-auto last:pr-5">
                    {catalog.courses.map((course, idx) => (
                      <Link
                        to={"/bootcamp/course/" + course.name}
                        key={`${catalog.category}-${idx}`}
                        className="group flex h-[25rem] w-96 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-300 p-1 dark:border-white/10"
                      >
                        <div className="relative flex h-56 w-full shrink-0 flex-col overflow-hidden rounded-[calc(var(--radius-2xl)-(--spacing(1)))] bg-white shadow-lg dark:bg-white/5">
                          {/* high res */}
                          <img
                            src={course.thumbnail.high_res_url}
                            className="absolute inset-0 z-20 size-full object-cover transition-all duration-300 group-hover:scale-105"
                            alt="high res cource image"
                          />

                          {/* low res */}
                          <img
                            src={course.thumbnail.low_res_url}
                            className="absolute inset-0 z-10 h-full w-full scale-150 object-cover object-center"
                            alt="low res course image"
                          />
                          {/* low res */}
                        </div>

                        <div className="flex flex-1 flex-col p-3">
                          <div className="flex flex-1 flex-col">
                            <h3 className="line-clamp-1 text-base font-medium text-gray-900 group-hover:underline dark:text-white">
                              {course.name}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-white/60">
                              {course.description}
                            </p>
                          </div>

                          <div className="flex items-end justify-between">
                            <p className="text-[0.65rem] text-gray-600 dark:text-white/60">
                              Published at{" "}
                              {format(
                                new Date(course.created_at),
                                "do MMM yyyy",
                              )}
                            </p>

                            <div className="flex items-center justify-center gap-3 rounded-full bg-gray-200 px-3 py-1.5 text-gray-800 dark:bg-white/10 dark:text-white">
                              <IoVideocamOutline className="size-5" />
                              <p className="text-xs">{course.duration}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {filteredCatalog &&
            filteredCatalog.length <= 0 &&
            searchQuery.length > 0 && (
              <div className="flex w-full flex-1 flex-col items-center justify-center p-3 @lg:p-5">
                <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
                  <svg
                    className="size-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.8 17c-1.199 0-2.229-.379-3.09-1.137-.863-.758-1.368-1.712-1.515-2.863h-5.68A.503.503 0 014 12.499a.47.47 0 01.148-.356.51.51 0 01.366-.143h5.681c.06-.537.235-1.078.525-1.623A3.873 3.873 0 0111.97 9h-5.4a.503.503 0 01-.514-.501.47.47 0 01.148-.356A.509.509 0 016.571 8H14.8c1.28 0 2.373.439 3.275 1.316.902.876 1.354 1.936 1.354 3.181s-.452 2.306-1.354 3.185C17.173 16.561 16.081 17 14.8 17zm0-1c.989 0 1.836-.343 2.542-1.029.705-.686 1.058-1.51 1.058-2.471 0-.961-.353-1.785-1.058-2.471A3.516 3.516 0 0014.8 9c-.989 0-1.836.343-2.542 1.029-.705.686-1.058 1.51-1.058 2.471 0 .961.353 1.785 1.058 2.471A3.516 3.516 0 0014.8 16zm-7.2 1a.503.503 0 01-.514-.501.47.47 0 01.148-.356A.51.51 0 017.6 16h1.029a.503.503 0 01.514.501.47.47 0 01-.148.356.51.51 0 01-.366.143H7.6z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                  No course found
                </p>
                <p className="text-center text-sm text-balance text-gray-600 dark:text-white/60">
                  Try adjusting your filters or reset to see all courses
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  variant={"ghost"}
                  wrapperClass="w-max"
                  className={
                    "text-primary dark:text-secondary ring-primary px-1 text-xs hover:underline md:px-1"
                  }
                >
                  Reset filters
                </Button>
              </div>
            )}
        </div>
      )}

      {isCatalogLoading && (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <Spinner className={"size-5 dark:text-white"} />
        </div>
      )}
    </section>
  );
};

export default Bootcamp;
