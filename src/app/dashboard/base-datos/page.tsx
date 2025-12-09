"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
} from "@/components/ui/dialog";
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";

interface PoliticaBackup {
  id_politica: number;
  nombre: string;
  tipo: "completo" | "parcial" | "incremental";
  tablas_seleccionadas: string | null;
  frecuencia: string;
  hora_ejecucion: string;
  dia_semana: number | null;
  dia_mes: number | null;
  activa: boolean;
  ultima_ejecucion: string | null;
  proxima_ejecucion: string | null;
  created_at: string;
}

interface HistorialBackup {
  id_historial: number;
  id_politica: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: "en_progreso" | "completado" | "fallido";
  archivo_generado: string | null;
  tamano_bytes: number | null;
  tablas_respaldadas: string | null;
  mensaje_error: string | null;
  politica_nombre: string;
  politica_tipo: string;
}

const TABLAS_DISPONIBLES = [
  "usuario",
  "grupo",
  "componente",
  "formulario",
  "modulo",
  "grupocomponente",
  "grupousuario",
  "cliente",
  "proveedor",
  "pieza",
  "pintura",
  "piezapintada",
  "remito",
  "remitodetalle",
  "factura",
  "facturadetalle",
  "cabina",
  "pistola",
  "horno",
  "cabinahistorial",
  "empleado",
  "asistencia",
  "recibo_sueldo",
  "auditoriasesion",
];

const FRECUENCIAS = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "unico", label: "Único (una sola vez)" },
];

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

