import { STAFF_ROLES } from "@/shared/config";

import type { Role, StaffRole } from "../model/types";

// Роли, которые админ может выдать сотруднику (в порядке «младше → старше»).
export const staffRoles: StaffRole[] = ["barista", "manager", "admin"];

export const roleLabels: Record<Role, string> = {
  client: "Клиент",
  barista: "Бариста",
  manager: "Менеджер",
  admin: "Админ",
};

export function isStaff(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

// Куда вести после входа и по кнопке профиля.
export function homePathFor(role: Role): string {
  return isStaff(role) ? "/admin" : "/account";
}
