import type { ApiSchemas } from "@/shared/api";

type Role = ApiSchemas["Role"];

// Кому открыта панель: все, кроме клиентов. Окончательно права проверяет API.
export const STAFF_ROLES: Role[] = ["barista", "manager", "admin"];

// Разделы панели: из этого списка строится боковое меню и проверка доступа к странице.
export const adminSections = [
  {
    href: "/admin/orders",
    label: "Заказы",
    roles: ["barista", "manager", "admin"],
    description:
      "Очередь предзаказов и смена статуса: принят, готовится, готов.",
  },
  {
    href: "/admin/menu",
    label: "Меню",
    roles: ["manager", "admin"],
    description: "Позиции, цены и стоп-лист.",
  },
  {
    href: "/admin/stats",
    label: "Статистика",
    roles: ["manager", "admin"],
    description: "Продажи по дням и популярные позиции.",
  },
  {
    href: "/admin/staff",
    label: "Сотрудники",
    roles: ["admin"],
    description: "Сотрудники и их роли.",
  },
] as const satisfies readonly {
  href: string;
  label: string;
  roles: readonly Role[];
  description: string;
}[];

export type AdminSection = (typeof adminSections)[number];

export function sectionsForRole(role: Role): AdminSection[] {
  return adminSections.filter((section) =>
    (section.roles as readonly Role[]).includes(role),
  );
}

export function sectionRoles(href: AdminSection["href"]): Role[] {
  const section = adminSections.find((item) => item.href === href);
  return section ? [...section.roles] : [];
}
