export enum EAuth {
  GET_ME = 1,
}

export const authKeys: Record<EAuth, string> = {
  [EAuth.GET_ME]: "get-me",
};
