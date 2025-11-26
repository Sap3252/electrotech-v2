"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";
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
import { ModalDetalleFactura } from "@/components/facturas/ModalDetalleFactura";

interface Cliente {
  id_cliente: number;
  nombre: string;
}

interface PiezaDisponible {
  id_pieza_pintada: number;
  descripcion: string;
  cantidad: number;
  cantidad_facturada: number;
}

interface Factura {
  id_factura: number;
  cliente_nombre: string;
  fecha: string;
  total: number;
}

function FacturacionPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [piezasFiltradas, setPiezasFiltradas] = useState<PiezaDisponible[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [detalleFactura, setDetalleFactura] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    id_cliente: "",
  });

  const [items, setItems] = useState<
    {
      id_pieza_pintada: number;
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[]
  >([]);

  const [selectedPieza, setSelectedPieza] = useState<PiezaDisponible | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);

  // ============================
  // CARGAS INICIALES
  // ============================
  const cargarClientes = async () => {
    const res = await fetch("/api/clientes");
    if (res.ok) setClientes(await res.json());
  };

  const cargarPiezasCliente = async (id_cliente: string) => {
    if (!id_cliente) {
      setPiezasFiltradas([]);
      return;
    }
    const res = await fetch(`/api/piezas-pintadas/disponibles?id_cliente=${id_cliente}`);
    if (res.ok) {
      setPiezasFiltradas(await res.json());
    }
  };

  const cargarFacturas = async () => {
    const res = await fetch("/api/facturas/listado");
    if (res.ok) setFacturas(await res.json());
  };

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await cargarClientes();
        await cargarFacturas();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  // ============================
  // AGREGAR ÍTEM A LA FACTURA
  // ============================
  const agregarItem = () => {
    if (!selectedPieza) return alert("Seleccione una pieza");
    if (cantidad < 1) return alert("Cantidad inválida");

    const disponible =
      selectedPieza.cantidad - selectedPieza.cantidad_facturada;

    if (cantidad > disponible)
      return alert("No hay suficientes piezas disponibles para facturar.");

    const subtotal = cantidad * precioUnitario;

    setItems([
      ...items,
      {
        id_pieza_pintada: selectedPieza.id_pieza_pintada,
        descripcion: selectedPieza.descripcion,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      },
    ]);

    setCantidad(1);
    setPrecioUnitario(0);
    setSelectedPieza(null);
  };

  // ============================
  // TOTAL FACTURA
  // ============================
  const totalFactura = items.reduce((acc, x) => acc + x.subtotal, 0);

  // ============================
  // GUARDAR FACTURA
  // ============================
  const guardarFactura = async () => {
    if (!form.id_cliente) return alert("Seleccione cliente");
    if (items.length === 0) return alert("Agregue items");

    const res = await fetch("/api/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_cliente: form.id_cliente,
        items,
      }),
    });

    if (res.ok) {
      alert("Factura generada correctamente");
      setItems([]);
      setForm({ id_cliente: "" });
      setSelectedPieza(null);
      setPiezasFiltradas([]);
      await cargarFacturas();
    } else {
      alert("Error al generar factura");
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
        
        <h1 className="text-3xl font-bold mb-6">Facturación</h1>

        {/* FORMULARIO FACTURA */}
        <ProtectedComponent componenteId={14}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generar Factura</CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">

            {/* CLIENTE */}
            <div>
              <Label>Cliente</Label>
              <Select
                value={form.id_cliente}
                onValueChange={async (v) => {
                  setForm({ ...form, id_cliente: v });
                  setItems([]);
                  setSelectedPieza(null);
                  await cargarPiezasCliente(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem
                      key={c.id_cliente}
                      value={String(c.id_cliente)}
                    >
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ITEM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* PIEZA */}
              <div>
                <Label>Pieza Pintada</Label>
                <Select
                  value={selectedPieza ? String(selectedPieza.id_pieza_pintada) : ""}
                  onValueChange={(v) => {
                    const p = piezasFiltradas.find((x) => x.id_pieza_pintada == Number(v));
                    setSelectedPieza(p || null);
                  }}
                  disabled={!form.id_cliente}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!form.id_cliente ? "Primero seleccione cliente" : "Seleccione pieza"} />
                  </SelectTrigger>
                  <SelectContent>
                    {piezasFiltradas.map((p) => (
                      <SelectItem
                        key={p.id_pieza_pintada}
                        value={String(p.id_pieza_pintada)}
                      >
                        {p.descripcion} — Disponible:{" "}
                        {p.cantidad - p.cantidad_facturada}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CANTIDAD */}
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>

              {/* PRECIO */}
              <div>
                <Label>Precio Unitario</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                />
              </div>
            </div>

            <Button onClick={agregarItem} className="bg-black text-white">
              Agregar Item
            </Button>

            {/* ITEMS LISTADOS */}
            {items.length > 0 && (
              <div className="bg-slate-50 p-4 rounded border mt-6">
                <h3 className="font-semibold mb-3">Detalle de factura:</h3>

                <ul className="space-y-2">
                  {items.map((i, idx) => (
                    <li key={idx}>
                      • {i.descripcion} — {i.cantidad} u — $
                      {i.precio_unitario} = ${i.subtotal}
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-bold mt-4">
                  Total: ${totalFactura}
                </h2>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                onClick={guardarFactura}
                className="bg-green-600 text-white"
              >
                Generar Factura
              </Button>
            </div>
          </CardContent>
        </Card>
        </ProtectedComponent>

        {/* TABLA DE FACTURAS */}
        <ProtectedComponent componenteId={15}>
          <Card className="mt-10">
          <CardHeader>
            <CardTitle>Facturas Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Cliente</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => (
                    <tr key={f.id_factura} className="border-b">
                      <td className="p-2">{f.id_factura}</td>
                      <td className="p-2">{f.cliente_nombre}</td>
                      <td className="p-2">{f.fecha}</td>
                      <td className="p-2">${f.total}</td>
                      <td className="p-2">
                        <ProtectedComponent componenteId={16}>
                          <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            size="sm"
                            onClick={() => {
                              setDetalleFactura(f.id_factura);
                              setModalOpen(true);
                            }}
                          >
                          Ver Detalle
                        </Button>
                        </ProtectedComponent>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </ProtectedComponent>

        {/* MODAL DETALLE FACTURA */}
        <ModalDetalleFactura
          facturaId={detalleFactura}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
  );
}

export default function FacturacionPageProtected() {
  return (
    <ProtectedPage ruta="/facturacion">
      <FacturacionPage />
    </ProtectedPage>
  );
}