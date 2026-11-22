import type { ReactNode } from "react";

import { CartBar } from "@/features/cart";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

// Каркас публичного сайта — группа роутинга (site).
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <CartBar />
      <Footer />
    </>
  );
}
