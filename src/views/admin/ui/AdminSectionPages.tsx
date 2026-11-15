import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

import { AdminPageGate } from "./AdminPageGate";

export function AdminOrdersPage() {
  return (
    <AdminPageGate href="/admin/orders">
      <SectionPlaceholder
        title="Заказы"
        description="Здесь будет живая очередь предзаказов: новые заказы появляются сами, бариста меняет статус — принят, готовится, готов. Раздел появится вместе с оформлением заказа."
      />
    </AdminPageGate>
  );
}

export function AdminStatsPage() {
  return (
    <AdminPageGate href="/admin/stats">
      <SectionPlaceholder
        title="Статистика"
        description="Здесь будут продажи по дням и популярные позиции, когда появятся заказы."
      />
    </AdminPageGate>
  );
}
