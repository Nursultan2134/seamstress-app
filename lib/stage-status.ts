import type { StageStatus } from "@prisma/client";

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
};

export const STAGE_STATUS_CLASSES: Record<StageStatus, string> = {
  PENDING:
    "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400",
  IN_PROGRESS:
    "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-950 dark:border-amber-600 dark:text-amber-400",
  DONE: "bg-green-100 border-green-500 text-green-700 dark:bg-green-950 dark:border-green-600 dark:text-green-400",
};
