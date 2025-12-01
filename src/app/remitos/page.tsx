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
import { ModalDetalleRemito } from "@/components/remitos/ModalDetalleRemito";

interface Cliente {
  id_cliente: number;
  nombre: string;
  direccion: string;
}

interface Pieza {
  id_pieza: number;
  detalle: string;
  ancho_m: number;
  alto_m: number;
  id_cliente: number;
}

interface Remito {
  id_remito: number;
  cliente_nombre: string;
  fecha_recepcion: string;
  cantidad_piezas: number;
}

function RemitosPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [piezasFiltradas, setPiezasFiltradas] = useState<Pieza[]>([]);
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

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
    const [erroresDetalle, setErroresDetalle] = useState<{ [key: string]: string }>({});
    const [erroresForm, setErroresForm] = useState<{ [key: string]: string }>({});
  //================
  //CARGAS INICIALES
  //================
  const cargarClientes = async () => {
    const res = await fetch("/api/clientes");
    if (res.ok) setClientes(await res.json());
  };

  const cargarPiezasCliente = async (id_cliente: string) => {
    if (!id_cliente) {
      setPiezasFiltradas([]);
      return;
    }
    const res = await fetch(`/api/piezas?id_cliente=${id_cliente}`);
    if (res.ok) {
      setPiezasFiltradas(await res.json());
    }
  };

  const cargarRemitos = async () => {
    const res = await fetch("/api/remitos");
    if (res.ok) {
      setRemitos(await res.json());
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await cargarClientes();
      await cargarRemitos();
    };
    fetchData();
  }, []);

  // =============
  //GUARDAR REMITO
  // =============
  const guardarRemito = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.id_cliente) newErrors.id_cliente = "Debe seleccionar un cliente.";
    if (!form.fecha_recepcion) newErrors.fecha = "Debe ingresar una fecha.";
    if (detalle.length === 0) newErrors.detalle = "Debe agregar al menos una pieza.";

    // Validar que la fecha no exceda la fecha actual
    if (form.fecha_recepcion) {
      const fechaIngresada = new Date(form.fecha_recepcion);
      const fechaActual = new Date();
      // Comparar solo la fecha (ignorar horas/minutos)
      fechaIngresada.setHours(0, 0, 0, 0);
      fechaActual.setHours(0, 0, 0, 0);
      if (fechaIngresada > fechaActual) {
        newErrors.fecha = "La fecha no puede ser mayor a la fecha actual.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErroresForm(newErrors);
      return;
    }

    setErroresForm({});

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
      setPiezaSeleccionada("");
      setCantidad("");
      await cargarRemitos();
    } else {
      alert("Error al cargar remito");
    }
  };

  //=======================
  //VER DETALLE DEL REMITO
  //========================
  const verDetalle = (id: number) => {
    setSelectedRemito(id);
    setOpenModal(true);
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
        
        <h1 className="text-3xl font-bold mb-6">Gestión de Remitos</h1>

        {/* ================================
            FORMULARIO
        =================================== */}
        <ProtectedComponent componenteId={10}>
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
                  onValueChange={async (v) => {
                    setForm({ ...form, id_cliente: v });
                    setDetalle([]);
                    setErroresForm((prev) => { const copy = { ...prev }; delete copy.id_cliente; return copy; });
                    await cargarPiezasCliente(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {erroresForm.id_cliente && (
                  <p className="text-sm text-red-600 mt-1">{erroresForm.id_cliente}</p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <Label>Fecha de recepción</Label>
                <Input
                  type="datetime-local"
                  value={form.fecha_recepcion}
                  onChange={(e) => {
                    setForm({ ...form, fecha_recepcion: e.target.value });
                    setErroresForm((prev) => { const copy = { ...prev }; delete copy.fecha; return copy; });
                  }}
                />
                {erroresForm.fecha && (
                  <p className="text-sm text-red-600 mt-1">{erroresForm.fecha}</p>
                )}
              </div>
            </div>

            {erroresForm.detalle && (
              <p className="text-sm text-red-600 mt-4">{erroresForm.detalle}</p>
            )}

            <hr className="my-6" />

            {/* PIEZAS DEL DETALLE */}
            <h3 className="text-lg font-semibold mb-3">Agregar piezas</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Seleccionar pieza */}
              <Select 
                value={piezaSeleccionada}
                onValueChange={(v) => setPiezaSeleccionada(v)}
                disabled={!form.id_cliente}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!form.id_cliente ? "Primero seleccione cliente" : "Seleccione pieza"} />
                </SelectTrigger>
                <SelectContent>
                  {piezasFiltradas.map((p) => (
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
                        const newErrors: { [key: string]: string } = {};

                        if (!piezaSeleccionada) {
                          newErrors.pieza = "Debe seleccionar una pieza.";
                        }

                        const cantNum = parseFloat(cantidad);
                        if (Number.isNaN(cantNum) || cantNum <= 0) {
                          newErrors.cantidad = "La cantidad debe ser un número mayor a 0.";
                        }

                        if (Object.keys(newErrors).length > 0) {
                          setErroresDetalle(newErrors);
                          return;
                        }

                        setErroresDetalle({});

                        const p = piezasFiltradas.find((x) => String(x.id_pieza) === piezaSeleccionada);
                        if (!p) return;

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
                <ul className="space-y-2">
                  {detalle.map((d, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>• {d.nombre} — {d.cantidad} unidades</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDetalle((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {erroresDetalle.pieza && (
              <p className="text-sm text-red-600 mt-2">{erroresDetalle.pieza}</p>
            )}
            {erroresDetalle.cantidad && (
              <p className="text-sm text-red-600 mt-2">{erroresDetalle.cantidad}</p>
            )}

            <Button
            
              className="mt-6 bg-green-600 text-white/80"
              onClick={guardarRemito}
            >
              Guardar Remito
            </Button>
          </CardContent>
        </Card>
        </ProtectedComponent>

        {/* ================================
            TABLA DE REMITOS
        =================================== */}
        <ProtectedComponent componenteId={11}>
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
                  {(() => {
                    const total = remitos.length;
                    const totalPages = Math.max(1, Math.ceil(total / pageSize));
                    const page = Math.min(Math.max(1, currentPage), totalPages);
                    const start = (page - 1) * pageSize;
                    const visibles = remitos.slice(start, start + pageSize);
                    return visibles.map((r) => (
                      <tr key={r.id_remito} className="border-b">
                        <td className="p-2">{r.id_remito}</td>
                        <td className="p-2">
                          {r.cliente_nombre}
                        </td>
                        <td className="p-2">{r.fecha_recepcion}</td>
                        <td className="p-2">{r.cantidad_piezas}</td>
                        <td className="p-2">
                          <ProtectedComponent componenteId={12}>
                            <Button
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => verDetalle(r.id_remito)}
                            >
                              Ver Detalle
                            </Button>
                          </ProtectedComponent>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </ProtectedComponent>

        {/* ================================
            PAGINACIÓN REMITOS
        =================================== */}
        {remitos.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              ← Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {currentPage} de {Math.max(1, Math.ceil(remitos.length / pageSize))}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * pageSize >= remitos.length}
            >
              Siguiente →
            </Button>
          </div>
        )}

        {/* ================================
            MODAL DETALLE
        =================================== */}
        <ModalDetalleRemito
          remitoId={selectedRemito}
          open={openModal}
          onOpenChange={setOpenModal}
        />
      </div>
  );
}

export default function RemitosPageProtected() {
  return (
    <ProtectedPage ruta="/remitos">
      <RemitosPage />
    </ProtectedPage>
  );
}
