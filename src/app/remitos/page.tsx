"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ModalDetalleRemito } from "@/components/remitos/ModalDetalleRemito";




export default function RemitosPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [piezas, setPiezas] = useState<any[]>([]);
  const [remitos, setRemitos] = useState<any[]>([]);

  const [form, setForm] = useState({
    id_cliente: "",
    fecha_recepcion: "",
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<
    { id_pieza: string; cantidad: number; nombre: string }[]
  >([]);
    const [piezaSeleccionada, setPiezaSeleccionada] = useState("");
    const [cantidad, setCantidad] = useState("");
  // =============================
  // CARGAS INICIALES
  // =============================
  const cargarClientes = async () => {
    const res = await fetch("/api/clientes");
    if (res.ok) setClientes(await res.json());
  };

  const cargarPiezas = async () => {
    const res = await fetch("/api/piezas");
    if (res.ok) setPiezas(await res.json());
  };

  const cargarRemitos = async () => {
    const res = await fetch("/api/remitos");
    if (res.ok) setRemitos(await res.json());
  };

  useEffect(() => {
    const fetchData = async () => {
      await cargarClientes();
      await cargarPiezas();
      await cargarRemitos();
    };
    fetchData();
  }, []);

  // =============================
  // GUARDAR REMITO
  // =============================
  const guardarRemito = async () => {
    if (!form.id_cliente || !form.fecha_recepcion || detalle.length === 0) {
      alert("Complete todos los campos");
      return;
    }

    const res = await fetch("/api/remitos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_cliente: form.id_cliente,
        fecha_recepcion: form.fecha_recepcion,
        piezas: detalle,
      }),
    });


    if (res.ok) {
      alert("Remito cargado correctamente");
      setForm({ id_cliente: "", fecha_recepcion: "" });
      setDetalle([]);
      cargarRemitos();
    } else {
      alert("Error al cargar remito");
    }
  };

  // =============================
  // VER DETALLE DEL REMITO
  // =============================
  const verDetalle = (id: number) => {
    setSelectedRemito(id);
    setOpenModal(true);
  };


  return (
    <ProtectedRoute allowedGroups={["Contabilidad", "Admin"]}>
      <div className="min-h-screen bg-slate-100 p-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Remitos</h1>

        {/* ================================
            FORMULARIO
        =================================== */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cargar Remito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Cliente */}
              <div>
                <Label>Cliente</Label>
                <Select
                  value={form.id_cliente}
                  onValueChange={(v) =>
                    setForm({ ...form, id_cliente: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c: any) => (
                      <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div>
                <Label>Fecha de recepción</Label>
                <Input
                  type="datetime-local"
                  value={form.fecha_recepcion}
                  onChange={(e) =>
                    setForm({ ...form, fecha_recepcion: e.target.value })
                  }
                />
              </div>
            </div>

            <hr className="my-6" />

            {/* PIEZAS DEL DETALLE */}
            <h3 className="text-lg font-semibold mb-3">Agregar piezas</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Seleccionar pieza */}
              <Select onValueChange={(v) => setPiezaSeleccionada(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione pieza" />
                </SelectTrigger>
                <SelectContent>
                  {piezas.map((p: any) => (
                    <SelectItem
                      key={p.id_pieza}
                      value={String(p.id_pieza)}
                    >
                      {p.detalle} ({p.ancho_m}x{p.alto_m})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cantidad */}
              <Input
                type="number"
                placeholder="Cantidad"
                min="1"
                onChange={(e) => setCantidad(e.target.value)}
                
              />
                <Button
                    className="bg-black text-white"
                    onClick={() => {
                        const p = piezas.find((x: any) => String(x.id_pieza) === piezaSeleccionada);
                        if (!p || !cantidad) return;

                        setDetalle((prev) => [
                        ...prev,
                        {
                            id_pieza: piezaSeleccionada,
                            cantidad: Number(cantidad),
                            nombre: p.detalle,
                        },
                        ]);

                        setCantidad("");
                        setPiezaSeleccionada("");
                    }}
                >
  Agregar al detalle
</Button>
            </div>

            {/* Lista */}
            {detalle.length > 0 && (
              <div className="mt-4 bg-slate-50 p-4 rounded border">
                <h4 className="font-semibold mb-2">Detalle cargado:</h4>
                <ul>
                  {detalle.map((d, i) => (
                    <li key={i}>
                      • {d.nombre} — {d.cantidad} unidades
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              className="mt-6 bg-black text-white hover:bg-black/80"
              onClick={guardarRemito}
            >
              Guardar Remito
            </Button>
          </CardContent>
        </Card>

        {/* ================================
            TABLA DE REMITOS
        =================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Remitos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Cliente</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Piezas</th>
                    <th className="p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {remitos.map((r: any) => (
                    <tr key={r.id_remito} className="border-b">
                      <td className="p-2">{r.id_remito}</td>
                      <td className="p-2">
                        {r.cliente_nombre}
                      </td>
                      <td className="p-2">{r.fecha_recepcion}</td>
                      <td className="p-2">{r.cantidad_piezas}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => verDetalle(r.id_remito)}
                        >
                          Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ================================
            MODAL DETALLE
        =================================== */}
        <ModalDetalleRemito
          remitoId={selectedRemito}
          open={openModal}
          onOpenChange={setOpenModal}
        />
      </div>
    </ProtectedRoute>
  );
}
