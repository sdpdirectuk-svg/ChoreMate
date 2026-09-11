import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-chrome";
import { SetupChoice } from "@/components/setup-wizard";
import { getOwnedHousehold, requireParentUser } from "@/lib/auth/parent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Setup",
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  await requireParentUser();
  const { household } = await getOwnedHousehold();
  if (household?.setup_completed) redirect("/app");

  return (
    <div className="min-h-full">
      <SiteHeader compact />
      <main className="cm-shell py-10">
        <SetupChoice defaultName={household?.name || "Our family"} />
      </main>
    </div>
  );
}
