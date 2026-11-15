import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// Линтер правил FSD для src/. Корневой app/ — роутинг Next.js, вне FSD.
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Steiger не знает слой views (наш pages) и не видит импорты из него:
    // любой виджет страницы для него «без ссылок». Правило даёт ложные срабатывания.
    rules: { "fsd/insignificant-slice": "off" },
  },
  {
    // app/providers и app/layouts — принятые в FSD имена сегментов слоя app.
    files: ["./src/app/**"],
    rules: { "fsd/segments-by-purpose": "off" },
  },
]);
