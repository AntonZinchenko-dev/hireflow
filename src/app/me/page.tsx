import { getServerSession } from "@/shared/lib/supabase-server";
import { getOrCreateProfile, updateProfileAction } from "@/features/account/api/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) return null;

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
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Имя
            </label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.fullName}
              className="h-11 rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" defaultValue={session.user.email ?? ""} readOnly className="h-11 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Роль
            </label>
            <Input id="role" defaultValue={profile.role} readOnly className="h-11 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="headline" className="text-sm font-medium text-slate-700">
              Заголовок
            </label>
            <Input
              id="headline"
              name="headline"
              defaultValue={profile.headline ?? ""}
              placeholder="Например: Frontend Engineer, 4 года опыта"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-slate-700">
              О себе
            </label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              placeholder="Коротко о навыках и интересах"
              className="rounded-xl"
            />
          </div>
        </div>
        <Button type="submit" className="mt-5 h-11 rounded-xl">
          Сохранить изменения
        </Button>
      </form>
    </section>
  );
}
