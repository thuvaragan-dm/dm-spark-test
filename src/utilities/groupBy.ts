export type GroupResult = {
  id: string;
  name: string;
};

export type Group<T> = {
  group: string;
  results: T[];
};

export const groupBy = <T extends GroupResult>(
  items: T[],
  field: keyof T,
): Group<T>[] => {
  // Create a map to hold the groups
  const groupsMap: Record<string, Group<T>> = {};

  // Iterate over the items
  items.forEach((item) => {
    // Get the value of the field to group by
    const groupValue = item[field] as unknown as string;

    // If the group doesn't exist, create it
    if (!groupsMap[groupValue]) {
      groupsMap[groupValue] = { group: groupValue, results: [] };
    }

    // Add the item to the appropriate group
    groupsMap[groupValue].results.push(item);
  });

  // Convert the map to an array
  return Object.values(groupsMap);
};
