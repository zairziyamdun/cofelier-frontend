import type { MenuItem, MenuPhoto } from "@/entities/menu-item";

// Сколько позиций просить у API: часть популярных может быть без фото.
export const POPULAR_FETCH_LIMIT = 8;
export const POPULAR_SHOWN = 4;

// Пауза автопрокрутки витрины, мс; после выбора гостем она останавливается.
export const POPULAR_AUTOPLAY_MS = 6000;

// Обложка позиции для витрины. wide — кадр шире высоты (чашка с блюдцем):
// показываем крупнее. cutout — прозрачный фон: напиток «стоит», без рамки.
export type DrinkImage = { photo: MenuPhoto; wide: boolean; cutout: boolean };

// Без фото позиция на витрину не попадает: пустой стакан на главной хуже, чем его отсутствие.
export function drinkImage(item: MenuItem): DrinkImage | null {
  const photo = item.photos[0];
  if (!photo) return null;
  return {
    photo,
    wide: photo.width > photo.height * 1.1,
    cutout: photo.hasAlpha,
  };
}
