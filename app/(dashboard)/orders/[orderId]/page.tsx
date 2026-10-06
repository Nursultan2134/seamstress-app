import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, CURRENCY_LABELS } from "@/lib/order-status";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { StageFlow } from "@/components/stage-flow/StageFlow";
import { allocateMaterial, logOrderCost } from "@/lib/actions/warehouse-actions";
import { markOrderPickedUp } from "@/lib/actions/order-actions";
import { calculateOrderProfit } from "@/lib/profit";

const COST_TYPE_LABELS = { THREAD: "Нитки", LABOR: "Доп. работа", MISC: "Прочее" } as const;
const INPUT_CLASS =
  "rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { orderId } = await params;
  const { error } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      stages: {
        include: { processType: true, assignedEmployee: true },
        orderBy: { sequenceOrder: "asc" },
      },
      materialUsages: { include: { material: true }, orderBy: { usedAt: "desc" } },
      costs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const availableMaterials = await prisma.warehouseMaterial.findMany({
    where: { workshopId: order.workshopId, metersRemaining: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  const profit = await calculateOrderProfit(order.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {order.orderNumber} {order.clientName && `— ${order.clientName}`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {order.quantity} шт · {order.pricePerUnit} {CURRENCY_LABELS[order.currency]}/шт
            {order.deadline && ` · срок: ${order.deadline.toLocaleDateString("ru-RU")}`}
          </p>
        </div>
        <Badge className={ORDER_STATUS_CLASSES[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Этапы</h2>
        <StageFlow stages={order.stages} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Материал со склада
          </h2>
          <div className="mb-4 flex flex-col gap-2">
            {order.materialUsages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Материал ещё не списан.</p>
            ) : (
              order.materialUsages.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span>{u.material.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{u.metersUsed} м</span>
                </div>
              ))
            )}
          </div>
          {availableMaterials.length > 0 && (
            <form
              action={allocateMaterial}
              className="flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-700"
            >
              <input type="hidden" name="orderId" value={order.id} />
              <select name="materialId" required className={INPUT_CLASS}>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (остаток {m.metersRemaining} м)
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  required
                  name="metersUsed"
                  type="number"
                  min={0.1}
                  step="0.1"
                  placeholder="Метров"
                  className={`flex-1 ${INPUT_CLASS}`}
                />
                <SubmitButton pendingLabel="Списываем…" variant="secondary">
                  Списать
                </SubmitButton>
              </div>
            </form>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Расходы (нитки, прочее)
          </h2>
          <div className="mb-4 flex flex-col gap-2">
            {order.costs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Расходов пока нет.</p>
            ) : (
              order.costs.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>
                    {COST_TYPE_LABELS[c.type]}
                    {c.note && ` — ${c.note}`}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {c.amount} {CURRENCY_LABELS[c.currency]}
                  </span>
                </div>
              ))
            )}
          </div>
          <form
            action={logOrderCost}
            className="flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-700"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <div className="flex gap-2">
              <select name="type" defaultValue="THREAD" className={INPUT_CLASS}>
                <option value="THREAD">Нитки</option>
                <option value="LABOR">Доп. работа</option>
                <option value="MISC">Прочее</option>
              </select>
              <select name="currency" defaultValue={order.currency} className={`w-24 ${INPUT_CLASS}`}>
                <option value="KGS">сом</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <input
              required
              name="amount"
              type="number"
              min={0.01}
              step="0.01"
              placeholder="Сумма"
              className={INPUT_CLASS}
            />
            <input name="note" placeholder="Заметка" className={INPUT_CLASS} />
            <SubmitButton pendingLabel="Сохраняем…" variant="secondary" className="self-start">
              Добавить расход
            </SubmitButton>
          </form>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Прибыль</h2>
          {order.status !== "PICKED_UP" && (
            <form action={markOrderPickedUp.bind(null, order.id)}>
              <SubmitButton pendingLabel="Сохраняем…" variant="secondary">
                Заказчик забрал товар
              </SubmitButton>
            </form>
          )}
        </div>
        <div className="mb-3 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Выручка: </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {profit.revenue.toFixed(0)} {CURRENCY_LABELS[profit.currency]}
          </span>
        </div>

        {profit.isMixedCurrency ? (
          <div>
            <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              Расходы в разных валютах — итог нужно посчитать вручную
            </p>
            <div className="flex flex-col gap-1 text-sm">
              {(Object.entries(profit.costsByCurrency) as [string, number][]).map(
                ([currency, amount]) => (
                  <p key={currency}>
                    Расходы в {CURRENCY_LABELS[currency as "KGS" | "USD"]}: {amount.toFixed(2)}
                  </p>
                )
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Материал</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  −{profit.materialCost.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Работа</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  −{profit.laborCost.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Прочее</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  −{profit.miscCost.toFixed(0)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
              Итого: {profit.profit?.toFixed(0)} {CURRENCY_LABELS[profit.currency]}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
