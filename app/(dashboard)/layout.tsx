import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/nav/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "OWNER" && session.role !== "MANAGER") {
    redirect("/my-tasks");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
  });
  if (!employee) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <DashboardSidebar fullName={employee.fullName} role={employee.role} />
      <main className="flex-1 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">{children}</main>
    </div>
  );
}
