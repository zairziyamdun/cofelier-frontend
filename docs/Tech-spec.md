# Tech spec — frontend

Версии — из `package.json`. Менеджер пакетов — `pnpm@10.34.1`.

## Ядро

| Технология | Для чего |
| --- | --- |
| Next.js 16.4 (App Router, Turbopack) | роутинг, SSR, сборка |
| React 19.3 | UI |
| TypeScript 5 (`strict: true`) | язык |
| @tanstack/react-query 5 | серверное состояние, кеш, гидрация с сервера |

## Стили и UI

| Технология | Для чего |
| --- | --- |
| Tailwind CSS 4 | стили, токены бренда в `src/app/styles/globals.css` |
| shadcn/ui (`base-nova`) + `@base-ui/react` | компоненты админки, `src/shared/ui` |
| class-variance-authority | варианты компонентов |
| tw-animate-css | простые CSS-анимации shadcn |
| lucide-react | иконки |
| next/font (Manrope, Playfair Display) | шрифты с кириллицей |

## План

| Технология | Этап | Для чего |
| --- | --- | --- |
| openapi-typescript | 2 | типы API из Swagger бэкенда |
| GSAP + ScrollTrigger + @gsap/react | 7 | анимации |
| Three.js | 7 | 3D |
| Vitest | 7 | unit-тесты `lib/` |

## Качество

| Технология | Для чего |
| --- | --- |
| ESLint 9 (`eslint-config-next` + `eslint-config-prettier`) | линтер |
| Steiger 0.10 + `@feature-sliced/steiger-plugin` | правила FSD |
| Prettier 3 + `prettier-plugin-tailwindcss` | форматирование, порядок классов |
| GitHub Actions | CI на каждый PR |
