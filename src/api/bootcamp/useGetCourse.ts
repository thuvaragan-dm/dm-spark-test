import { useQuery } from "@tanstack/react-query";
import { bootcampKey, EBootcamp } from "./config";
import { Course } from "./types";
import { useGetBootcamp } from "./useGetBootcamp";

export const useGetCourse = ({ name }: { name: string }) => {
  const { data: catalogData, isPending: isAcademyLoading } = useGetBootcamp();

  return useQuery<Course | null>({
    queryKey: [bootcampKey[EBootcamp.FETCH_SINGLE] + name],
    queryFn: async () => {
      if (!catalogData) {
        return null;
      }

      const lowercasedName = name.toLowerCase();

      for (const category of catalogData.catalog) {
        const foundCourse = category.courses.find(
          (course) => course.name.toLowerCase() === lowercasedName,
        );

        if (foundCourse) {
          return foundCourse;
        }
      }

      return null;
    },
    enabled: !!name && !isAcademyLoading && !!catalogData,
  });
};
