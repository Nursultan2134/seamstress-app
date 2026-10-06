import Link from "next/link";
import { logout } from "@/lib/actions/auth-actions";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { Role } from "@/lib/session";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Props = {
  fullName: string;
  role: Role;
};

const LINKS = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/orders", label: "Заказы" },
  { href: "/warehouse", label: "Склад" },
  { href: "/employees", label: "Сотрудники" },
  { href: "/analytics", label: "Аналитика" },
];

export function DashboardSidebar({ fullName, role }: Props) {
  return (
    <aside className="flex w-full flex-col border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:h-screen sm:w-56 sm:flex-shrink-0 sm:border-b-0 sm:border-r sm:py-6">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fullName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{ROLE_LABELS[role]}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logout}>
            <button type="submit" className="text-xs font-medium text-red-600 dark:text-red-400">
              Выйти
            </button>
          </form>
        </div>
      </div>
      <nav className="flex flex-row items-center gap-4 overflow-x-auto text-sm font-medium text-gray-600 dark:text-gray-300 sm:flex-col sm:items-stretch sm:gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap hover:text-gray-900 dark:hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
