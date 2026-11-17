# Frontend — техническое устройство

Next.js 16 (App Router) + Tailwind 4 + FSD, TanStack Query, shadcn/ui. Что за
продукт — `OVERVIEW.md`, стек — `Tech-spec.md`.

В разделах помечено, что **есть** в коде и что **план** (появится на этапе N).
Когда план становится кодом — пометка снимается в том же коммите.

---

## 1. Структура

```
app/                  роутинг Next.js — page.tsx / layout.tsx / error.tsx / route.ts
  (site)/             сайт: /, /menu, /about, /contacts,           (есть)
                      /login, /register, /account (+ мои заказы), /cart (есть)
  (admin)/admin/      панель: обзор, orders (живая очередь),       (есть)
                      menu (редактор), staff (сотрудники и роли)
                      stats                                        (заглушка, этап 7)
  icon.svg            favicon: знак без пара                       (есть)
  layout.tsx          корневой layout: шрифты, <Providers>, title  (есть)
proxy.ts              без cookie на /admin и /account — сразу на вход (есть)
src/
  app/                слой FSD app: providers/, layouts/ (Site, Admin), styles/ (есть)
  views/              home, menu, about, contacts, auth, account, cart, admin (есть)
  widgets/            header, footer, menu-list, admin-sidebar,
                      menu-editor, cart-panel, my-orders, order-queue,
                      staff-manager                                (есть)
                      gallery                                      (план, этап 7)
  features/           auth/login, auth/register, auth/logout       (есть)
                      menu-admin/item-editor, menu-admin/stop-list,
                      menu-admin/category-editor,
                      cart, checkout, order-status,
                      staff/create, staff/access                   (есть)
  entities/           menu-item, user, order                       (есть)
  shared/             ui, lib (format-price, format-time), api, brand, (есть)
                      config (env, site, admin-sections),
                      session (только сервер: текущий пользователь),
                      realtime (одно подключение socket.io на вкладку)
openapi/              openapi.json — копия схемы бэкенда (коммитится)
docs/                 документация
```

**Почему два `app`.** Next.js ищет роутер в корневом `app/` (он важнее
`src/app/`), поэтому `src/app/` свободен под слой FSD. В `src/app/` нет
`page.tsx` и `layout.tsx` — только провайдеры и стили.

### Слои

Зависимости — только вниз. Слайсы одного слоя друг друга не импортируют.

