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
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";

function PiezasPage() {
  const router = useRouter();
  const [piezas, setPiezas] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_cliente: "",
    ancho_m: "",
    alto_m: "",
    detalle: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    // Client-side validation
    const newErrors: { [key: string]: string } = {};

    if (!form.id_cliente) newErrors.id_cliente = "Debe seleccionar un cliente.";

    const ancho = parseFloat(String(form.ancho_m));
    if (Number.isNaN(ancho) || ancho <= 0) newErrors.ancho_m = "El ancho debe ser un número mayor a 0.";

    const alto = parseFloat(String(form.alto_m));
    if (Number.isNaN(alto) || alto <= 0) newErrors.alto_m = "El alto debe ser un número mayor a 0.";

    if (!String(form.detalle || "").trim()) newErrors.detalle = "El detalle no puede quedar vacío.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch("/api/piezas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ id_cliente: "", ancho_m: "", alto_m: "", detalle: "" });
      cargar();
    } else {
      // show server error if any
      const text = await res.text().catch(() => "");
      setErrors({ general: `Error del servidor: ${text || res.statusText}` });
    }
  };

  const editarPieza = async () => {
    // Same validation as crear
    const newErrors: { [key: string]: string } = {};
    if (!form.id_cliente) newErrors.id_cliente = "Debe seleccionar un cliente.";
    const ancho = parseFloat(String(form.ancho_m));
    if (Number.isNaN(ancho) || ancho <= 0) newErrors.ancho_m = "El ancho debe ser un número mayor a 0.";
    const alto = parseFloat(String(form.alto_m));
    if (Number.isNaN(alto) || alto <= 0) newErrors.alto_m = "El alto debe ser un número mayor a 0.";
    if (!String(form.detalle || "").trim()) newErrors.detalle = "El detalle no puede quedar vacío.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch(`/api/piezas/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setEditId(null);
      setForm({ id_cliente: "", ancho_m: "", alto_m: "", detalle: "" });
      cargar();
    } else {
      const text = await res.text().catch(() => "");
      setErrors({ general: `Error del servidor: ${text || res.statusText}` });
    }
  };

  const eliminarPieza = async (id: number) => {
    await fetch(`/api/piezas/${id}`, { method: "DELETE" });
    cargar();
  };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
      setForm({ ...form, [name]: value });
      // clear field error on change
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        delete copy.general;
        return copy;
      });
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
      <ProtectedComponent componenteId={1}>
        <Card className="max-w-xl mb-10">
          <CardHeader>
            <CardTitle>
              {editId ? "Editar Pieza" : "Agregar Nueva Pieza"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={crearPieza}>
            <Select
            onValueChange={(value) => {
                setForm({ ...form, id_cliente: value });
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.id_cliente;
                  delete copy.general;
                  return copy;
                });
            }}
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
            {errors.ancho_m && (
              <p className="text-sm text-red-600">{errors.ancho_m}</p>
            )}

            <Input
              placeholder="Alto (m)"
              name="alto_m"
              value={form.alto_m}
              onChange={handleChange}
              required
            />
            {errors.alto_m && (
              <p className="text-sm text-red-600">{errors.alto_m}</p>
            )}

            <Input
              placeholder="Detalle"
              name="detalle"
              value={form.detalle}
              onChange={handleChange}
            />
            {errors.detalle && (
              <p className="text-sm text-red-600">{errors.detalle}</p>
            )}

            {errors.id_cliente && (
              <p className="text-sm text-red-600">{errors.id_cliente}</p>
            )}

            {errors.general && (
              <p className="text-sm text-red-600">{errors.general}</p>
            )}

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
      </ProtectedComponent>

      {/* LISTADO */}
      <ProtectedComponent componenteId={2}>
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
                    <ProtectedComponent componenteId={3}>
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
                    </ProtectedComponent>

                    <ProtectedComponent componenteId={4}>
                      <Button
                        variant="destructive"
                        onClick={() => eliminarPieza(p.id_pieza)}
                      >
                        Eliminar
                      </Button>
                    </ProtectedComponent>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      </ProtectedComponent>

    </div>
  );
}

function PiezasPageProtected() {
  return (
    <ProtectedPage ruta="/piezas">
      <PiezasPage />
    </ProtectedPage>
  );
}

export default PiezasPageProtected;
