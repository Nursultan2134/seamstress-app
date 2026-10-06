import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { calculateOrderProfit } from "@/lib/profit";
import { CURRENCY_LABELS } from "@/lib/order-status";
import { Card } from "@/components/ui/Card";

export default async function AnalyticsPage() {
  const workshop = await getCurrentWorkshop();

  const orders = await prisma.order.findMany({
    where: { workshopId: workshop.id },
    orderBy: { createdAt: "desc" },
  });

  const orderProfits = await Promise.all(
    orders.map(async (order) => ({ order, profit: await calculateOrderProfit(order.id) }))
  );

  const entries = await prisma.productionEntry.findMany({
    where: { orderStage: { order: { workshopId: workshop.id } } },
    include: { orderStage: { include: { processType: true } }, employee: true },
  });

  const throughputByProcess = new Map<string, number>();
  for (const entry of entries) {
    const name = entry.orderStage.processType.name;
    throughputByProcess.set(name, (throughputByProcess.get(name) ?? 0) + entry.quantityCompleted);
  }
  const maxThroughput = Math.max(1, ...throughputByProcess.values());

  const ironerOutput = entries
    .filter((e) => e.employee.role === "IRONER")
    .reduce((sum, e) => sum + e.quantityCompleted, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Аналитика</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Прибыль по заказам
        </h2>
        {orderProfits.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Нет заказов.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {orderProfits.map(({ order, profit }) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between text-sm hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span>
                  {order.orderNumber} {order.clientName && `— ${order.clientName}`}
                </span>
                <span className="font-medium">
                  {profit.isMixedCurrency
                    ? "разные валюты"
                    : `${profit.profit?.toFixed(0)} ${CURRENCY_LABELS[profit.currency]}`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Выработка по этапам
        </h2>
        {throughputByProcess.size === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Пока нет выполненных этапов.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.from(throughputByProcess.entries()).map(([name, qty]) => (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{qty} шт</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gray-900 dark:bg-gray-100"
                    style={{ width: `${(qty / maxThroughput) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Утюжка — всего обработано
        </h2>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {ironerOutput} шт
        </p>
      </Card>
    </div>
  );
}
