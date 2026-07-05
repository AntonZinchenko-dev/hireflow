import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/lib/supabase-server";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.app_metadata.role as string | undefined;
  redirect(role === "admin" ? "/vacancies" : "/analytics");
}