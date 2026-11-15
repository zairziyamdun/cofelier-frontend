import { SectionPlaceholder } from "@/shared/ui/section-placeholder";
import { OrderQueue } from "@/widgets/order-queue";

import { AdminPageGate } from "./AdminPageGate";

export function AdminOrdersPage() {
  return (
    <AdminPageGate href="/admin/orders">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">Заказы</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Новые предзаказы появляются сами. Клиент видит статус в личном
            кабинете сразу после нажатия кнопки.
          </p>
        </div>
        <OrderQueue />
      </div>
    </AdminPageGate>
  );
}

export function AdminStatsPage() {
  return (
    <AdminPageGate href="/admin/stats">
      <SectionPlaceholder
        title="Статистика"
        description="Здесь будут продажи по дням и популярные позиции — на этапе доводки."
      />
    </AdminPageGate>
  );
}
