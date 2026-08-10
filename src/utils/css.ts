export interface BadgeCSS {
  bg: string;
  color: string;
  radius: number;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  font: string;
  theme: "dark" | "light" | "auto";
  size: "base" | "large";
}

const SHARED = {
  radius: 4,
  borderWidth: 0,
  borderStyle: "solid" as const,
  font: "Datatype",
  size: "base" as const,
};

export const DARK = {
  bg: "#2d2d2e",
  color: "#fff",
  borderColor: "#2d2d2e",
};

export const LIGHT = {
  bg: "#f5f5f5",
  color: "#333",
  borderColor: "#d0d0d0",
};

export function parseCSS(searchParams: URLSearchParams): BadgeCSS {
  const rawTheme = searchParams.get("theme");
  const theme: BadgeCSS["theme"] =
    rawTheme === "light" ? "light" : rawTheme === "auto" ? "auto" : "dark";
  const colors = theme === "light" ? LIGHT : DARK;

  const hex = (v: string | null, fallback: string) => {
    if (!v) return fallback;
    const stripped = v.replace(/^#/, "");
    if (/^[0-9a-fA-F]{3,8}$/.test(stripped)) return `#${stripped}`;
    return stripped;
  };

  const num = (v: string | null, fallback: number) => {
    if (v === null) return fallback;
    const n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  };

  const parsed: BadgeCSS = {
    bg: hex(searchParams.get("bg"), colors.bg),
    color: hex(searchParams.get("color"), colors.color),
    radius: num(searchParams.get("radius"), SHARED.radius),
    borderWidth: num(searchParams.get("border"), SHARED.borderWidth),
    borderStyle: SHARED.borderStyle,
    borderColor: hex(searchParams.get("borderColor"), colors.borderColor),
    font: searchParams.get("font") ?? SHARED.font,
    size: searchParams.get("size") === "large" ? "large" : SHARED.size,
    theme,
  };

  const borderParam = searchParams.get("border");
  if (borderParam) {
    const parts = borderParam.split("+");
    if (parts.length >= 1) parsed.borderWidth = num(parts[0], 1);
    if (parts.length >= 2) parsed.borderStyle = parts[1] || SHARED.borderStyle;
    if (parts.length >= 3) parsed.borderColor = hex(parts[2], colors.borderColor);
  }

  return parsed;
}
