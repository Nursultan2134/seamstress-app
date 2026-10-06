"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { createOrderSchema } from "@/lib/validators/order";

export async function createOrder(input: unknown): Promise<{ error: string }> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные заказа" };
  }
  const data = parsed.data;
  const workshop = await getCurrentWorkshop();

  let orderId: string;
  try {
    const order = await prisma.order.create({
      data: {
        workshopId: workshop.id,
        orderNumber: data.orderNumber,
        clientName: data.clientName,
        quantity: data.quantity,
        pricePerUnit: data.pricePerUnit,
        currency: data.currency,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: "IN_PROGRESS",
        stages: {
          create: data.stages.map((stage, index) => ({
            processTypeId: stage.processTypeId,
            assignedEmployeeId: stage.assignedEmployeeId,
            quantity: stage.quantity,
            deadline: stage.deadline ? new Date(stage.deadline) : null,
            sequenceOrder: index + 1,
          })),
        },
      },
    });
    orderId = order.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: `Заказ с номером «${data.orderNumber}» уже существует` };
    }
    throw error;
  }

  redirect(`/orders/${orderId}`);
}

export async function markOrderPickedUp(orderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PICKED_UP", pickedUpAt: new Date() },
  });
  revalidatePath(`/orders/${orderId}`);
}
