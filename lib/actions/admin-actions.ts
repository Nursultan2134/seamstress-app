"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/auth/pin";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-session";

export async function adminLogin(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect(`/admin/login?error=${encodeURIComponent("Неверный пароль")}`);
  }
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

const DEFAULT_PROCESS_TYPES = [
  { code: "cutting", name: "Крой", defaultRate: 15, sortOrder: 1 },
  { code: "sew_body", name: "Шов — основа", defaultRate: 25, sortOrder: 2 },
  { code: "sew_zipper", name: "Шов — молния", defaultRate: 10, sortOrder: 3 },
  { code: "sew_button", name: "Шов — пуговицы", defaultRate: 5, sortOrder: 4 },
  { code: "sew_print", name: "Шов — принт", defaultRate: 8, sortOrder: 5 },
  { code: "qc", name: "ОТК", defaultRate: 0, sortOrder: 6 },
  { code: "shipping", name: "Отправка", defaultRate: 0, sortOrder: 7 },
  { code: "ironing", name: "Утюжка", defaultRate: 7, sortOrder: 8 },
];

export async function createWorkshop(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerPin = String(formData.get("ownerPin") ?? "");

  if (!name || !ownerName || !/^\d{4}$/.test(ownerPin)) {
    redirect(`/admin/workshops/new?error=${encodeURIComponent("Заполните все поля (PIN — 4 цифры)")}`);
  }

  const workshop = await prisma.workshop.create({
    data: {
      name,
      processTypes: { create: DEFAULT_PROCESS_TYPES },
      employees: {
        create: { fullName: ownerName, role: "OWNER", pinHash: await hashPin(ownerPin) },
      },
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/workshops/${workshop.id}`);
}
