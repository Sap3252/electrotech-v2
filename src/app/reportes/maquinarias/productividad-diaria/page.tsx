"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedPage from "@/components/ProtectedPage";

type ProductividadDiaria = {
  fecha: string;
  id_cabina: number;
  cabina: string;
  piezas_dia: number;
  horas_dia: number;
  gas_dia: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#FF6F91"];

function ProductividadDiariaContent() {
  const router = useRouter();
  const [data, setData] = useState<ProductividadDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tipo", "productividad-diaria");
      if (fechaDesde) params.append("fechaDesde", fechaDesde);
      if (fechaHasta) params.append("fechaHasta", fechaHasta);

      const res = await fetch(`/api/reportes/cabinas?${params}`);
      if (!res.ok) throw new Error("Error al cargar datos");
      const json = await res.json();
      
      const converted = json.map((row: any) => ({
        ...row,
        piezas_dia: Number(row.piezas_dia) || 0,
        horas_dia: Number(row.horas_dia) || 0,
        gas_dia: Number(row.gas_dia) || 0,
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

  // Agrupar datos por fecha para gráfico de líneas y ordenar por fecha ascendente
  const dataByDate = data.reduce((acc: any, row) => {
    const existing = acc.find((d: any) => d.fecha === row.fecha);
    if (existing) {
      existing.piezas_total += row.piezas_dia;
      existing.horas_total += row.horas_dia;
      existing.gas_total += row.gas_dia;
    } else {
      acc.push({
        fecha: row.fecha,
        piezas_total: row.piezas_dia,
        horas_total: row.horas_dia,
        gas_total: row.gas_dia,
      });
    }
    return acc;
  }, []).sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Obtener cabinas únicas
  const cabinasUnicas = [...new Set(data.map(d => d.cabina))];

  // Datos por cabina para comparación
  const dataByCabina = cabinasUnicas.map((cabina, idx) => {
    const cabinaData = data.filter(d => d.cabina === cabina);
    return {
      cabina,
      piezas_total: cabinaData.reduce((sum, d) => sum + d.piezas_dia, 0),
      horas_total: cabinaData.reduce((sum, d) => sum + d.horas_dia, 0),
      gas_total: cabinaData.reduce((sum, d) => sum + d.gas_dia, 0),
      color: COLORS[idx % COLORS.length],
    };
  });

  // Calcular totales
  const totales = {
    piezas: data.reduce((sum, d) => sum + d.piezas_dia, 0),
    horas: data.reduce((sum, d) => sum + d.horas_dia, 0),
    gas: data.reduce((sum, d) => sum + d.gas_dia, 0),
    dias: dataByDate.length,
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Productividad Diaria</h1>
        <p className="text-gray-600 mt-2">
          Evolución de la productividad día a día por cabina
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
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No hay datos de productividad para el período seleccionado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{totales.piezas}</p>
                <p className="text-gray-600 text-sm">Piezas Totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{totales.horas.toFixed(1)}</p>
                <p className="text-gray-600 text-sm">Horas Totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">{totales.gas.toFixed(1)}</p>
                <p className="text-gray-600 text-sm">Gas Total (m³)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-orange-600">{totales.dias}</p>
                <p className="text-gray-600 text-sm">Días con Actividad</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Líneas - Evolución de Piezas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolución de Producción por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dataByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="piezas_total" 
                      name="Piezas" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Líneas - Horas y Gas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolución de Horas y Gas por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="horas_total" 
                      name="Horas" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="gas_total" 
                      name="Gas (m³)" 
                      stroke="#FF8042" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Producción por Cabina */}
            <Card>
              <CardHeader>
                <CardTitle>Producción Total por Cabina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataByCabina}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabina" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="piezas_total" name="Piezas" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Horas y Gas por Cabina */}
            <Card>
              <CardHeader>
                <CardTitle>Horas y Gas por Cabina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataByCabina}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabina" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="horas_total" name="Horas" fill="#00C49F" />
                    <Bar yAxisId="right" dataKey="gas_total" name="Gas (m³)" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Productividad Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Cabina</th>
                      <th className="text-right p-3">Piezas</th>
                      <th className="text-right p-3">Horas</th>
                      <th className="text-right p-3">Gas (m³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3">{row.fecha}</td>
                        <td className="p-3 font-medium">{row.cabina}</td>
                        <td className="p-3 text-right">{row.piezas_dia}</td>
                        <td className="p-3 text-right">{row.horas_dia.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.gas_dia.toFixed(1)}</td>
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

export default function ProductividadDiariaPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias/productividad-diaria">
      <ProductividadDiariaContent />
    </ProtectedPage>
  );
}
