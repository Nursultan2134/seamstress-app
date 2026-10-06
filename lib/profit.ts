import { prisma } from "@/lib/prisma";

export type CurrencyBreakdown = Partial<Record<"KGS" | "USD", number>>;

export type OrderProfit = {
  revenue: number;
  materialCost: number;
  laborCost: number;
  miscCost: number;
  /** null when costs span more than one currency — see isMixedCurrency. */
  profit: number | null;
  currency: "KGS" | "USD";
  isMixedCurrency: boolean;
  costsByCurrency: CurrencyBreakdown;
};

function addTo(breakdown: CurrencyBreakdown, currency: "KGS" | "USD", amount: number) {
  breakdown[currency] = (breakdown[currency] ?? 0) + amount;
}

export async function calculateOrderProfit(orderId: string): Promise<OrderProfit> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      materialUsages: { include: { material: true } },
      costs: true,
      stages: { include: { productionEntries: true } },
    },
  });

  const revenue = order.quantity * order.pricePerUnit;
  const costsByCurrency: CurrencyBreakdown = {};

  let materialCost = 0;
  for (const usage of order.materialUsages) {
    const perMeter = usage.material.purchaseCost / usage.material.metersTotal;
    const cost = usage.metersUsed * perMeter;
    materialCost += cost;
    addTo(costsByCurrency, usage.material.currency, cost);
  }

  let laborCost = 0;
  for (const stage of order.stages) {
    for (const entry of stage.productionEntries) {
      laborCost += entry.quantityCompleted * entry.rateApplied;
    }
  }
  // Labor cost is computed from piece-rate entries, always in the order's currency context.
  addTo(costsByCurrency, order.currency, laborCost);

  let miscCost = 0;
  for (const cost of order.costs) {
    miscCost += cost.amount;
    addTo(costsByCurrency, cost.currency, cost.amount);
  }

  const isMixedCurrency = Object.keys(costsByCurrency).length > 1;
  // Mixed-currency costs can't be netted against single-currency revenue without an
  // FX rate we don't have — withhold the blended total rather than show a wrong number.
  const profit = isMixedCurrency ? null : revenue - materialCost - laborCost - miscCost;

  return {
    revenue,
    materialCost,
    laborCost,
    miscCost,
    profit,
    currency: order.currency,
    isMixedCurrency,
    costsByCurrency,
  };
}
