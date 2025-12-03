"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedPage from "@/components/ProtectedPage";

type ConsumoGas = {
  id_horno: number;
  horno: string;
  gasto_gas_hora: number;
  total_gas_consumido: number;
  total_horas: number;
  dias_trabajados: number;
};

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6"];

function ConsumoGasContent() {
  const router = useRouter();
  const [data, setData] = useState<ConsumoGas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tipo", "consumo-gas");
      if (fechaDesde) params.append("fechaDesde", fechaDesde);
      if (fechaHasta) params.append("fechaHasta", fechaHasta);

      const res = await fetch(`/api/reportes/cabinas?${params}`);
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      
      const converted = json.map((row: any) => ({
        ...row,
        gasto_gas_hora: Number(row.gasto_gas_hora) || 0,
        total_gas_consumido: Number(row.total_gas_consumido) || 0,
        total_horas: Number(row.total_horas) || 0,
        dias_trabajados: Number(row.dias_trabajados) || 0,
      }));
      
      setData(converted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular totales
  const totales = {
    gasTotal: data.reduce((sum, h) => sum + h.total_gas_consumido, 0),
    horasTotal: data.reduce((sum, h) => sum + h.total_horas, 0),
    diasTotal: data.reduce((sum, h) => sum + h.dias_trabajados, 0),
  };

  // Calcular promedio de gas por hora
  const promedioGasPorHora = totales.horasTotal > 0 
    ? totales.gasTotal / totales.horasTotal 
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Consumo de Gas</h1>
        <p className="text-gray-600 mt-2">
          Análisis del consumo de gas por horno de secado
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={fetchData}>Aplicar Filtros</Button>
            <Button
              variant="outline"
              onClick={() => {
                setFechaDesde("");
                setFechaHasta("");
                setTimeout(fetchData, 0);
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-purple-600">{totales.gasTotal.toFixed(1)}</p>
                <p className="text-gray-600">m³ Gas Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-blue-600">{totales.horasTotal.toFixed(1)}</p>
                <p className="text-gray-600">Horas Totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-green-600">{promedioGasPorHora.toFixed(2)}</p>
                <p className="text-gray-600">m³/hora Promedio</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-orange-600">{data.length}</p>
                <p className="text-gray-600">Hornos</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Barras - Consumo Total por Horno */}
            <Card>
              <CardHeader>
                <CardTitle>Consumo Total de Gas por Horno</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horno" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)} m³`} />
                    <Legend />
                    <Bar dataKey="total_gas_consumido" name="Gas Consumido (m³)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Pie - Distribución de Consumo */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución del Consumo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="total_gas_consumido"
                      nameKey="horno"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ horno, percent }) => 
                        `${horno}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)} m³`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Comparativa Gas/Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Gas por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horno" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} m³/h`} />
                    <Legend />
                    <Bar dataKey="gasto_gas_hora" name="Gasto Gas/Hora" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Horas Trabajadas */}
            <Card>
              <CardHeader>
                <CardTitle>Horas Trabajadas por Horno</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horno" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)} horas`} />
                    <Legend />
                    <Bar dataKey="total_horas" name="Horas Trabajadas" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Comparativo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Comparativa: Horas vs Gas Consumido</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horno" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total_horas" name="Horas" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="total_gas_consumido" name="Gas (m³)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Consumo por Horno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Horno</th>
                      <th className="text-right p-3">Gas/Hora (m³)</th>
                      <th className="text-right p-3">Gas Total (m³)</th>
                      <th className="text-right p-3">Horas Trabajadas</th>
                      <th className="text-right p-3">Días Trabajados</th>
                      <th className="text-right p-3">Promedio/Día (m³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id_horno || idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{row.horno}</td>
                        <td className="p-3 text-right">{row.gasto_gas_hora.toFixed(2)}</td>
                        <td className="p-3 text-right">{row.total_gas_consumido.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.total_horas.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.dias_trabajados}</td>
                        <td className="p-3 text-right">
                          {row.dias_trabajados > 0 
                            ? (row.total_gas_consumido / row.dias_trabajados).toFixed(2) 
                            : "-"
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-gray-100 font-semibold">
                      <td className="p-3">TOTAL</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">{totales.gasTotal.toFixed(1)}</td>
                      <td className="p-3 text-right">{totales.horasTotal.toFixed(1)}</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/reportes/maquinarias")}>
          ← Volver a Reportes de Maquinarias
        </Button>
      </div>
    </div>
  );
}

export default function ConsumoGasPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias/consumo-gas">
      <ConsumoGasContent />
    </ProtectedPage>
  );
}
