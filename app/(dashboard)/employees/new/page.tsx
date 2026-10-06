import { createEmployee } from "@/lib/actions/employee-actions";
import { ROLE_VALUES } from "@/lib/validators/employee";
import { ROLE_LABELS } from "@/lib/role-labels";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";

const INPUT_CLASS =
  "rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Новый сотрудник</h1>
      <form action={createEmployee}>
        <Card className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Имя
            <input required name="fullName" className={INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Роль
            <select name="role" defaultValue="SEWER" className={INPUT_CLASS}>
              {ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            4-значный PIN
            <input
              required
              name="pin"
              pattern="\d{4}"
              maxLength={4}
              placeholder="1234"
              className={INPUT_CLASS}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

          <SubmitButton pendingLabel="Сохраняем…" className="self-start">
            Добавить сотрудника
          </SubmitButton>
        </Card>
      </form>
    </div>
  );
}
