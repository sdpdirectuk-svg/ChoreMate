import { describe, expect, it } from "vitest";
import { publicErrorMessage, safeInternalPath } from "@/lib/safe";

describe("safeInternalPath", () => {
  it("allows normal app paths", () => {
    expect(safeInternalPath("/app")).toBe("/app");
    expect(safeInternalPath("/setup/quick")).toBe("/setup/quick");
  });

  it("blocks open redirects", () => {
    expect(safeInternalPath("//evil.com")).toBe("/app");
    expect(safeInternalPath("https://evil.com")).toBe("/app");
    expect(safeInternalPath("/\\evil")).toBe("/app");
  });

  it("uses fallback when empty", () => {
    expect(safeInternalPath("", "/setup")).toBe("/setup");
    expect(safeInternalPath(null, "/setup")).toBe("/setup");
  });
});

describe("publicErrorMessage", () => {
  it("hides infra details", () => {
    expect(
      publicErrorMessage(new Error("Missing SUPABASE_SERVICE_ROLE_KEY")),
    ).toBe("Something went wrong. Please try again.");
  });

  it("keeps simple user messages", () => {
    expect(publicErrorMessage(new Error("Incorrect PIN."))).toBe(
      "Incorrect PIN.",
    );
  });
});
