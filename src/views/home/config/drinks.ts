// Рендеры напитков для витрины главной (Blender, public/images/home).
// Позиция меню без рендера на витрину не попадает: десерт или чай в
// стакане смотрелись бы чужими. Новый напиток в меню — новый рендер здесь.
// Эспрессо подают в чашке с блюдцем: кадр широкий, показываем его крупнее.
const WIDE_DRINKS = new Set(["espresso"]);

// Ключ рендера → названия позиции, под которыми он подходит. Менеджер может
// написать название по-английски или с другим регистром — рендер всё равно найдётся.
const DRINK_NAMES: Record<string, string[]> = {
  espresso: ["Эспрессо", "Espresso"],
  americano: ["Американо", "Americano"],
  cappuccino: ["Капучино", "Cappuccino"],
  flatwhite: ["Флэт уайт", "Флет уайт", "Flat white"],
  latte: ["Латте", "Latte"],
  raf: ["Раф", "Raf"],
  v60: ["Воронка V60", "V60"],
  aeropress: ["Аэропресс", "AeroPress"],
  coldbrew: ["Колд брю", "Cold brew"],
  copper: ["Медный латте", "Copper latte"],
  tonic: ["Апельсиновый тоник", "Эспрессо-тоник", "Espresso tonic"],
  matcha: ["Матча латте", "Matcha latte", "Матча"],
  cocoa: ["Какао", "Cocoa"],
};

// «Флэт  Уайт» и «флэт уайт», «ё» и «е» — одно и то же название.
export function normalizeDrinkName(name: string): string {
  return name.trim().toLowerCase().replaceAll("ё", "е").replace(/\s+/g, " ");
}

const DRINK_IMAGES = new Map(
  Object.entries(DRINK_NAMES).flatMap(([key, names]) =>
    names.map((name) => [normalizeDrinkName(name), key] as const),
  ),
);

// Сколько позиций просить у API: часть популярных может не иметь рендера.
export const POPULAR_FETCH_LIMIT = 8;
export const POPULAR_SHOWN = 4;

// Пауза автопрокрутки витрины, мс; после выбора гостем она останавливается.
export const POPULAR_AUTOPLAY_MS = 6000;

export type DrinkImage = { src: string; wide: boolean };

export function drinkImage(name: string): DrinkImage | null {
  const key = DRINK_IMAGES.get(normalizeDrinkName(name));
  if (!key) return null;
  return { src: `/images/home/drink-${key}.webp`, wide: WIDE_DRINKS.has(key) };
}
