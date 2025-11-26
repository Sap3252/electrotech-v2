"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Proveedor = {
  id_proveedor: number;
  nombre: string;
  direccion?: string;
};

export default function ProveedoresPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
  });

  const cargarProveedores = async () => {
    const res = await fetch("/api/proveedores");
    if (res.ok) {
      const data = await res.json();
      setProveedores(data);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      const res = await fetch("/api/proveedores");
      if (res.ok) {
        const data = await res.json();
        setProveedores(data);
      }
    };
    cargar();
  }, []);

  const limpiarForm = () => {
    setForm({ nombre: "", direccion: "" });
    setEditando(null);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const method = editando ? "PUT" : "POST";
    const url = editando ? `/api/proveedores/${editando.id_proveedor}` : "/api/proveedores";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert(editando ? "Proveedor actualizado" : "Proveedor creado");
      limpiarForm();
      cargarProveedores();
    } else {
      alert("Error al guardar proveedor");
    }
  };

  const editar = (proveedor: Proveedor) => {
    setForm({
      nombre: proveedor.nombre,
      direccion: proveedor.direccion || "",
    });
    setEditando(proveedor);
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este proveedor?")) return;

    const res = await fetch(`/api/proveedores/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Proveedor eliminado");
      cargarProveedores();
    } else {
      alert("Error al eliminar proveedor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin")}>
          Volver a Administración
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                placeholder="Dirección"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={guardar} className="flex-1 bg-black text-white">
                {editando ? "Actualizar" : "Guardar"}
              </Button>
              {editando && (
                <Button onClick={limpiarForm} variant="outline">
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((p) => (
                  <TableRow key={p.id_proveedor}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.direccion || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editar(p)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => eliminar(p.id_proveedor)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
