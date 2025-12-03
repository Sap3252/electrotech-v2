"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedPage from "@/components/ProtectedPage";

type UsoCabina = {
  id_cabina: number;
  cabina: string;
  estado: string;
  max_piezas_diarias: number;
  total_registros: number;
  total_piezas: number;
  total_horas: number;
  total_gas: number;
  promedio_piezas_dia: number;
};

type MantenimientoPistola = {
  id_pistola: number;
  nombre: string;
  estado: string;
  horas_uso: number;
  horas_mantenimiento: number;
  porcentaje_uso: number;
  ultimo_mantenimiento: string;
  dias_desde_mantenimiento: number;
  alerta: string;
  cabinas_asignadas: string;
};

type MantenimientoHorno = {
  id_horno: number;
  nombre: string;
  estado: string;
  horas_uso: number;
  horas_mantenimiento: number;
  temperatura_max: number;
  gasto_gas_hora: number;
  porcentaje_uso: number;
  ultimo_mantenimiento: string;
  dias_desde_mantenimiento: number;
  alerta: string;
  cabinas_asignadas: string;
};

function ReportesCabinasContent() {
  const router = useRouter();
  const [tipoReporte, setTipoReporte] = useState("uso-cabinas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tipo: tipoReporte });
      if (fechaDesde) params.append("fechaDesde", fechaDesde);
      if (fechaHasta) params.append("fechaHasta", fechaHasta);

      const res = await fetch(`/api/reportes/cabinas?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [tipoReporte]);

  const getAlertaColor = (alerta: string) => {
    switch (alerta) {
      case "URGENTE":
        return "bg-red-500 text-white";
      case "PRONTO":
        return "bg-orange-500 text-white";
      case "PROGRAMAR":
        return "bg-yellow-500 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activa":
      case "activo":
        return "bg-green-100 text-green-800";
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800";
      case "inactiva":
      case "inactivo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Reportes de Cabinas y Equipos</h1>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Reporte</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uso-cabinas">Uso de Cabinas</SelectItem>
                  <SelectItem value="mantenimiento-pistolas">Mantenimiento Pistolas</SelectItem>
                  <SelectItem value="mantenimiento-hornos">Mantenimiento Hornos</SelectItem>
                  <SelectItem value="consumo-gas">Consumo de Gas</SelectItem>
                  <SelectItem value="productividad-diaria">Productividad Diaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div>
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={cargarReporte} disabled={loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tipoReporte === "uso-cabinas" && "Uso de Cabinas"}
            {tipoReporte === "mantenimiento-pistolas" && "Estado de Mantenimiento - Pistolas"}
            {tipoReporte === "mantenimiento-hornos" && "Estado de Mantenimiento - Hornos"}
            {tipoReporte === "consumo-gas" && "Consumo de Gas por Horno"}
            {tipoReporte === "productividad-diaria" && "Productividad Diaria por Cabina"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : data.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No hay datos para mostrar</p>
          ) : (
            <>
              {/* Tabla Uso Cabinas */}
              {tipoReporte === "uso-cabinas" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Cabina</th>
                        <th className="text-left p-3">Estado</th>
                        <th className="text-right p-3">Total Piezas</th>
                        <th className="text-right p-3">Total Horas</th>
                        <th className="text-right p-3">Gas (m³)</th>
                        <th className="text-right p-3">Promedio/Día</th>
                        <th className="text-right p-3">Cap. Máx/Día</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data as UsoCabina[]).map((row, idx) => (
                        <tr key={row.id_cabina || idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{row.cabina}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                              {row.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right">{row.total_piezas}</td>
                          <td className="p-3 text-right">{Number(row.total_horas || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{Number(row.total_gas || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{row.promedio_piezas_dia || 0}</td>
                          <td className="p-3 text-right">{row.max_piezas_diarias}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla Mantenimiento Pistolas */}
              {tipoReporte === "mantenimiento-pistolas" && (
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
                      {(data as MantenimientoPistola[]).map((row, idx) => (
                        <tr key={row.id_pistola || idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{row.nombre}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                              {row.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right">{row.horas_uso}</td>
                          <td className="p-3 text-right">{row.horas_mantenimiento}</td>
                          <td className="p-3 text-right">{row.porcentaje_uso}%</td>
                          <td className="p-3">{row.ultimo_mantenimiento || "-"}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${getAlertaColor(row.alerta)}`}>
                              {row.alerta}
                            </span>
                          </td>
                          <td className="p-3">{row.cabinas_asignadas || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla Mantenimiento Hornos */}
              {tipoReporte === "mantenimiento-hornos" && (
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
                      {(data as MantenimientoHorno[]).map((row, idx) => (
                        <tr key={row.id_horno || idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{row.nombre}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(row.estado)}`}>
                              {row.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right">{row.horas_uso}</td>
                          <td className="p-3 text-right">{row.horas_mantenimiento}</td>
                          <td className="p-3 text-right">{row.porcentaje_uso}%</td>
                          <td className="p-3 text-right">{row.temperatura_max}°C</td>
                          <td className="p-3 text-right">{row.gasto_gas_hora} m³</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${getAlertaColor(row.alerta)}`}>
                              {row.alerta}
                            </span>
                          </td>
                          <td className="p-3">{row.cabinas_asignadas || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla Consumo Gas */}
              {tipoReporte === "consumo-gas" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Horno</th>
                        <th className="text-right p-3">Gas/Hora (m³)</th>
                        <th className="text-right p-3">Total Gas (m³)</th>
                        <th className="text-right p-3">Total Horas</th>
                        <th className="text-right p-3">Días Trabajados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row: any, idx: number) => (
                        <tr key={row.id_horno || idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{row.horno}</td>
                          <td className="p-3 text-right">{row.gasto_gas_hora}</td>
                          <td className="p-3 text-right">{Number(row.total_gas_consumido || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{Number(row.total_horas || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{row.dias_trabajados || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla Productividad Diaria */}
              {tipoReporte === "productividad-diaria" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-left p-3">Cabina</th>
                        <th className="text-right p-3">Piezas</th>
                        <th className="text-right p-3">Horas</th>
                        <th className="text-right p-3">Gas (m³)</th>
                        <th className="text-right p-3">Cap. Máx</th>
                        <th className="text-right p-3">% Capacidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3">{row.fecha}</td>
                          <td className="p-3 font-medium">{row.cabina}</td>
                          <td className="p-3 text-right">{row.piezas_dia}</td>
                          <td className="p-3 text-right">{Number(row.horas_dia || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{Number(row.gas_dia || 0).toFixed(1)}</td>
                          <td className="p-3 text-right">{row.max_piezas_diarias}</td>
                          <td className="p-3 text-right">{row.porcentaje_capacidad || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/reportes")}>
          Volver a Reportes
        </Button>
      </div>
    </div>
  );
}

export default function ReportesCabinasPage() {
  return (
    <ProtectedPage ruta="/reportes/cabinas">
      <ReportesCabinasContent />
    </ProtectedPage>
  );
}
