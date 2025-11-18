"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Panel Principal — ElectroTech</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card className="shadow cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push("/core1")}>
          <CardHeader>
            <CardTitle>Core 1 — Piezas & Pinturas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ABM de Piezas, ABM de Pinturas y cálculo de consumo (Strategy).</p>
          </CardContent>
        </Card>

        <Card className="shadow cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push("/core2")}>
          <CardHeader>
            <CardTitle>Core 2 — Facturación y Remitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Carga de remitos, facturas, impresión y reportes avanzados.</p>
          </CardContent>
        </Card>

        <Card className="shadow cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push("/core3")}>
          <CardHeader>
            <CardTitle>Core 3 — Maquinaria</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Control de uso, alertas automáticas (Observer) e informes mensuales.</p>
          </CardContent>
        </Card>

        <Card className="shadow cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push("/core4")}>
          <CardHeader>
            <CardTitle>Core 4 — Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gestión de asistencia, salarios, descuentos y presentismo.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
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
