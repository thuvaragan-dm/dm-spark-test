export enum EMemory {
  FETCH_ALL = 1,
}

export const memoryKey: Record<EMemory, string> = {
  [EMemory.FETCH_ALL]: "get-all-memory",
};
