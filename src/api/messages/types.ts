export enum EnumSender {
  USER = "USER",
  BOT = "BOT",
}

export type Sender = EnumSender;

export type Reaction = "like" | "dislike" | null;

export interface Source {
  id: string;
  name: string;
  object_ref: string;
}

export interface Suggestion {
  question: string;
  relevance: number;
}

export interface Video {
  video: string;
  title?: string;
  relevance: number;
}

export interface Message {
  id: string;
  thread_id: string;
  message: string;
  sender: Sender;
  flag: unknown;
  sources: Source[];
  reaction: Reaction;
}

export type MessageInput = {
  thread_id: string;
  message: string;
  sender: Sender;
  flag: unknown;
  sources: Source[];
};

export type ReactionInput = {
  reaction_type: Reaction;
};

export type MessageParams = {
  limit?: number;
  offset?: number;
  order?: "desc" | "asc";
};
