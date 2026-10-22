// Preview only: mirrors MoneyUtil on the backend, which recomputes every amount when saving.
// VND has no minor unit, so amounts are rounded to whole đồng.
export function lineTotal(
  unitPrice: number,
  quantity: number,
  discountPercent: number
): number {
  const gross = (Number(unitPrice) || 0) * (Number(quantity) || 0);
  return Math.round((gross * (100 - (Number(discountPercent) || 0))) / 100);
}
