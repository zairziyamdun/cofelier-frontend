"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useLogout } from "../api/use-logout";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("min-h-11 px-4", className)}
      disabled={logout.isPending}
      onClick={() =>
        logout.mutate(undefined, {
          onSuccess: () => {
            router.replace("/");
            router.refresh();
          },
        })
      }
    >
      <LogOut aria-hidden="true" />
      Выйти
    </Button>
  );
}
