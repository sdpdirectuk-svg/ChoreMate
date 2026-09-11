import { describe, expect, it } from "vitest";
import { createHash } from "crypto";

function hashPin(pin: string, householdId: string): string {
  return createHash("sha256").update(`${householdId}:${pin}`).digest("hex");
}

describe("pin hashing", () => {
  it("is deterministic and household-scoped", () => {
    const a = hashPin("1234", "house-a");
    const b = hashPin("1234", "house-a");
    const c = hashPin("1234", "house-b");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
