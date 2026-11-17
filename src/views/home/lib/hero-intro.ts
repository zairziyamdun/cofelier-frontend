// Связь интро hero и тяжёлой 3D-сцены через DOM: сцена ждёт сигнала
// на самой секции, поэтому при каждом заходе на главную всё начинается заново.
const DONE_EVENT = "hero-intro-done";
const DONE_ATTR = "data-hero-intro-done";

export function markHeroIntroDone(hero: HTMLElement) {
  if (hero.hasAttribute(DONE_ATTR)) return;
  hero.setAttribute(DONE_ATTR, "");
  hero.dispatchEvent(new Event(DONE_EVENT));
}

// Вызывает callback после интро, но не позже timeout: сцена не должна
// пропасть, если анимации не запустились.
export function afterHeroIntro(
  hero: HTMLElement,
  callback: () => void,
  timeout = 4000,
) {
  if (hero.hasAttribute(DONE_ATTR)) {
    callback();
    return () => undefined;
  }
  let called = false;
  const run = () => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    hero.removeEventListener(DONE_EVENT, run);
    callback();
  };
  const timer = setTimeout(run, timeout);
  hero.addEventListener(DONE_EVENT, run);
  return () => {
    called = true;
    clearTimeout(timer);
    hero.removeEventListener(DONE_EVENT, run);
  };
}
