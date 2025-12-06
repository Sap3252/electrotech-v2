"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

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

function ReportePinturaPorMes() {
  const router = useRouter();
  const [data, setData] = useState<ChartData[]>([]);
  const [pinturas, setPinturas] = useState<string[]>([]);
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
          
          // Obtener todas las pinturas únicas
          const todasPinturas = [...new Set(res.map(item => item.pintura))];
          setPinturas(todasPinturas);
          
          // Obtener todos los meses únicos
          const todosMeses = [...new Set(res.map(item => item.mes))].sort();
          
          // Agrupar por mes
          const mesesMap: Record<string, ChartData> = {};
          
          // Inicializar todos los meses con todas las pinturas en 0
          todosMeses.forEach(mes => {
            mesesMap[mes] = { mes };
            todasPinturas.forEach(pintura => {
              mesesMap[mes][pintura] = 0;
            });
          });
          
          // Llenar con los datos reales
          res.forEach(item => {
            mesesMap[item.mes][item.pintura] = Number(item.total_kg);
          });
          
          // Ordenar por mes (formato YYYY-MM)
          const datosConvertidos = Object.values(mesesMap).sort((a, b) => 
            a.mes.localeCompare(b.mes)
          );
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
                  {pinturas.map((pintura, idx) => (
                    <Line 
                      key={pintura} 
                      type="monotone" 
                      dataKey={pintura} 
                      stroke={`hsl(${idx * 30}, 70%, 50%)`}
                      name={pintura}
                      connectNulls={false}
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
            onClick={() => router.push("/reportes/ventas")}
          >
            Volver a Reportes
          </Button>
        </div>
      </div>
  );
}

export default function ReportePinturaPorMesProtected() {
  return (
    <ProtectedPage ruta="/reportes/ventas/pintura-por-mes">
      <ReportePinturaPorMes />
    </ProtectedPage>
  );
}
