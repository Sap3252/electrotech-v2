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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedPage from "@/components/ProtectedPage";

type MantenimientoPistola = {
  id_pistola: number;
  nombre: string;
  estado: string;
  horas_uso: number;
  horas_mantenimiento: number;
  porcentaje_uso: number;
  ultimo_mantenimiento: string | null;
  alerta: string;
  cabinas: string;
};

const COLORS = {
  OK: "#22c55e",
  PROGRAMAR: "#eab308",
  PRONTO: "#f97316",
  URGENTE: "#ef4444",
};

const ESTADO_COLORS = {
  activa: "#22c55e",
  mantenimiento: "#eab308",
  inactiva: "#ef4444",
};

function MantenimientoPistolasContent() {
  const router = useRouter();
  const [data, setData] = useState<MantenimientoPistola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/cabinas?tipo=mantenimiento-pistolas")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then((json) => {
        const converted = json.map((row: any) => ({
          ...row,
          horas_uso: Number(row.horas_uso) || 0,
          horas_mantenimiento: Number(row.horas_mantenimiento) || 0,
          porcentaje_uso: Number(row.porcentaje_uso) || 0,
        }));
        setData(converted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getAlertaColor = (alerta: string) => {
    switch (alerta) {
      case "OK": return "bg-green-100 text-green-800";
      case "PROGRAMAR": return "bg-yellow-100 text-yellow-800";
      case "PRONTO": return "bg-orange-100 text-orange-800";
      case "URGENTE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activa": return "bg-green-100 text-green-800";
      case "mantenimiento": return "bg-yellow-100 text-yellow-800";
      case "inactiva": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Estadísticas
  const stats = {
    total: data.length,
    activas: data.filter(p => p.estado === "activa").length,
    mantenimiento: data.filter(p => p.estado === "mantenimiento").length,
    alertaUrgente: data.filter(p => p.alerta === "URGENTE").length,
    alertaPronto: data.filter(p => p.alerta === "PRONTO").length,
  };

  // Datos para gráfico de alertas
  const alertasData = [
    { name: "OK", value: data.filter(p => p.alerta === "OK").length, fill: COLORS.OK },
    { name: "PROGRAMAR", value: data.filter(p => p.alerta === "PROGRAMAR").length, fill: COLORS.PROGRAMAR },
    { name: "PRONTO", value: data.filter(p => p.alerta === "PRONTO").length, fill: COLORS.PRONTO },
    { name: "URGENTE", value: data.filter(p => p.alerta === "URGENTE").length, fill: COLORS.URGENTE },
  ].filter(d => d.value > 0);

  // Datos para gráfico radial de uso
  const radialData = data.map(p => ({
    name: p.nombre,
    porcentaje: p.porcentaje_uso,
    fill: p.porcentaje_uso >= 90 ? COLORS.URGENTE : 
          p.porcentaje_uso >= 75 ? COLORS.PRONTO :
          p.porcentaje_uso >= 50 ? COLORS.PROGRAMAR : COLORS.OK,
  }));

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mantenimiento de Pistolas</h1>
        <p className="text-gray-600 mt-2">
          Estado de mantenimiento y alertas preventivas de pistolas de pintura
        </p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <>
          {/* Resumen de Estado */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-600 text-sm">Total Pistolas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.activas}</p>
                <p className="text-gray-600 text-sm">Activas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.mantenimiento}</p>
                <p className="text-gray-600 text-sm">En Mantenimiento</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-orange-600">{stats.alertaPronto}</p>
                <p className="text-gray-600 text-sm">Alerta Pronto</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-red-600">{stats.alertaUrgente}</p>
                <p className="text-gray-600 text-sm">Alerta Urgente</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico Pie - Distribución de Alertas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertasData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {alertasData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Horas de Uso vs Límite */}
            <Card>
              <CardHeader>
                <CardTitle>Horas de Uso vs Límite de Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nombre" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas_uso" name="Horas Uso" fill="#3b82f6" />
                    <Bar dataKey="horas_mantenimiento" name="Límite" fill="#d1d5db" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Porcentaje de Uso */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Porcentaje de Uso hacia Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="porcentaje_uso" name="% Uso">
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.porcentaje_uso >= 90 ? COLORS.URGENTE : 
                            entry.porcentaje_uso >= 75 ? COLORS.PRONTO :
                            entry.porcentaje_uso >= 50 ? COLORS.PROGRAMAR : COLORS.OK
                          } 
                        />
                      ))}
                    </Bar>
                    {/* Líneas de referencia */}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.OK }}></div>
                    0-50% OK
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PROGRAMAR }}></div>
                    50-75% Programar
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PRONTO }}></div>
                    75-90% Pronto
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.URGENTE }}></div>
                    90%+ Urgente
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Pistolas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Pistola</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-right p-3">Horas Uso</th>
                      <th className="text-right p-3">Límite</th>
                      <th className="text-right p-3">% Uso</th>
                      <th className="text-left p-3">Último Mant.</th>
                      <th className="text-center p-3">Alerta</th>
                      <th className="text-left p-3">Cabinas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id_pistola || idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{row.nombre}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                            {row.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right">{row.horas_uso.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.horas_mantenimiento}</td>
                        <td className="p-3 text-right">{row.porcentaje_uso.toFixed(1)}%</td>
                        <td className="p-3">{row.ultimo_mantenimiento || "-"}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${getAlertaColor(row.alerta)}`}>
                            {row.alerta}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{row.cabinas || "-"}</td>
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

export default function MantenimientoPistolasPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias/mantenimiento-pistolas">
      <MantenimientoPistolasContent />
    </ProtectedPage>
  );
}
