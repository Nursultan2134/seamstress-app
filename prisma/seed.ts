import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

async function main() {
  // Idempotent: wipe children-first so reruns during development don't duplicate.
  await prisma.productionEntry.deleteMany();
  await prisma.materialUsage.deleteMany();
  await prisma.orderCost.deleteMany();
  await prisma.dayOff.deleteMany();
  await prisma.employeeRate.deleteMany();
  await prisma.orderStage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.warehouseMaterial.deleteMany();
  await prisma.processType.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.workshop.deleteMany();

  const workshop = await prisma.workshop.create({
    data: { name: "Швейный цех «Весна»" },
  });

  const processTypeDefs = [
    { code: "cutting", name: "Крой", defaultRate: 15, sortOrder: 1 },
    { code: "sew_body", name: "Шов — основа", defaultRate: 25, sortOrder: 2 },
    { code: "sew_zipper", name: "Шов — молния", defaultRate: 10, sortOrder: 3 },
    { code: "sew_button", name: "Шов — пуговицы", defaultRate: 5, sortOrder: 4 },
    { code: "sew_print", name: "Шов — принт", defaultRate: 8, sortOrder: 5 },
    { code: "qc", name: "ОТК", defaultRate: 0, sortOrder: 6 },
    { code: "shipping", name: "Отправка", defaultRate: 0, sortOrder: 7 },
    { code: "ironing", name: "Утюжка", defaultRate: 7, sortOrder: 8 },
  ];

  const processTypes: Record<string, { id: string }> = {};
  for (const def of processTypeDefs) {
    const pt = await prisma.processType.create({
      data: { workshopId: workshop.id, ...def },
    });
    processTypes[def.code] = pt;
  }

  async function createEmployee(
    fullName: string,
    role:
      | "OWNER"
      | "MANAGER"
      | "CUTTER"
      | "SEWER"
      | "QC"
      | "SHIPPER"
      | "IRONER",
    pin: string
  ) {
    return prisma.employee.create({
      data: {
        workshopId: workshop.id,
        fullName,
        role,
        pinHash: await hashPin(pin),
      },
    });
  }

  const owner = await createEmployee("Айгуль (владелец)", "OWNER", "1111");
  const manager1 = await createEmployee("Нурлан (менеджер)", "MANAGER", "2222");
  const manager2 = await createEmployee("Бек (менеджер)", "MANAGER", "3333");
  const cutter = await createEmployee("Данияр (кроятель)", "CUTTER", "4444");
  const sewer1 = await createEmployee("Жанна (швея)", "SEWER", "5555");
  const sewer2 = await createEmployee("Айнура (швея)", "SEWER", "6666");
  const qc = await createEmployee("Салтанат (ОТК)", "QC", "7777");
  const shipper = await createEmployee("Эрлан (отправка)", "SHIPPER", "8888");
  const ironer = await createEmployee("Гүлнара (утюжка)", "IRONER", "9999");

  // Жанна has a personal rate override for sew_body, above the shop default.
  await prisma.employeeRate.create({
    data: {
      employeeId: sewer1.id,
      processTypeId: processTypes.sew_body.id,
      rate: 30,
    },
  });

  const freshRoll = await prisma.warehouseMaterial.create({
    data: {
      workshopId: workshop.id,
      name: "Хлопок синий, рулон №1",
      metersTotal: 100,
      metersRemaining: 100,
      purchaseCost: 300,
      currency: "USD",
      loggedById: cutter.id,
      notes: "Свежий рулон, ещё не использован",
    },
  });

  const partialRoll = await prisma.warehouseMaterial.create({
    data: {
      workshopId: workshop.id,
      name: "Хлопок белый, рулон №2",
      metersTotal: 80,
      metersRemaining: 50,
      purchaseCost: 150,
      currency: "USD",
      loggedById: cutter.id,
      notes: "Частично использован",
    },
  });

  const order = await prisma.order.create({
    data: {
      workshopId: workshop.id,
      orderNumber: "#001",
      clientName: "ТОО «Глобал Трейд»",
      quantity: 200,
      pricePerUnit: 350,
      currency: "KGS",
      status: "IN_PROGRESS",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const cuttingStage = await prisma.orderStage.create({
    data: {
      orderId: order.id,
      processTypeId: processTypes.cutting.id,
      sequenceOrder: 1,
      assignedEmployeeId: cutter.id,
      quantity: 200,
      status: "DONE",
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.orderStage.create({
    data: {
      orderId: order.id,
      processTypeId: processTypes.sew_body.id,
      sequenceOrder: 2,
      assignedEmployeeId: sewer1.id,
      quantity: 200,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  await prisma.orderStage.create({
    data: {
      orderId: order.id,
      processTypeId: processTypes.sew_print.id,
      sequenceOrder: 3,
      assignedEmployeeId: sewer2.id,
      quantity: 200,
      status: "PENDING",
    },
  });

  await prisma.orderStage.create({
    data: {
      orderId: order.id,
      processTypeId: processTypes.qc.id,
      sequenceOrder: 4,
      assignedEmployeeId: qc.id,
      quantity: 200,
      status: "PENDING",
    },
  });

  await prisma.orderStage.create({
    data: {
      orderId: order.id,
      processTypeId: processTypes.shipping.id,
      sequenceOrder: 5,
      assignedEmployeeId: shipper.id,
      quantity: 200,
      status: "PENDING",
    },
  });

  // Cutting is done -> matching production entry (feeds Данияр's payroll).
  await prisma.productionEntry.create({
    data: {
      employeeId: cutter.id,
      orderStageId: cuttingStage.id,
      quantityCompleted: 200,
      rateApplied: processTypeDefs[0].defaultRate,
    },
  });

  // Material allocation: the sample order drew 30m from the partially-used roll.
  await prisma.materialUsage.create({
    data: {
      materialId: partialRoll.id,
      orderId: order.id,
      orderStageId: cuttingStage.id,
      metersUsed: 30,
    },
  });

  await prisma.orderCost.create({
    data: {
      orderId: order.id,
      type: "THREAD",
      amount: 500,
      currency: "KGS",
      note: "Нитки",
    },
  });

  console.log("Seed complete:");
  console.log(`  Workshop: ${workshop.name} (${workshop.id})`);
  console.log("  PINs — Айгуль(OWNER)=1111 Нурлан(MANAGER)=2222 Бек(MANAGER)=3333");
  console.log("         Данияр(CUTTER)=4444 Жанна(SEWER)=5555 Айнура(SEWER)=6666");
  console.log("         Салтанат(QC)=7777 Эрлан(SHIPPER)=8888 Гүлнара(IRONER)=9999");
  console.log(`  Fresh roll: ${freshRoll.name} (100% remaining)`);
  console.log(`  Order ${order.orderNumber}: 200 шт, 5 этапов (крой готов)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
