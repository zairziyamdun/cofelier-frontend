const tengeFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "KZT",
  // Иначе ru-RU пишет «KZT» вместо знака ₸.
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

// 1500 → «1 500 ₸»
export function formatPrice(price: number): string {
  return tengeFormat.format(price);
}
