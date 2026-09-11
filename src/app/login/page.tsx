import { LoginClient } from "@/components/auth-forms";

export const metadata = {
  title: "Parent login",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <LoginClient next={params.next} />;
}
