import { Button } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-5xl">Cofelier</h1>
      <p className="text-lg text-copper">Мастерская вашего кофе</p>
      <Button size="lg">Смотреть меню</Button>
    </main>
  );
}
