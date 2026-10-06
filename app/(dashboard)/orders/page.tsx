import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, CURRENCY_LABELS } from "@/lib/order-status";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function OrdersPage() {
  const workshop = await getCurrentWorkshop();
  const orders = await prisma.order.findMany({
    where: { workshopId: workshop.id },
    orderBy: { createdAt: "desc" },
    include: { stages: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Заказы</h1>
        <Link href="/orders/new">
          <Button>+ Новый заказ</Button>
        </Link>
      </div>

      {orders.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Нет заказов.</p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const done = order.stages.filter((s) => s.status === "DONE").length;
          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {order.orderNumber} {order.clientName && `— ${order.clientName}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.quantity} шт · {order.pricePerUnit} {CURRENCY_LABELS[order.currency]}/шт ·{" "}
                    {done}/{order.stages.length} этапов готово
                  </p>
                </div>
                <Badge className={ORDER_STATUS_CLASSES[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
