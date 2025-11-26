"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

type PinturaData = {
  id_pintura: number;
  marca: string;
  color: string;
  tipo: string;
  total_consumido: number;
};

function ReportePinturaMasUtilizada() {
  const router = useRouter();
  const [data, setData] = useState<PinturaData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/pintura-mas-utilizada")
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
            total_consumido: Number(item.total_consumido)
          }));
          setData(datosConvertidos);
        } else {
          setError("Error al cargar datos");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const masUtilizada = data[0];
  const otrasUtilizadas = data.slice(1);

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Pintura Más Utilizada</CardTitle>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : (
              <div className="space-y-6">
                {/* Pintura Más Utilizada - Destacada */}
                <div className="bg-linear-to-r from-blue-50 to-blue-100 p-8 rounded-lg border-2 border-blue-300">
                  <h3 className="text-2xl font-bold mb-4 text-blue-900">🏆 Pintura con Mayor Consumo</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-700">Marca:</p>
                      <p className="text-xl font-bold text-blue-900">{masUtilizada.marca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Color:</p>
                      <p className="text-xl font-bold text-blue-900">{masUtilizada.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Tipo:</p>
                      <p className="text-xl font-bold text-blue-900">{masUtilizada.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Total Consumido:</p>
                      <p className="text-xl font-bold text-blue-900">{masUtilizada.total_consumido.toFixed(2)} kg</p>
                    </div>
                  </div>
                </div>

                {/* Otras Pinturas - Lista más pequeña */}
                {otrasUtilizadas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Otras Pinturas Utilizadas</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-sm">
                        <thead>
                          <tr className="border-b bg-slate-100">
                            <th className="p-2 text-left">Marca</th>
                            <th className="p-2 text-left">Color</th>
                            <th className="p-2 text-left">Tipo</th>
                            <th className="p-2 text-left">Consumido (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {otrasUtilizadas.map((pintura) => (
                            <tr key={pintura.id_pintura} className="border-b hover:bg-slate-50">
                              <td className="p-2">{pintura.marca}</td>
                              <td className="p-2">{pintura.color}</td>
                              <td className="p-2">{pintura.tipo}</td>
                              <td className="p-2">{pintura.total_consumido.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

export default function ReportePinturaMasUtilizadaProtected() {
  return (
    <ProtectedPage ruta="/reportes/pintura-mas-utilizada">
      <ReportePinturaMasUtilizada />
    </ProtectedPage>
  );
}

