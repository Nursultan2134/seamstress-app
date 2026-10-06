import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/role-labels";
import { Card } from "@/components/ui/Card";

export default async function AdminWorkshopDetailPage({
  params,
}: {
  params: Promise<{ workshopId: string }>;
}) {
  await requireAdmin();
  const { workshopId } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { employees: { orderBy: { fullName: "asc" } } },
  });
  if (!workshop) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{workshop.name}</h1>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Сотрудники</h2>
        <div className="flex flex-col gap-1 text-sm">
          {workshop.employees.map((e) => (
            <div key={e.id} className="flex items-center justify-between">
              <span>{e.fullName}</span>
              <span className="text-gray-500 dark:text-gray-400">{ROLE_LABELS[e.role]}</span>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
