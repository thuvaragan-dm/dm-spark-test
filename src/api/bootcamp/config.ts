export enum EBootcamp {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const bootcampKey: Record<EBootcamp, string> = {
  [EBootcamp.FETCH_ALL]: "get-all-bootcamp",
  [EBootcamp.FETCH_SINGLE]: "get-single-bootcamp",
};
