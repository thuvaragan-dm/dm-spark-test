import { CustomSlottedComponent } from "../../types/type-utils";

export type AlertToast = {
  t: string | number;
  title: string;
  description: string;
  Custom?: CustomSlottedComponent<"div">;
};

export type PendingAlertToast = {
  t: string | number;
  title: string;
  description: string;
  asyncTask: () => Promise<unknown>;
  successTitle: string;
};
