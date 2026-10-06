"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { hashPin, isPinTakenInWorkshop } from "@/lib/auth/pin";
import { createEmployeeSchema, setEmployeeRateSchema, addDayOffSchema } from "@/lib/validators/employee";

export async function createEmployee(formData: FormData): Promise<void> {
  const parsed = createEmployeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/employees/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;
  const workshop = await getCurrentWorkshop();

  if (await isPinTakenInWorkshop(workshop.id, data.pin)) {
    redirect(`/employees/new?error=${encodeURIComponent("Этот PIN уже используется другим сотрудником")}`);
  }

  await prisma.employee.create({
    data: {
      workshopId: workshop.id,
      fullName: data.fullName,
      role: data.role,
      pinHash: await hashPin(data.pin),
    },
  });

  revalidatePath("/employees");
  redirect("/employees");
}

export async function toggleEmployeeActive(employeeId: string): Promise<void> {
  const employee = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } });
  await prisma.employee.update({
    where: { id: employeeId },
    data: { isActive: !employee.isActive },
  });
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/employees");
}

export async function resetEmployeePin(formData: FormData): Promise<void> {
  const employeeId = String(formData.get("employeeId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!/^\d{4}$/.test(pin)) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent("PIN должен состоять из 4 цифр")}`);
  }

  const employee = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } });

  if (await isPinTakenInWorkshop(employee.workshopId, pin, employeeId)) {
    redirect(
      `/employees/${employeeId}?error=${encodeURIComponent("Этот PIN уже используется другим сотрудником")}`
    );
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: { pinHash: await hashPin(pin) },
  });

  revalidatePath(`/employees/${employeeId}`);
  redirect(`/employees/${employeeId}`);
}

export async function setEmployeeRate(formData: FormData): Promise<void> {
  const parsed = setEmployeeRateSchema.safeParse(Object.fromEntries(formData));
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!parsed.success) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;

  await prisma.employeeRate.upsert({
    where: {
      employeeId_processTypeId: {
        employeeId: data.employeeId,
        processTypeId: data.processTypeId,
      },
    },
    create: data,
    update: { rate: data.rate },
  });

  revalidatePath(`/employees/${data.employeeId}`);
  redirect(`/employees/${data.employeeId}`);
}

export async function addDayOff(formData: FormData): Promise<void> {
  const parsed = addDayOffSchema.safeParse(Object.fromEntries(formData));
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!parsed.success) {
    redirect(`/employees/${employeeId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;

  await prisma.dayOff.upsert({
    where: { employeeId_date: { employeeId: data.employeeId, date: new Date(data.date) } },
    create: { employeeId: data.employeeId, date: new Date(data.date), reason: data.reason },
    update: { reason: data.reason },
  });

  revalidatePath(`/employees/${data.employeeId}`);
  redirect(`/employees/${data.employeeId}`);
}
