import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 min-[360px]:p-6 md:p-8">
        <h1 className="font-heading text-2xl break-words min-[360px]:text-3xl">
          {title}
        </h1>
        <p className="mt-2 mb-6 text-muted-foreground">{description}</p>
        {children}
      </div>
    </main>
  );
}
