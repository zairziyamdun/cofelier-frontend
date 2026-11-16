// Тяжёлое (Three.js, модели) — после гидратации и старта анимации hero:
// иначе разбор ~600 КБ скрипта отнимает кадры у первого экрана.
export function whenIdle(callback: () => void, timeout = 1500) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 300);
  return () => clearTimeout(id);
}
