// Модель зерна для 3D-сцены hero: сжата meshopt, текстуры WebP 1K (~200 КБ).
export const BEAN_MODEL_URL = "/models/coffee-bean.glb";

// Сколько зёрен летит в фоне: на телефоне меньше — дешевле для GPU и батареи.
export const BEAN_COUNT = { desktop: 46, mobile: 16 } as const;
