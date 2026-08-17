import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createSampleUser(): AuthenticatedUser {
  const now = new Date();
  return {
    id: 1,
    openId: "test-member",
    email: "member@example.com",
    name: "Test Member",
    loginMethod: "manus",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

describe("members and newsletter router", () => {
  it("requires authentication to fetch member profile", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.members.profile()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("validates newsletter email input format", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("allows public search of member directory with filters", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const results = await caller.members.directory({
      region: "all",
      categoryType: "all",
      interestKey: "all",
      search: "",
    });
    expect(Array.isArray(results)).toBe(true);
  });
});