function PanelBaseDatosContent() {
  const router = useRouter();
  const [politicas, setPoliticas] = useState<PoliticaBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [historial, setHistorial] = useState<HistorialBackup[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "completo" as "completo" | "parcial" | "incremental",
    frecuencia: "diario",
    hora_ejecucion: "02:00",
    dia_semana: 1,
    dia_mes: 1,
    tablas_seleccionadas: [] as string[],
  });

  useEffect(() => {
    cargarPoliticas();
    cargarHistorial();
  }, []);

  async function cargarPoliticas() {
    try {
      setLoading(true);
      const res = await fetch("/api/backup/politicas");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar políticas");
      }
      const data = await res.json();
      setPoliticas(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function cargarHistorial(tipo?: string, idPolitica?: number) {
    try {
      setHistorialLoading(true);
      let url = "/api/backup/historial";
      const params = new URLSearchParams();
      
      if (tipo && tipo !== "todos") {
        params.append("tipo", tipo);
      }
      if (idPolitica) {
        params.append("id_politica", idPolitica.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setHistorialLoading(false);
    }
  }

  function abrirHistorial(tipo?: string, idPolitica?: number) {
    if (tipo) {
      setFiltroTipo(tipo);
    }
    cargarHistorial(tipo, idPolitica);
  }

  function formatBytes(bytes: number | null): string {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function limpiarFormulario() {
    setFormData({
      nombre: "",
      tipo: "completo",
      frecuencia: "diario",
      hora_ejecucion: "02:00",
      dia_semana: 1,
      dia_mes: 1,
      tablas_seleccionadas: [],
    });
  }

  async function handleAgregarPolitica(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      if (!formData.nombre.trim()) {
        throw new Error("El nombre de la política es requerido");
      }

      if (formData.tipo === "parcial" && formData.tablas_seleccionadas.length === 0) {
        throw new Error("Debe seleccionar al menos una tabla para backup parcial");
      }

      const payload = {
        ...formData,
        tablas_seleccionadas: formData.tipo === "parcial" 
          ? formData.tablas_seleccionadas.join(",") 
          : null,
        dia_semana: formData.frecuencia === "semanal" ? formData.dia_semana : null,
        dia_mes: formData.frecuencia === "mensual" ? formData.dia_mes : null,
      };

      const res = await fetch("/api/backup/politicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear política");
      }

      setSuccess("Política de backup creada exitosamente");
      setModalOpen(false);
      limpiarFormulario();
      cargarPoliticas();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActiva(politica: PoliticaBackup) {
    try {
      const res = await fetch(`/api/backup/politicas/${politica.id_politica}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !politica.activa }),
      });

      if (!res.ok) throw new Error("Error al actualizar política");
      cargarPoliticas();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function eliminarPolitica(id: number) {
    if (!confirm("¿Está seguro de eliminar esta política?")) return;

    try {
      const res = await fetch(`/api/backup/politicas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar política");
      cargarPoliticas();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function ejecutarBackupManual(politica: PoliticaBackup) {
    if (!confirm(`¿Ejecutar backup "${politica.nombre}" ahora?`)) return;

    try {
      setSuccess(`Ejecutando backup "${politica.nombre}"...`);
      const res = await fetch(`/api/backup/ejecutar/${politica.id_politica}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al ejecutar backup");
      
      const data = await res.json();
      setSuccess(`Backup ejecutado exitosamente: ${data.archivo}`);
      cargarPoliticas();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleTablaChange(tabla: string, checked: boolean) {
    setFormData(prev => ({
      ...prev,
      tablas_seleccionadas: checked
        ? [...prev.tablas_seleccionadas, tabla]
        : prev.tablas_seleccionadas.filter(t => t !== tabla)
    }));
  }

  function getTipoBadge(tipo: string) {
    switch (tipo) {
      case "completo":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Completo</span>;
      case "parcial":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Parcial</span>;
      case "incremental":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Incremental</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{tipo}</span>;
    }
  }

  function getFrecuenciaTexto(politica: PoliticaBackup) {
    switch (politica.frecuencia) {
      case "diario":
        return `Diario a las ${politica.hora_ejecucion}`;
      case "semanal":
        const dia = DIAS_SEMANA.find(d => d.value === politica.dia_semana);
        return `Semanal (${dia?.label}) a las ${politica.hora_ejecucion}`;
      case "mensual":
        return `Mensual (día ${politica.dia_mes}) a las ${politica.hora_ejecucion}`;
      case "unico":
        return `Único a las ${politica.hora_ejecucion}`;
      default:
        return politica.frecuencia;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de Base de Datos</h1>
            <p className="text-gray-600">Gestión de políticas de backup</p>
          </div>
          <div className="flex gap-2">
            <ProtectedComponent componenteId={131}>
              <Button onClick={() => setModalOpen(true)}>
                + Nueva Política
              </Button>
            </ProtectedComponent>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Grid de Políticas */}
        <Card>
          <CardHeader>
            <CardTitle>Políticas de Backup Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <ProtectedComponent componenteId={132}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Tablas</TableHead>
                    <TableHead>Última Ejecución</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {politicas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay políticas de backup configuradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    politicas.map((politica) => (
                      <TableRow key={politica.id_politica}>
                        <TableCell className="font-medium">{politica.nombre}</TableCell>
                        <TableCell>{getTipoBadge(politica.tipo)}</TableCell>
                        <TableCell>{getFrecuenciaTexto(politica)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {politica.tipo === "parcial" && politica.tablas_seleccionadas
                            ? politica.tablas_seleccionadas.split(",").slice(0, 3).join(", ") + 
                              (politica.tablas_seleccionadas.split(",").length > 3 ? "..." : "")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {politica.ultima_ejecucion 
                            ? new Date(politica.ultima_ejecucion).toLocaleString("es-AR")
                            : "Nunca"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            politica.activa 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {politica.activa ? "Activa" : "Inactiva"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <ProtectedComponent componenteId={133}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ejecutarBackupManual(politica)}
                              >
                                Ejecutar
                              </Button>
                            </ProtectedComponent>
                            <ProtectedComponent componenteId={134}>
                              <Button
                                size="sm"
                                variant={politica.activa ? "secondary" : "default"}
                                onClick={() => toggleActiva(politica)}
                              >
                                {politica.activa ? "Desactivar" : "Activar"}
                              </Button>
                            </ProtectedComponent>
                            <ProtectedComponent componenteId={135}>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => eliminarPolitica(politica.id_politica)}
                              >
                                Eliminar
                              </Button>
                            </ProtectedComponent>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirHistorial(undefined, politica.id_politica)}
                            >
                              Historial
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ProtectedComponent>
          </CardContent>
        </Card>

        {/* Sección Historial de Backups */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Historial de Backups</CardTitle>
              <div className="flex gap-2 items-center">
                <Label className="text-sm">Filtrar por tipo:</Label>
                <Select
                  value={filtroTipo}
                  onValueChange={(v) => {
                    setFiltroTipo(v);
                    abrirHistorial(v === "todos" ? undefined : v);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="completo">Completo</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirHistorial(filtroTipo === "todos" ? undefined : filtroTipo)}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {historialLoading ? (
              <p className="text-center py-4">Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No hay backups en el historial</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Política</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tamaño</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historial.map((h) => (
                    <TableRow key={h.id_historial}>
                      <TableCell className="font-medium">{h.politica_nombre}</TableCell>
                      <TableCell>{getTipoBadge(h.politica_tipo)}</TableCell>
                      <TableCell>
                        {new Date(h.fecha_inicio).toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell>
                        {h.fecha_fin ? new Date(h.fecha_fin).toLocaleString("es-AR") : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          h.estado === "completado"
                            ? "bg-green-100 text-green-800"
                            : h.estado === "fallido"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {h.estado === "completado" ? "Completado" : 
                           h.estado === "fallido" ? "Fallido" : "En progreso"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={h.archivo_generado || ""}>
                        {h.archivo_generado || "-"}
                      </TableCell>
                      <TableCell>{formatBytes(h.tamano_bytes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal Nueva Política */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Política de Backup</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAgregarPolitica}>
              <div className="grid gap-6 py-4">
                {/* Nombre */}
                <div>
                  <Label htmlFor="nombre">Nombre de la Política *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Backup diario completo"
                    className="mt-1"
                  />
                </div>

                {/* Tipo y Frecuencia en grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Backup *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completo">Backup Completo</SelectItem>
                        <SelectItem value="parcial">Backup Parcial</SelectItem>
                        <SelectItem value="incremental">Backup Incremental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Frecuencia *</Label>
                    <Select
                      value={formData.frecuencia}
                      onValueChange={(v) => setFormData({ ...formData, frecuencia: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRECUENCIAS.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Programación */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Hora de Ejecución *</Label>
                    <Input
                      type="time"
                      value={formData.hora_ejecucion}
                      onChange={(e) => setFormData({ ...formData, hora_ejecucion: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {formData.frecuencia === "semanal" && (
                    <div>
                      <Label>Día de la Semana</Label>
                      <Select
                        value={formData.dia_semana.toString()}
                        onValueChange={(v) => setFormData({ ...formData, dia_semana: parseInt(v) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA.map(d => (
                            <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.frecuencia === "mensual" && (
                    <div>
                      <Label>Día del Mes</Label>
                      <Select
                        value={formData.dia_mes.toString()}
                        onValueChange={(v) => setFormData({ ...formData, dia_mes: parseInt(v) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                            <SelectItem key={d} value={d.toString()}>Día {d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Selección de tablas para backup parcial */}
                {formData.tipo === "parcial" && (
                  <div>
                    <Label className="mb-2 block">Tablas a respaldar *</Label>
                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2">
                        {TABLAS_DISPONIBLES.map(tabla => (
                          <div key={tabla} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tabla-${tabla}`}
                              checked={formData.tablas_seleccionadas.includes(tabla)}
                              onCheckedChange={(checked) => handleTablaChange(tabla, checked as boolean)}
                            />
                            <label
                              htmlFor={`tabla-${tabla}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {tabla}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Seleccionadas: {formData.tablas_seleccionadas.length} tablas
                    </p>
                  </div>
                )}

                {/* Info adicional según tipo */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="font-medium mb-2">Información del tipo seleccionado:</h4>
                  {formData.tipo === "completo" && (
                    <p className="text-sm text-gray-600">
                      El backup completo respalda todas las tablas de la base de datos, incluyendo estructura y datos.
                    </p>
                  )}
                  {formData.tipo === "parcial" && (
                    <p className="text-sm text-gray-600">
                      El backup parcial solo respalda las tablas seleccionadas. Útil para respaldos específicos de áreas del sistema.
                    </p>
                  )}
                  {formData.tipo === "incremental" && (
                    <p className="text-sm text-gray-600">
                      El backup incremental solo respalda los cambios desde el último backup. Requiere un backup completo previo.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Agregar Política"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function PanelBaseDatosPage() {
  return (
    <ProtectedPage ruta="/dashboard/base-datos">
      <PanelBaseDatosContent />
    </ProtectedPage>
  );
}
