-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employees_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "process_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultRate" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "process_types_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employee_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "processTypeId" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_rates_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_rates_processTypeId_fkey" FOREIGN KEY ("processTypeId") REFERENCES "process_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "clientName" TEXT,
    "quantity" INTEGER NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KGS',
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pickedUpAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "processTypeId" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "assignedEmployeeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_stages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_stages_processTypeId_fkey" FOREIGN KEY ("processTypeId") REFERENCES "process_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_stages_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "warehouse_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metersTotal" REAL NOT NULL,
    "metersRemaining" REAL NOT NULL,
    "purchaseCost" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KGS',
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedById" TEXT,
    "notes" TEXT,
    CONSTRAINT "warehouse_materials_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderStageId" TEXT,
    "metersUsed" REAL NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_usages_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "warehouse_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "material_usages_orderStageId_fkey" FOREIGN KEY ("orderStageId") REFERENCES "order_stages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_costs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KGS',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_costs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "orderStageId" TEXT NOT NULL,
    "quantityCompleted" INTEGER NOT NULL,
    "rateApplied" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_entries_orderStageId_fkey" FOREIGN KEY ("orderStageId") REFERENCES "order_stages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "days_off" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "days_off_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "employees_workshopId_idx" ON "employees"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "process_types_workshopId_code_key" ON "process_types"("workshopId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_rates_employeeId_processTypeId_key" ON "employee_rates"("employeeId", "processTypeId");

-- CreateIndex
CREATE INDEX "orders_workshopId_idx" ON "orders"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_workshopId_orderNumber_key" ON "orders"("workshopId", "orderNumber");

-- CreateIndex
CREATE INDEX "order_stages_assignedEmployeeId_status_idx" ON "order_stages"("assignedEmployeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "order_stages_orderId_sequenceOrder_key" ON "order_stages"("orderId", "sequenceOrder");

-- CreateIndex
CREATE INDEX "warehouse_materials_workshopId_idx" ON "warehouse_materials"("workshopId");

-- CreateIndex
CREATE INDEX "material_usages_materialId_idx" ON "material_usages"("materialId");

-- CreateIndex
CREATE INDEX "material_usages_orderId_idx" ON "material_usages"("orderId");

-- CreateIndex
CREATE INDEX "order_costs_orderId_idx" ON "order_costs"("orderId");

-- CreateIndex
CREATE INDEX "production_entries_employeeId_date_idx" ON "production_entries"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "days_off_employeeId_date_key" ON "days_off"("employeeId", "date");
