// Данные кофейни для шапки, подвала и страницы контактов — в одном месте.
// Адрес, телефон, часы и координаты — заглушки до передачи реальных данных.
export const site = {
  name: "Cofelier",
  slogan: "Мастерская вашего кофе",
  city: "Алматы",
  address: "ул. Кофейная, 12",
  addressNote: "Вход со двора, вывеска с медной чашкой",
  phone: "+7 700 000 00 00",
  email: "hello@cofelier.kz",
  instagram: "cofelier",
  hours: [
    { days: "Пн–Пт", time: "08:00–21:00" },
    { days: "Сб–Вс", time: "09:00–22:00" },
  ],
  // Координаты точки на карте: [долгота, широта] — порядок Яндекс.Карт.
  map: { lon: 76.9458, lat: 43.2381, zoom: 16 },
} as const;

export const navigation = [
  { href: "/menu", label: "Меню" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
] as const;

// tel:-ссылка без пробелов и скобок.
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
