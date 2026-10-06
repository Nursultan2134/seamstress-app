"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createOrder } from "@/lib/actions/order-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ProcessTypeOption = { id: string; name: string };
type EmployeeOption = { id: string; fullName: string; roleLabel: string };

type StageRow = {
  processTypeId: string;
  assignedEmployeeId: string;
  quantity: number;
};

type Props = {
  processTypes: ProcessTypeOption[];
  employees: EmployeeOption[];
  defaultQuantity?: number;
};

export function StageFlowBuilder({ processTypes, employees, defaultQuantity = 1 }: Props) {
  const [orderNumber, setOrderNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [currency, setCurrency] = useState<"KGS" | "USD">("KGS");
  const [deadline, setDeadline] = useState("");
  const [stages, setStages] = useState<StageRow[]>([
    { processTypeId: processTypes[0]?.id ?? "", assignedEmployeeId: "", quantity: defaultQuantity },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addStage() {
    setStages((rows) => [
      ...rows,
      { processTypeId: processTypes[0]?.id ?? "", assignedEmployeeId: "", quantity },
    ]);
  }

  function removeStage(index: number) {
    setStages((rows) => rows.filter((_, i) => i !== index));
  }

  function updateStage(index: number, patch: Partial<StageRow>) {
    setStages((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createOrder({
        orderNumber,
        clientName: clientName || undefined,
        quantity,
        pricePerUnit,
        currency,
        deadline: deadline || undefined,
        stages,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Номер заказа
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="#002"
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Клиент
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Количество (шт)
          <input
            required
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Цена за единицу
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="flex w-28 flex-col gap-1 text-sm">
            Валюта
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "KGS" | "USD")}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="KGS">сом</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Срок (дедлайн)
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Этапы (в порядке выполнения)</h2>
        {stages.map((stage, index) => (
          <Card key={index} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 sm:pb-2">{index + 1}.</span>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Процесс
              <select
                required
                value={stage.processTypeId}
                onChange={(e) => updateStage(index, { processTypeId: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {processTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Сотрудник
              <select
                required
                value={stage.assignedEmployeeId}
                onChange={(e) => updateStage(index, { assignedEmployeeId: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">— выбрать —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.roleLabel})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-28 flex-col gap-1 text-sm">
              Кол-во
              <input
                required
                type="number"
                min={1}
                value={stage.quantity}
                onChange={(e) => updateStage(index, { quantity: Number(e.target.value) })}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={() => removeStage(index)}
              disabled={stages.length === 1}
            >
              Удалить
            </Button>
          </Card>
        ))}
        <Button type="button" variant="secondary" onClick={addStage} className="self-start">
          + Добавить этап
        </Button>
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Создаём…" : "Создать заказ"}
      </Button>
    </form>
  );
}
