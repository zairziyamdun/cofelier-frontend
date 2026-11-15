"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useCurrentUser, useStaff } from "@/entities/user";
import { StaffAccessControls } from "@/features/staff/access";
import { CreateStaffDialog } from "@/features/staff/create";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export function StaffManager() {
  const staff = useStaff();
  const { data: currentUser } = useCurrentUser();
  const [creating, setCreating] = useState(false);

  if (staff.isPending) {
    return (
      <div
        role="status"
        aria-label="Загружаем сотрудников"
        className="h-48 animate-pulse rounded-xl bg-muted"
      />
    );
  }

  if (staff.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border p-6">
        <p>Не получилось загрузить сотрудников: {staff.error.message}</p>
        <Button
          type="button"
          className="min-h-11 px-6"
          onClick={() => void staff.refetch()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        className="min-h-11 self-start px-4"
        onClick={() => setCreating(true)}
      >
        <Plus aria-hidden="true" />
        Добавить сотрудника
      </Button>

      {staff.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
          Сотрудников пока нет.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {staff.data.map((person) => (
            <li
              key={person.id}
              className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className={cn("min-w-0", !person.isActive && "opacity-60")}>
                <p className="truncate font-medium">{person.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {person.email}
                </p>
              </div>
              <StaffAccessControls
                staff={person}
                isSelf={person.id === currentUser?.id}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateStaffDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
