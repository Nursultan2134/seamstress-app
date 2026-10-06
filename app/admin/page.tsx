import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { adminLogout } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function AdminPage() {
  await requireAdmin();

  const workshops = await prisma.workshop.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { employees: true, orders: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Админ: цеха</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/admin/workshops/new">
            <Button>+ Новый цех</Button>
          </Link>
          <form action={adminLogout}>
            <Button type="submit" variant="secondary">
              Выйти
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {workshops.map((w) => (
          <Link key={w.id} href={`/admin/workshops/${w.id}`}>
            <Card className="hover:border-gray-400 dark:hover:border-gray-500">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{w.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {w._count.employees} сотрудников · {w._count.orders} заказов
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
