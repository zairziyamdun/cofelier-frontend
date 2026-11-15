"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// Модальное окно на нативном <dialog>: фокус внутри, Escape и фон — из браузера.
// Содержимое монтируется только пока окно открыто — форма каждый раз чистая.
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Клик по фону (сам <dialog>, а не его содержимое) закрывает окно.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-0 text-card-foreground backdrop:bg-charcoal/60"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <h2 id={titleId} className="font-heading text-2xl">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
