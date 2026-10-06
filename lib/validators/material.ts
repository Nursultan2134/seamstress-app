import { z } from "zod";

export const logMaterialSchema = z.object({
  name: z.string().min(1, "Укажите название материала"),
  metersTotal: z.coerce.number().positive("Метраж должен быть больше 0"),
  purchaseCost: z.coerce.number().nonnegative("Стоимость не может быть отрицательной"),
  currency: z.enum(["KGS", "USD"]),
  notes: z.string().optional(),
});

export const allocateMaterialSchema = z.object({
  materialId: z.string().min(1, "Выберите рулон"),
  orderId: z.string().min(1),
  orderStageId: z.string().optional(),
  metersUsed: z.coerce.number().positive("Количество метров должно быть больше 0"),
});

export const logCostSchema = z.object({
  orderId: z.string().min(1),
  type: z.enum(["THREAD", "LABOR", "MISC"]),
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
  currency: z.enum(["KGS", "USD"]),
  note: z.string().optional(),
});
