"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Grupo = {
  id_grupo: number;
  nombre: string;
  id_estado: number;
  estado: string;
  total_usuarios: number;
  total_permisos: number;
};

type EstadoGrupo = {
  id_estado: number;
  nombre: string;
};

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estados, setEstados] = useState<EstadoGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("1");

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [resGrupos, resEstados] = await Promise.all([
        fetch("/api/grupos"),
        fetch("/api/rbac/grupos"),
      ]);

      if (!resGrupos.ok || !resEstados.ok) {
        if (resGrupos.status === 401 || resEstados.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar datos");
      }

      const dataGrupos = await resGrupos.json();
      setGrupos(dataGrupos);

      //Extraer estados unicos de los grupos
      const estadosUnicos: EstadoGrupo[] = [
        { id_estado: 1, nombre: "Activo" },
        { id_estado: 2, nombre: "Inactivo" },
        { id_estado: 3, nombre: "Suspendido" },
      ];
      setEstados(estadosUnicos);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const limpiarFormulario = () => {
    setEditando(false);
    setIdEditando(null);
    setNombre("");
    setEstadoSeleccionado("1");
  };

  const editarGrupo = async (id: number) => {
    try {
      const res = await fetch(`/api/grupos/${id}`);
      if (!res.ok) throw new Error("Error al cargar grupo");

      const grupo = await res.json();

      setEditando(true);
      setIdEditando(id);
      setNombre(grupo.nombre);
      setEstadoSeleccionado(grupo.id_estado.toString());
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar grupo");
    }
  };

  const guardarGrupo = async () => {
    if (!nombre) {
      alert("El nombre es requerido");
      return;
    }

    try {
      setGuardando(true);

      const body = {
        nombre,
        id_estado: parseInt(estadoSeleccionado),
      };

      const url = editando ? `/api/grupos/${idEditando}` : "/api/grupos";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar grupo");
      }

      alert(
        editando
          ? "Grupo actualizado exitosamente"
          : "Grupo creado exitosamente"
      );

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al guardar grupo");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarGrupo = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este grupo?")) return;

    try {
      const res = await fetch(`/api/grupos/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar grupo");
      }

      alert("Grupo eliminado exitosamente");
      await cargarDatos();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar grupo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Grupos</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin")}>
          Volver a Administración
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>{editando ? "Editar Grupo" : "Nuevo Grupo"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Grupo *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Operadores, Supervisores"
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={estadoSeleccionado}
                  onValueChange={setEstadoSeleccionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem
                        key={estado.id_estado}
                        value={estado.id_estado.toString()}
                      >
                        {estado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={guardarGrupo}
                  disabled={guardando}
                  className="flex-1"
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                    ? "Actualizar"
                    : "Crear"}
                </Button>
                {editando && (
                  <Button variant="outline" onClick={limpiarFormulario}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listado */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos ({grupos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grupos.map((grupo) => (
                    <TableRow key={grupo.id_grupo}>
                      <TableCell className="font-medium">
                        {grupo.nombre}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            grupo.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : grupo.estado === "Inactivo"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {grupo.estado}
                        </span>
                      </TableCell>
                      <TableCell>{grupo.total_usuarios}</TableCell>
                      <TableCell>{grupo.total_permisos}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/grupos/${grupo.id_grupo}`)}
                          >
                            Permisos
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editarGrupo(grupo.id_grupo)}
                          >
                            Editar
                          </Button>
                          {grupo.id_grupo !== 1 && ( // No permitir eliminar Admin
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarGrupo(grupo.id_grupo)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
