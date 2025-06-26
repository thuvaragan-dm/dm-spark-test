interface AuthDataItem {
  key: string;
  value: any;
}

/**
 * Transforms an array of key-value objects into a single object.
 *
 * @param authArray - An array of objects, where each has a 'key' and 'value'.
 * @returns A single object. Returns an empty object if the input is null, undefined, or empty.
 */
export const authArrayToObject = (
  authArray?: AuthDataItem[] | null,
): Record<string, any> => {
  if (!authArray) {
    return {};
  }

  return authArray.reduce(
    (accumulator, currentItem) => {
      if (currentItem && currentItem.key) {
        accumulator[currentItem.key] = currentItem.value;
      }
      return accumulator;
    },
    {} as Record<string, any>,
  );
};

export const authObjectToArray = (
  authObject?: Record<string, any> | null,
): AuthDataItem[] => {
  if (!authObject) {
    return [];
  }

  // Use Object.entries to get [key, value] pairs and map them to the desired format.
  return Object.entries(authObject).map(([key, value]) => ({
    key,
    value,
  }));
};

/**
 * Compares two arrays of AuthDataItem to determine if they are equivalent.
 * The comparison is order-independent.
 *
 * @param array1 - The first array of AuthDataItem.
 * @param array2 - The second array of AuthDataItem.
 * @returns True if the arrays contain the same key-value pairs, false otherwise.
 */
export const isSameAuthData = (
  array1?: AuthDataItem[] | null,
  array2?: AuthDataItem[] | null,
): boolean => {
  // If both are null/undefined, they can be considered the same.
  if (!array1 && !array2) {
    return true;
  }

  // If only one is null/undefined, they are different.
  if (!array1 || !array2) {
    return false;
  }

  // If the arrays have a different number of items, they can't be the same.
  if (array1.length !== array2.length) {
    return false;
  }

  // Convert both arrays to objects for an easy, order-independent comparison.
  const obj1 = authArrayToObject(array1);
  const obj2 = authArrayToObject(array2);

  const keys1 = Object.keys(obj1);

  // Check if the number of unique keys matches.
  if (keys1.length !== Object.keys(obj2).length) {
    return false;
  }

  // Iterate over the keys of the first object and compare values with the second.
  // A simple string comparison for values is used here. For deep object comparison,
  // a more complex check (e.g., JSON.stringify or a recursive function) would be needed.
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  // If all checks pass, the arrays are considered equivalent.
  return true;
};
