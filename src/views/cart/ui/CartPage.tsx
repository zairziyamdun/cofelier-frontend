import { CartPanel } from "@/widgets/cart-panel";

export function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl md:text-5xl">Корзина</h1>
      <CartPanel />
    </main>
  );
}
