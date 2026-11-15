"use client";

import { MenuItemCard, usePublicMenu } from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";

export function MenuList() {
  const { data: categories } = usePublicMenu();

  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Меню скоро появится — заходите чуть позже.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Разделы меню" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.slug}`}
                className="flex min-h-11 items-center rounded-full border border-border px-4 whitespace-nowrap hover:bg-muted"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {categories.map((category) => (
        <section
          key={category.id}
          id={category.slug}
          aria-labelledby={`${category.slug}-title`}
          className="scroll-mt-36 sm:scroll-mt-24"
        >
          <h2
            id={`${category.slug}-title`}
            className="mb-4 font-heading text-2xl md:text-3xl"
          >
            {category.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                action={
                  <AddToCartButton
                    menuItemId={item.id}
                    name={item.name}
                    price={item.price}
                  />
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
