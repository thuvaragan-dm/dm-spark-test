/**
 * @typedef {object} DocumentData
 * @property {string} documentId - The extracted document ID from the span tag.
 * @property {string} name - The extracted name from the span tag. If not present, this defaults to the documentId.
 */

/**
 * @typedef {object} DocumentExtractionResult
 * @property {DocumentData[]} documents - An array of objects containing the extracted data.
 * @property {string} message - The message with all span tags removed.
 */

/**
 * Extracts document data from span tags within a user message string.
 * It supports older formats where only a documentId is present.
 *
 * @param {string} content - The input string containing text and span tags.
 * @returns {DocumentExtractionResult} An object with the extracted document data and the clean message.
 */
export function documentsExtractorFromUserMessage(content: string): {
  documents: { documentId: string; name: string | null }[];
  message: string;
} {
  const documents: { documentId: string; name: string | null }[] = [];
  // Regex to find all span tags, including their content.
  const spanTagRegex = /<span[^>]*>.*?<\/span>/g;
  // Regex to extract the documentId and optionally the name from the content of a span tag.
  const dataRegex = /document id:([\w-]+)(?: name:([^<]+))?/;

  // Find all matches of the span tag regex in the content.
  const matches = content.match(spanTagRegex);

  if (matches) {
    matches.forEach((match) => {
      // For each found span tag, try to extract the data.
      const dataMatch = match.match(dataRegex);
      if (dataMatch && dataMatch[1]) {
        const documentId = dataMatch[1].trim();
        // Use the extracted name if it exists (group 2), otherwise fall back to the documentId.
        const name = dataMatch[2].trim() || null;
        documents.push({ documentId, name });
      }
    });
  }

  // Remove all span tags from the original content to get the clean message.
  // We also replace multiple spaces with a single space and trim the result.
  const message = content
    .replace(spanTagRegex, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    documents,
    message,
  };
}
