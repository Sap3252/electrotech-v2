"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

type AuditoriaRecord = {
  id_auditoria: number;
  tabla_afectada: string;
  id_registro: number;
  accion: "INSERT" | "UPDATE" | "DELETE";
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  usuario_sistema: string;
  id_usuario: number | null;
  usuario_nombre: string | null;
  usuario_apellido: string | null;
  usuario_email: string | null;
  grupo_nombre: string | null;
  fecha_hora: string;
};

type SesionRecord = {
  id: number;
  id_usuario: number;
  usuario_nombre: string;
  usuario_email: string;
  fecha_hora_login: string;
  fecha_hora_logout: string | null;
  duracion_minutos: number | null;
};

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
};

type TabType = "sesiones" | "trazabilidad" | "reportes";

// Tipos para reportes
type ReportesData = {
  sesiones: {
    porUsuario: { nombre: string; apellido: string; total_sesiones: number; tiempo_total: number }[];
    porDia: { fecha: string; sesiones: number }[];
    porHora: { hora: number; sesiones: number }[];
    duracionPromedio: { usuario: string; duracion_promedio: number }[];
  };
  trazabilidad: {
    porTipo: { accion: string; cantidad: number }[];
    porDia: { fecha: string; operaciones: number }[];
    porUsuario: { usuario: string; operaciones: number }[];
    porTabla: { tabla_afectada: string; operaciones: number }[];
    porHora: { hora: number; operaciones: number }[];
    tendenciaSemanal: { semana: string; operaciones: number }[];
  };
  estadisticas: {
    total_sesiones: number;
    usuarios_activos: number;
    duracion_promedio: number;
    total_operaciones: number;
    total_inserts: number;
    total_updates: number;
    total_deletes: number;
  };
};

// Colores para gráficos
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const ACCION_COLORS: Record<string, string> = {
  INSERT: "#22c55e",
  UPDATE: "#f59e0b", 
  DELETE: "#ef4444",
};

