"use client";

import { useState, type FormEvent } from "react";

import { roleLabels, staffRoles, type StaffRole } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input, Select } from "@/shared/ui/input";

import { useCreateStaff } from "../api/use-create-staff";
import { temporaryPassword } from "../lib/temporary-password";

export function CreateStaffDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createStaff = useCreateStaff();
  // После создания показываем данные для входа: пароль больше нигде не увидеть.
  const [created, setCreated] = useState<{
    email: string;
    password: string;
  } | null>(null);

  function handleClose() {
    createStaff.reset();
    setCreated(null);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      role: String(form.get("role")) as StaffRole,
    };
    createStaff.mutate(body, {
      onSuccess: (staff) =>
        setCreated({ email: staff.email, password: body.password }),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={created ? "Сотрудник добавлен" : "Новый сотрудник"}
    >
      {created ? (
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            Передайте эти данные сотруднику — пароль больше нигде не будет
            показан.
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg bg-muted p-4">
            <dt className="text-muted-foreground">Почта</dt>
            <dd className="break-all">{created.email}</dd>
            <dt className="text-muted-foreground">Пароль</dt>
            <dd className="font-mono break-all">{created.password}</dd>
          </dl>
          <Button
            type="button"
            className="min-h-11 px-6 sm:self-end"
            onClick={handleClose}
          >
            Готово
          </Button>
        </div>
      ) : (
        <StaffForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isPending={createStaff.isPending}
          error={createStaff.error}
        />
      )}
    </Dialog>
  );
}

function StaffForm({
  onSubmit,
  onCancel,
  isPending,
  error,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isPending: boolean;
  error: Error | null;
}) {
  const [password, setPassword] = useState(() => temporaryPassword());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Имя" htmlFor="staff-name">
        <Input
          id="staff-name"
          name="name"
          required
          minLength={2}
          maxLength={60}
        />
      </Field>
      <Field label="Почта для входа" htmlFor="staff-email">
        <Input
          id="staff-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          required
        />
      </Field>
      <Field label="Роль" htmlFor="staff-role">
        <Select id="staff-role" name="role" defaultValue="barista">
          {staffRoles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Временный пароль"
        htmlFor="staff-password"
        hint="Не короче 8 символов. Сгенерирован случайно — можно заменить."
      >
        <div className="flex gap-2">
          <Input
            id="staff-password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 shrink-0 px-4"
            onClick={() => setPassword(temporaryPassword())}
          >
            Другой
          </Button>
        </div>
      </Field>
      <FormError error={error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-6"
          onClick={onCancel}
        >
          Отмена
        </Button>
        <Button type="submit" className="min-h-11 px-6" disabled={isPending}>
          {isPending ? "Добавляем…" : "Добавить"}
        </Button>
      </div>
    </form>
  );
}
