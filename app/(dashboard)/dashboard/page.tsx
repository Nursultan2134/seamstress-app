import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkshop } from "@/lib/workshop";
import { Card } from "@/components/ui/Card";

export default async function DashboardOverviewPage() {
  const workshop = await getCurrentWorkshop();

  const [activeOrders, employeeCount, lowStock] = await Promise.all([
    prisma.order.count({
      where: { workshopId: workshop.id, status: { in: ["DRAFT", "IN_PROGRESS"] } },
    }),
    prisma.employee.count({ where: { workshopId: workshop.id, isActive: true } }),
    prisma.warehouseMaterial.count({
      where: { workshopId: workshop.id, metersRemaining: { lt: 20 } },
    }),
  ]);

  const tiles = [
    { label: "Заказы в работе", value: activeOrders, href: "/orders" },
    { label: "Сотрудников", value: employeeCount, href: "/employees" },
    { label: "Рулонов на складе <20м", value: lowStock, href: "/warehouse" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{workshop.name}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card className="hover:border-gray-400 dark:hover:border-gray-500">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tile.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tile.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
