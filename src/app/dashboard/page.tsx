

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserSession = {
  id_usuario: number;
  email: string;
  grupos: string[];
  idAuditoria: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión con el servidor
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include"
        });
        
        if (!res.ok) {
          router.push("/login");
          return;
        }
        
        const data = await res.json();
        setSession(data);
        setLoading(false);
      } catch (error) {
        console.error("Error verificando sesión:", error);
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  // Si todavía no se cargó sesión → no mostrar nada
  if (loading || !session) return null;


  //REVISAR
  /*
  // Funciones para verificar acceso por grupo
  const hasAccess = (gruposRequeridos: string[]) => {
    return gruposRequeridos.some(g => session.grupos.includes(g));
  };
  */

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/electrotech logo nombre.png"
          alt="ElectroTech Logo"
          width={300}
          height={100}
          priority
        />
        <h1 className="text-3xl font-bold mt-4">Panel Principal</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* ---------------------- CORE 1 ---------------------- */}
        <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Core 1 — Piezas & Pinturas</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4">ABM de piezas y pinturas, con cálculo de consumo (Strategy).</p>

              <div className="flex flex-col gap-3">
                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => router.push("/piezas")}
                >
                  Gestionar Piezas
                </Button>

                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => router.push("/pinturas")}
                >
                  Gestionar Pinturas
                </Button>

                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => router.push("/piezas-pintadas")}
                >
                  Registrar Piezas Pintadas
               </Button>
                
              </div>
            </CardContent>
          </Card>



        {/* ---------------------- CORE 2 ---------------------- */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Core 2 — Remitos & Facturación</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4">
                Registro de remitos, facturación y reportes avanzados.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => {
                    setTimeout(() => router.push("/remitos"), 100);
                  }}
                >
                  Gestionar Remitos
                </Button>

                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => router.push("/facturacion")}
                >
                  Gestionar Facturas
                </Button>

                <Button
                  className="bg-black text-white hover:bg-black/80"
                  onClick={() => router.push("/reportes")}
                >
                  Reportes (solo Admin & Gerente)
                </Button>
              </div>
            </CardContent>
          </Card>


        {/* ---------------------- CORE 3 ---------------------- */}
        <Card
            className="shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push("/core3")}
          >
            <CardHeader>
              <CardTitle>Core 3 — Maquinaria</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Control de uso, alertas automáticas (Observer) e informes mensuales.</p>
            </CardContent>
          </Card>

        {/* ---------------------- CORE 4 ---------------------- */}
        <Card
            className="shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push("/core4")}
          >
            <CardHeader>
              <CardTitle>Core 4 — Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gestión de asistencia, salarios, descuentos y presentismo.</p>
            </CardContent>
          </Card>
      </div>

      <div className="mt-10 flex gap-4 flex-wrap">
        {session.grupos.includes("Admin") && (
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => router.push("/dashboard/admin")}
          >
            Panel de Administración
          </Button>
        )}
        
        <Button
          variant="destructive"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              window.location.href = "/login";
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
