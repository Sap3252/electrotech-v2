"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [gruposInactivas, setGruposInactivas] = useState<
    { id_grupo: number; nombre: string; id_estado: number; estado: string }[]
  >([]);

  const verificarAcceso = useCallback(async () => {
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

      // Guardar grupos inactivas relacionadas con la ruta si vienen
      if (data.grupos_inactivas_ruta && Array.isArray(data.grupos_inactivas_ruta)) {
        setGruposInactivas(data.grupos_inactivas_ruta);
      }

      if (!data.tieneAcceso) {
        // Sin permisos -> redirigir al dashboard
        // Mostrar mensaje de grupo inactivo si aplica
        if (data.grupos_inactivas_ruta && data.grupos_inactivas_ruta.length > 0) {
          const nombres = data.grupos_inactivas_ruta.map((g: any) => `${g.nombre} (${g.estado || 'inactivo'})`).join(', ');
          alert(`Su(s) grupo(s) ${nombres} están inactivos o suspendidos para este formulario. Consulte con el administrador.`);
        } else {
          alert("No tienes permisos para acceder a esta página");
        }
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
  }, [ruta, router]);

  useEffect(() => {
    verificarAcceso();
  }, [verificarAcceso]);

  if (verificando) {
    return loadingComponent || (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p className="text-lg">Verificando permisos...</p>
      </div>
    );
  }

  if (!tieneAcceso) {
    return null;
  }

  return (
    <>
      {gruposInactivas.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded mb-4">
          <strong>Atención:</strong> Su(s) grupo(s) {gruposInactivas.map(g => g.nombre).join(', ')} están inactivos o suspendidos. Por favor consulte con el administrador.
        </div>
      )}
      {children}
    </>
  );
}
