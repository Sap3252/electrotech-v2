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
import ProtectedPage from "@/components/ProtectedPage";

type MantenimientoHorno = {
  id_horno: number;
  nombre: string;
  estado: string;
  horas_uso: number;
  horas_mantenimiento: number;
  porcentaje_uso: number;
  temperatura_max: number;
  gasto_gas_hora: number;
  alerta: string;
  cabinas: string;
};

const COLORS = {
  OK: "#22c55e",
  PROGRAMAR: "#eab308",
  PRONTO: "#f97316",
  URGENTE: "#ef4444",
};

function MantenimientoHornosContent() {
  const router = useRouter();
  const [data, setData] = useState<MantenimientoHorno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reportes/cabinas?tipo=mantenimiento-hornos")
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
          temperatura_max: Number(row.temperatura_max) || 0,
          gasto_gas_hora: Number(row.gasto_gas_hora) || 0,
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
      case "activo": return "bg-green-100 text-green-800";
      case "mantenimiento": return "bg-yellow-100 text-yellow-800";
      case "inactivo": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Estadísticas
  const stats = {
    total: data.length,
    activos: data.filter(h => h.estado === "activo").length,
    mantenimiento: data.filter(h => h.estado === "mantenimiento").length,
    alertaUrgente: data.filter(h => h.alerta === "URGENTE").length,
    alertaPronto: data.filter(h => h.alerta === "PRONTO").length,
    gastoTotal: data.reduce((sum, h) => sum + h.gasto_gas_hora, 0),
  };

  // Datos para gráfico de alertas
  const alertasData = [
    { name: "OK", value: data.filter(h => h.alerta === "OK").length, fill: COLORS.OK },
    { name: "PROGRAMAR", value: data.filter(h => h.alerta === "PROGRAMAR").length, fill: COLORS.PROGRAMAR },
    { name: "PRONTO", value: data.filter(h => h.alerta === "PRONTO").length, fill: COLORS.PRONTO },
    { name: "URGENTE", value: data.filter(h => h.alerta === "URGENTE").length, fill: COLORS.URGENTE },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mantenimiento de Hornos</h1>
        <p className="text-gray-600 mt-2">
          Estado de mantenimiento, temperaturas y consumo de gas de hornos de secado
        </p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <>
          {/* Resumen de Estado */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-600 text-sm">Total Hornos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
                <p className="text-gray-600 text-sm">Activos</p>
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
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.gastoTotal.toFixed(1)}</p>
                <p className="text-gray-600 text-sm">m³/hora Total</p>
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
                    <Bar dataKey="horas_uso" name="Horas Uso" fill="#f97316" />
                    <Bar dataKey="horas_mantenimiento" name="Límite" fill="#d1d5db" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Temperatura y Gas */}
            <Card>
              <CardHeader>
                <CardTitle>Temperatura Máxima por Horno</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}°C`} />
                    <Bar dataKey="temperatura_max" name="Temp. Máx (°C)" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Consumo de Gas por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Consumo de Gas por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} m³/h`} />
                    <Bar dataKey="gasto_gas_hora" name="Gas (m³/hora)" fill="#8b5cf6" />
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
              <CardTitle>Detalle de Hornos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Horno</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-right p-3">Horas Uso</th>
                      <th className="text-right p-3">Límite</th>
                      <th className="text-right p-3">% Uso</th>
                      <th className="text-right p-3">Temp. Máx</th>
                      <th className="text-right p-3">Gas/Hora</th>
                      <th className="text-center p-3">Alerta</th>
                      <th className="text-left p-3">Cabinas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id_horno || idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{row.nombre}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                            {row.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right">{row.horas_uso.toFixed(1)}</td>
                        <td className="p-3 text-right">{row.horas_mantenimiento}</td>
                        <td className="p-3 text-right">{row.porcentaje_uso.toFixed(1)}%</td>
                        <td className="p-3 text-right">{row.temperatura_max}°C</td>
                        <td className="p-3 text-right">{row.gasto_gas_hora} m³</td>
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

export default function MantenimientoHornosPage() {
  return (
    <ProtectedPage ruta="/reportes/maquinarias/mantenimiento-hornos">
      <MantenimientoHornosContent />
    </ProtectedPage>
  );
}
