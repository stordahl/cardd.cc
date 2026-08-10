import type { Context } from "hono";
import type { Env } from "./cache.js";

export function trackBadge(
  env: Env,
  badgeId: string,
  status: string,
  theme: string,
  durationMs: number,
  req: { referer?: string; userAgent?: string; country?: string; ip?: string },
) {
  if (!env.BADGE_ANALYTICS) return;
  env.BADGE_ANALYTICS.writeDataPoint({
    indexes: [badgeId],
    blobs: [
      status,
      theme,
      req.referer ?? "",
      req.userAgent ?? "",
      req.country ?? "",
      req.ip ?? "",
    ],
    doubles: [durationMs],
  });
}
