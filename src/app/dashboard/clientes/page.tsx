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

type Cliente = {
  id_cliente: number;
  nombre: string;
  direccion?: string;
};

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
  });

  const cargarClientes = async () => {
    const res = await fetch("/api/clientes");
    if (res.ok) {
      const data = await res.json();
      setClientes(data);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      const res = await fetch("/api/clientes");
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
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
    const url = editando ? `/api/clientes/${editando.id_cliente}` : "/api/clientes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert(editando ? "Cliente actualizado" : "Cliente creado");
      limpiarForm();
      cargarClientes();
    } else {
      alert("Error al guardar cliente");
    }
  };

  const editar = (cliente: Cliente) => {
    setForm({
      nombre: cliente.nombre,
      direccion: cliente.direccion || "",
    });
    setEditando(cliente);
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return;

    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Cliente eliminado");
      cargarClientes();
    } else {
      alert("Error al eliminar cliente");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin")}>
          Volver a Administración
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>{editando ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del cliente"
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
            <CardTitle>Listado de Clientes</CardTitle>
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
                {clientes.map((c) => (
                  <TableRow key={c.id_cliente}>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell>{c.direccion || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editar(c)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => eliminar(c.id_cliente)}
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
