import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Черновик",
  IN_PROGRESS: "В работе",
  DONE: "Готов",
  PICKED_UP: "Забран",
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  DONE: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  PICKED_UP: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export const CURRENCY_LABELS: Record<"KGS" | "USD", string> = {
  KGS: "сом",
  USD: "$",
};
