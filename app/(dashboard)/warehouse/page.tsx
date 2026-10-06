import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { CURRENCY_LABELS } from "@/lib/order-status";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function WarehousePage() {
  const workshop = await getCurrentWorkshop();
  const materials = await prisma.warehouseMaterial.findMany({
    where: { workshopId: workshop.id },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Склад</h1>
        <Link href="/warehouse/new">
          <Button>+ Новый рулон</Button>
        </Link>
      </div>

      {materials.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Нет материалов на складе.</p>
      )}

      <div className="flex flex-col gap-3">
        {materials.map((m) => {
          const percentRemaining = Math.round((m.metersRemaining / m.metersTotal) * 100);
          return (
            <Link key={m.id} href={`/warehouse/${m.id}`}>
              <Card className="hover:border-gray-400 dark:hover:border-gray-500">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</p>
                  <p
                    className={`text-sm font-medium ${
                      m.metersRemaining < 20
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {m.metersRemaining} / {m.metersTotal} м
                  </p>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gray-900 dark:bg-gray-100"
                    style={{ width: `${percentRemaining}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Куплено за {m.purchaseCost} {CURRENCY_LABELS[m.currency]}
                  {m.notes && ` · ${m.notes}`}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
