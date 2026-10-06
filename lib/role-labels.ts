import type { Role } from "@/lib/session";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Владелец",
  MANAGER: "Менеджер",
  CUTTER: "Кроятель",
  SEWER: "Швея",
  QC: "ОТК",
  SHIPPER: "Отправка",
  IRONER: "Утюжка",
};
