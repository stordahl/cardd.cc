import { describe, it, expect } from "vitest";
import { parseCSS, DARK, LIGHT } from "../css.js";

function params(input: string) {
  return new URLSearchParams(input);
}

describe("parseCSS", () => {
  it("returns dark defaults when no params are given", () => {
    const css = parseCSS(params(""));
    expect(css.bg).toBe(DARK.bg);
    expect(css.color).toBe(DARK.color);
    expect(css.radius).toBe(4);
    expect(css.borderWidth).toBe(0);
    expect(css.borderStyle).toBe("solid");
    expect(css.borderColor).toBe(DARK.borderColor);
    expect(css.font).toBe("Datatype");
    expect(css.theme).toBe("dark");
  });

  it("returns light defaults when theme=light", () => {
    const css = parseCSS(params("theme=light"));
    expect(css.bg).toBe(LIGHT.bg);
    expect(css.color).toBe(LIGHT.color);
    expect(css.borderColor).toBe(LIGHT.borderColor);
    expect(css.theme).toBe("light");
  });

  it("returns auto theme when theme=auto", () => {
    const css = parseCSS(params("theme=auto"));
    expect(css.theme).toBe("auto");
  });

  it("prepends # to hex values", () => {
    const css = parseCSS(params("bg=2ea44f&color=fff"));
    expect(css.bg).toBe("#2ea44f");
    expect(css.color).toBe("#fff");
  });

  it("strips existing # from hex values", () => {
    const css = parseCSS(params("bg=%232ea44f&color=%23fff"));
    expect(css.bg).toBe("#2ea44f");
    expect(css.color).toBe("#fff");
  });

  it("parses named CSS colors", () => {
    const css = parseCSS(params("bg=red&color=dodgerblue"));
    expect(css.bg).toBe("red");
    expect(css.color).toBe("dodgerblue");
  });

  it("parses radius as a number", () => {
    const css = parseCSS(params("radius=8"));
    expect(css.radius).toBe(8);
  });

  it("defaults radius to 4 for non-numeric values", () => {
    const css = parseCSS(params("radius=abc"));
    expect(css.radius).toBe(4);
  });

  it("parses font", () => {
    const css = parseCSS(params("font=Inter"));
    expect(css.font).toBe("Inter");
  });

  it("parses border shorthand with width only", () => {
    const css = parseCSS(params("border=2"));
    expect(css.borderWidth).toBe(2);
    expect(css.borderStyle).toBe("solid");
    expect(css.borderColor).toBe(DARK.borderColor);
  });

  it("parses border shorthand with width+style", () => {
    const css = parseCSS(params("border=2%2Bdashed"));
    expect(css.borderWidth).toBe(2);
    expect(css.borderStyle).toBe("dashed");
  });

  it("parses border shorthand with width+style+color", () => {
    const css = parseCSS(params("border=2%2Bsolid%2Bf00"));
    expect(css.borderWidth).toBe(2);
    expect(css.borderStyle).toBe("solid");
    expect(css.borderColor).toBe("#f00");
  });

  it("parses standalone borderColor", () => {
    const css = parseCSS(params("borderColor=f00"));
    expect(css.borderColor).toBe("#f00");
  });

  it("uses DARK fallbacks with auto theme", () => {
    const css = parseCSS(params("theme=auto"));
    expect(css.bg).toBe(DARK.bg);
    expect(css.color).toBe(DARK.color);
    expect(css.theme).toBe("auto");
  });
});
