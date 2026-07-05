import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const role = resolveAppRole(session.user);
  redirect(role === "employer" ? "/vacancies" : "/jobs");
}