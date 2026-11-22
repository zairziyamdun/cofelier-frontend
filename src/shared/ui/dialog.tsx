"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // sheet — шторка снизу на телефоне, окно по центру с sm; заголовок рисует
  // содержимое само (title — только для читалок).
  variant?: "dialog" | "sheet";
};

// Модальное окно на нативном <dialog>: фокус внутри, Escape и фон — из браузера.
// Содержимое монтируется только пока окно открыто — форма каждый раз чистая.
export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "dialog",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const sheet = variant === "sheet";

  // Синхронизация с DOM-методами showModal/close — единственный способ открыть модальный <dialog>.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={sheet ? undefined : titleId}
      aria-label={sheet ? title : undefined}
      onClose={onClose}
      onClick={(event) => {
        // Клик по фону (сам <dialog>, а не его содержимое) закрывает окно.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "border border-border bg-card p-0 text-card-foreground backdrop:bg-charcoal/60",
        sheet
          ? "mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl sm:m-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-2xl"
          : "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl",
      )}
    >
      {open &&
        (sheet ? (
          children
        ) : (
          <div className="flex flex-col gap-4 p-6">
            <h2 id={titleId} className="font-heading text-2xl">
              {title}
            </h2>
            {children}
          </div>
        ))}
    </dialog>
  );
}
