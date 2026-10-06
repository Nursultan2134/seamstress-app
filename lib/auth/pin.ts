import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Employee } from "@prisma/client";

const PIN_PATTERN = /^\d{4}$/;

export function isValidPinFormat(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * PINs aren't unique-indexed in the DB (hashes aren't lookup-able by value),
 * so login scans the small set of active employees in the workshop and compares.
 */
export async function findEmployeeByPin(
  workshopId: string,
  pin: string
): Promise<Employee | null> {
  if (!isValidPinFormat(pin)) return null;

  const employees = await prisma.employee.findMany({
    where: { workshopId, isActive: true },
  });

  for (const employee of employees) {
    if (await bcrypt.compare(pin, employee.pinHash)) {
      return employee;
    }
  }
  return null;
}

/** Enforces PIN uniqueness among active employees of the same workshop. */
export async function isPinTakenInWorkshop(
  workshopId: string,
  pin: string,
  excludeEmployeeId?: string
): Promise<boolean> {
  const employees = await prisma.employee.findMany({
    where: {
      workshopId,
      isActive: true,
      ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
    },
  });

  for (const employee of employees) {
    if (await bcrypt.compare(pin, employee.pinHash)) {
      return true;
    }
  }
  return false;
}
