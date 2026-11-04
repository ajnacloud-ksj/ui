import { describe, expect, it } from "vitest";

import theme from "./theme.json";

function luminance(channels: string) {
  const [hue, saturation, lightness] = channels
    .replace(/%/g, "")
    .split(" ")
    .map(Number);
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const color = (n: number) => {
    const k = (n + h * 12) % 12;
    const channel = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * color(0) + 0.7152 * color(8) + 0.0722 * color(4);
}

describe("default theme text contrast", () => {
  const pairs = [
    ["foreground", "background"],
    ["card-foreground", "card"],
    ["popover-foreground", "popover"],
    ["primary-foreground", "primary"],
    ["secondary-foreground", "secondary"],
    ["accent-foreground", "accent"],
    ["destructive-foreground", "destructive"],
    ["destructive-text", "secondary"],
    ["muted-foreground", "card"],
    ["muted-foreground", "background"],
    ["muted-foreground", "popover"],
    ["muted-foreground", "secondary"],
    ["muted-foreground", "muted"],
    ["muted-foreground", "accent"],
    ["destructive-text", "destructive-tint"],
    ["info", "info-tint"],
    ["success", "success-tint"],
    ["warning", "warning-tint"],
    ["background", "info"],
    ["background", "success"],
    ["background", "warning"],
  ] as const;
  it.each([0, 1])("keeps normal-sized text at WCAG AA in mode %s", (mode) => {
    for (const [foreground, background] of pairs) {
      const values = [
        luminance(theme.colors[foreground][mode]),
        luminance(theme.colors[background][mode]),
      ].sort((a, b) => a - b);
      expect(
        (values[1] + 0.05) / (values[0] + 0.05),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

it.each([0, 1])("keeps sidebar text at WCAG AA in mode %s", (mode) => {
  const color = (name: keyof typeof theme.sidebarColors) => {
    const value = theme.sidebarColors[name][mode];
    const alias = value.match(/^var\(--ajna-(.+)\)$/)?.[1];
    return luminance(
      alias ? theme.colors[alias as keyof typeof theme.colors][mode] : value,
    );
  };
  const pairs = [
    ["sidebar-foreground", "sidebar"],
    ["sidebar-primary-foreground", "sidebar-primary"],
    ["sidebar-accent-foreground", "sidebar-accent"],
  ] as const;
  for (const [foreground, background] of pairs) {
    const values = [color(foreground), color(background)].sort((a, b) => a - b);
    expect(
      (values[1] + 0.05) / (values[0] + 0.05),
      `${foreground} on ${background}`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
