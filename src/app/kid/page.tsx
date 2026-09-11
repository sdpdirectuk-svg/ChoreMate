import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { KidLoginClient } from "@/components/kid-experience";
import { getChildSession } from "@/lib/auth/child-session";

export const metadata = {
  title: "Kid login",
  robots: { index: false, follow: false },
};

export default async function KidLoginPage() {
  const session = await getChildSession();
  if (session) redirect("/kid/home");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell flex flex-1 items-start py-10">
        <div className="w-full space-y-6">
          <KidLoginClient />
          <p className="text-center text-sm text-ink-soft">
            Parent?{" "}
            <Link href="/login" className="font-semibold text-brand">
              Sign in here
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
