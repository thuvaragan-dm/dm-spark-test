export const MESSAGE_LIMIT = 100;
export const MESSAGE_ORDER = "desc";

export enum EMessage {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const messageKey: Record<EMessage, string> = {
  [EMessage.FETCH_ALL]: "get-all-messages",
  [EMessage.FETCH_SINGLE]: "get-single-message",
};
