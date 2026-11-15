import Link from "next/link";

import { MenuEditor } from "@/widgets/menu-editor";

import { AdminPageGate } from "./AdminPageGate";

export function AdminMenuPage() {
  return (
    <AdminPageGate href="/admin/menu">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">Меню</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Изменения сразу видны на{" "}
            <Link href="/menu" className="text-copper hover:underline">
              странице меню
            </Link>
            . Временно закончилось — выключите позицию: она останется на сайте с
            пометкой «Нет в наличии».
          </p>
        </div>
        <MenuEditor />
      </div>
    </AdminPageGate>
  );
}
