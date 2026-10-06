"use server";

import { redirect } from "next/navigation";
import { getCurrentWorkshop } from "@/lib/workshop";
import { findEmployeeByPin } from "@/lib/auth/pin";
import { createSession, destroySession } from "@/lib/auth-session";

export async function loginWithPin(pin: string): Promise<{ error: string }> {
  const workshop = await getCurrentWorkshop();
  const employee = await findEmployeeByPin(workshop.id, pin);

  if (!employee) {
    return { error: "Неверный PIN. Попробуйте ещё раз." };
  }

  await createSession({
    employeeId: employee.id,
    role: employee.role,
    workshopId: workshop.id,
  });

  if (employee.role === "OWNER" || employee.role === "MANAGER") {
    redirect("/dashboard");
  }
  redirect("/my-tasks");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
