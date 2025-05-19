/**
 * Copies the provided text to the clipboard.
 *
 * This function attempts to use the modern Clipboard API (`navigator.clipboard.writeText`)
 * for copying text. If the API is not available or permission is denied, it falls back
 * to a less reliable method using a hidden <textarea> element.
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @returns {Promise<void>} A promise that resolves when the text is successfully copied,
 * or rejects if both methods fail.
 *
 * @example
 * ```typescript
 * try {
 * await copyTextToClipboard("Hello, world!");
 * console.log("Text copied to clipboard!");
 * } catch (error) {
 * console.error("Failed to copy text to clipboard:", error);
 * }
 * ```
 */
export default async function copyTextToClipboard(text: string): Promise<void> {
  // Try using the modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return; // Successfully copied
    } catch (err) {
      console.warn(
        "Clipboard API (navigator.clipboard.writeText) failed, attempting fallback.",
        err,
      );
      // If Clipboard API fails (e.g., due to permissions, or not focused document),
      // we can still try the fallback.
    }
  }

  // Fallback method for browsers that do not support the Clipboard API or if it failed
  console.warn(
    "Using fallback method (deprecated document.execCommand) to copy to clipboard.",
  );

  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Styling to make the textarea invisible and prevent scrolling
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px"; // Position off-screen
  textArea.style.left = "-9999px";
  textArea.style.width = "2em"; // Small size
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  document.body.appendChild(textArea);
  textArea.focus(); // Ensure the textarea is focused for `select()` and `execCommand()`
  textArea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
    if (!success) {
      // This error will be caught by the outer catch block if not handled here
      throw new Error("Fallback: document.execCommand('copy') returned false.");
    }
  } catch (err) {
    console.error(
      "Fallback: Unable to copy to clipboard using execCommand.",
      err,
    );
    document.body.removeChild(textArea); // Ensure cleanup on error
    return Promise.reject(err); // Explicitly reject the promise on fallback failure
  }

  document.body.removeChild(textArea);

  if (success) {
    return Promise.resolve(); // Fallback succeeded
  } else {
    // This path should ideally be covered by the error thrown if execCommand returned false
    return Promise.reject(new Error("Fallback: Copying to clipboard failed."));
  }
}
