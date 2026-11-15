"use client";

import { useQueryRetry } from "@/shared/api";
import { ErrorState } from "@/shared/ui/error-state";

export default function MenuErrorBoundary({ retry }: { retry: () => void }) {
  const onRetry = useQueryRetry(retry);
  return <ErrorState title="Не получилось загрузить меню" onRetry={onRetry} />;
}
