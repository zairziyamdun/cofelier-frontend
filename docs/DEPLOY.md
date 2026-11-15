# Деплой сайта — Vercel

Сайт — на Vercel, API и база — на Railway (`cofelier-backend/docs/DEPLOY.md`).

## Как ходят запросы

```
браузер ──/api/*──▶ Vercel (Next rewrites) ──▶ Railway API   (REST, cookie входа — домена сайта)
браузер ──wss──────────────────────────────▶ Railway /orders (сокет, токен из /api/auth/socket-token)
сервер Next ─────── BACKEND_URL ───────────▶ Railway API     (cookie пересылает shared/session)
```

Сайт (`*.vercel.app`) и API (`*.up.railway.app`) — разные сайты, браузер не
отправил бы cookie входа с одного на другой. Поэтому REST идёт через сам
сайт, а сокет авторизуется одноразовым токеном (Vercel WebSocket не
проксирует).

## Первый запуск

1. Vercel → Add New → Project → импорт `cofelier-frontend` (Framework:
   Next.js, остальное по умолчанию: Vercel сам видит pnpm и `pnpm build`;
   `postinstall` генерирует типы из `openapi/openapi.json`).
2. Settings → Environment Variables (Production и Preview):

   | Переменная | Значение |
   | --- | --- |
   | `BACKEND_URL` | `https://<проект>.up.railway.app` — без `/api` и `/` в конце |
   | `NEXT_PUBLIC_SOCKET_URL` | тот же адрес Railway |

3. Deploy. После смены переменных — Redeploy: `NEXT_PUBLIC_*` вшиваются в
   сборку, `rewrites` читаются при сборке.
4. На Railway в переменных бэкенда — `FRONTEND_URL=https://<проект>.vercel.app`
   (CORS для сокета), `COOKIE_DOMAIN` — пустой.

## Проверка

- `https://<сайт>/api/health` → `{"status":"ok"}` — прокси до Railway работает.
- Вход → открывается кабинет (не возвращает на `/login`).
- В панели «Заказы» — «Онлайн».

## Частые ошибки

| Симптом | Причина |
| --- | --- |
| После входа снова страница входа | сборка без `BACKEND_URL` (прокси ведёт на `localhost:4000`) или старая сборка — Redeploy |
| `/api/health` на сайте — 404 или ошибка | `BACKEND_URL` с `/api` на конце или с опечаткой |
| Очередь: «Нет связи — переподключаемся…» | `NEXT_PUBLIC_SOCKET_URL` не задан (сокет идёт на localhost) или `FRONTEND_URL` на Railway не совпадает с адресом сайта |
| Первый запрос долгий | Railway/Render будит спящий сервис — подождать |

## Локально

То же самое: `BACKEND_URL` и `NEXT_PUBLIC_SOCKET_URL` в `.env.local`
(`http://localhost:4000`), `pnpm dev` — браузер ходит на
`localhost:3000/api/*`, Next проксирует на локальный бэкенд. После правки
`next.config.ts` или `.env.local` dev-сервер нужно перезапустить.
