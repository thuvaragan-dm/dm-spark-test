export enum EUser {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const userKey: Record<EUser, string> = {
  [EUser.FETCH_ALL]: "get-all-users",
  [EUser.FETCH_SINGLE]: "get-single-user",
};
