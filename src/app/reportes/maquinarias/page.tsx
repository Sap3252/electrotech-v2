"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

function ReportesMaquinariasContent() {
  const router = useRouter();

  const reportes = [
    {
      titulo: "Uso de Cabinas",
      descripcion: "Estadísticas de producción por cabina: piezas pintadas, horas de trabajo y consumo de recursos.",
      ruta: "/reportes/maquinarias/uso-cabinas",
    },
    {
      titulo: "Mantenimiento de Pistolas",
      descripcion: "Estado de mantenimiento de pistolas de pintura, horas de uso y alertas preventivas.",
      ruta: "/reportes/maquinarias/mantenimiento-pistolas",
    },
    {
      titulo: "Mantenimiento de Hornos",
      descripcion: "Estado de mantenimiento de hornos de secado, temperaturas y consumo de gas.",
      ruta: "/reportes/maquinarias/mantenimiento-hornos",
    },
    {
      titulo: "Consumo de Gas",
      descripcion: "Análisis del consumo de gas por horno, comparativas y tendencias de gasto.",
      ruta: "/reportes/maquinarias/consumo-gas",
    },
    {
      titulo: "Productividad Diaria",
      descripcion: "Evolución de la productividad día a día: piezas, horas y porcentaje de capacidad.",
      ruta: "/reportes/maquinarias/productividad-diaria",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reportes de Maquinarias</h1>
        <p className="text-gray-600 mt-2">
          Análisis y estadísticas de cabinas, pistolas y hornos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((reporte) => (
          <Card key={reporte.ruta} className="shadow hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">{reporte.descripcion}</p>
              <Button
                className="bg-black text-white hover:bg-black/80 w-full"
                onClick={() => router.push(reporte.ruta)}
              >
                Ver Reporte
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.push("/reportes")}>
          Volver a Reportes
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function ReportesMaquinariasPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias">
      <ReportesMaquinariasContent />
    </ProtectedPage>
  );
}