| Слой | Что можно импортировать |
| --- | --- |
| `app/` (роутинг) | `@/app`, `@/views` и при необходимости `@/shared/config` |
| `src/app` | все слои ниже |
| `views` | `widgets`, `features`, `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `features` | `entities`, `shared` |
| `entities` | `shared` (кросс-импорт сущностей — только через `@x`, см. ниже) |
| `shared` | только `shared` |

Алиас один — `@/*` → `src/*`. Проверка — Steiger (`pnpm lint:fsd`,
`steiger.config.mjs`, пресет `recommended`); в `src/app` отключено
`fsd/segments-by-purpose` ради сегментов `providers` и `layouts`, а везде —
`fsd/insignificant-slice`: Steiger не знает слой `views` и не видит импорты
из него, поэтому любой виджет страницы для него «без ссылок».

### Устройство слайса

```
src/entities/menu-item/
  index.ts          публичный API: только то, что нужно снаружи
  ui/               MenuItemCard.tsx …
  model/            типы-обёртки над контрактом, zustand-стор (если нужен)
  api/              функции запросов и хуки TanStack Query, фабрика ключей
  lib/              чистые функции (форматирование цены и т.п.)
  config/           константы
```

- Снаружи — только `@/entities/menu-item`. Глубокий путь — нарушение.
- Сегмент заводится, когда в нём появляется первый файл; пустые не создавать.
- Сущности, которым нужна соседняя сущность (заказ → позиция меню), берут её
  через `@x`-реэкспорт: `entities/menu-item/@x/order.ts`.

## 2. Роутинг и доступ

- `page.tsx` — одна строка: `export { MenuPage as default } from "@/views/menu"`.
  Метаданные (`metadata`, `generateMetadata`) — тоже в `page.tsx`, данные для
  них берутся функцией из `views` или `entities`.
- `(site)/layout.tsx` — реэкспорт `SiteLayout` из `@/app/layouts` (шапка и
  подвал — виджеты); `(admin)/layout.tsx` — так же, боковое меню панели.
- `error.tsx` — клиентский и тонкий: `ErrorState` из `shared/ui` и
  `useQueryRetry(retry)` из `shared/api`. Реэкспортировать его из `views`
  нельзя: клиентский файл потянул бы в бандл серверный экран.
- Заголовок страницы — `metadata.title` в `page.tsx`; шаблон
  `%s — Cofelier` задан в корневом layout.
- **Доступ** (есть). JWT лежит в `httpOnly`-cookie `access_token`, которую
  ставит бэкенд; JS страницы её не видит. Браузер шлёт cookie и на API, и на
  сайт (cookie не зависят от порта; в проде — общий `COOKIE_DOMAIN`), поэтому
  сервер Next может спросить API от имени пользователя. Три уровня:
  1. `proxy.ts` — только «есть ли cookie»: нет — redirect на
     `/login?next=<точный адрес>`. Не авторизация, а быстрый путь.
  2. Серверные страницы — `requireUser({ from, roles })` из `shared/session`:
     `GET /auth/me` с cookie запроса; нет входа — на вход, не та роль —
     клиента на `/`, сотрудника на `/admin`. Читается **только под
     `<Suspense>`** (cookies() с cacheComponents); `getCurrentUser` обёрнут в
     `React.cache` — один запрос на рендер.
  3. API — окончательное решение (401/403), фронт роль не «считает».
- **Layout не защищает страницы**: в App Router страница рендерится
  параллельно с layout. Поэтому `AdminLayout` проверяет «сотрудник ли» ради
  бокового меню, а каждая страница раздела оборачивается в `AdminPageGate`
  (`views/admin`) с ролями раздела. Новая страница панели без гейта — ошибка.
- **Разделы панели и роли** — `shared/config/admin-sections.ts`: из него
  строятся и боковое меню (`sectionsForRole`), и проверка страницы
  (`sectionRoles`). Новый раздел — строка там и страница с `AdminPageGate`.
- **`shared/session` — только серверный код** (`server-only`): в клиентском
  компоненте импорт упадёт на сборке. В браузере пользователь — из
  `useCurrentUser()` (`entities/user`): 401 там не ошибка, а `null`.
- После входа, регистрации и выхода: `setQueryData(userKeys.current())`,
  затем `router.replace(...)` и `router.refresh()` — чтобы серверные
  компоненты перечитали сессию.
- `?next=` после входа — только через `safeRedirectPath` (`shared/lib`):
  относительный путь, без `//` и чужих доменов.
- Гость в консоли видит `401` на `/api/auth/me` — так браузер помечает любой
  неуспешный ответ; это ожидаемо.
- Кнопка действия, недоступного роли, не показывается — но запрос без прав всё
  равно должен получить 403 от бэкенда.

### Server и Client Components

- По умолчанию — Server Component. `"use client"` — в листовых компонентах с
  состоянием, эффектами, браузерными API, TanStack Query, GSAP.
- Публичные страницы рендерятся на сервере ради SEO. Включён
  `cacheComponents`, поэтому загрузка данных на сервере устроена так
  (образец — `views/menu/ui/MenuPage.tsx`):
  1. экран синхронный, данные — в отдельном async-компоненте внутри
     `<Suspense fallback={<Skeleton />}>`;
  2. в нём первым делом `await connection()` — иначе Next пойдёт в API во
     время сборки и упадёт в CI без бэкенда;
  3. `prefetchQuery(xxxQueryOptions())` → `<HydrationBoundary
     state={dehydrate(queryClient)}>` → клиентский виджет с
     `useSuspenseQuery` по тем же опциям.

  Итог — частичный пререндер (`◐` в `next build`): оболочка статическая,
  данные приходят потоком на каждый запрос. Ошибка загрузки — в `error.tsx`
  сегмента.
- `new Date()` и `Math.random()` в серверных компонентах без `connection()` —
  ошибка пререндера (cacheComponents).
- Секреты и серверные адреса — только в серверном коде; клиентская переменная
  — с префиксом `NEXT_PUBLIC_` и считается публичной.

## 3. API и кеш

- **Клиент запросов** (есть: `shared/api/query-client.ts`): на сервере —
  новый `QueryClient` на каждый запрос, в браузере — один. `staleTime` 60 с.
- **HTTP** (есть): `http` из `shared/api/http.ts` — `openapi-fetch`,
  типизированный схемой: `http.GET("/api/menu")`. Базовый адрес — `API_URL`
  из `shared/config`: **в браузере пустой** (запрос идёт на сам сайт,
  `/api/*` проксирует `rewrites` в `next.config.ts` на `BACKEND_URL`),
  **на сервере** — `BACKEND_URL`. Так cookie входа принадлежит домену сайта,
  даже когда API на другом (Vercel + Railway, `docs/DEPLOY.md`). `unwrap(result)` отдаёт данные или
  бросает `ApiError` с текстом бэкенда (для `429` — ещё `retryAfterSeconds`
  из `Retry-After`). Голого `fetch` нет.
- **Лимит попыток** (есть): вход и регистрация на бэкенде — 10 запросов в
  минуту с IP. На `429` форма зовёт `useRateLimitCooldown` из `shared/api`:
  показывает отсчёт и блокирует кнопку до конца лимита.
- **Пароль** (есть): правила — `passwordRules` / `passwordProblem` из
  `entities/user` (8–128 символов, буква и цифра), копия
  `common/password-policy.ts` бэкенда — менять вместе. Регистрация
  показывает их списком, проверяет до отправки и требует «Повторите
  пароль»; временный пароль сотрудника генерируется так, чтобы им
  соответствовать.
- **Контракт** (есть): схема бэкенда лежит в `openapi/openapi.json`
  (коммитится). `pnpm sync:api` берёт свежую из `../cofelier-backend`
  (`openapi:export`, без БД) и генерирует типы; `pnpm gen:api` (и
  `postinstall`) — только генерация `shared/api/schema.gen.ts`, этот файл
  не коммитится. Типы — `ApiSchemas["XxxDto"]`; не хватает поля — правится
  DTO бэкенда и `pnpm sync:api`, а не ручной тип.
- **Запросы сущности** — в `entities/<x>/api/`: функция запроса, фабрика
  ключей `xxxKeys`, `xxxQueryOptions()` (общие для сервера и браузера) и хук
  (`usePublicMenu` → `useSuspenseQuery`). Литерал `queryKey: ["menu"]` —
  нельзя. Образец — `entities/menu-item/api/menu.queries.ts`.
- **Мутации меню** — в `features/menu-admin/*/api`; после успеха
  `useInvalidateMenu()` из `entities/menu-item` (инвалидирует `menuKeys.all`:
  и панель, и публичное меню). Ответ `204` без тела — `ensureOk(result)`
  вместо `unwrap`.
- **Оптимистичное обновление** — только там, где ответ почти всегда успешен и
  важна мгновенная реакция: переключатель стоп-листа (`use-stop-list.ts`):
  `onMutate` правит кеш, `onError` откатывает, `onSettled` инвалидирует.
- **Повтор после ошибки** — `useQueryRetry(retry)`: сначала сброс ошибок
  запросов, потом `retry()` Next; без сброса запрос с ошибкой из кеша снова
  бросит её.
- **Мутации** — в `features/<x>/api/`: хук `useXxxMutation`, в `onSuccess` —
  инвалидация всех затронутых ключей, тост — в хуке, а не в компоненте.
- **Живые обновления** (есть): `useLiveOrders()` из `entities/order`
  подписывается на `/orders` (socket.io, `shared/realtime`) и кладёт события
  прямо в кеш TanStack: `order.created` — в очередь, `order.updated` — в
  очередь (неактивный заказ уходит) и в «мои заказы». Отдельного состояния
  заказов нет. После переподключения — `invalidateQueries(orderKeys.all)`:
  события за разрыв могли потеряться. Поэтому у запросов заказов
  `staleTime: Infinity` — их не опрашиваем.
- **Сокет один на вкладку**: `acquireOrdersSocket` / `releaseOrdersSocket` —
  счётчик держателей, последний закрывает. Cookie для авторизации сокета
  — нет: сокет идёт прямо в API (`NEXT_PUBLIC_SOCKET_URL`, Vercel WebSocket не
  проксирует), а перед каждым (пере)подключением берёт через прокси сайта
  токен на минуту `GET /api/auth/socket-token` и передаёт его в
  `auth.token`; без входа сервер сразу отключает.
- **Корзина** (`features/cart`) — в `localStorage` через
  `useSyncExternalStore`: на сервере и при гидратации снимок `null` («ещё не
  загружена» — скелетон или неактивная кнопка), вкладки синхронизируются
  событием `storage`. Цена в корзине — только для показа: сумму считает
  сервер, в запрос уходят `menuItemId` и `quantity`. Модуль помечен
  `"use client"`: серверная шапка импортирует `CartLink` через тот же index.
- **Оформление** (`features/checkout`) не импортирует корзину (слайсы одного
  слоя): `CartPanel` (виджет) передаёт строки и очищает корзину в `onPlaced`.
- Время в клиентских компонентах (`new Date()`) — только после загрузки
  данных или в `useState(() => …)` внутри уже клиентской ветки: при
  пререндере с cacheComponents чтение времени — ошибка.

## 4. UI и бренд

- **Токены** (есть: `src/app/styles/globals.css`): базовые `--charcoal`,
  `--cream`, `--copper`; семантические shadcn-токены `background`,
  `foreground`, `primary`, `accent`, `muted`, `border`… Есть тёмная тема.
  В классах — только семантика: `bg-background`, `text-primary`,
  `border-border`; `text-copper` — для акцентов бренда.
- **Шрифты** (есть): `font-sans` — Manrope, `font-heading` — Playfair Display;
  подключены через `next/font` в корневом layout с кириллицей.
- **Сетка**: шаг 8px → в Tailwind значения, кратные `2` (`p-2`, `gap-4`,
  `mt-6`). Нечётные (`p-3`) — только с причиной.
- **Mobile-first**: база — 320px, брейкпоинты `sm:` `md:` `lg:` добавляют.
  Шапка на телефоне — две строки: знак, корзина и профиль сверху, разделы
  под ними; с `sm:` — одна строка, с `md:` рядом со знаком появляется слово.
- **shadcn/ui** (есть: стиль `base-nova`, примитивы `@base-ui/react`):
  компоненты в `src/shared/ui`, импорт `@/shared/ui/button`. Используется в
  первую очередь в админке; на публичном сайте — свои виджеты в духе бренда.
- **Классы** — через `cn()`; строки классов не склеивать шаблонами.
- **Модальные окна** — `Dialog` из `shared/ui/dialog.tsx` на нативном
  `<dialog>` (`showModal`): фокус, Escape и затемнение — из браузера.
  Содержимое монтируется только пока окно открыто — форма каждый раз чистая
  (`defaultValue`, без синхронизации состояния). Ошибка формы — `FormError`.
- **Поля** — `Input`, `Textarea`, `Select`, `Field`, `FormError` из
  `shared/ui/input.tsx`; переключатель — `Switch` (`role="switch"`).
- **Сотрудники** — `widgets/staff-manager`: создание (`features/staff/create`,
  временный пароль генерируется в браузере, `crypto.getRandomValues`, и
  показывается один раз после создания) и роль/доступ
  (`features/staff/access`, сохраняется сразу; своя строка заблокирована —
  так же решает API).
- **Удаление** — всегда через окно подтверждения с последствиями; если
  удалить нельзя (категория с позициями) — окно объясняет почему, без кнопки
  «Удалить».
- **Иконки** — `lucide-react`.
- **Картинки** — `next/image` с `alt`; фото со стоков — в `public/` или
  внешним доменом из `next.config.ts`.
- **Логотип** (есть): знак векторизован из логотипа бренда —
  `shared/brand/mark-paths.ts` (буква C с чашкой и пар отдельными путями).
  `LogoMark` в `shared/ui/logo.tsx` красит букву с чашкой в `currentColor`
  (угольный на светлом, кремовый в подвале), пар — медный; `steam={false}` —
  без пара. Готовые файлы: `cofelier-mark-light.svg` (для светлого фона) и
  `cofelier-mark-dark.svg` (для тёмного) в `shared/brand`. Favicon
  `app/icon.svg` — знак без пара на угольном. Полный растровый логотип со
  словом — `brandLogo` (`cofelier-logo.png`).
- **Цена** — `formatPrice` из `shared/lib/format-price`: «1 500 ₸»
  (`currencyDisplay: "narrowSymbol"`, иначе ru-RU пишет «KZT»).

### Контент сайта

Тексты и данные кофейни не размазаны по разметке:

| Что | Где |
| --- | --- |
| Название, слоган, адрес, телефон, почта, Instagram, часы, координаты карты | `src/shared/config/site.ts` (`site`) |
| Пункты меню шапки и подвала | `src/shared/config/site.ts` (`navigation`) |
| Тексты главной | `src/views/home/config/content.ts` |
| Тексты «О нас» | `src/views/about/config/content.ts` |
| Меню и цены | бэкенд, `prisma/seed.ts` |

Сейчас там заглушки: правка контента — только в этих файлах.

- **Карта** — виджет Яндекс.Карт в `<iframe>` по `site.map` (без API-ключа),
  ссылки — `views/contacts/lib/map-urls.ts`. Порядок координат —
  `lon, lat`.

## 5. Анимации (этап 7)

- GSAP + `ScrollTrigger` — только в клиентских компонентах через `useGSAP`
  (`@gsap/react`), с `scope` на ref контейнера: хук сам чистит анимации.
- `gsap.registerPlugin(ScrollTrigger)` — один раз в `shared/lib/gsap.ts`.
- Three.js — отдельным клиентским компонентом через `next/dynamic` с
  `ssr: false`, чтобы не утяжелять первый экран.
- Учитывать `prefers-reduced-motion`: константа `MOTION_OK` из
  `shared/lib/gsap.ts`, анимации — внутри `gsap.matchMedia()`.

**Главная** (`views/home`) — образец:

- Секции — серверные компоненты, размеченные `data-*` (`data-reveal`,
  `data-split`, `data-magnetic`, `data-count`…); поведение — в
  `lib/home-motion.ts`, подключает его клиентская оболочка `HomeMotion`
  (`<main>`). Без JS и при reduced motion весь текст виден сразу.
- Текст hero до старта GSAP скрыт классом `hero-hidden` (только при
  `scripting: enabled`), через 3 с CSS показывает его сам.
- 3D — `lib/bean-field.ts` (Three.js без React: главное зерно + фон из одного
  `InstancedMesh`), обёртка `ui/BeanScene.tsx` через `next/dynamic`
  (`ssr: false`). Рисует только пока hero на экране и вкладка активна; при
  `saveData`, без WebGL или при ошибке загрузки hero остаётся без 3D.
- Предметы секций — одна сцена `lib/story-scene.ts` на прилипающем холсте
  поверх страницы. Место предмета в вёрстке — пустой блок `ui/ModelSlot.tsx`
  (`data-model-slot`); сцена каждый кадр ставит модель на его место, поэтому
  предметы едут вместе со страницей. Подключает сцену `HomeMotion`; модель
  грузится, когда её место подходит к экрану.
- Движение 3D завязано на прокрутку и несёт смысл, а не украшает
  (`behavior` в `config/scene.ts`, `MODELS`): `turn` — предмет «Пути зерна»
  поворачивается, проезжая мимо, а между соседними шагами (`flow`)
  пересыпаются зёрна — сырые до ростера, обжаренные после; `arrive` — заказ
  приезжает издалека; `pour` — стакан наполняется, в конце падает лёд.
  Новый предмет без такой роли на главную не ставим.
- Фон — одна «студия» на всю страницу: `HomeMotion` вешает на `<main>` класс
  `dark` и прилипающий слой с двумя источниками света (`studio-key`,
  `studio-fill`), которые переезжают при прокрутке. Секции своих фонов не
  имеют — иначе между ними видны швы.
- Модели — `public/models/*.glb`, сжатые `gltf-transform optimize`
  (meshopt, WebP 1K, упрощение сетки): цель — до ~1 МБ и ~15 тыс.
  треугольников на модель. Исключение — ростер (1,6 МБ, 143 тыс.): при
  более сильном упрощении он разваливается. Айс-латте (стакан, напиток,
  лёд) и банка собраны в Blender; материалы `glass`, `ice` и `latte` сцена
  узнаёт по имени: первые два делает полупрозрачными, напиток «наливает».

---

## Правила

**Процесс**

- Код — источник истины; док правится в том же коммите, что и поведение.
- Объём задачи не расширять молча; неоднозначность — спросить.
- Сначала найти готовое (shadcn, `shared`). Абстракция — со второго случая.

**Код**

- Компонент больше 250–300 строк — делить. Компонент не объявлять внутри
  компонента. `useEffect` — последнее средство, только для внешнего мира и с
  очисткой.
- Полные имена; поля API — как в контракте, свои переменные — `camelCase`,
  компоненты — `PascalCase`, файлы компонентов — `PascalCase.tsx`.
- Комментарий — одно предложение про «почему».
- Экран с запросом обязан иметь состояния загрузки, пусто и ошибки.
- Форматирование — Prettier с настройками по умолчанию (двойные кавычки,
  `;`) и `prettier-plugin-tailwindcss` (сортировка классов); markdown не
  форматируется.

**Безопасность**

- JWT — только в `httpOnly`-cookie; в `localStorage` и JS ничего не хранить.
- `NEXT_PUBLIC_*` публичны.
- `dangerouslySetInnerHTML` — не использовать.
- Внешние ссылки — `rel="noopener noreferrer"`.

**Язык.** Комментарии и доки — русский; идентификаторы, коммиты, ветки —
английский. Тексты интерфейса — русский, прямо в JSX (мультиязычности нет).
