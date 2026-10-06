import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "OWNER" || session.role === "MANAGER") {
    redirect("/dashboard");
  }

  redirect("/my-tasks");
}