export default function AuditoriaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("sesiones");
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Estado para Sesiones
  const [sesiones, setSesiones] = useState<SesionRecord[]>([]);
  const [sesionesTotal, setSesionesTotal] = useState(0);
  const [sesionesPage, setSesionesPage] = useState(0);
  const [sesionesStats, setSesionesStats] = useState({ totalSesiones: 0, tiempoTotalMinutos: 0 });
  const [sesionUsuarioId, setSesionUsuarioId] = useState<string>("");
  const [sesionFechaDesde, setSesionFechaDesde] = useState<string>("");
  const [sesionFechaHasta, setSesionFechaHasta] = useState<string>("");

  // Estado para Trazabilidad
  const [records, setRecords] = useState<AuditoriaRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<AuditoriaRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [accion, setAccion] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [loteSeleccionado, setLoteSeleccionado] = useState<string>("");
  const [lotes, setLotes] = useState<{ id_pieza_pintada: number; pieza_nombre: string; pintura_nombre: string }[]>([]);

  // Estado para Reportes
  const [reportesData, setReportesData] = useState<ReportesData | null>(null);
  const [reportesLoading, setReportesLoading] = useState(false);

  const limit = 20;

  // Cargar usuarios
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch("/api/usuarios");
        if (res.ok) {
          const data = await res.json();
          setUsuarios(data);
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    }
    fetchUsuarios();
  }, []);

  // Cargar lotes
  useEffect(() => {
    async function fetchLotes() {
      try {
        const res = await fetch("/api/auditoria/lotes");
        if (res.ok) {
          const data = await res.json();
          setLotes(data);
        }
      } catch (error) {
        console.error("Error cargando lotes:", error);
      }
    }
    fetchLotes();
  }, []);

  // Fetch Sesiones
  const fetchSesiones = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (sesionUsuarioId && sesionUsuarioId !== "all") params.set("idUsuario", sesionUsuarioId);
      if (sesionFechaDesde) params.set("fechaDesde", sesionFechaDesde);
      if (sesionFechaHasta) params.set("fechaHasta", sesionFechaHasta);
      params.set("limit", limit.toString());
      params.set("offset", (sesionesPage * limit).toString());

      const res = await fetch(`/api/auditoria/sesiones?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error fetching sesiones");
      }

      const data = await res.json();
      setSesiones(data.data);
      setSesionesTotal(data.total);
      setSesionesStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  }, [sesionUsuarioId, sesionFechaDesde, sesionFechaHasta, sesionesPage, router]);

  // Fetch Trazabilidad
  const fetchAuditoria = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (accion && accion !== "all") params.set("accion", accion);
      if (fechaDesde) params.set("fechaDesde", fechaDesde);
      if (fechaHasta) params.set("fechaHasta", fechaHasta);
      if (loteSeleccionado) params.set("idRegistro", loteSeleccionado);
      params.set("limit", limit.toString());
      params.set("offset", (page * limit).toString());

      const res = await fetch(`/api/auditoria?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error fetching auditoria");
      }

      const data = await res.json();
      setRecords(data.data);
      setTotal(data.total);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  }, [accion, fechaDesde, fechaHasta, loteSeleccionado, page, router]);

  // Fetch Reportes
  const fetchReportes = useCallback(async () => {
    try {
      setReportesLoading(true);
      const res = await fetch("/api/auditoria/reportes");
      if (!res.ok) {
        throw new Error("Error fetching reportes");
      }
      const data = await res.json();
      setReportesData(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setReportesLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "sesiones") {
      fetchSesiones();
    } else if (activeTab === "trazabilidad") {
      fetchAuditoria();
    } else if (activeTab === "reportes") {
      fetchReportes();
    } else {
      setLoading(false);
    }
  }, [activeTab, fetchSesiones, fetchAuditoria, fetchReportes]);

  const formatDuracion = (minutos: number | null) => {
    if (minutos === null) return "En curso";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTiempoTotal = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const getAccionBadge = (accion: string) => {
    switch (accion) {
      case "INSERT":
        return <Badge className="bg-green-500 hover:bg-green-600">CREAR</Badge>;
      case "UPDATE":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">MODIFICAR</Badge>;
      case "DELETE":
        return <Badge className="bg-red-500 hover:bg-red-600">ELIMINAR</Badge>;
      default:
        return <Badge>{accion}</Badge>;
    }
  };

  // Helper para obtener valores de datos_nuevos de forma segura
  const getDatosNuevos = (record: AuditoriaRecord | null) => {
    if (!record?.datos_nuevos) return null;
    const d = record.datos_nuevos as Record<string, unknown>;
    return {
      fecha: d.fecha != null ? String(d.fecha) : null,
      cantidad: d.cantidad != null ? String(d.cantidad) : null,
      pieza_nombre: d.pieza_nombre != null ? String(d.pieza_nombre) : null,
      cabina_nombre: d.cabina_nombre != null ? String(d.cabina_nombre) : null,
      pintura_nombre: d.pintura_nombre != null ? String(d.pintura_nombre) : null,
      cantidad_facturada: d.cantidad_facturada != null ? String(d.cantidad_facturada) : null,
      consumo_estimado_kg: d.consumo_estimado_kg != null ? Number(d.consumo_estimado_kg).toFixed(4) : null,
      // Campos para eliminación (parcial o completa)
      cantidad_lote: d.cantidad_lote != null ? String(d.cantidad_lote) : null,
      cantidad_eliminada: d.cantidad_eliminada != null ? String(d.cantidad_eliminada) : null,
      cantidad_pendiente: d.cantidad_pendiente != null ? String(d.cantidad_pendiente) : null,
      motivo_eliminacion: d.motivo_eliminacion != null ? String(d.motivo_eliminacion) : null,
    };
  };

  // Helper para obtener datos de registros eliminados (DELETE usa datos_nuevos, no datos_anteriores)
  const getDatosEliminados = (record: AuditoriaRecord | null) => {
    if (!record?.datos_nuevos) return null;
    const d = record.datos_nuevos as Record<string, unknown>;
    return {
      fecha: d.fecha != null ? String(d.fecha) : null,
      pieza_nombre: d.pieza_nombre != null ? String(d.pieza_nombre) : null,
      cabina_nombre: d.cabina_nombre != null ? String(d.cabina_nombre) : null,
      pintura_nombre: d.pintura_nombre != null ? String(d.pintura_nombre) : null,
      consumo_estimado_kg: d.consumo_estimado_kg != null ? Number(d.consumo_estimado_kg).toFixed(4) : null,
      cantidad_lote: d.cantidad_lote != null ? String(d.cantidad_lote) : null,
      cantidad_facturada: d.cantidad_facturada != null ? String(d.cantidad_facturada) : null,
      cantidad_eliminada: d.cantidad_eliminada != null ? String(d.cantidad_eliminada) : null,
    };
  };

  const getChangedFields = (anterior: Record<string, unknown> | null, nuevo: Record<string, unknown> | null) => {
    if (!anterior || !nuevo) return [];
    const changes: { campo: string; antes: unknown; despues: unknown }[] = [];
    
    for (const key of Object.keys(nuevo)) {
      if (JSON.stringify(anterior[key]) !== JSON.stringify(nuevo[key])) {
        changes.push({
          campo: key,
          antes: anterior[key],
          despues: nuevo[key],
        });
      }
    }
    return changes;
  };

  const totalPages = Math.ceil(total / limit);
  const sesionesTotalPages = Math.ceil(sesionesTotal / limit);

  if (loading && activeTab !== "reportes") {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Auditoría</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin")}>
          Volver al Panel
        </Button>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "sesiones" ? "default" : "outline"}
          onClick={() => setActiveTab("sesiones")}
          className={activeTab === "sesiones" ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          Sesiones de Usuarios
        </Button>
        <Button
          variant={activeTab === "trazabilidad" ? "default" : "outline"}
          onClick={() => setActiveTab("trazabilidad")}
          className={activeTab === "trazabilidad" ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          Trazabilidad
        </Button>
        <Button
          variant={activeTab === "reportes" ? "default" : "outline"}
          onClick={() => setActiveTab("reportes")}
          className={activeTab === "reportes" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Reportes
        </Button>
      </div>

      {/* ==================== SECCIÓN SESIONES ==================== */}
      {activeTab === "sesiones" && (
        <>
          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros - Sesiones de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Usuario</Label>
                  <Select value={sesionUsuarioId} onValueChange={setSesionUsuarioId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {usuarios.map((u) => (
                        <SelectItem key={u.id_usuario} value={u.id_usuario.toString()}>
                          {u.nombre} {u.apellido} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fecha Desde</Label>
                  <Input
                    type="date"
                    value={sesionFechaDesde}
                    onChange={(e) => setSesionFechaDesde(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Fecha Hasta</Label>
                  <Input
                    type="date"
                    value={sesionFechaHasta}
                    onChange={(e) => setSesionFechaHasta(e.target.value)}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={() => { setSesionesPage(0); fetchSesiones(); }} className="bg-blue-600 hover:bg-blue-700">
                    Buscar
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSesionUsuarioId("");
                    setSesionFechaDesde("");
                    setSesionFechaHasta("");
                    setSesionesPage(0);
                  }}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-blue-600">
                  {sesionesStats.totalSesiones}
                </div>
                <p className="text-center text-gray-500">Total de Sesiones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-green-600">
                  {formatTiempoTotal(sesionesStats.tiempoTotalMinutos)}
                </div>
                <p className="text-center text-gray-500">Tiempo Total Conectado</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-purple-600">
                  {sesionesStats.totalSesiones > 0 
                    ? formatTiempoTotal(Math.round(sesionesStats.tiempoTotalMinutos / sesionesStats.totalSesiones))
                    : "0m"}
                </div>
                <p className="text-center text-gray-500">Promedio por Sesión</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de sesiones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sesiones</CardTitle>
            </CardHeader>
            <CardContent>
              {sesiones.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No hay sesiones registradas con los filtros seleccionados.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Login</TableHead>
                        <TableHead>Logout</TableHead>
                        <TableHead>Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sesiones.map((sesion) => (
                        <TableRow key={sesion.id}>
                          <TableCell className="font-medium">
                            {sesion.usuario_nombre}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {sesion.usuario_email}
                          </TableCell>
                          <TableCell>{sesion.fecha_hora_login}</TableCell>
                          <TableCell>
                            {sesion.fecha_hora_logout || (
                              <Badge className="bg-blue-500">Activo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={sesion.duracion_minutos === null ? "text-blue-600 font-medium" : ""}>
                              {formatDuracion(sesion.duracion_minutos)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginación */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                      Mostrando {sesionesPage * limit + 1} - {Math.min((sesionesPage + 1) * limit, sesionesTotal)} de {sesionesTotal}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sesionesPage === 0}
                        onClick={() => setSesionesPage(sesionesPage - 1)}
                      >
                        Anterior
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Página {sesionesPage + 1} de {sesionesTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sesionesPage >= sesionesTotalPages - 1}
                        onClick={() => setSesionesPage(sesionesPage + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ==================== SECCIÓN TRAZABILIDAD ==================== */}
      {activeTab === "trazabilidad" && (
        <>
          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros - Trazabilidad de Piezas Pintadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label>Acción</Label>
                  <Select value={accion} onValueChange={setAccion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="INSERT">Crear</SelectItem>
                      <SelectItem value="UPDATE">Modificar</SelectItem>
                      <SelectItem value="DELETE">Eliminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Lote (ID - Pieza - Pintura)</Label>
                  <Combobox
                    options={lotes.map((lote): ComboboxOption => ({
                      value: String(lote.id_pieza_pintada),
                      label: `#${lote.id_pieza_pintada} - ${lote.pieza_nombre} - ${lote.pintura_nombre}`
                    }))}
                    value={loteSeleccionado}
                    onValueChange={setLoteSeleccionado}
                    placeholder="Seleccionar lote..."
                    searchPlaceholder="Buscar por ID, pieza o pintura..."
                    emptyText="No se encontraron lotes."
                  />
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
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={() => { setPage(0); fetchAuditoria(); }} className="bg-purple-600 hover:bg-purple-700">
                  Buscar
                </Button>
                <Button variant="outline" onClick={() => {
                  setAccion("");
                  setLoteSeleccionado("");
                  setFechaDesde("");
                  setFechaHasta("");
                  setPage(0);
                }}>
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center">{total}</div>
                <p className="text-center text-gray-500">Total Registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-green-600">
                  {records.filter(r => r.accion === "INSERT").length}
                </div>
                <p className="text-center text-gray-500">Creaciones (página)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-yellow-600">
                  {records.filter(r => r.accion === "UPDATE").length}
                </div>
                <p className="text-center text-gray-500">Modificaciones (página)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-red-600">
                  {records.filter(r => r.accion === "DELETE").length}
                </div>
                <p className="text-center text-gray-500">Eliminaciones (página)</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios - PiezaPintada</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No hay registros de auditoría. Los cambios se registrarán automáticamente.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id_auditoria}>
                          <TableCell>{record.id_auditoria}</TableCell>
                          <TableCell>{record.fecha_hora}</TableCell>
                          <TableCell>{getAccionBadge(record.accion)}</TableCell>
                          <TableCell className="font-medium">
                            {record.usuario_nombre && record.usuario_apellido 
                              ? `${record.usuario_nombre} ${record.usuario_apellido}`
                              : <span className="text-gray-400 italic">Sin registrar</span>}
                          </TableCell>
                          <TableCell>
                            {record.grupo_nombre 
                              ? <Badge variant="outline">{record.grupo_nombre}</Badge>
                              : <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowModal(true);
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginación */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                      Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, total)} de {total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Página {page + 1} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(page + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ==================== SECCIÓN REPORTES ==================== */}
      {activeTab === "reportes" && (
        <div className="space-y-6">
          {reportesLoading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-lg">Cargando reportes...</div>
              </CardContent>
            </Card>
          ) : reportesData ? (
            <>
              {/* Estadísticas Generales */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{reportesData.estadisticas.total_sesiones}</p>
                    <p className="text-xs text-blue-600">Total Sesiones</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-purple-700">{reportesData.estadisticas.usuarios_activos}</p>
                    <p className="text-xs text-purple-600">Usuarios Activos</p>
                  </CardContent>
                </Card>
                <Card className="bg-cyan-50 border-cyan-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-cyan-700">{reportesData.estadisticas.duracion_promedio}m</p>
                    <p className="text-xs text-cyan-600">Duración Promedio</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-gray-700">{reportesData.estadisticas.total_operaciones}</p>
                    <p className="text-xs text-gray-600">Total Operaciones</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{reportesData.estadisticas.total_inserts}</p>
                    <p className="text-xs text-green-600">Creaciones</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{reportesData.estadisticas.total_updates}</p>
                    <p className="text-xs text-yellow-600">Modificaciones</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-red-700">{reportesData.estadisticas.total_deletes}</p>
                    <p className="text-xs text-red-600">Eliminaciones</p>
                  </CardContent>
                </Card>
              </div>

              {/* Título Sesiones */}
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mt-4">Reportes de Sesiones</h2>

              {/* Fila 1: Sesiones por día y Tipo de acciones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Lineal: Sesiones por día */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sesiones por Día (últimos 30 días)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={reportesData.sesiones.porDia.map(d => ({
                        ...d,
                        fecha: new Date(d.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sesiones" stroke="#3b82f6" fill="#93c5fd" name="Sesiones" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico Circular: Tipos de acciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribución de Acciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportesData.trazabilidad.porTipo.map(item => ({
                            name: item.accion === 'INSERT' ? 'CREAR' : item.accion === 'UPDATE' ? 'MODIFICAR' : 'ELIMINAR',
                            value: item.cantidad,
                            accion: item.accion
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportesData.trazabilidad.porTipo.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ACCION_COLORS[entry.accion] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Fila 2: Sesiones por usuario y Duración promedio */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Barras: Sesiones por usuario */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top 10 Usuarios con más Sesiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportesData.sesiones.porUsuario.map(u => ({
                        ...u,
                        usuario: `${u.nombre} ${u.apellido}`.substring(0, 15)
                      }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis dataKey="usuario" type="category" width={100} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="total_sesiones" fill="#8b5cf6" name="Sesiones" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico Barras: Duración promedio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Duración Promedio de Sesión por Usuario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportesData.sesiones.duracionPromedio.map(u => ({
                        ...u,
                        usuario: u.usuario.substring(0, 15)
                      }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis dataKey="usuario" type="category" width={100} fontSize={11} />
                        <Tooltip formatter={(value) => [`${value} min`, 'Duración']} />
                        <Bar dataKey="duracion_promedio" fill="#06b6d4" name="Minutos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Barras: Actividad por hora */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actividad por Hora del Día (Sesiones)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reportesData.sesiones.porHora.map(h => ({
                      ...h,
                      hora: `${h.hora}:00`
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="sesiones" fill="#3b82f6" name="Sesiones" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Título Trazabilidad */}
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mt-6">Reportes de Trazabilidad</h2>

              {/* Fila: Operaciones por día y por tabla */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Lineal: Operaciones por día */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Operaciones por Día (últimos 30 días)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportesData.trazabilidad.porDia.map(d => ({
                        ...d,
                        fecha: new Date(d.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="operaciones" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Operaciones" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico Barras: Operaciones por tabla */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Operaciones por Tabla</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportesData.trazabilidad.porTabla} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis dataKey="tabla_afectada" type="category" width={120} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="operaciones" fill="#f59e0b" name="Operaciones">
                          {reportesData.trazabilidad.porTabla.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Fila: Operaciones por usuario y por hora */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Barras: Operaciones por usuario */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top 10 Usuarios con más Operaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportesData.trazabilidad.porUsuario.map(u => ({
                        ...u,
                        usuario: u.usuario.substring(0, 15)
                      }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis dataKey="usuario" type="category" width={100} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="operaciones" fill="#ec4899" name="Operaciones" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico Barras: Actividad por hora */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Actividad por Hora del Día (Operaciones)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportesData.trazabilidad.porHora.map(h => ({
                        ...h,
                        hora: `${h.hora}:00`
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="operaciones" fill="#84cc16" name="Operaciones" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tendencia Semanal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tendencia Semanal (últimas 12 semanas)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={reportesData.trazabilidad.tendenciaSemanal.map((d, i) => ({
                      ...d,
                      semana: `Sem ${i + 1}`
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="operaciones" stroke="#8b5cf6" fill="#c4b5fd" name="Operaciones" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Botón refrescar */}
              <div className="flex justify-center">
                <Button onClick={fetchReportes} variant="outline">
                  Actualizar Reportes
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-500">No se pudieron cargar los reportes</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal de detalles (Trazabilidad) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible" id="detalle-auditoria">
          <DialogHeader className="print:mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">
                Detalle de Auditoría #{selectedRecord?.id_auditoria}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="print:hidden flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Imprimir
              </Button>
            </div>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Información del Usuario */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Usuario que realizó el cambio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-500 text-xs">Nombre Completo</Label>
                      <p className="font-medium text-lg">
                        {selectedRecord.usuario_nombre && selectedRecord.usuario_apellido 
                          ? `${selectedRecord.usuario_nombre} ${selectedRecord.usuario_apellido}`
                          : <span className="text-gray-400 italic">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Email</Label>
                      <p className="font-medium">
                        {selectedRecord.usuario_email || <span className="text-gray-400">-</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Grupo</Label>
                      <p>
                        {selectedRecord.grupo_nombre 
                          ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{selectedRecord.grupo_nombre}</Badge>
                          : <span className="text-gray-400">-</span>}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de la Operación */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Label className="text-gray-500 text-xs">Fecha/Hora</Label>
                    <p className="font-medium">{selectedRecord.fecha_hora}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Label className="text-gray-500 text-xs">Acción</Label>
                    <div className="mt-1">{getAccionBadge(selectedRecord.accion)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Label className="text-gray-500 text-xs">Tabla</Label>
                    <p className="font-medium">{selectedRecord.tabla_afectada}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Label className="text-gray-500 text-xs">ID Registro</Label>
                    <p className="font-medium">#{selectedRecord.id_registro}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Para UPDATE de eliminación parcial - mostrar tarjetas especiales */}
              {selectedRecord.accion === "UPDATE" && selectedRecord.datos_nuevos && 
               !!(selectedRecord.datos_nuevos as Record<string, unknown>).cantidad_eliminada && (() => {
                const datos = getDatosNuevos(selectedRecord);
                if (!datos) return null;
                return (
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-amber-700 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Eliminación Parcial de Piezas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {datos.fecha && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Fecha</Label>
                            <p className="font-medium text-base">{datos.fecha}</p>
                          </div>
                        )}
                        {datos.pieza_nombre && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Pieza</Label>
                            <p className="font-medium text-base break-words">{datos.pieza_nombre}</p>
                          </div>
                        )}
                        {datos.cabina_nombre && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cabina</Label>
                            <p className="font-medium text-base break-words">{datos.cabina_nombre}</p>
                          </div>
                        )}
                        {datos.pintura_nombre && (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Pintura</Label>
                            <p className="font-medium text-base break-words">{datos.pintura_nombre}</p>
                          </div>
                        )}
                        {datos.consumo_estimado_kg && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Consumo Estimado</Label>
                            <p className="font-medium text-base">{datos.consumo_estimado_kg} kg</p>
                          </div>
                        )}
                        {datos.cantidad_lote && (
                          <div className="bg-slate-100 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad Lote Actual</Label>
                            <p className="font-medium text-lg">{datos.cantidad_lote} unidades</p>
                          </div>
                        )}
                        {datos.cantidad_facturada && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad Facturada</Label>
                            <p className="font-medium text-lg text-green-700">{datos.cantidad_facturada} unidades</p>
                          </div>
                        )}
                        {datos.cantidad_pendiente && (
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
                            <Label className="text-gray-500 text-xs block mb-1">Sin Facturar Restante</Label>
                            <p className="font-medium text-lg text-amber-700">{datos.cantidad_pendiente} unidades</p>
                          </div>
                        )}
                        {datos.cantidad_eliminada && (
                          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                            <Label className="text-gray-500 text-xs block mb-1">Sin Facturar Eliminada</Label>
                            <p className="font-medium text-lg text-red-700">{datos.cantidad_eliminada} unidades</p>
                          </div>
                        )}
                      </div>
                      {datos.motivo_eliminacion && (
                        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                          <Label className="text-gray-500 text-xs block mb-1">Motivo de Eliminación</Label>
                          <p className="font-medium text-base italic">&quot;{datos.motivo_eliminacion}&quot;</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Para UPDATE normal mostrar campos cambiados (no eliminación parcial) */}
              {selectedRecord.accion === "UPDATE" && selectedRecord.datos_anteriores && selectedRecord.datos_nuevos &&
               !(selectedRecord.datos_nuevos as Record<string, unknown>).cantidad_eliminada && (
                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-yellow-700 mb-3">Campos Modificados</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Valor Nuevo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getChangedFields(
                          selectedRecord.datos_anteriores,
                          selectedRecord.datos_nuevos
                        ).map((change, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{change.campo}</TableCell>
                            <TableCell className="text-red-600 bg-red-50">
                              {String(change.antes)}
                            </TableCell>
                            <TableCell className="text-green-600 bg-green-50">
                              {String(change.despues)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Datos Nuevos - Diseño bonito con tarjetas */}
              {selectedRecord.datos_nuevos && selectedRecord.accion === "INSERT" && (() => {
                const datos = getDatosNuevos(selectedRecord);
                if (!datos) return null;
                return (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Datos del Registro Creado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {datos.fecha && (
                          <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Fecha</Label>
                            <p className="font-medium text-base">{datos.fecha}</p>
                          </div>
                        )}
                        {datos.cantidad && (
                          <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad</Label>
                            <p className="font-medium text-lg">{datos.cantidad} unidades</p>
                          </div>
                        )}
                        {datos.pieza_nombre && (
                          <div className="bg-blue-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Pieza</Label>
                            <p className="font-medium text-base break-words">{datos.pieza_nombre}</p>
                          </div>
                        )}
                        {datos.cabina_nombre && (
                          <div className="bg-purple-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Cabina</Label>
                            <p className="font-medium text-base break-words">{datos.cabina_nombre}</p>
                          </div>
                        )}
                        {datos.pintura_nombre && (
                          <div className="bg-orange-50 p-4 rounded-lg min-h-[80px] md:col-span-2 lg:col-span-1">
                            <Label className="text-gray-500 text-xs block mb-1">Pintura</Label>
                            <p className="font-medium text-base break-words">{datos.pintura_nombre}</p>
                          </div>
                        )}
                        {datos.cantidad_facturada && (
                          <div className="bg-green-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad Facturada</Label>
                            <p className="font-medium text-base">{datos.cantidad_facturada}</p>
                          </div>
                        )}
                        {datos.consumo_estimado_kg && (
                          <div className="bg-yellow-50 p-4 rounded-lg min-h-[80px]">
                            <Label className="text-gray-500 text-xs block mb-1">Consumo Estimado</Label>
                            <p className="font-medium text-base">{datos.consumo_estimado_kg} kg</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Datos del registro eliminado (para DELETE - usa datos_nuevos) */}
              {selectedRecord.datos_nuevos && selectedRecord.accion === "DELETE" && (() => {
                const datos = getDatosEliminados(selectedRecord);
                if (!datos) return null;
                return (
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Datos del Registro Eliminado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {datos.fecha && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Fecha</Label>
                            <p className="font-medium text-base">{datos.fecha}</p>
                          </div>
                        )}
                        {datos.pieza_nombre && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Pieza</Label>
                            <p className="font-medium text-base break-words">{datos.pieza_nombre}</p>
                          </div>
                        )}
                        {datos.cabina_nombre && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cabina</Label>
                            <p className="font-medium text-base break-words">{datos.cabina_nombre}</p>
                          </div>
                        )}
                        {datos.pintura_nombre && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Pintura</Label>
                            <p className="font-medium text-base break-words">{datos.pintura_nombre}</p>
                          </div>
                        )}
                        {datos.consumo_estimado_kg && (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Consumo Estimado</Label>
                            <p className="font-medium text-base">{datos.consumo_estimado_kg} kg</p>
                          </div>
                        )}
                        {datos.cantidad_lote && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad Lote</Label>
                            <p className="font-medium text-lg">{datos.cantidad_lote} unidades</p>
                          </div>
                        )}
                        {datos.cantidad_facturada && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <Label className="text-gray-500 text-xs block mb-1">Cantidad Facturada</Label>
                            <p className="font-medium text-lg text-green-700">{datos.cantidad_facturada} unidades</p>
                          </div>
                        )}
                        {datos.cantidad_eliminada && (
                          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                            <Label className="text-gray-500 text-xs block mb-1">Sin Facturar Eliminada</Label>
                            <p className="font-medium text-lg text-red-700">{datos.cantidad_eliminada} unidades</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          /* Ocultar todo excepto el contenido del modal */
          body * {
            visibility: hidden;
          }
          
          /* Ocultar elementos de navegación y overlay */
          nav, header, aside, footer,
          [data-slot="dialog-overlay"],
          [data-slot="dialog-close"],
          .print\\:hidden {
            display: none !important;
          }
          
          /* Mostrar solo el contenido del detalle */
          #detalle-auditoria,
          #detalle-auditoria * {
            visibility: visible;
          }
          
          #detalle-auditoria {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 15px !important;
            margin: 0 !important;
            transform: none !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Forzar layout vertical en todos los grids */
          #detalle-auditoria .grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          #detalle-auditoria .grid > * {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Tarjetas más compactas */
          #detalle-auditoria [class*="Card"],
          #detalle-auditoria [class*="card"] {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            margin-bottom: 8px !important;
          }
          
          #detalle-auditoria [class*="CardContent"] {
            padding: 10px !important;
          }
          
          /* Espaciado reducido */
          #detalle-auditoria .space-y-6 > * {
            margin-top: 12px !important;
          }
          
          #detalle-auditoria .space-y-6 > *:first-child {
            margin-top: 0 !important;
          }
          
          /* Items dentro de grids en línea para ahorrar espacio */
          #detalle-auditoria .bg-gray-50,
          #detalle-auditoria .bg-green-50,
          #detalle-auditoria .bg-red-50 {
            padding: 8px !important;
            min-height: auto !important;
          }
          
          /* Tablas legibles */
          #detalle-auditoria table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          
          #detalle-auditoria th,
          #detalle-auditoria td {
            border: 1px solid #d1d5db !important;
            padding: 6px 8px !important;
            font-size: 11px !important;
            text-align: left !important;
          }
          
          #detalle-auditoria th {
            background-color: #f3f4f6 !important;
            font-weight: 600 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Colores de fondo para impresión */
          #detalle-auditoria .bg-green-100,
          #detalle-auditoria .bg-green-50 {
            background-color: #dcfce7 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #detalle-auditoria .bg-red-100,
          #detalle-auditoria .bg-red-50 {
            background-color: #fee2e2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #detalle-auditoria .bg-yellow-100,
          #detalle-auditoria .bg-yellow-50 {
            background-color: #fef9c3 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #detalle-auditoria .bg-blue-100,
          #detalle-auditoria .bg-blue-50 {
            background-color: #dbeafe !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          #detalle-auditoria .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Bordes de tarjetas con color */
          #detalle-auditoria .border-l-blue-500 {
            border-left: 4px solid #3b82f6 !important;
          }
          
          #detalle-auditoria .border-l-green-500 {
            border-left: 4px solid #22c55e !important;
          }
          
          #detalle-auditoria .border-l-yellow-500 {
            border-left: 4px solid #eab308 !important;
          }
          
          #detalle-auditoria .border-l-red-500 {
            border-left: 4px solid #ef4444 !important;
          }
          
          /* Títulos más pequeños */
          #detalle-auditoria h3 {
            font-size: 13px !important;
            margin-bottom: 8px !important;
          }
          
          #detalle-auditoria [class*="DialogTitle"] {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          
          /* Labels y textos */
          #detalle-auditoria label,
          #detalle-auditoria .text-xs {
            font-size: 10px !important;
          }
          
          #detalle-auditoria p {
            font-size: 12px !important;
          }
          
          /* Página configuración vertical */
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
