"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedPage from "@/components/ProtectedPage";
import { PermisosProvider, Protegido, usePermisos } from "@/components/PermisosContext";

// ==========================================
// TIPOS
// ==========================================
type Pistola = {
  id_pistola: number;
  nombre: string;
  descripcion: string | null;
  horas_uso: number;
  horas_mantenimiento: number;
  ultimo_mantenimiento: string | null;
  estado: "activa" | "mantenimiento" | "inactiva";
  porcentaje_mantenimiento?: number;
  alerta_mantenimiento?: string;
};

type Horno = {
  id_horno: number;
  nombre: string;
  descripcion: string | null;
  horas_uso: number;
  horas_mantenimiento: number;
  temperatura_max: number;
  gasto_gas_hora: number;
  ultimo_mantenimiento: string | null;
  estado: "activo" | "mantenimiento" | "inactivo";
  porcentaje_mantenimiento?: number;
  alerta_mantenimiento?: string;
};

type Cabina = {
  id_cabina: number;
  nombre: string;
  descripcion: string | null;
  max_piezas_diarias: number;
  piezas_hoy: number;
  estado: "activa" | "mantenimiento" | "inactiva";
  porcentaje_uso?: number;
  pistolas: Pistola[];
  hornos: Horno[];
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function MaquinariasPageProtected() {
  return (
    <ProtectedPage ruta="/dashboard/maquinarias">
      <PermisosProvider ruta="/dashboard/maquinarias">
        <MaquinariasPage />
      </PermisosProvider>
    </ProtectedPage>
  );
}

function MaquinariasPage() {
  const router = useRouter();
  const { tienePermisoNombre, cargando: cargandoPermisos } = usePermisos();
  const [activeTab, setActiveTab] = useState<"cabinas" | "pistolas" | "hornos" | null>(null);
  
  // Estados para cabinas
  const [cabinas, setCabinas] = useState<Cabina[]>([]);
  const [pistolas, setPistolas] = useState<Pistola[]>([]);
  const [hornos, setHornos] = useState<Horno[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalCabinaOpen, setModalCabinaOpen] = useState(false);
  const [modalPistolaOpen, setModalPistolaOpen] = useState(false);
  const [modalHornoOpen, setModalHornoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cabina | Pistola | Horno | null>(null);

  // Seleccionar el primer tab disponible según permisos
  useEffect(() => {
    if (!cargandoPermisos && activeTab === null) {
      if (tienePermisoNombre("Tab Cabinas")) {
        setActiveTab("cabinas");
      } else if (tienePermisoNombre("Tab Pistolas")) {
        setActiveTab("pistolas");
      } else if (tienePermisoNombre("Tab Hornos")) {
        setActiveTab("hornos");
      }
    }
  }, [cargandoPermisos, activeTab, tienePermisoNombre]);

  // Formularios
  const [cabinaForm, setCabinaForm] = useState({
    nombre: "",
    descripcion: "",
    max_piezas_diarias: 200,
    pistolas_ids: [] as number[],
    hornos_ids: [] as number[],
  });

  const [pistolaForm, setPistolaForm] = useState({
    nombre: "",
    descripcion: "",
    horas_mantenimiento: 500,
  });

  const [hornoForm, setHornoForm] = useState({
    nombre: "",
    descripcion: "",
    horas_mantenimiento: 1000,
    temperatura_max: 200,
    gasto_gas_hora: 5,
  });

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [cabinasRes, pistolasRes, hornosRes] = await Promise.all([
        fetch("/api/cabinas"),
        fetch("/api/pistolas"),
        fetch("/api/hornos"),
      ]);

      if (cabinasRes.ok) setCabinas(await cabinasRes.json());
      if (pistolasRes.ok) setPistolas(await pistolasRes.json());
      if (hornosRes.ok) setHornos(await hornosRes.json());
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLERS CABINAS
  // ==========================================
  const handleCrearCabina = async () => {
    try {
      const res = await fetch("/api/cabinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cabinaForm),
      });

      if (res.ok) {
        setModalCabinaOpen(false);
        setCabinaForm({ nombre: "", descripcion: "", max_piezas_diarias: 200, pistolas_ids: [], hornos_ids: [] });
        cargarDatos();
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear cabina");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditarCabina = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/cabinas/${(editingItem as Cabina).id_cabina}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cabinaForm),
      });

      if (res.ok) {
        setModalCabinaOpen(false);
        setEditingItem(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEliminarCabina = async (id: number) => {
    if (!confirm("¿Eliminar esta cabina?")) return;
    try {
      const res = await fetch(`/api/cabinas/${id}`, { method: "DELETE" });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ==========================================
  // HANDLERS PISTOLAS
  // ==========================================
  const handleCrearPistola = async () => {
    try {
      const res = await fetch("/api/pistolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pistolaForm),
      });

      if (res.ok) {
        setModalPistolaOpen(false);
        setPistolaForm({ nombre: "", descripcion: "", horas_mantenimiento: 500 });
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMantenimientoPistola = async (id: number) => {
    if (!confirm("¿Registrar mantenimiento? Esto reseteará las horas de uso.")) return;
    try {
      const res = await fetch(`/api/pistolas/${id}/mantenimiento`, { method: "POST" });
      if (res.ok) {
        alert("Mantenimiento registrado");
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditarPistola = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/pistolas/${(editingItem as Pistola).id_pistola}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pistolaForm),
      });

      if (res.ok) {
        setModalPistolaOpen(false);
        setEditingItem(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEliminarPistola = async (id: number) => {
    if (!confirm("¿Eliminar esta pistola?")) return;
    try {
      const res = await fetch(`/api/pistolas/${id}`, { method: "DELETE" });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ==========================================
  // HANDLERS HORNOS
  // ==========================================
  const handleCrearHorno = async () => {
    try {
      const res = await fetch("/api/hornos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hornoForm),
      });

      if (res.ok) {
        setModalHornoOpen(false);
        setHornoForm({ nombre: "", descripcion: "", horas_mantenimiento: 1000, temperatura_max: 200, gasto_gas_hora: 5 });
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMantenimientoHorno = async (id: number) => {
    if (!confirm("¿Registrar mantenimiento? Esto reseteará las horas de uso.")) return;
    try {
      const res = await fetch(`/api/hornos/${id}/mantenimiento`, { method: "POST" });
      if (res.ok) {
        alert("Mantenimiento registrado");
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditarHorno = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/hornos/${(editingItem as Horno).id_horno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hornoForm),
      });

      if (res.ok) {
        setModalHornoOpen(false);
        setEditingItem(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEliminarHorno = async (id: number) => {
    if (!confirm("¿Eliminar este horno?")) return;
    try {
      const res = await fetch(`/api/hornos/${id}`, { method: "DELETE" });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activa":
      case "activo":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "mantenimiento":
        return <Badge className="bg-yellow-500">Mantenimiento</Badge>;
      case "inactiva":
      case "inactivo":
        return <Badge className="bg-red-500">Inactiva</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getAlertaBadge = (alerta: string) => {
    switch (alerta) {
      case "URGENTE":
        return <Badge className="bg-red-600">⚠️ URGENTE</Badge>;
      case "PRONTO":
        return <Badge className="bg-yellow-500">⚡ Pronto</Badge>;
      default:
        return <Badge className="bg-green-500">✓ OK</Badge>;
    }
  };

  const getProgressColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "bg-red-500";
    if (porcentaje >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading || cargandoPermisos) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Maquinaria</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Protegido nombre="Tab Cabinas">
          <Button
            variant={activeTab === "cabinas" ? "default" : "outline"}
            onClick={() => setActiveTab("cabinas")}
          >
            Cabinas ({cabinas.length})
          </Button>
        </Protegido>
        <Protegido nombre="Tab Pistolas">
          <Button
            variant={activeTab === "pistolas" ? "default" : "outline"}
            onClick={() => setActiveTab("pistolas")}
          >
            Pistolas ({pistolas.length})
          </Button>
        </Protegido>
        <Protegido nombre="Tab Hornos">
          <Button
            variant={activeTab === "hornos" ? "default" : "outline"}
            onClick={() => setActiveTab("hornos")}
          >
            Hornos ({hornos.length})
          </Button>
        </Protegido>
      </div>

      {/* ==========================================
          TAB: CABINAS
          ========================================== */}
      {activeTab === "cabinas" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cabinas de Pintura</h2>
            <Protegido nombre="Formulario Nueva Cabina">
              <Button onClick={() => {
                setEditingItem(null);
                setCabinaForm({ nombre: "", descripcion: "", max_piezas_diarias: 200, pistolas_ids: [], hornos_ids: [] });
                setModalCabinaOpen(true);
              }}>
                + Nueva Cabina
              </Button>
            </Protegido>
          </div>

          <Protegido nombre="Ver Cards Cabinas" fallback={
            <p className="text-gray-500 text-center py-8">No tienes permiso para ver las cabinas.</p>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cabinas.map((cabina) => (
                <Card key={cabina.id_cabina} className="shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cabina.nombre}</CardTitle>
                      {getEstadoBadge(cabina.estado)}
                    </div>
                    <p className="text-sm text-gray-500">{cabina.descripcion || "Sin descripción"}</p>
                  </CardHeader>
                  <CardContent>
                    {/* Barra de progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uso diario</span>
                        <span>{cabina.piezas_hoy} / {cabina.max_piezas_diarias} piezas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getProgressColor(Number(cabina.porcentaje_uso) || 0)}`}
                          style={{ width: `${Math.min(Number(cabina.porcentaje_uso) || 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-right text-sm mt-1">{Number(cabina.porcentaje_uso)?.toFixed(1) || 0}%</p>
                    </div>

                    {/* Equipos asignados */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-sm font-medium">Pistolas: </span>
                        {cabina.pistolas?.length > 0 ? (
                          cabina.pistolas.map(p => (
                            <Badge key={p.id_pistola} variant="outline" className="mr-1">
                              {p.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Sin asignar</span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium">Hornos: </span>
                        {cabina.hornos?.length > 0 ? (
                          cabina.hornos.map(h => (
                            <Badge key={h.id_horno} variant="outline" className="mr-1">
                              {h.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Sin asignar</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Protegido nombre="Botón Editar Cabina">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(cabina);
                            setCabinaForm({
                              nombre: cabina.nombre,
                              descripcion: cabina.descripcion || "",
                              max_piezas_diarias: cabina.max_piezas_diarias,
                              pistolas_ids: cabina.pistolas?.map(p => p.id_pistola) || [],
                              hornos_ids: cabina.hornos?.map(h => h.id_horno) || [],
                            });
                            setModalCabinaOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </Protegido>
                      <Protegido nombre="Botón Eliminar Cabina">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEliminarCabina(cabina.id_cabina)}
                        >
                          Eliminar
                        </Button>
                      </Protegido>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Protegido>
        </div>
      )}

      {/* ==========================================
          TAB: PISTOLAS
          ========================================== */}
      {activeTab === "pistolas" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pistolas de Pintura</h2>
            <Protegido nombre="Formulario Nueva Pistola">
              <Button onClick={() => {
                setEditingItem(null);
                setPistolaForm({ nombre: "", descripcion: "", horas_mantenimiento: 100 });
                setModalPistolaOpen(true);
              }}>
                + Nueva Pistola
              </Button>
            </Protegido>
          </div>

          <Protegido nombre="Ver Cards Pistolas" fallback={
            <p className="text-gray-500 text-center py-8">No tienes permiso para ver las pistolas.</p>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pistolas.map((pistola) => (
                <Card key={pistola.id_pistola} className="shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{pistola.nombre}</CardTitle>
                      <div className="flex gap-1">
                        {getEstadoBadge(pistola.estado)}
                        {getAlertaBadge(pistola.alerta_mantenimiento || "OK")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Horas de uso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Horas de uso</span>
                        <span>{Number(pistola.horas_uso || 0).toFixed(1)} / {pistola.horas_mantenimiento} hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getProgressColor(Number(pistola.porcentaje_mantenimiento) || 0)}`}
                          style={{ width: `${Math.min(Number(pistola.porcentaje_mantenimiento) || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      Último mantenimiento: {pistola.ultimo_mantenimiento || "Nunca"}
                    </p>

                    <div className="flex gap-2 mb-2">
                      <Protegido nombre="Botón Editar Pistola">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(pistola);
                            setPistolaForm({
                              nombre: pistola.nombre,
                              descripcion: pistola.descripcion || "",
                              horas_mantenimiento: pistola.horas_mantenimiento,
                            });
                            setModalPistolaOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </Protegido>
                      <Protegido nombre="Botón Eliminar Pistola">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEliminarPistola(pistola.id_pistola)}
                        >
                          Eliminar
                        </Button>
                      </Protegido>
                    </div>

                    <Protegido nombre="Botón Registrar Mantenimiento Pistola">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleMantenimientoPistola(pistola.id_pistola)}
                      >
                        🔧 Registrar Mantenimiento
                      </Button>
                    </Protegido>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Protegido>
        </div>
      )}

      {/* ==========================================
          TAB: HORNOS
          ========================================== */}
      {activeTab === "hornos" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hornos de Secado</h2>
            <Protegido nombre="Formulario Nuevo Horno">
              <Button onClick={() => {
                setEditingItem(null);
                setHornoForm({ nombre: "", descripcion: "", horas_mantenimiento: 500, temperatura_max: 200, gasto_gas_hora: 5 });
                setModalHornoOpen(true);
              }}>
                + Nuevo Horno
              </Button>
            </Protegido>
          </div>

          <Protegido nombre="Ver Cards Hornos" fallback={
            <p className="text-gray-500 text-center py-8">No tienes permiso para ver los hornos.</p>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hornos.map((horno) => (
                <Card key={horno.id_horno} className="shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{horno.nombre}</CardTitle>
                      <div className="flex gap-1">
                        {getEstadoBadge(horno.estado)}
                        {getAlertaBadge(horno.alerta_mantenimiento || "OK")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Horas de uso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Horas de uso</span>
                        <span>{Number(horno.horas_uso || 0).toFixed(1)} / {horno.horas_mantenimiento} hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getProgressColor(Number(horno.porcentaje_mantenimiento) || 0)}`}
                          style={{ width: `${Math.min(Number(horno.porcentaje_mantenimiento) || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Temp. máx:</span>
                        <span className="ml-1 font-medium">{horno.temperatura_max}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gas/hora:</span>
                        <span className="ml-1 font-medium">{horno.gasto_gas_hora} m³</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <Protegido nombre="Botón Editar Horno">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(horno);
                            setHornoForm({
                              nombre: horno.nombre,
                              descripcion: horno.descripcion || "",
                              horas_mantenimiento: horno.horas_mantenimiento,
                              temperatura_max: horno.temperatura_max,
                              gasto_gas_hora: horno.gasto_gas_hora,
                            });
                            setModalHornoOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </Protegido>
                      <Protegido nombre="Botón Eliminar Horno">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEliminarHorno(horno.id_horno)}
                        >
                          Eliminar
                        </Button>
                      </Protegido>
                    </div>

                    <Protegido nombre="Botón Registrar Mantenimiento Horno">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleMantenimientoHorno(horno.id_horno)}
                      >
                        🔧 Registrar Mantenimiento
                      </Button>
                    </Protegido>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Protegido>
        </div>
      )}

      {/* ==========================================
          MODAL: NUEVA/EDITAR CABINA
          ========================================== */}
      <Dialog open={modalCabinaOpen} onOpenChange={setModalCabinaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Cabina" : "Nueva Cabina"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={cabinaForm.nombre}
                onChange={(e) => setCabinaForm({ ...cabinaForm, nombre: e.target.value })}
                placeholder="Ej: Cabina A1"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={cabinaForm.descripcion}
                onChange={(e) => setCabinaForm({ ...cabinaForm, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <div>
              <Label>Máximo piezas diarias</Label>
              <Input
                type="number"
                value={cabinaForm.max_piezas_diarias}
                onChange={(e) => setCabinaForm({ ...cabinaForm, max_piezas_diarias: Number(e.target.value) })}
              />
            </div>

            {/* Selección de pistolas */}
            <div>
              <Label className="mb-2 block">Pistolas asignadas</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {pistolas.map((p) => (
                  <div key={p.id_pistola} className="flex items-center gap-2">
                    <Checkbox
                      checked={cabinaForm.pistolas_ids.includes(p.id_pistola)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCabinaForm({
                            ...cabinaForm,
                            pistolas_ids: [...cabinaForm.pistolas_ids, p.id_pistola],
                          });
                        } else {
                          setCabinaForm({
                            ...cabinaForm,
                            pistolas_ids: cabinaForm.pistolas_ids.filter((id) => id !== p.id_pistola),
                          });
                        }
                      }}
                    />
                    <span>{p.nombre}</span>
                    {p.estado !== "activa" && <Badge variant="outline">{p.estado}</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {/* Selección de hornos */}
            <div>
              <Label className="mb-2 block">Hornos asignados</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {hornos.map((h) => (
                  <div key={h.id_horno} className="flex items-center gap-2">
                    <Checkbox
                      checked={cabinaForm.hornos_ids.includes(h.id_horno)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCabinaForm({
                            ...cabinaForm,
                            hornos_ids: [...cabinaForm.hornos_ids, h.id_horno],
                          });
                        } else {
                          setCabinaForm({
                            ...cabinaForm,
                            hornos_ids: cabinaForm.hornos_ids.filter((id) => id !== h.id_horno),
                          });
                        }
                      }}
                    />
                    <span>{h.nombre}</span>
                    {h.estado !== "activo" && <Badge variant="outline">{h.estado}</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={editingItem ? handleEditarCabina : handleCrearCabina}
            >
              {editingItem ? "Guardar Cambios" : "Crear Cabina"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: NUEVA/EDITAR PISTOLA
          ========================================== */}
      <Dialog open={modalPistolaOpen} onOpenChange={setModalPistolaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Pistola" : "Nueva Pistola"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={pistolaForm.nombre}
                onChange={(e) => setPistolaForm({ ...pistolaForm, nombre: e.target.value })}
                placeholder="Ej: Pistola Automática P1"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={pistolaForm.descripcion}
                onChange={(e) => setPistolaForm({ ...pistolaForm, descripcion: e.target.value })}
              />
            </div>
            <div>
              <Label>Horas entre mantenimientos</Label>
              <Input
                type="number"
                value={pistolaForm.horas_mantenimiento}
                onChange={(e) => setPistolaForm({ ...pistolaForm, horas_mantenimiento: Number(e.target.value) })}
              />
            </div>
            <Button className="w-full" onClick={editingItem ? handleEditarPistola : handleCrearPistola}>
              {editingItem ? "Guardar Cambios" : "Crear Pistola"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL: NUEVO/EDITAR HORNO
          ========================================== */}
      <Dialog open={modalHornoOpen} onOpenChange={setModalHornoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Horno" : "Nuevo Horno"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={hornoForm.nombre}
                onChange={(e) => setHornoForm({ ...hornoForm, nombre: e.target.value })}
                placeholder="Ej: Horno Industrial H1"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={hornoForm.descripcion}
                onChange={(e) => setHornoForm({ ...hornoForm, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horas entre mantenimientos</Label>
                <Input
                  type="number"
                  value={hornoForm.horas_mantenimiento}
                  onChange={(e) => setHornoForm({ ...hornoForm, horas_mantenimiento: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Temperatura máx (°C)</Label>
                <Input
                  type="number"
                  value={hornoForm.temperatura_max}
                  onChange={(e) => setHornoForm({ ...hornoForm, temperatura_max: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Consumo gas (m³/hora)</Label>
              <Input
                type="number"
                step="0.1"
                value={hornoForm.gasto_gas_hora}
                onChange={(e) => setHornoForm({ ...hornoForm, gasto_gas_hora: Number(e.target.value) })}
              />
            </div>
            <Button className="w-full" onClick={editingItem ? handleEditarHorno : handleCrearHorno}>
              {editingItem ? "Guardar Cambios" : "Crear Horno"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
