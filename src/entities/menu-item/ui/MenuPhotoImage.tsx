import { cn } from "@/shared/lib/utils";
import { LogoMark } from "@/shared/ui/logo";

import type { MenuPhoto } from "../model/types";

// Фото заполняет рамку родителя (ему нужны relative и пропорция).
// Прозрачный фон (рендер) — целиком на фоне бренда; обычное фото — обрезается
// по рамке. Нет фото — знак бренда вместо пустого места.
// sizes — ширина рамки на экране: по ней браузер берёт файл 320, 800 или 1600.
export function MenuPhotoImage({
  photo,
  alt,
  sizes,
  priority = false,
  className,
}: {
  photo: MenuPhoto | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!photo) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted text-foreground/25",
          className,
        )}
      >
        <LogoMark steam={false} className="size-1/3 max-w-16" />
      </div>
    );
  }

  const { small, medium, large } = photo.urls;
  return (
    // policy-exception: FE-UI-3 файлы трёх размеров уже лежат в хранилище — next/image
    // без оптимизации не даёт srcset, а оптимизация Vercel лимитирована.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={medium}
      srcSet={`${small} 320w, ${medium} 800w, ${large} 1600w`}
      sizes={sizes}
      alt={alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      className={cn(
        "absolute inset-0 size-full",
        photo.hasAlpha ? "bg-muted object-contain p-[6%]" : "object-cover",
        className,
      )}
    />
  );
}
