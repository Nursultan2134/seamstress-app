import type { StageStatus } from "@prisma/client";
import { StageNode } from "@/components/stage-flow/StageNode";

export type StageFlowItem = {
  id: string;
  sequenceOrder: number;
  quantity: number;
  status: StageStatus;
  processType: { name: string };
  assignedEmployee: { fullName: string };
};

export function StageFlow({ stages }: { stages: StageFlowItem[] }) {
  const sorted = [...stages].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return (
    <div className="flex flex-col gap-2 overflow-x-auto sm:flex-row sm:items-center sm:gap-2">
      {sorted.map((stage, index) => (
        <div key={stage.id} className="flex flex-col items-center gap-2 sm:flex-row">
          <StageNode
            processName={stage.processType.name}
            employeeName={stage.assignedEmployee.fullName}
            quantity={stage.quantity}
            status={stage.status}
          />
          {index < sorted.length - 1 && (
            <span className="text-xl text-gray-400 dark:text-gray-600 sm:mx-1" aria-hidden>
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
