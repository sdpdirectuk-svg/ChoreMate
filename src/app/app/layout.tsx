import { redirect } from "next/navigation";
import { ParentNav } from "@/components/parent-nav";
import { getOwnedHousehold } from "@/lib/auth/parent";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { household } = await getOwnedHousehold();
  if (!household) redirect("/setup");
  if (!household.setup_completed) redirect("/setup");

  return (
    <div className="min-h-full">
      <ParentNav familyName={household.name} kidCode={household.kid_access_code} />
      <main className="cm-shell py-6 sm:py-8">{children}</main>
    </div>
  );
}
