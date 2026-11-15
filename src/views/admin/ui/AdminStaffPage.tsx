import { StaffManager } from "@/widgets/staff-manager";

import { AdminPageGate } from "./AdminPageGate";

export function AdminStaffPage() {
  return (
    <AdminPageGate href="/admin/staff">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">Сотрудники</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Новый сотрудник входит по почте и временному паролю. Смена роли и
            отключение действуют сразу — без повторного входа.
          </p>
        </div>
        <StaffManager />
      </div>
    </AdminPageGate>
  );
}
