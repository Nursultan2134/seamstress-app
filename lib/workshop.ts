import { prisma } from "@/lib/prisma";
import type { Workshop } from "@prisma/client";

/**
 * V1 is single-workshop: no switcher in the main app. Resolves via
 * WORKSHOP_ID env (set once seeding is done) or falls back to the first
 * workshop row. The /admin area is the only place multiple workshops exist.
 */
export async function getCurrentWorkshop(): Promise<Workshop> {
  const workshopId = process.env.WORKSHOP_ID;

  const workshop = workshopId
    ? await prisma.workshop.findUnique({ where: { id: workshopId } })
    : await prisma.workshop.findFirst({ orderBy: { createdAt: "asc" } });

  if (!workshop) {
    throw new Error(
      "Нет ни одного цеха в базе данных. Запустите `npm run db:seed`."
    );
  }

  return workshop;
}
