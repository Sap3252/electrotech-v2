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

type UsoCabina = {
  id_cabina: number;
  cabina: string;
  estado: string;
  total_piezas: number;
  total_horas: number;
  total_gas: number;
  promedio_piezas_dia: number;
  max_piezas_diarias: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#FF6F91"];

function UsoCabinasContent() {
  const router = useRouter();
  const [data, setData] = useState<UsoCabina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tipo", "uso-cabinas");
      if (fechaDesde) params.append("fechaDesde", fechaDesde);
      if (fechaHasta) params.append("fechaHasta", fechaHasta);

      const res = await fetch(`/api/reportes/cabinas?${params}`);
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      
      // Convertir strings a números
      const converted = json.map((row: any) => ({
        ...row,
        total_piezas: Number(row.total_piezas) || 0,
        total_horas: Number(row.total_horas) || 0,
        total_gas: Number(row.total_gas) || 0,
        promedio_piezas_dia: Number(row.promedio_piezas_dia) || 0,
        max_piezas_diarias: Number(row.max_piezas_diarias) || 0,
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activa": return "bg-green-100 text-green-800";
      case "mantenimiento": return "bg-yellow-100 text-yellow-800";
      case "inactiva": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calcular totales para resumen
  const totales = {
    piezas: data.reduce((sum, c) => sum + c.total_piezas, 0),
    horas: data.reduce((sum, c) => sum + c.total_horas, 0),
    gas: data.reduce((sum, c) => sum + c.total_gas, 0),
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Uso de Cabinas</h1>
        <p className="text-gray-600 mt-2">
          Estadísticas de producción por cabina de pintura
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-blue-600">{totales.piezas}</p>
                <p className="text-gray-600">Piezas Totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-green-600">{totales.horas.toFixed(1)}</p>
                <p className="text-gray-600">Horas Trabajadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-orange-600">{totales.gas.toFixed(1)} m³</p>
                <p className="text-gray-600">Gas Consumido</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Barras - Piezas por Cabina */}
            <Card>
              <CardHeader>
                <CardTitle>Piezas Pintadas por Cabina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabina" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_piezas" name="Piezas" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Pie - Distribución de Piezas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Producción</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="total_piezas"
                      nameKey="cabina"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ cabina, percent }) => 
                        `${cabina}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Horas y Gas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Horas de Trabajo y Consumo de Gas por Cabina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabina" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total_horas" name="Horas" fill="#00C49F" />
                    <Bar yAxisId="right" dataKey="total_gas" name="Gas (m³)" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle por Cabina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Cabina</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-right p-3">Piezas</th>
                      <th className="text-right p-3">Horas</th>
                      <th className="text-right p-3">Gas (m³)</th>
                      <th className="text-right p-3">Promedio/Día</th>
                      <th className="text-right p-3">Capacidad Máx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id_cabina || idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{row.cabina}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                            {row.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right">{row.total_piezas}</td>
                        <td className="p-3 text-right">{row.total_horas.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.total_gas.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.promedio_piezas_dia}</td>
                        <td className="p-3 text-right">{row.max_piezas_diarias}</td>
                      </tr>
                    ))}
                  </tbody>
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

export default function UsoCabinasPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias/uso-cabinas">
      <UsoCabinasContent />
    </ProtectedPage>
  );
}
