"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type ClienteData = {
  cliente: string;
  piezas_totales: number;
  porcentaje: number;
};

export default function ReporteClienteTrabajo() {
  const router = useRouter();
  const [data, setData] = useState<ClienteData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/clientes/piezas")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos para ver este reporte");
        }
        return res.json();
      })
      .then((res) => {
        if (Array.isArray(res)) {
          console.log("Datos recibidos:", res);
          // Convertir strings a números
          const datosConvertidos = res.map(item => ({
            cliente: item.cliente,
            piezas_totales: Number(item.piezas_totales),
            porcentaje: Number(item.porcentaje)
          }));
          setData(datosConvertidos);
        } else {
          setError("Error al cargar datos");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

  return (
    <ProtectedRoute allowedGroups={["Admin", "Gerente"]}>
      <div className="min-h-screen bg-slate-100 p-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Participación de Trabajo por Cliente</CardTitle>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : (
              <div className="flex justify-center items-center w-full" style={{ height: "500px" }}>
                <PieChart width={600} height={500}>
                  <Pie
                    data={data}
                    dataKey="piezas_totales"
                    nameKey="cliente"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/reportes")}
          >
            Volver a Reportes
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
