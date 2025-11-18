"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
