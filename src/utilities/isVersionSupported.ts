/**
 * Compares a current version string with a minimum supported version string.
 *
 * @param currentVersion - The version string to check (e.g., "1.2.3", "2.0").
 * @param minimumSupportedVersion - The minimum version required (e.g., "1.3.0").
 * @returns {boolean} - Returns true if the currentVersion is greater than or equal to the minimumSupportedVersion, otherwise false.
 */
export default function isVersionSupported(
  currentVersion: string,
  minimumSupportedVersion: string,
): boolean {
  // Split the version strings into arrays of numbers.
  // The '|| []' handles cases where a version string might be empty.
  const currentParts = currentVersion.split(".").map(Number);
  const minimumParts = minimumSupportedVersion.split(".").map(Number);

  // Determine the maximum length to iterate through, to handle versions
  // with different numbers of segments (e.g., "1.2" vs "1.2.3").
  const maxLength = Math.max(currentParts.length, minimumParts.length);

  // Iterate through each part of the version string (major, minor, patch, etc.)
  for (let i = 0; i < maxLength; i++) {
    // Get the numeric value for the current part, or default to 0 if it doesn't exist.
    // This handles cases like comparing "2.0" with "1.9.5". The third part of "2.0" is 0.
    const currentPart = currentParts[i] || 0;
    const minimumPart = minimumParts[i] || 0;

    // If the current version part is greater than the minimum, it's supported.
    if (currentPart > minimumPart) {
      return true;
    }

    // If the current version part is less than the minimum, it's not supported.
    if (currentPart < minimumPart) {
      return false;
    }

    // If the parts are equal, continue to the next part to check the minor or patch version.
  }

  // If the loop completes, it means all parts were equal (e.g., "1.2.3" vs "1.2.3").
  // In this case, the version is exactly the minimum, so it is supported.
  return true;
}
