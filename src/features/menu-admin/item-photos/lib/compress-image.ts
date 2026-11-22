// Фото с телефона — 5–10 МБ: уменьшаем в браузере до отправки, по мобильному
// интернету так в разы быстрее. Окончательные размеры всё равно делает сервер.
const MAX_SIDE = 2400;
const SMALL_ENOUGH_BYTES = 1.5 * 1024 * 1024;
const SAFE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function compressImage(file: File): Promise<Blob> {
  // Браузер не смог прочитать файл — отправляем как есть: сервер ответит понятно.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  }).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (
    scale === 1 &&
    file.size <= SMALL_ENOUGH_BYTES &&
    SAFE_TYPES.has(file.type)
  ) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP сохраняет прозрачность; браузер без WebP вернёт PNG — тоже без потерь.
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9),
  );
  return blob ?? file;
}

// Перестановка соседей: порядок фото — список id, первое — обложка.
export function movePhoto(ids: number[], index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
