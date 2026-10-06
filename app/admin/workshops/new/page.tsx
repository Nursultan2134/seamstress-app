import { requireAdmin } from "@/lib/admin-session";
import { createWorkshop } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";

const INPUT_CLASS =
  "rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export default async function NewWorkshopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Новый цех</h1>
      <form action={createWorkshop}>
        <Card className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Название цеха
            <input required name="name" className={INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Имя владельца
            <input required name="ownerName" className={INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            PIN владельца (4 цифры)
            <input
              required
              name="ownerPin"
              pattern="\d{4}"
              maxLength={4}
              className={INPUT_CLASS}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

          <SubmitButton pendingLabel="Создаём…" className="self-start">
            Создать цех
          </SubmitButton>
        </Card>
      </form>
    </main>
  );
}
