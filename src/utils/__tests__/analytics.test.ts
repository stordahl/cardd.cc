import { describe, it, expect, vi } from "vitest";
import { trackBadge } from "../analytics.js";
import type { Env } from "../cache.js";

function mockEnv(): Env {
  const writeDataPoint = vi.fn();
  return {
    BADGE_ANALYTICS: { writeDataPoint } as unknown as AnalyticsEngineDataset,
  } as Env;
}

function mockReq(overrides: {
  referer?: string;
  userAgent?: string;
  country?: string;
  ip?: string;
} = {}) {
  return {
    referer: "",
    userAgent: "",
    country: "",
    ip: "",
    ...overrides,
  };
}

describe("trackBadge", () => {
  it("calls writeDataPoint with index, blobs, and duration", () => {
    const env = mockEnv();
    trackBadge(env, "npm-v", "success", "dark", 42, mockReq());

    expect(env.BADGE_ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
      indexes: ["npm-v"],
      blobs: ["success", "dark", "", "", "", ""],
      doubles: [42],
    });
  });

  it("tracks errors with the corresponding status", () => {
    const env = mockEnv();
    trackBadge(env, "gh-stars", "error", "light", 150, mockReq());

    expect(env.BADGE_ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
      indexes: ["gh-stars"],
      blobs: ["error", "light", "", "", "", ""],
      doubles: [150],
    });
  });

  it("tracks auto theme", () => {
    const env = mockEnv();
    trackBadge(env, "static", "success", "auto", 10, mockReq());

    expect(env.BADGE_ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
      indexes: ["static"],
      blobs: ["success", "auto", "", "", "", ""],
      doubles: [10],
    });
  });

  it("includes referrer, user-agent, country, and ip when provided", () => {
    const env = mockEnv();
    trackBadge(env, "npm-d", "success", "dark", 8, mockReq({
      referer: "https://example.com",
      userAgent: "Mozilla/5.0",
      country: "US",
      ip: "1.2.3.4",
    }));

    expect(env.BADGE_ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
      indexes: ["npm-d"],
      blobs: ["success", "dark", "https://example.com", "Mozilla/5.0", "US", "1.2.3.4"],
      doubles: [8],
    });
  });

  it("does not throw when analytics is undefined", () => {
    const env = {} as Env;
    expect(() =>
      trackBadge(env, "npm-v", "success", "dark", 42, mockReq()),
    ).not.toThrow();
  });
});
