"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";


function PinturasPage() {
  const router = useRouter();
  const [pinturas, setPinturas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [colores, setColores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    id_marca: "",
    id_tipo: "",
    id_color: "",
    id_proveedor: "",
    precio_unitario: "",
    cantidad_kg: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const cargarPinturas = async () => {
    const res = await fetch("/api/pinturas");
    if (res.ok) {
      setPinturas(await res.json());
    }
  };

  const cargarMarcas = async () => {
    const res = await fetch("/api/marcas");
    if (res.ok) {
      setMarcas(await res.json());
    }
  };

  const cargarColores = async () => {
    const res = await fetch("/api/colores");
    if (res.ok) {
      setColores(await res.json());
    }
  };

  const cargarTipos = async () => {
    const res = await fetch("/api/tipos");
    if (res.ok) {
      setTipos(await res.json());
    }
  };

  const cargarProveedores = async () => {
    const res = await fetch("/api/proveedores");
    if (res.ok) {
      setProveedores(await res.json());
    }
  };

  useEffect(() => {
    const load = async () => {
      await cargarPinturas();
      await cargarMarcas();
      await cargarColores();
      await cargarTipos();
      await cargarProveedores();
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side validation
    const newErrors: { [key: string]: string } = {};
    if (!form.id_marca) newErrors.id_marca = "Debe seleccionar una marca.";
    if (!form.id_tipo) newErrors.id_tipo = "Debe seleccionar un tipo de pintura.";
    if (!form.id_color) newErrors.id_color = "Debe seleccionar un color.";
    if (!form.id_proveedor) newErrors.id_proveedor = "Debe seleccionar un proveedor.";

    const precio = parseFloat(String(form.precio_unitario));
    if (Number.isNaN(precio) || precio <= 0) newErrors.precio_unitario = "El precio debe ser un número mayor a 0.";

    const cantidad = parseFloat(String(form.cantidad_kg));
    if (Number.isNaN(cantidad) || cantidad <= 0) newErrors.cantidad_kg = "La cantidad debe ser un número mayor a 0.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/pinturas/${editId}` : "/api/pinturas";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await cargarPinturas();
      setEditId(null);
      setForm({
        id_marca: "",
        id_tipo: "",
        id_color: "",
        id_proveedor: "",
        precio_unitario: "",
        cantidad_kg: "",
      });
    } else {
      const text = await res.text().catch(() => "");
      setErrors({ general: `Error del servidor: ${text || res.statusText}` });
    }
  };

  const editarPintura = (pintura: any) => {
    setEditId(pintura.id_pintura);
    setForm({
      id_marca: String(pintura.id_marca),
      id_tipo: String(pintura.id_tipo),
      id_color: String(pintura.id_color),
      id_proveedor: String(pintura.id_proveedor),
      precio_unitario: String(pintura.precio_unitario),
      cantidad_kg: String(pintura.cantidad_kg),
    });
  };

  const eliminarPintura = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta pintura?")) return;

    const res = await fetch(`/api/pinturas/${id}`, { method: "DELETE" });
    if (res.ok) {
      await cargarPinturas();
    }
  };
  

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Volver al Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Gestión de Pinturas</h1>

        <ProtectedComponent componenteId={5}>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">{editId ? "Editar Pintura" : "Agregar Pintura"}</h2>
          
            <Button
              className="bg-black text-white mb-4 hover:bg-black/80"
              onClick={() => window.location.href = "/pinturas/calculadora"}
            >
              Abrir Calculadora de Consumo
            </Button>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Marca</Label>
              <Select
                value={form.id_marca}
                onValueChange={(value) => {
                  setForm({ ...form, id_marca: value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.id_marca; delete copy.general; return copy; });
                }
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((m: any) => (
                    <SelectItem key={m.id_marca} value={String(m.id_marca)}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_marca && (
                <p className="text-sm text-red-600">{errors.id_marca}</p>
              )}
            </div>

            <div>
              <Label>Tipo de Pintura</Label>
              <Select
                value={form.id_tipo}
                onValueChange={(value) => {
                  setForm({ ...form, id_tipo: value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.id_tipo; delete copy.general; return copy; });
                }
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de pintura" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t: any) => (
                    <SelectItem key={t.id_tipo} value={String(t.id_tipo)}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_tipo && (
                <p className="text-sm text-red-600">{errors.id_tipo}</p>
              )}
            </div>

            <div>
              <Label>Color</Label>
              <Select
                value={form.id_color}
                onValueChange={(value) => {
                  setForm({ ...form, id_color: value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.id_color; delete copy.general; return copy; });
                }
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione color" />
                </SelectTrigger>
                <SelectContent>
                  {colores.map((c: any) => (
                    <SelectItem key={c.id_color} value={String(c.id_color)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_color && (
                <p className="text-sm text-red-600">{errors.id_color}</p>
              )}
            </div>

            <div>
              <Label>Proveedor</Label>
              <Select
                value={form.id_proveedor}
                onValueChange={(value) => {
                  setForm({ ...form, id_proveedor: value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.id_proveedor; delete copy.general; return copy; });
                }
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((p: any) => (
                    <SelectItem key={p.id_proveedor} value={String(p.id_proveedor)}>
                      {p.nombre || p.id_proveedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_proveedor && (
                <p className="text-sm text-red-600">{errors.id_proveedor}</p>
              )}
            </div>

            <div>
              <Label>Precio Unitario</Label>
              <Input
                type="number"
                step="0.01"
                value={form.precio_unitario}
                onChange={(e) => {
                  setForm({ ...form, precio_unitario: e.target.value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.precio_unitario; delete copy.general; return copy; });
                }}
                placeholder="0.00"
                required
              />
              {errors.precio_unitario && (
                <p className="text-sm text-red-600">{errors.precio_unitario}</p>
              )}
            </div>
                
            <div>
              <Label>Cantidad (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cantidad_kg}
                onChange={(e) => {
                  setForm({ ...form, cantidad_kg: e.target.value });
                  setErrors((prev) => { const copy = { ...prev }; delete copy.cantidad_kg; delete copy.general; return copy; });
                }}
                placeholder="0.00"
                required
              />
              {errors.cantidad_kg && (
                <p className="text-sm text-red-600">{errors.cantidad_kg}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editId ? "Actualizar" : "Agregar"} Pintura</Button>
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      id_marca: "",
                      id_tipo: "",
                      id_color: "",
                      id_proveedor: "",
                      precio_unitario: "",
                      cantidad_kg: "",
                    });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-600">{errors.general}</p>
            )}

          </form>
        </div>
        </ProtectedComponent>

        <ProtectedComponent componenteId={6}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pinturas Registradas</h2>
          
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Marca</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Color</th>
                  <th className="text-left p-2">Proveedor</th>
                  <th className="text-left p-2">Precio</th>
                  <th className="text-left p-2">Cantidad (kg)</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pinturas.map((p: any) => (
                  <tr key={p.id_pintura} className="border-b">
                    <td className="p-2">{p.id_pintura}</td>
                    <td className="p-2">{p.marca || p.id_marca}</td>
                    <td className="p-2">{p.tipo || p.id_tipo}</td>
                    <td className="p-2">{p.color || p.id_color}</td>
                    <td className="p-2">{p.proveedor || p.id_proveedor}</td>
                    <td className="p-2">${p.precio_unitario}</td>
                    <td className="p-2">{p.cantidad_kg} kg</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <ProtectedComponent componenteId={24}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editarPintura(p)}
                          >
                            Editar
                          </Button>
                        </ProtectedComponent>
                        <ProtectedComponent componenteId={7}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarPintura(p.id_pintura)}
                          >
                            Eliminar
                          </Button>
                        </ProtectedComponent>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </ProtectedComponent>
      </div>
  );
}

export default function PinturasPageProtected() {
  return (
    <ProtectedPage ruta="/pinturas">
      <PinturasPage />
    </ProtectedPage>
  );
}
