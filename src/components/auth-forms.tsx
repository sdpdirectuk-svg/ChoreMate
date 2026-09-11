"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { signInParent, signUpParent, type ActionResult } from "@/lib/actions/auth-setup";

function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const action = mode === "login" ? signInParent : signUpParent;
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className="cm-panel mx-auto w-full max-w-md space-y-4 p-6 sm:p-8">
      <div className="space-y-2">
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          {mode === "login" ? "Parent login" : "Create your family"}
        </h1>
        <p className="text-sm text-ink-soft">
          {mode === "login"
            ? "Sign in to manage chores, approvals, and rewards."
            : "Parents create the household. Kids join with a simple access code."}
        </p>
      </div>

      {mode === "signup" ? (
        <label className="block space-y-2 text-sm font-medium">
          Your name
          <input className="cm-input" name="name" autoComplete="name" placeholder="Alex" />
        </label>
      ) : null}

      <label className="block space-y-2 text-sm font-medium">
        Email
        <input
          className="cm-input"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium">
        Password
        <input
          className="cm-input"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="At least 8 characters"
        />
      </label>

      {mode === "login" && next ? (
        <input type="hidden" name="next" value={next} />
      ) : null}

      {state && !state.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : null}

      <button className="cm-btn cm-btn-primary w-full" disabled={pending}>
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Get started"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-brand">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function LoginClient({ next }: { next?: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell flex flex-1 items-center py-8">
        <AuthForm mode="login" next={next} />
      </main>
      <SiteFooter />
    </div>
  );
}

export function SignupClient() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell flex flex-1 items-center py-8">
        <AuthForm mode="signup" />
      </main>
      <SiteFooter />
    </div>
  );
}
