"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PiezasPage() {
  const router = useRouter();
  const [piezas, setPiezas] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_cliente: "",
    ancho_m: "",
    alto_m: "",
    detalle: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);

  const cargar = async () => {
    const res = await fetch("/api/piezas");
    const data = await res.json();
    setPiezas(data);
  };

  const cargarClientes = async () => {
  const res = await fetch("/api/clientes");
  const data = await res.json();
  setClientes(data);
};

    useEffect(() => {
    const fetchData = async () => {
        await cargar();
        await cargarClientes();
    };
    fetchData();
    }, []);

  const crearPieza = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/piezas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ id_cliente: "", ancho_m: "", alto_m: "", detalle: "" });
      cargar();
    }
  };

  const editarPieza = async () => {
    const res = await fetch(`/api/piezas/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setEditId(null);
      setForm({ id_cliente: "", ancho_m: "", alto_m: "", detalle: "" });
      cargar();
    }
  };

  const eliminarPieza = async (id: number) => {
    await fetch(`/api/piezas/${id}`, { method: "DELETE" });
    cargar();
  };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm({ ...form, [name]: value });
    };

  return (
    <div className="p-10">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Volver al Dashboard
        </Button>
      </div>

      {/* FORMULARIO */}
      <Card className="max-w-xl mb-10">
        <CardHeader>
          <CardTitle>
            {editId ? "Editar Pieza" : "Agregar Nueva Pieza"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={crearPieza}>
            <Select
            onValueChange={(value) =>
                setForm({ ...form, id_cliente: value })
            }
            >
            <SelectTrigger>
                <SelectValue placeholder="Seleccione un cliente" />
            </SelectTrigger>

            <SelectContent>
                {clientes.map((c) => (
                <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                    {c.nombre}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Input
              placeholder="Ancho (m)"
              name="ancho_m"
              value={form.ancho_m}
              onChange={handleChange}
              required
            />

            <Input
              placeholder="Alto (m)"
              name="alto_m"
              value={form.alto_m}
              onChange={handleChange}
              required
            />

            <Input
              placeholder="Detalle"
              name="detalle"
              value={form.detalle}
              onChange={handleChange}
            />

            {!editId ? (
              <Button type="submit">Agregar Pieza</Button>
            ) : (
              <Button type="button" onClick={editarPieza}>
                Guardar Cambios
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* LISTADO */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Piezas</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border text-left">
            <thead>
              <tr className="border-b">
                <th>ID</th>
                <th>Cliente</th>
                <th>Ancho</th>
                <th>Alto</th>
                <th>Detalle</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {piezas.map((p) => (
                <tr key={p.id_pieza} className="border-b">
                  <td>{p.id_pieza}</td>
                  <td>{p.id_cliente}</td>
                  <td>{p.ancho_m} m</td>
                  <td>{p.alto_m} m</td>
                  <td>{p.detalle}</td>

                  <td className="flex gap-2 py-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditId(p.id_pieza);
                        setForm({
                          id_cliente: p.id_cliente,
                          ancho_m: p.ancho_m,
                          alto_m: p.alto_m,
                          detalle: p.detalle,
                        });
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => eliminarPieza(p.id_pieza)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
}
