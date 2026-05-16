export function round(num: number, digits = 2): number {
  return Number(num.toFixed(digits));
}