import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CURRENCY_LABELS } from "@/lib/order-status";
import { Card } from "@/components/ui/Card";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;

  const material = await prisma.warehouseMaterial.findUnique({
    where: { id: materialId },
    include: {
      loggedBy: true,
      usages: { include: { order: true }, orderBy: { usedAt: "desc" } },
    },
  });

  if (!material) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{material.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Остаток {material.metersRemaining} из {material.metersTotal} м · куплено за{" "}
          {material.purchaseCost} {CURRENCY_LABELS[material.currency]}
          {material.loggedBy && ` · внёс: ${material.loggedBy.fullName}`}
        </p>
        {material.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{material.notes}</p>
        )}
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          История списаний
        </h2>
        {material.usages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Материал ещё не расходовался.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {material.usages.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span>{u.order.orderNumber}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {u.metersUsed} м · {u.usedAt.toLocaleDateString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
