"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: any) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include"
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setReady(true);
      } catch (error) {
        console.error("Error verificando sesión:", error);
        router.replace("/login");
      }
    }

    verify();
  }, [router]);

  if (!ready) return null;
  return children;
}

