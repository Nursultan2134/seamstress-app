import { z } from "zod";

export const createOrderStageSchema = z.object({
  processTypeId: z.string().min(1, "Выберите этап"),
  assignedEmployeeId: z.string().min(1, "Выберите сотрудника"),
  quantity: z.number().int().positive("Количество должно быть больше 0"),
  deadline: z.string().optional(),
});

export const createOrderSchema = z.object({
  orderNumber: z.string().min(1, "Укажите номер заказа"),
  clientName: z.string().optional(),
  quantity: z.number().int().positive("Количество должно быть больше 0"),
  pricePerUnit: z.number().nonnegative("Цена не может быть отрицательной"),
  currency: z.enum(["KGS", "USD"]),
  deadline: z.string().optional(),
  stages: z.array(createOrderStageSchema).min(1, "Добавьте хотя бы один этап"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
