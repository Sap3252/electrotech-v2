"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  funcion: string | null;
  telefono: string | null;
  dni: string | null;
  direccion: string | null;
  salario_base: number;
  fecha_ingreso: string | null;
  activo: boolean;
  dias_trabajados?: number;
  dias_ausentes?: number;
}

interface EmpleadoForm {
  nombre: string;
  apellido: string;
  funcion: string;
  telefono: string;
  dni: string;
  direccion: string;
  salario_base: string;
  fecha_ingreso: string;
}

const initialForm: EmpleadoForm = {
  nombre: "",
  apellido: "",
  funcion: "",
  telefono: "",
  dni: "",
  direccion: "",
  salario_base: "",
  fecha_ingreso: "",
};

export default function EmpleadosPage() {
  const router = useRouter();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroActivos, setFiltroActivos] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"crear" | "editar">("crear");
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [form, setForm] = useState<EmpleadoForm>(initialForm);
  const [saving, setSaving] = useState(false);

  // Confirmar eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(null);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  async function cargarEmpleados() {
    try {
      setLoading(true);
      const res = await fetch("/api/empleados");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar empleados");
      }
      const data = await res.json();
      setEmpleados(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalCrear() {
    setForm(initialForm);
    setSelectedEmpleado(null);
    setModalMode("crear");
    setModalOpen(true);
  }

  function abrirModalEditar(empleado: Empleado) {
    setSelectedEmpleado(empleado);
    setForm({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      funcion: empleado.funcion || "",
      telefono: empleado.telefono || "",
      dni: empleado.dni || "",
      direccion: empleado.direccion || "",
      salario_base: empleado.salario_base?.toString() || "",
      fecha_ingreso: empleado.fecha_ingreso ? empleado.fecha_ingreso.split("T")[0] : "",
    });
    setModalMode("editar");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        funcion: form.funcion || null,
        telefono: form.telefono || null,
        dni: form.dni,
        direccion: form.direccion || null,
        salario_base: form.salario_base ? parseFloat(form.salario_base) : 0,
        fecha_ingreso: form.fecha_ingreso || null,
      };

      let res: Response;

      if (modalMode === "crear") {
        res = await fetch("/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/empleados/${selectedEmpleado?.id_empleado}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar empleado");
      }

      setModalOpen(false);
      cargarEmpleados();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!empleadoToDelete) return;

    try {
      const res = await fetch(`/api/empleados/${empleadoToDelete.id_empleado}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al desactivar empleado");
      }

      setDeleteModalOpen(false);
      setEmpleadoToDelete(null);
      cargarEmpleados();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function reactivarEmpleado(empleado: Empleado) {
    try {
      const res = await fetch(`/api/empleados/${empleado.id_empleado}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: true }),
      });

      if (!res.ok) {
        throw new Error("Error al reactivar empleado");
      }

      cargarEmpleados();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((emp) => {
    const matchActivo = filtroActivos ? emp.activo : true;
    const matchBusqueda =
      busqueda === "" ||
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.dni?.toLowerCase().includes(busqueda.toLowerCase());
    return matchActivo && matchBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <ProtectedPage ruta="/dashboard/empleados">
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            ← Volver al Dashboard
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filtroActivos"
                  checked={filtroActivos}
                  onChange={(e) => setFiltroActivos(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="filtroActivos">Solo activos</Label>
              </div>
              <ProtectedComponent componenteId={71}>
                <Button onClick={abrirModalCrear}>+ Nuevo Empleado</Button>
              </ProtectedComponent>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Función</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Salario Base</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron empleados
                      </TableCell>
                    </TableRow>
                  ) : (
                    empleadosFiltrados.map((emp) => (
                      <TableRow key={emp.id_empleado} className={!emp.activo ? "opacity-50" : ""}>
                        <TableCell className="font-medium">
                          {emp.apellido}, {emp.nombre}
                        </TableCell>
                        <TableCell>{emp.dni || "-"}</TableCell>
                        <TableCell>{emp.funcion || "-"}</TableCell>
                        <TableCell>{emp.telefono || "-"}</TableCell>
                        <TableCell className="text-right">
                          ${emp.salario_base?.toLocaleString("es-AR", { minimumFractionDigits: 2 }) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              emp.activo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {emp.activo ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <ProtectedComponent componenteId={73}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalEditar(emp)}
                              >
                                Editar
                              </Button>
                            </ProtectedComponent>
                            <ProtectedComponent componenteId={75}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/empleados/${emp.id_empleado}/asistencia`)}
                              >
                                Asistencia
                              </Button>
                            </ProtectedComponent>
                            <ProtectedComponent componenteId={76}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/empleados/${emp.id_empleado}/recibos`)}
                              >
                                Recibos
                              </Button>
                            </ProtectedComponent>
                            {emp.activo ? (
                              <ProtectedComponent componenteId={74}>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setEmpleadoToDelete(emp);
                                    setDeleteModalOpen(true);
                                  }}
                                >
                                  Desactivar
                                </Button>
                              </ProtectedComponent>
                            ) : (
                              <ProtectedComponent componenteId={74}>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => reactivarEmpleado(emp)}
                                >
                                  Reactivar
                                </Button>
                              </ProtectedComponent>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Crear/Editar */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {modalMode === "crear" ? "Nuevo Empleado" : "Editar Empleado"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={form.apellido}
                      onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={form.dni}
                      onChange={(e) => setForm({ ...form, dni: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="funcion">Función</Label>
                    <Input
                      id="funcion"
                      value={form.funcion}
                      onChange={(e) => setForm({ ...form, funcion: e.target.value })}
                      placeholder="Ej: Operario, Supervisor..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="salario_base">Salario Base (Quincenal)</Label>
                    <Input
                      id="salario_base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.salario_base}
                      onChange={(e) => setForm({ ...form, salario_base: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                  <Input
                    id="fecha_ingreso"
                    type="date"
                    value={form.fecha_ingreso}
                    onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Confirmar Eliminación */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Desactivación</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              ¿Está seguro que desea desactivar al empleado{" "}
              <strong>
                {empleadoToDelete?.apellido}, {empleadoToDelete?.nombre}
              </strong>
              ?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Desactivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </ProtectedPage>
  );
}
