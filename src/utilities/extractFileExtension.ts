export default function extractFileExtension(fileName: string): string | null {
  const fileExtension = fileName?.split(".")?.pop()?.toLowerCase();

  // Check if the file has an extension and it's not the entire file name
  return fileExtension && fileExtension !== fileName ? fileExtension : null;
}
