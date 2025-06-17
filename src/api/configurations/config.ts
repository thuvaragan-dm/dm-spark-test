export enum EConfigurations {
  FETCH_CHANGELOG = 1,
}

export const configKey: Record<EConfigurations, string> = {
  [EConfigurations.FETCH_CHANGELOG]: "get-changelog-configurations",
};
