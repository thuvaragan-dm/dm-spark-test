export enum EAcademy {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const academyKey: Record<EAcademy, string> = {
  [EAcademy.FETCH_ALL]: "get-all-academy",
  [EAcademy.FETCH_SINGLE]: "get-single-academy",
};
