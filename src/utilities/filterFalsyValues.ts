/**
 * Filters an object to remove properties with falsy values (false, 0, "", null, undefined, NaN).
 * This function is generic and preserves the type information of the remaining properties.
 *
 * @param obj The object to filter.
 * @returns A new object containing only the properties from the original object that had truthy values.
 * The return type is a Partial<T> because some properties may have been removed.
 * @example
 * const myObject = {
 * name: "John Doe",
 * age: 30,
 * email: undefined,
 * isAdmin: true,
 * posts: 0,
 * nickname: "",
 * lastLogin: null,
 * isVerified: false
 * };
 *
 * const filtered = filterFalsyValues(myObject);
 * // filtered is now: { name: "John Doe", age: 30, isAdmin: true }
 */
export function filterFalsyValues<T extends object>(obj: T): Partial<T> {
  // 1. Get an array of [key, value] pairs from the object.
  // 2. Filter the array, keeping only the pairs where the value is truthy.
  // 3. Convert the filtered array of pairs back into an object.
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => !!value),
  ) as Partial<T>;
}
