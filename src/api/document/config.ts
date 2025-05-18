export enum EDocument {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
  DOWNLOAD = 3,
  SEARCH = 4,
}

export const documentKey: Record<EDocument, string> = {
  [EDocument.FETCH_ALL]: "get-all-documents",
  [EDocument.FETCH_SINGLE]: "get-single-document",
  [EDocument.DOWNLOAD]: "download-document",
  [EDocument.SEARCH]: "search-documents",
};
