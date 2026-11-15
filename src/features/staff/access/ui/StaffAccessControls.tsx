"use client";

import {
  roleLabels,
  staffRoles,
  type Staff,
  type StaffRole,
} from "@/entities/user";
import { Select } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import { useUpdateStaff } from "../api/use-update-staff";

// Роль и доступ сотрудника. Свою строку админ изменить не может (так решает и API).
export function StaffAccessControls({
  staff,
  isSelf,
}: {
  staff: Staff;
  isSelf: boolean;
}) {
  const updateStaff = useUpdateStaff();
  const locked = isSelf || updateStaff.isPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Select
          aria-label={`Роль: ${staff.name}`}
          value={staff.role}
          disabled={locked}
          className="w-40"
          onChange={(event) =>
            updateStaff.mutate({
              id: staff.id,
              body: { role: event.target.value as StaffRole },
            })
          }
        >
          {staffRoles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-1">
          <Switch
            checked={staff.isActive}
            disabled={locked}
            label={`${staff.name}: может входить`}
            onCheckedChange={(isActive) =>
              updateStaff.mutate({ id: staff.id, body: { isActive } })
            }
          />
          <span className="text-sm">
            {staff.isActive ? "Может входить" : "Отключён"}
          </span>
        </div>
      </div>
      {isSelf && (
        <p className="text-sm text-muted-foreground">
          Это вы — свою роль и доступ меняет другой админ.
        </p>
      )}
      {updateStaff.error && (
        <p role="alert" className="text-sm text-destructive">
          {updateStaff.error.message}
        </p>
      )}
    </div>
  );
}
