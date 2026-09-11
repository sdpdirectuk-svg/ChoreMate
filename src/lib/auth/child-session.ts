import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { getChildSessionSecret } from "@/lib/env";
import type { ChildSessionPayload } from "@/lib/types";

export const CHILD_SESSION_COOKIE = "cm_child_session";

function secretKey() {
  return new TextEncoder().encode(getChildSessionSecret());
}

export async function createChildSessionToken(
  payload: ChildSessionPayload,
): Promise<string> {
  return new SignJWT({
    householdId: payload.householdId,
    memberId: payload.memberId,
    memberName: payload.memberName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function verifyChildSessionToken(
  token: string,
): Promise<ChildSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.householdId !== "string" ||
      typeof payload.memberId !== "string" ||
      typeof payload.memberName !== "string"
    ) {
      return null;
    }
    return {
      householdId: payload.householdId,
      memberId: payload.memberId,
      memberName: payload.memberName,
    };
  } catch {
    return null;
  }
}

export async function getChildSession(): Promise<ChildSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHILD_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyChildSessionToken(token);
}

export async function setChildSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CHILD_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearChildSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CHILD_SESSION_COOKIE);
}

export function hashPin(pin: string, householdId: string): string {
  return createHash("sha256")
    .update(`${householdId}:${pin}`)
    .digest("hex");
}

export function verifyPin(
  pin: string,
  householdId: string,
  pinHash: string | null,
): boolean {
  if (!pinHash) return true;
  const incoming = Buffer.from(hashPin(pin, householdId));
  const stored = Buffer.from(pinHash);
  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}
