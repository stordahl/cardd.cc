import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { rateLimiter } from "hono-rate-limiter";
import type { Env } from "./utils/cache.js";
import { BUNDLED_FONT_DATA } from "./utils/fonts.js";
import { handleBadge, handleError } from "./utils/badge.js";
import { BADGES } from "./badges/index.js";
import LandingPage from "./pages/LandingPage.js";
import { trackBadge } from "./utils/analytics.js";
import { parseCSS } from "./utils/css.js";

const app = new Hono<{ Bindings: Env }>();

app.use(
  rateLimiter<{ Bindings: Env }>({
    binding: (c) => c.env.BADGE_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
    skip: (c) =>
      c.req.path === "/" || c.req.path === "/fonts/Datatype-Regular.ttf",
  })
);

for (const badge of BADGES) {
  app[badge.method.toLowerCase() as "get"](badge.path, async (c) => {
    const start = Date.now();
    const theme = parseCSS(new URL(c.req.url).searchParams).theme;
    try {
      const { label, value } = await badge.fetch(c);
      const response = await handleBadge(c, label, value);
      trackBadge(c.env, badge.id, "success", theme, Date.now() - start, {
        referer: c.req.header("referer"),
        userAgent: c.req.header("user-agent"),
        country: c.req.header("cf-ipcountry"),
        ip: c.req.header("cf-connecting-ip"),
      });
      return response;
    } catch (err) {
      const { label, value } = badge.onError(err as Error, c);
      const response = await handleError(c, label, value);
      trackBadge(c.env, badge.id, "error", theme, Date.now() - start, {
        referer: c.req.header("referer"),
        userAgent: c.req.header("user-agent"),
        country: c.req.header("cf-ipcountry"),
        ip: c.req.header("cf-connecting-ip"),
      });
      return response;
    }
  });

  app.get(`/partial/${badge.id}`, (c) => {
    const preset = c.req.query("preset") ?? "";
    const src = badge.buildDemoPath(preset);
    return c.html(fragment(src));
  });
}

app.get("/fonts/Datatype-Regular.ttf", (c) => {
  return c.body(BUNDLED_FONT_DATA, 200, {
    "Content-Type": "font/ttf",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

export function fragment(src: string) {
  return `<div class="badge-preview"><img class="badge-img" src="${src}" /></div><div class="demo-url"><code class="badge-code">cardd.cc${src}</code></div>`;
}

app.get("/", jsxRenderer(), (c) => {
  return c.render(<LandingPage badges={BADGES} />);
});

export default app;
