// Рендеры напитков для витрины главной (Blender, public/images/home).
// Позиция меню без рендера на витрину не попадает: десерт или чай в
// стакане смотрелись бы чужими. Новый напиток в меню — новый рендер здесь.
const DRINK_IMAGES: Record<string, string> = {
  Эспрессо: "espresso",
  Американо: "americano",
  Капучино: "cappuccino",
  "Флэт уайт": "flatwhite",
  Латте: "latte",
  Раф: "raf",
  "Воронка V60": "v60",
  Аэропресс: "aeropress",
  "Колд брю": "coldbrew",
  "Медный латте": "copper",
  "Апельсиновый тоник": "tonic",
  "Матча латте": "matcha",
  Какао: "cocoa",
};

// Сколько позиций просить у API: часть популярных может не иметь рендера.
export const POPULAR_FETCH_LIMIT = 8;
export const POPULAR_SHOWN = 4;

// Пауза автопрокрутки витрины, мс; после выбора гостем она останавливается.
export const POPULAR_AUTOPLAY_MS = 6000;

export function drinkImage(name: string): string | null {
  const key = DRINK_IMAGES[name.trim()];
  return key ? `/images/home/drink-${key}.webp` : null;
}

export const FLOATING_BEANS = [
  "/images/home/bean-1.webp",
  "/images/home/bean-2.webp",
  "/images/home/bean-3.webp",
] as const;
