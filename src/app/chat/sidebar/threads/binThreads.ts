import {
  differenceInDays,
  format,
  isThisWeek,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { Thread } from "../../../../api/thread/types";

export type BinnedThreads = {
  today: Thread[];
  yesterday: Thread[];
  lastWeek: Thread[];
  last30Days: Thread[];
  months: { [key: string]: Thread[] };
};

export const binThreads = (threads: Thread[]): BinnedThreads => {
  const now = new Date();

  const today: Thread[] = [];
  const yesterday: Thread[] = [];
  const lastWeek: Thread[] = [];
  const last30Days: Thread[] = [];
  const months: { [key: string]: Thread[] } = {};

  for (const thread of threads) {
    const updatedAt = parseISO(thread.updated_at);

    if (isToday(updatedAt)) {
      today.push(thread);
    } else if (isYesterday(updatedAt)) {
      yesterday.push(thread);
    } else if (isThisWeek(updatedAt)) {
      lastWeek.push(thread);
    } else if (differenceInDays(now, updatedAt) <= 30) {
      last30Days.push(thread);
    } else {
      const monthKey = format(updatedAt, "MMMM yyyy");

      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(thread);
    }
  }

  return {
    today,
    yesterday,
    lastWeek,
    last30Days,
    months,
  };
};
