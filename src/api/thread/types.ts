export interface Thread {
  id: string;
  title: string;
  user_id: string;
  has_task: boolean;
  updated_at: string;
  copilot_id: string;
}

export type ThreadInput = {
  copilot_id: string;
  title: string;
};

export type RenameThreadInput = {
  title: string;
};

export type ThreadParams = {
  copilot_id?: string;
  has_task?: boolean;
  limit?: number;
  offset?: number;
};
