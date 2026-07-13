import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/lib/supabase-server";
import { getOrCreateProfile, updateProfileAction } from "@/features/account/api/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { resolveAppRole } from "@/shared/lib/auth-role";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (resolveAppRole(session.user) !== "candidate") {
    redirect("/vacancies");
  }

  const profile = await getOrCreateProfile();

  return (
    <section className="hf-page">
      <div className="hf-card p-6">
        <p className="hf-section-label">Profile</p>
        <h1 className="hf-title">Личный кабинет</h1>
        <p className="hf-subtitle">Управляйте личной информацией и отображением профиля.</p>
      </div>
      <form action={updateProfileAction} className="hf-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Имя
            </label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.fullName}
              className="h-11 rounded-md"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input id="email" defaultValue={session.user.email ?? ""} readOnly className="h-11 rounded-md bg-secondary" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Роль
            </label>
            <Input id="role" defaultValue={profile.role} readOnly className="h-11 rounded-md bg-secondary" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="headline" className="text-sm font-medium text-foreground">
              Заголовок
            </label>
            <Input
              id="headline"
              name="headline"
              defaultValue={profile.headline ?? ""}
              placeholder="Например: Frontend Engineer, 4 года опыта"
              className="h-11 rounded-md"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">
              О себе
            </label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              placeholder="Коротко о навыках и интересах"
              className="rounded-md"
            />
          </div>
        </div>
        <Button type="submit" className="mt-5 h-11 rounded-md">
          Сохранить изменения
        </Button>
      </form>
    </section>
  );
}
