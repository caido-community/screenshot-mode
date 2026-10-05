export type Hsb = {
  h: number;
  s: number;
  b: number;
};

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

function toChannel(value: number): string {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

export function hsbToHex(hsb: Hsb): string {
  const value = hsb.b / 100;
  const sat = hsb.s / 100;
  const channel = (n: number) => {
    const k = (n + hsb.h / 60) % 6;
    return value - value * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };

  return `#${toChannel(channel(5))}${toChannel(channel(3))}${toChannel(channel(1))}`;
}

function toHue(red: number, green: number, blue: number): number {
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  if (delta === 0) {
    return 0;
  }

  if (max === red) {
    return (60 * ((green - blue) / delta) + 360) % 360;
  }

  if (max === green) {
    return 60 * ((blue - red) / delta + 2);
  }

  return 60 * ((red - green) / delta + 4);
}

export function hexToHsb(hex: string): Hsb {
  const digits = HEX_PATTERN.exec(hex)?.[1];
  if (digits === undefined) {
    return { h: 0, s: 0, b: 0 };
  }

  const red = Number.parseInt(digits.slice(0, 2), 16) / 255;
  const green = Number.parseInt(digits.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(digits.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);

  return {
    h: toHue(red, green, blue),
    s: max === 0 ? 0 : (delta / max) * 100,
    b: max * 100,
  };
}
