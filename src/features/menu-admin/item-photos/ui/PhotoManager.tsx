"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";

import { type ManagedMenuItem, MenuPhotoImage } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { FormError } from "@/shared/ui/input";

import {
  useDeletePhoto,
  useReorderPhotos,
  useUploadPhotos,
} from "../api/use-photo-mutations";
import { movePhoto } from "../lib/compress-image";

export const MAX_PHOTOS = 6;

// Фото позиции в форме: добавить (камера или галерея), порядок, удалить.
// Все кнопки — type="button": блок живёт внутри формы позиции.
export function PhotoManager({ item }: { item: ManagedMenuItem }) {
  const [progress, setProgress] = useState<{ done: number; total: number }>();
  const upload = useUploadPhotos(item.id, (done, total) =>
    setProgress({ done, total }),
  );
  const remove = useDeletePhoto(item.id);
  const reorder = useReorderPhotos(item.id);
  const busy = upload.isPending || remove.isPending || reorder.isPending;
  const photos = item.photos;
  const freeSlots = MAX_PHOTOS - photos.length;
  const ids = photos.map((photo) => photo.id);
  const error = upload.error ?? remove.error ?? reorder.error;

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    // Лишние сверх лимита не отправляем: сервер всё равно откажет целиком.
    const files = [...list].slice(0, freeSlots);
    upload.reset();
    upload.mutate(files);
  };

  return (
    <fieldset className="flex flex-col gap-2" disabled={busy}>
      <legend className="mb-2 text-sm font-medium">
        Фото · {photos.length} из {MAX_PHOTOS}
      </legend>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className="flex flex-col overflow-hidden rounded-lg border border-border"
          >
            <div className="relative aspect-[4/5]">
              <MenuPhotoImage
                photo={photo}
                alt={`Фото ${index + 1}`}
                sizes="(min-width: 640px) 10rem, 45vw"
              />
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-copper px-2 text-xs leading-5 text-charcoal">
                  Обложка
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={`Фото ${index + 1}: левее`}
                disabled={index === 0}
                onClick={() => reorder.mutate(movePhoto(ids, index, -1))}
              >
                <ArrowLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 text-destructive"
                aria-label={`Удалить фото ${index + 1}`}
                onClick={() => {
                  if (window.confirm("Удалить это фото?")) {
                    remove.mutate(photo.id);
                  }
                }}
              >
                <Trash2 aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={`Фото ${index + 1}: правее`}
                disabled={index === photos.length - 1}
                onClick={() => reorder.mutate(movePhoto(ids, index, 1))}
              >
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}

        {freeSlots > 0 && (
          <li>
            <label className="flex aspect-[4/5] h-full min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-2 text-center text-sm text-muted-foreground hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
              <ImagePlus aria-hidden="true" className="size-6" />
              {upload.isPending && progress
                ? `Загружаем ${Math.min(progress.done + 1, progress.total)} из ${progress.total}…`
                : "Добавить фото"}
              <input
                type="file"
                // image/* — телефон предложит камеру или галерею, а iPhone
                // сам переведёт HEIC в JPEG.
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  handleFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>

      <p className="text-sm text-muted-foreground">
        {photos.length === 0
          ? "Без фото позиция не попадёт на главную. Лучше вертикальные, 4:5."
          : "Первое фото — обложка в меню. Лучше вертикальные, 4:5."}
      </p>
      <FormError error={error} />
    </fieldset>
  );
}
