import { z } from "zod";

export const ROLE_VALUES = [
  "OWNER",
  "MANAGER",
  "CUTTER",
  "SEWER",
  "QC",
  "SHIPPER",
  "IRONER",
] as const;

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Укажите имя"),
  role: z.enum(ROLE_VALUES),
  pin: z.string().regex(/^\d{4}$/, "PIN должен состоять из 4 цифр"),
});

export const setEmployeeRateSchema = z.object({
  employeeId: z.string().min(1),
  processTypeId: z.string().min(1),
  rate: z.coerce.number().nonnegative("Ставка не может быть отрицательной"),
});

export const addDayOffSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().min(1, "Укажите дату"),
  reason: z.string().optional(),
});
