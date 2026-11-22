import { useMutation } from "@tanstack/react-query";

import { useInvalidateMenu } from "@/entities/menu-item";
import { http, unwrap } from "@/shared/api";

import { compressImage } from "../lib/compress-image";

// Файлы уходят по одному: так запрос не упирается в лимит тела прокси сайта,
// а менеджер видит, сколько уже загружено.
export function useUploadPhotos(
  itemId: number,
  onProgress: (done: number, total: number) => void,
) {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (files: File[]) => {
      for (const [index, file] of files.entries()) {
        onProgress(index, files.length);
        const blob = await compressImage(file);
        unwrap(
          await http.POST("/api/menu/items/{id}/photos", {
            params: { path: { id: itemId } },
            body: { photos: [] },
            bodySerializer: () => {
              const form = new FormData();
              form.append("photos", blob, file.name);
              return form;
            },
          }),
        );
      }
      onProgress(files.length, files.length);
    },
    // И при частичном сбое: уже загруженные фото должны появиться.
    onSettled: invalidateMenu,
  });
}

export function useDeletePhoto(itemId: number) {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (photoId: number) =>
      unwrap(
        await http.DELETE("/api/menu/items/{id}/photos/{photoId}", {
          params: { path: { id: itemId, photoId } },
        }),
      ),
    onSuccess: invalidateMenu,
  });
}

export function useReorderPhotos(itemId: number) {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (ids: number[]) =>
      unwrap(
        await http.PUT("/api/menu/items/{id}/photos/order", {
          params: { path: { id: itemId } },
          body: { ids },
        }),
      ),
    onSuccess: invalidateMenu,
  });
}
