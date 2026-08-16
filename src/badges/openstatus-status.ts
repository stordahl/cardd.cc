import type { Context } from "hono";
import { Badge } from "./types.js";

const STATUS_LABELS: Record<string, string> = {
  operational: "operational",
  degraded_performance: "degraded",
  partial_outage: "partial outage",
  major_outage: "major outage",
  under_maintenance: "maintenance",
  unknown: "unknown",
  incident: "incident",
};

export class OpenStatusStatusBadge extends Badge {
  id = "openstatus-status";
  title = "OpenStatus status";
  description = "Live status from an OpenStatus status page";
  path = "/openstatus/status/:slug";
  examplePath = "/openstatus/status/openstatus";

  pathParams = [{ name: "slug", description: "OpenStatus status page slug" }];

  demoPresets = [
    { label: "openstatus", value: "openstatus" },
    { label: "calcom", value: "calcom" },
    { label: "vercel", value: "vercel" },
    { label: "github", value: "github" },
    { label: "linear", value: "linear" },
    { label: "supabase", value: "supabase" },
  ];

  async fetch(c: Context) {
    const slug = c.req.param("slug") ?? "";
    const resp = await fetch(
      `https://api.openstatus.dev/public/status/${encodeURIComponent(slug)}`,
      { headers: { "User-Agent": "cardd.cc" } },
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = (await resp.json()) as { status: string };
    return { label: "openstatus", value: STATUS_LABELS[data.status] ?? data.status };
  }

  onError(err: Error, c: Context) {
    return { label: "openstatus", value: err.message };
  }
}
