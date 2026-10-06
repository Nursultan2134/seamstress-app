import { adminLogin } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Админ-доступ</h1>
        <form action={adminLogin} className="flex flex-col gap-3">
          <input
            required
            name="password"
            type="password"
            placeholder="Пароль администратора"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          <SubmitButton pendingLabel="Входим…">Войти</SubmitButton>
        </form>
      </Card>
    </main>
  );
}
