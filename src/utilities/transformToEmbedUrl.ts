/**
 * Transforms a standard YouTube 'watch' URL or a shortened 'youtu.be' URL
 * into a standardized embeddable URL.
 *
 * If the provided URL is already in the embed format, it is returned unchanged.
 * This function creates a clean embed link and intentionally does not transfer
 * query parameters (like `t=` or `si=`) from the original URL, as they are not
 * always applicable or desirable for an embedded player.
 *
 * @param url The YouTube URL string to transform.
 * @returns A standardized embed URL string, or the original URL if it cannot be transformed.
 *
 * @example
 * // Returns: 'https://www.youtube.com/embed/pZ85hgb85rU'
 * transformToEmbedUrl('https://youtu.be/pZ85hgb85rU?feature=shared');
 *
 * @example
 * // Returns: 'https://www.youtube.com/embed/pZ85hgb85rU'
 * transformToEmbedUrl('https://www.youtube.com/watch?v=pZ85hgb85rU&t=10s');
 *
 * @example
 * // Returns: 'https://www.youtube.com/embed/pZ85hgb85rU?si=z9BvQJko3ZmJhwbA'
 * transformToEmbedUrl('https://www.youtube.com/embed/pZ85hgb85rU?si=z9BvQJko3ZmJhwbA');
 */
export const transformToEmbedUrl = (url: string): string => {
  // 1. First, check if the URL is already in the correct embed format.
  // If so, return it as is without any modifications.
  if (url.includes("/embed/")) {
    return url;
  }

  let videoId: string | null = null;

  try {
    // Use the URL constructor for robust parsing of the URL components.
    const urlObj = new URL(url);

    // 2. Handle shortened URLs (e.g., https://youtu.be/VIDEO_ID)
    if (urlObj.hostname === "youtu.be") {
      // For youtu.be links, the video ID is the first part of the pathname.
      // e.g., in "/pZ85hgb85rU", the ID is "pZ85hgb85rU".
      videoId = urlObj.pathname.split("/")[1];
    }
    // 3. Handle standard watch URLs (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
    else if (
      (urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com") &&
      urlObj.pathname === "/watch"
    ) {
      // For standard links, the video ID is in the 'v' query parameter.
      videoId = urlObj.searchParams.get("v");
    }
  } catch (error) {
    // If the URL constructor fails, the provided string is not a valid URL.
    console.error(
      `Invalid URL provided to transformToEmbedUrl: "${url}"`,
      error,
    );
    return url; // Return the original invalid string.
  }

  // 4. If a video ID was successfully extracted, build the standardized embed URL.
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // 5. If the URL is a valid URL but not a recognizable YouTube format, return it as a fallback.
  return url;
};
