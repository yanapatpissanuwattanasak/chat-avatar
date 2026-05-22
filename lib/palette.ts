// Dark, saturated palette — contrasts against bright sky-blue / green background
export const PALETTE: string[] = [
  "#8B1A3A", // deep rose
  "#0D3D6E", // dark navy
  "#1A5C2A", // deep forest
  "#3D0D7A", // dark violet
  "#7A5200", // dark amber
  "#7A2800", // burnt sienna
  "#0D4A40", // dark teal
  "#7A1020", // deep crimson
  "#1A3A6E", // slate blue
  "#5C0D2A", // dark magenta
  "#2A0D5C", // deep indigo
  "#0D5C3A", // dark jade
];

export function randomColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export function colorExcluding(exclude: string[]): string {
  const available = PALETTE.filter((c) => !exclude.includes(c));
  const pool = available.length > 0 ? available : PALETTE;
  return pool[Math.floor(Math.random() * pool.length)];
}
