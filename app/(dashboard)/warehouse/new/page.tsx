import { logMaterial } from "@/lib/actions/warehouse-actions";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function NewMaterialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">Новый рулон на складе</h1>
      <form action={logMaterial}>
        <Card className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Название
            <input
              required
              name="name"
              placeholder="Хлопок синий, рулон №3"
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Метраж (всего, м)
            <input
              required
              name="metersTotal"
              type="number"
              min={0.1}
              step="0.1"
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Стоимость закупки
              <input
                required
                name="purchaseCost"
                type="number"
                min={0}
                step="0.01"
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <label className="flex w-28 flex-col gap-1 text-sm">
              Валюта
              <select
                name="currency"
                defaultValue="USD"
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="KGS">сом</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Заметка
            <input name="notes" className="rounded-md border border-gray-300 px-3 py-2" />
          </label>

          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

          <SubmitButton pendingLabel="Сохраняем…" className="self-start">
            Добавить рулон
          </SubmitButton>
        </Card>
      </form>
    </div>
  );
}
