"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type PinturaMesData = {
  id_pintura: number;
  pintura: string;
  mes: string;
  total_kg: string;
};

type ChartData = {
  mes: string;
  [pintura: string]: number | string;
};

export default function ReportePinturaPorMes() {
  const router = useRouter();
  const [data, setData] = useState<ChartData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/pintura-por-mes")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos para ver este reporte");
        }
        return res.json();
      })
      .then((res: PinturaMesData[]) => {
        if (Array.isArray(res)) {
          // Agrupar por mes
          const mesesMap: Record<string, ChartData> = {};
          res.forEach(item => {
            if (!mesesMap[item.mes]) {
              mesesMap[item.mes] = { mes: item.mes };
            }
            mesesMap[item.mes][item.pintura] = Number(item.total_kg);
          });
          const datosConvertidos = Object.values(mesesMap);
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
            <CardTitle>Utilización de Pintura por Mes</CardTitle>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : (
              <div className="flex justify-center items-center w-full" style={{ height: "500px" }}>
                <LineChart width={800} height={400} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} kg`} />
                  <Legend />
                  {Object.keys(data[0] || {}).filter(k => k !== 'mes').map((pintura, idx) => (
                    <Line 
                      key={pintura} 
                      type="monotone" 
                      dataKey={pintura} 
                      stroke={`hsl(${idx * 60}, 70%, 50%)`}
                      name={pintura}
                    />
                  ))}
                </LineChart>
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
