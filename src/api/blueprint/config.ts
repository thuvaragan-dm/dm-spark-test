export enum EBlueprint {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const blueprintKey: Record<EBlueprint, string> = {
  [EBlueprint.FETCH_ALL]: "get-all-blueprints",
  [EBlueprint.FETCH_SINGLE]: "get-single-blueprint",
};
