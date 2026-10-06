import Link from "next/link";
import { logout } from "@/lib/actions/auth-actions";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { Role } from "@/lib/session";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Props = {
  fullName: string;
  role: Role;
};

export function WorkerNav({ fullName, role }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fullName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{ROLE_LABELS[role]}</p>
      </div>
      <nav className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Link href="/my-tasks">Мои задачи</Link>
        <Link href="/my-stats">Моя статистика</Link>
        <ThemeToggle />
        <form action={logout}>
          <button type="submit" className="text-red-600 dark:text-red-400">
            Выйти
          </button>
        </form>
      </nav>
    </header>
  );
}
