"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type VentasData = {
  id_cliente: number;
  nombre: string;
  total_comprado: string;
};

export default function ReporteVentasPorCliente() {
  const router = useRouter();
  const [data, setData] = useState<VentasData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/ventas-por-cliente")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos para ver este reporte");
        }
        return res.json();
      })
      .then((res) => {
        if (Array.isArray(res)) {
          const datosConvertidos = res.map(item => ({
            ...item,
            total_comprado: Number(item.total_comprado)
          }));
          setData(datosConvertidos);
        } else {
          setError("Error al cargar datos");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <ProtectedRoute allowedGroups={["Admin", "Gerente"]}>
      <div className="min-h-screen bg-slate-100 p-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Mayores Ventas por Cliente</CardTitle>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : (
              <div className="flex justify-center items-center w-full" style={{ height: "500px" }}>
                <BarChart width={700} height={400} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar dataKey="total_comprado" fill="#8884d8" name="Total Comprado" />
                </BarChart>
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
