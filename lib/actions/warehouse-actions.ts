"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { getSession } from "@/lib/auth-session";
import { logMaterialSchema, allocateMaterialSchema, logCostSchema } from "@/lib/validators/material";

export async function logMaterial(formData: FormData): Promise<void> {
  const parsed = logMaterialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/warehouse/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;
  const session = await getSession();
  const workshop = await getCurrentWorkshop();

  await prisma.warehouseMaterial.create({
    data: {
      workshopId: workshop.id,
      name: data.name,
      metersTotal: data.metersTotal,
      metersRemaining: data.metersTotal,
      purchaseCost: data.purchaseCost,
      currency: data.currency,
      loggedById: session?.employeeId,
      notes: data.notes,
    },
  });

  revalidatePath("/warehouse");
  redirect("/warehouse");
}

export async function allocateMaterial(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData);
  const orderId = String(raw.orderId ?? "");
  const parsed = allocateMaterialSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const material = await tx.warehouseMaterial.findUnique({ where: { id: data.materialId } });
      if (!material || material.metersRemaining < data.metersUsed) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      await tx.warehouseMaterial.update({
        where: { id: data.materialId },
        data: { metersRemaining: { decrement: data.metersUsed } },
      });
      await tx.materialUsage.create({
        data: {
          materialId: data.materialId,
          orderId: data.orderId,
          orderStageId: data.orderStageId || null,
          metersUsed: data.metersUsed,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      redirect(
        `/orders/${data.orderId}?error=${encodeURIComponent("Недостаточно материала на складе")}`
      );
    }
    throw error;
  }

  revalidatePath(`/orders/${data.orderId}`);
  revalidatePath("/warehouse");
  redirect(`/orders/${data.orderId}`);
}

export async function logOrderCost(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData);
  const orderId = String(raw.orderId ?? "");
  const parsed = logCostSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }
  const data = parsed.data;

  await prisma.orderCost.create({
    data: {
      orderId: data.orderId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      note: data.note,
    },
  });

  revalidatePath(`/orders/${data.orderId}`);
  redirect(`/orders/${data.orderId}`);
}
