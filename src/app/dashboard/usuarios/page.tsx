"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModalAuditorias } from "@/components/usuarios/ModalAuditorias";

type Usuario = {
  id_usuario: number;
  email: string;
  nombre: string | null;
  apellido: string | null;
  grupos: string;
  id_grupos: string;
};

type Grupo = {
  id_grupo: number;
  nombre: string;
  estado: string;
};

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Modal de auditorías
  const [modalAuditoriasOpen, setModalAuditoriasOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  // Formulario
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [gruposSeleccionados, setGruposSeleccionados] = useState<Set<number>>(
    new Set()
  );

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsuarios, resGrupos] = await Promise.all([
        fetch("/api/usuarios"),
        fetch("/api/grupos"),
      ]);

      if (!resUsuarios.ok || !resGrupos.ok) {
        if (resUsuarios.status === 401 || resGrupos.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar datos");
      }

      const dataUsuarios = await resUsuarios.json();
      const dataGrupos = await resGrupos.json();

      setUsuarios(dataUsuarios);
      setGrupos(dataGrupos);
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
    setEmail("");
    setPassword("");
    setNombre("");
    setApellido("");
    setGruposSeleccionados(new Set());
  };

  const verAuditorias = (usuario: Usuario) => {
    const nombreCompleto = usuario.nombre || usuario.apellido
      ? `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim()
      : usuario.email;
    
    setUsuarioSeleccionado({
      id: usuario.id_usuario,
      nombre: nombreCompleto,
    });
    setModalAuditoriasOpen(true);
  };

  const editarUsuario = async (id: number) => {
    try {
      const res = await fetch(`/api/usuarios/${id}`);
      if (!res.ok) throw new Error("Error al cargar usuario");

      const usuario = await res.json();

      setEditando(true);
      setIdEditando(id);
      setEmail(usuario.email);
      setNombre(usuario.nombre || "");
      setApellido(usuario.apellido || "");
      setPassword(""); // No mostrar password existente
      setGruposSeleccionados(new Set(usuario.grupos || []));
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar usuario");
    }
  };

  const guardarUsuario = async () => {
    if (!email) {
      alert("El email es requerido");
      return;
    }

    if (!editando && !password) {
      alert("La contraseña es requerida para nuevos usuarios");
      return;
    }

    try {
      setGuardando(true);

      const body = {
        email,
        nombre,
        apellido,
        grupos: Array.from(gruposSeleccionados),
        ...(password && { password }), // Solo incluir password si se ingresó
      };

      const url = editando ? `/api/usuarios/${idEditando}` : "/api/usuarios";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar usuario");
      }

      alert(
        editando
          ? "Usuario actualizado exitosamente"
          : "Usuario creado exitosamente"
      );

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al guardar usuario");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar usuario");
      }

      alert("Usuario eliminado exitosamente");
      await cargarDatos();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar usuario");
    }
  };

  const toggleGrupo = (id_grupo: number) => {
    const nuevo = new Set(gruposSeleccionados);
    if (nuevo.has(id_grupo)) {
      nuevo.delete(id_grupo);
    } else {
      nuevo.add(id_grupo);
    }
    setGruposSeleccionados(nuevo);
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
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin")}>
          Volver a Administración
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editando ? "Editar Usuario" : "Nuevo Usuario"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Contraseña {editando ? "(dejar vacío para mantener)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editando ? "Dejar vacío para no cambiar" : ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Grupos</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {grupos.map((grupo) => (
                    <div key={grupo.id_grupo} className="flex items-center gap-2">
                      <Checkbox
                        id={`grupo-${grupo.id_grupo}`}
                        checked={gruposSeleccionados.has(grupo.id_grupo)}
                        onCheckedChange={() => toggleGrupo(grupo.id_grupo)}
                      />
                      <label
                        htmlFor={`grupo-${grupo.id_grupo}`}
                        className="cursor-pointer flex-1"
                      >
                        {grupo.nombre} <span className="text-xs text-gray-500">({grupo.estado})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={guardarUsuario}
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
            <CardTitle>Usuarios ({usuarios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id_usuario}>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        {usuario.nombre || usuario.apellido
                          ? `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {usuario.grupos || "Sin grupos"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editarUsuario(usuario.id_usuario)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => verAuditorias(usuario)}
                          >
                            Auditorías
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarUsuario(usuario.id_usuario)}
                          >
                            Eliminar
                          </Button>
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

      {/* Modal de Auditorías */}
      <ModalAuditorias
        usuarioId={usuarioSeleccionado?.id || null}
        usuarioNombre={usuarioSeleccionado?.nombre || ""}
        open={modalAuditoriasOpen}
        onOpenChange={setModalAuditoriasOpen}
      />
    </div>
  );
}
