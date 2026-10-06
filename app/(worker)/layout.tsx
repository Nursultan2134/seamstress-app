import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { WorkerNav } from "@/components/nav/WorkerNav";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
  });
  if (!employee) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <WorkerNav fullName={employee.fullName} role={employee.role} />
      <main className="flex-1 bg-gray-50 p-4 dark:bg-gray-950">{children}</main>
    </div>
  );
}
