export enum EPrompt {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
  FETCH_CATEGORIES = 3,
  FETCH_SHARED_WITH_YOU = 4,
  FETCH_CREATED_BY_YOU = 5,
}

export const promptKey: Record<EPrompt, string> = {
  [EPrompt.FETCH_ALL]: "get-all-prompts",
  [EPrompt.FETCH_CREATED_BY_YOU]: "get-all-created-by-you-prompts",
  [EPrompt.FETCH_SHARED_WITH_YOU]: "get-all-shared-with-you-prompts",
  [EPrompt.FETCH_SINGLE]: "get-single-prompt",
  [EPrompt.FETCH_CATEGORIES]: "get-prompt-cateories",
};
