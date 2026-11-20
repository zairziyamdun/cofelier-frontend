import type { MenuItemBadge, ManualMenuBadge } from "../model/types";

// Подписи меток. Порядок меток приходит с сервера — здесь только текст.
export const BADGE_LABELS: Record<MenuItemBadge, string> = {
  popular: "Популярно",
  new: "Новинка",
  seasonal: "Сезонное",
  signature: "Выбор бариста",
  decaf: "Без кофеина",
};

// Метки, которые ставит менеджер; «Популярно» и «Новинка» считает сервер.
export const MANUAL_BADGES: ManualMenuBadge[] = [
  "seasonal",
  "signature",
  "decaf",
];

// «Популярно» и «Новинка» заметнее ручных: они про то, что происходит сейчас.
export const PRIMARY_BADGES: ReadonlySet<MenuItemBadge> = new Set([
  "popular",
  "new",
]);
