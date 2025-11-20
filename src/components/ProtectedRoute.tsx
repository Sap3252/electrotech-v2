"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionClient } from "@/lib/sessionClient";

export function ProtectedRoute({ children }: any) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verify() {
      const session = await getSessionClient();

      if (!session) {
        router.replace("/login");
        return;
      }

      setReady(true);
    }

    verify();
  }, []);

  if (!ready) return null;
  return children;
}

