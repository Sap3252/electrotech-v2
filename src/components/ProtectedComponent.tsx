"use client";

import { useEffect, useState } from "react";

type ProtectedComponentProps = {
  componenteId: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function ProtectedComponent({ 
  componenteId, 
  children, 
  fallback = null 
}: ProtectedComponentProps) {
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    verificarAcceso();
  }, [componenteId]);

  const verificarAcceso = async () => {
    try {
      const res = await fetch("/api/rbac/verificar-componente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_componente: componenteId }),
      });

      if (res.ok) {
        const data = await res.json();
        setTieneAcceso(data.tieneAcceso);
      }
    } catch (error) {
      console.error("Error verificando acceso a componente:", error);
    } finally {
      setVerificando(false);
    }
  };

  if (verificando) return null;
  if (!tieneAcceso) return <>{fallback}</>;
  
  return <>{children}</>;
}
