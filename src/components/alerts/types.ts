export type AlertToast = {
  t: string | number;
  title: string;
  description: string;
};

export type PendingAlertToast = {
  t: string | number;
  title: string;
  description: string;
  asyncTask: () => Promise<unknown>;
  successTitle: string;
};
