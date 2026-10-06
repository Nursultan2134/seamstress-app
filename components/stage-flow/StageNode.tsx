import type { StageStatus } from "@prisma/client";
import { STAGE_STATUS_CLASSES, STAGE_STATUS_LABELS } from "@/lib/stage-status";

type Props = {
  processName: string;
  employeeName: string;
  quantity: number;
  status: StageStatus;
};

export function StageNode({ processName, employeeName, quantity, status }: Props) {
  return (
    <div
      className={`flex w-40 flex-shrink-0 flex-col gap-1 rounded-lg border-2 p-3 text-sm ${STAGE_STATUS_CLASSES[status]}`}
    >
      <p className="font-semibold">{processName}</p>
      <p className="truncate text-xs opacity-80">{employeeName}</p>
      <p className="text-xs opacity-80">{quantity} шт</p>
      <p className="mt-1 text-xs font-medium">{STAGE_STATUS_LABELS[status]}</p>
    </div>
  );
}
