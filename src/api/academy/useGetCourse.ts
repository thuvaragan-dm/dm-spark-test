import { useQuery } from "@tanstack/react-query";
import { academyKey, EAcademy } from "./config";
import { Course } from "./types";
import { useGetAcademy } from "./useGetAcademy";

export const useGetCourse = ({ name }: { name: string }) => {
  const { data: catalogData, isPending: isAcademyLoading } = useGetAcademy();

  return useQuery<Course | null>({
    queryKey: [academyKey[EAcademy.FETCH_SINGLE] + name],
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
