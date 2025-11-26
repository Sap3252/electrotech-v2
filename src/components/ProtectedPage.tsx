"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProtectedPageProps = {
  ruta: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
};

export default function ProtectedPage({ 
  ruta, 
  children, 
  loadingComponent 
}: ProtectedPageProps) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  useEffect(() => {
    verificarAcceso();
  }, [ruta]);

  const verificarAcceso = async () => {
    try {
      const res = await fetch("/api/rbac/verificar-acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruta }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error verificando acceso");
      }

      const data = await res.json();

      if (!data.tieneAcceso) {
        // Sin permisos - redirigir al dashboard
        alert("No tienes permisos para acceder a esta página");
        router.push("/dashboard");
        return;
      }

      setTieneAcceso(true);
    } catch (error) {
      console.error("Error:", error);
      router.push("/dashboard");
    } finally {
      setVerificando(false);
    }
  };

  if (verificando) {
    return loadingComponent || (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p className="text-lg">Verificando permisos...</p>
      </div>
    );
  }

  if (!tieneAcceso) {
    return null; // Ya redirigió
  }

  return <>{children}</>;
}
