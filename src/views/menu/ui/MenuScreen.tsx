"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";

import { type MenuItem, usePublicMenu } from "@/entities/menu-item";
import { MenuList } from "@/widgets/menu-list";
import { ProductSheet } from "@/widgets/product-sheet";

// Меню и шторка товара. Открытый товар — в адресе (?item=slug): ссылкой можно
// поделиться, а «назад» на телефоне закрывает шторку, а не уводит со страницы.
export function MenuScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const slug = useSearchParams().get("item");
  const { data: categories } = usePublicMenu();
  // Шторку открыли здесь — закрываем шагом назад; пришли по ссылке — убираем параметр.
  const openedHere = useRef(false);

  const openItem = useMemo(() => {
    if (!slug) return null;
    for (const category of categories) {
      const found = category.items.find((item) => item.slug === slug);
      if (found) return found;
    }
    return null;
  }, [categories, slug]);

  const open = (item: MenuItem) => {
    openedHere.current = true;
    router.push(`${pathname}?item=${encodeURIComponent(item.slug)}`, {
      scroll: false,
    });
  };

  const close = () => {
    // Товара в адресе уже нет (нажали «назад») — окно закрылось само, второй
    // шаг назад увёл бы со страницы меню.
    if (!slug) {
      openedHere.current = false;
      return;
    }
    if (openedHere.current) {
      openedHere.current = false;
      router.back();
    } else {
      router.replace(pathname, { scroll: false });
    }
  };

  return (
    <>
      <MenuList onOpenItem={open} />
      <ProductSheet item={openItem} onClose={close} />
    </>
  );
}
