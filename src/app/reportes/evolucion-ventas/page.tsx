"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

type VentasData = {
  mes: string;
  cantidad_facturas: string;
  total_ventas: string;
};

type ChartData = {
  mes: string;
  cantidad_facturas: number;
  total_ventas: number;
};

function ReporteEvolucionVentas() {
  const router = useRouter();
  const [data, setData] = useState<ChartData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/evolucion-ventas")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos para ver este reporte");
        }
        return res.json();
      })
      .then((res: VentasData[]) => {
        if (Array.isArray(res)) {
          const datosConvertidos = res.map(item => ({
            mes: item.mes,
            cantidad_facturas: Number(item.cantidad_facturas),
            total_ventas: Number(item.total_ventas)
          }));
          setData(datosConvertidos);
        } else {
          setError("Error al cargar datos");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Evolución de Ventas Mensuales</CardTitle>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : (
              <div className="space-y-8">
                {/* Gráfico de Total de Ventas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Total de Ventas por Mes</h3>
                  <div className="flex justify-center items-center w-full" style={{ height: "400px" }}>
                    <LineChart width={800} height={350} data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total_ventas" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Total Ventas ($)"
                      />
                    </LineChart>
                  </div>
                </div>

                {/* Gráfico de Cantidad de Facturas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cantidad de Facturas por Mes</h3>
                  <div className="flex justify-center items-center w-full" style={{ height: "400px" }}>
                    <LineChart width={800} height={350} data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cantidad_facturas" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Cantidad de Facturas"
                      />
                    </LineChart>
                  </div>
                </div>

                {/* Tabla de Resumen */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resumen Detallado</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="border-b bg-slate-100">
                          <th className="p-2 text-left">Mes</th>
                          <th className="p-2 text-left">Cantidad de Facturas</th>
                          <th className="p-2 text-left">Total Ventas</th>
                          <th className="p-2 text-left">Promedio por Factura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{item.mes}</td>
                            <td className="p-2">{item.cantidad_facturas}</td>
                            <td className="p-2">${item.total_ventas.toFixed(2)}</td>
                            <td className="p-2">
                              ${(item.total_ventas / item.cantidad_facturas).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
  );
}

export default function ReporteEvolucionVentasProtected() {
  return (
    <ProtectedPage ruta="/reportes/evolucion-ventas">
      <ReporteEvolucionVentas />
    </ProtectedPage>
  );
}
