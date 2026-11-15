import { roleLabels } from "@/entities/user";
import { http, unwrap } from "@/shared/api";
import { sessionHeaders } from "@/shared/session";

import { AdminPageGate } from "./AdminPageGate";

export function AdminStaffPage() {
  return (
    <AdminPageGate href="/admin/staff">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">Сотрудники</h1>
          <p className="mt-2 text-muted-foreground">
            Добавление сотрудников и смена ролей появятся на следующем этапе.
          </p>
        </div>
        <StaffList />
      </div>
    </AdminPageGate>
  );
}

// Запрос с cookie пользователя: API сам проверяет, что это админ.
async function StaffList() {
  const staff = unwrap(
    await http.GET("/api/users/staff", { headers: await sessionHeaders() }),
  );

  if (staff.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
        Сотрудников пока нет.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {staff.map((person) => (
        <li
          key={person.id}
          className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{person.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {person.email}
            </p>
          </div>
          <span className="self-start rounded-full bg-muted px-4 py-1 text-sm sm:self-auto">
            {roleLabels[person.role]}
          </span>
        </li>
      ))}
    </ul>
  );
}
