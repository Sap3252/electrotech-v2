"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

function ReportesPageContent() {
  const router = useRouter();

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <h1 className="text-3xl font-bold mb-6">Reportes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* REPORTE CLIENTES */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Participación por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Gráfico de participación de trabajo por cliente.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/clientes")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>

          {/* REPORTE PINTURA MÁS UTILIZADA */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Pintura Más Utilizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Pintura con mayor consumo total en kg.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/pintura-mas-utilizada")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>

          {/* REPORTE VENTAS POR CLIENTE */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Mayores Ventas por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Ranking de clientes con mayores ventas totales.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/ventas-por-cliente")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>

          {/* REPORTE VENTAS CLIENTE ESPECÍFICO */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Ventas de Cliente Específico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Listado de facturas de un cliente en particular.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/ventas-cliente-especifico")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>

          {/* REPORTE PINTURA POR MES */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Utilización de Pintura por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Consumo de pintura agrupado por mes.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/pintura-por-mes")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>

          {/* REPORTE EVOLUCIÓN DE VENTAS */}
          <Card className="shadow transition p-4">
            <CardHeader>
              <CardTitle>Evolución de Ventas Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Evolución de ventas y cant. de facturas por mes.
              </p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push("/reportes/evolucion-ventas")}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>
          
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
  );
}

export default function ReportesPage() {
  return (
    <ProtectedPage ruta="/reportes">
      <ReportesPageContent />
    </ProtectedPage>
  );
}
