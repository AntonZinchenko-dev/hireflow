import { redirect } from "next/navigation";

export default async function BoardIndexPage() {
  redirect("/vacancies");
}
