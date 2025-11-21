"use client";

import { useState, useEffect } from "react";
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
import { ProtectedRoute } from "@/components/ProtectedRoute";


export default function PinturasPage() {
  const [pinturas, setPinturas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [colores, setColores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  const [form, setForm] = useState({
    id_marca: "",
    id_tipo: "",
    id_color: "",
    id_proveedor: "",
    precio_unitario: "",
    stock_actual: "",
  });

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
    
    const res = await fetch("/api/pinturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await cargarPinturas();
      setForm({
        id_marca: "",
        id_tipo: "",
        id_color: "",
        id_proveedor: "",
        precio_unitario: "",
        stock_actual: "",
      });
    }
  };
  

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 p-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Pinturas</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Agregar Pintura</h2>
          
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
                onValueChange={(value) =>
                  setForm({ ...form, id_marca: value })
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
            </div>

            <div>
              <Label>Tipo de Pintura</Label>
              <Select
                value={form.id_tipo}
                onValueChange={(value) =>
                  setForm({ ...form, id_tipo: value })
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
            </div>

            <div>
              <Label>Color</Label>
              <Select
                value={form.id_color}
                onValueChange={(value) =>
                  setForm({ ...form, id_color: value })
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
            </div>

            <div>
              <Label>Proveedor</Label>
              <Select
                value={form.id_proveedor}
                onValueChange={(value) =>
                  setForm({ ...form, id_proveedor: value })
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
            </div>

            <div>
              <Label>Precio Unitario</Label>
              <Input
                type="number"
                step="0.01"
                value={form.precio_unitario}
                onChange={(e) =>
                  setForm({ ...form, precio_unitario: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
                
            <div>
              <Label>Stock Actual</Label>
              <Input
                type="number"
                value={form.stock_actual}
                onChange={(e) =>
                  setForm({ ...form, stock_actual: e.target.value })
                }
                placeholder="0"
                required
              />
            </div>

            <Button type="submit">Agregar Pintura</Button>

          </form>
        </div>

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
                  <th className="text-left p-2">Stock</th>
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
                    <td className="p-2">{p.stock_actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

