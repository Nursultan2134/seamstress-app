-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_warehouse_materials" (
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
    CONSTRAINT "warehouse_materials_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "warehouse_materials_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_warehouse_materials" ("currency", "id", "loggedById", "metersRemaining", "metersTotal", "name", "notes", "purchaseCost", "purchasedAt", "workshopId") SELECT "currency", "id", "loggedById", "metersRemaining", "metersTotal", "name", "notes", "purchaseCost", "purchasedAt", "workshopId" FROM "warehouse_materials";
DROP TABLE "warehouse_materials";
ALTER TABLE "new_warehouse_materials" RENAME TO "warehouse_materials";
CREATE INDEX "warehouse_materials_workshopId_idx" ON "warehouse_materials"("workshopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
