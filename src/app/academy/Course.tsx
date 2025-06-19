import { format } from "date-fns";
import { useMemo } from "react";
import { RiGraduationCapFill } from "react-icons/ri";
import { Link, useParams } from "react-router-dom";
import { useGetCourse } from "../../api/academy/useGetCourse";
import { MemoizedMarkdown } from "../../components/MemMDRenderer";
import Spinner from "../../components/Spinner";
import { transformToEmbedUrl } from "../../utilities/transformToEmbedUrl";

const Course = () => {
  const params = useParams<{ name: string }>();
  const courseOptions = useMemo(() => ({ name: params.name || "" }), [params]);
  const { data: course, isPending: isCourseLoading } =
    useGetCourse(courseOptions);

  return (
    <section className="scrollbar dark:bg-primary-dark-foreground flex flex-1 flex-col overflow-y-auto bg-gray-100">
      {isCourseLoading && (
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      )}

      {!isCourseLoading && course && (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white">
            {course.name}
          </h1>
          <p className="mt-2 w-full max-w-xl text-base text-gray-600 dark:text-white/60">
            {course.description}
          </p>

          <p className="mt-5 text-sm text-gray-600 dark:text-white/60">
            Published at {format(new Date(course.created_at), "do MMM yyyy")}
          </p>

          <div className="mt-10 aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              width="100%"
              height="100%"
              src={
                transformToEmbedUrl(course.video_url.toString()) + "?&rel=0;"
              }
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          {course.content && (
            <div className="mt-10 w-full">
              <MemoizedMarkdown
                id={course.name}
                content={course.content}
                showDot={false}
              />
            </div>
          )}
        </div>
      )}

      {!isCourseLoading && !course && (
        <div className="flex w-full flex-1 flex-col items-center justify-center p-3 @lg:p-5">
          <div className="bg-secondary dark:bg-primary-700/20 text-primary flex w-min items-center justify-center rounded-full p-5 dark:text-white">
            <RiGraduationCapFill className="size-10" />
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
            Course not found
          </p>

          <p className="max-w-sm text-center text-sm text-balance text-gray-600 dark:text-white/60">
            The course you are looking for does not exist or has been removed.
          </p>
          <Link
            to={"/academy"}
            className={
              "text-primary dark:text-secondary ring-primary mt-5 px-1 text-xs hover:underline md:px-1"
            }
          >
            Go Back
          </Link>
        </div>
      )}
    </section>
  );
};

export default Course;
