"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";

type Pieza = {
  id_pieza: number;
  detalle: string;
  ancho_m: number;
  alto_m: number;
  stock_disponible: number;
};

type Pintura = {
  id_pintura: number;
  espesor_um: number;
  densidad_g_cm3: number;
  marca: string;
  color: string;
  tipo: string;
};

type PiezaPintadaRow = {
  id_pieza_pintada: number;
  fecha: string;
  cantidad: number;
  consumo_estimado_kg: number;
  pieza_detalle: string;
  marca: string;
  color: string;
  tipo: string;
};

export default function PiezasPintadasPageProtected() {
  return (
    <ProtectedPage ruta="/piezas-pintadas">
      <PiezasPintadasPage />
    </ProtectedPage>
  );
}

function PiezasPintadasPage() {
  const router = useRouter();

  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [pinturas, setPinturas] = useState<Pintura[]>([]);
  const [lotes, setLotes] = useState<PiezaPintadaRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [idPieza, setIdPieza] = useState<number | "">("");
  const [idPintura, setIdPintura] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [espesor, setEspesor] = useState<number>(50);
  const [densidad, setDensidad] = useState<number>(1.2);
  const [estrategia, setEstrategia] = useState<string>("standard");
  const [loading, setLoading] = useState(false);

  const [piezaSeleccionada, setPiezaSeleccionada] = useState<string>("");
  const [stockInfo, setStockInfo] = useState<{
    total_recibida: number;
    total_pintada: number;
    stock_disponible: number;
  } | null>(null);

  const [mensajeError, setMensajeError] = useState<string>("");


  //Cargar combos y tabla
  useEffect(() => {
    const cargar = async () => {
      try {
        const [piezasRes, pinturasRes, lotesRes] = await Promise.all([
          fetch("/api/piezas/disponibles"),
          fetch("/api/pinturas"),
          fetch("/api/piezas-pintadas"),
        ]);

        const piezasData = piezasRes.ok ? await piezasRes.json() : [];
        const pinturasData = pinturasRes.ok ? await pinturasRes.json() : [];
        const lotesData = lotesRes.ok ? await lotesRes.json() : [];

        setPiezas(Array.isArray(piezasData) ? piezasData : []);
        setPinturas(Array.isArray(pinturasData) ? pinturasData : []);
        setLotes(Array.isArray(lotesData) ? lotesData : []);
      } catch (err) {
        console.error("Error al cargar datos de Core 1:", err);
        setPiezas([]);
        setPinturas([]);
        setLotes([]);
      }
    };
    cargar();
  }, []);

  const registrarLote = async () => {
    if (!idPieza || !idPintura || cantidad <= 0) {
      alert("Seleccioná pieza, pintura y una cantidad válida.");
      return;
    }

    //Validar stock disponible
    if (stockInfo && cantidad > stockInfo.stock_disponible) {
      setMensajeError(
        `No podés pintar ${cantidad} piezas. Stock disponible: ${stockInfo.stock_disponible}.`
      );
      return;
    }
    setMensajeError("");

    setLoading(true);
    try {
      const res = await fetch("/api/piezas-pintadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pieza: idPieza,
          id_pintura: idPintura,
          cantidad,
          espesor_um: espesor,
          densidad_g_cm3: densidad,
          estrategia,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Error al registrar lote:", data);
        setMensajeError(data.error || "Error al registrar piezas pintadas.");
        return;
      }

      const resultado = await res.json();
      alert(`✅ Piezas pintadas registradas correctamente.\n\nConsumo total: ${resultado.consumo_total_kg} kg\nStock restante de pintura: ${resultado.stock_restante_kg} kg`);

      //Recargar tabla y piezas disponibles
      const [lotesRes, piezasRes] = await Promise.all([
        fetch("/api/piezas-pintadas"),
        fetch("/api/piezas/disponibles"),
      ]);
      const lotesData = lotesRes.ok ? await lotesRes.json() : [];
      const piezasData = piezasRes.ok ? await piezasRes.json() : [];
      setLotes(Array.isArray(lotesData) ? lotesData : []);
      setPiezas(Array.isArray(piezasData) ? piezasData : []);

      //Resetear formulario
      setCantidad(1);
      setPiezaSeleccionada("");
      setIdPieza("");
      setStockInfo(null);
    } catch (err) {
      console.error("Error al registrar lote:", err);
      alert("Error al registrar piezas pintadas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registrar Piezas Pintadas</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORMULARIO */}
        <ProtectedComponent componenteId={8}>
          <Card>
            <CardHeader>
              <CardTitle>Nueva producción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* PIEZA */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pieza (cruda)
              </label>
              <Select
                value={piezaSeleccionada}
                onValueChange={async (value) => {
                  setPiezaSeleccionada(value);
                  setIdPieza(Number(value));
                  setMensajeError("");

                  const res = await fetch(`/api/stock/pieza/${value}`);
                  if (res.ok) {
                    const data = await res.json();
                    setStockInfo({
                      total_recibida: data.total_recibida,
                      total_pintada: data.total_pintada,
                      stock_disponible: data.stock_disponible,
                    });
                  } else {
                    setStockInfo(null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Seleccionar pieza --" />
                </SelectTrigger>
                <SelectContent>
                  {piezas.length === 0 ? (
                    <SelectItem value="0" disabled>
                      No hay piezas con stock disponible
                    </SelectItem>
                  ) : (
                    piezas.map((p) => (
                      <SelectItem key={p.id_pieza} value={String(p.id_pieza)}>
                        {p.detalle} ({p.ancho_m}m x {p.alto_m}m) - Stock: {p.stock_disponible}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {stockInfo && (
                <div className="mt-4 p-4 rounded-lg bg-slate-50 border">
                  <p className="font-semibold mb-1">Stock de la pieza seleccionada</p>
                  <p>Recibidas por remitos: <strong>{stockInfo.total_recibida}</strong></p>
                  <p>Ya pintadas: <strong>{stockInfo.total_pintada}</strong></p>
                  <p>
                    Disponibles para pintar:{" "}
                    <strong
                      className={
                        stockInfo.stock_disponible > 0 ? "text-emerald-700" : "text-red-600"
                      }
                    >
                      {stockInfo.stock_disponible}
                    </strong>
                  </p>
                </div>
              )}
              
              {mensajeError && (
                <p className="mt-3 text-sm text-red-600 font-semibold">{mensajeError}</p>
              )}
            </div>

            {/* PINTURA */}
            <div>
              <label className="block text-sm font-medium mb-1">Pintura</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={idPintura}
                onChange={(e) =>
                  setIdPintura(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">-- Seleccionar pintura --</option>
                {pinturas.map((p) => (
                  <option key={p.id_pintura} value={p.id_pintura}>
                    {p.id_pintura} — {p.marca} / {p.color} / {p.tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* CANTIDAD */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cantidad de piezas
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={cantidad}
                min={1}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </div>

            {/* ESPESOR */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Espesor de pintura (µm)
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={espesor}
                min={1}
                step={0.1}
                onChange={(e) => setEspesor(Number(e.target.value))}
              />
            </div>

            {/* DENSIDAD */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Densidad (g/cm³)
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={densidad}
                min={0.1}
                step={0.1}
                onChange={(e) => setDensidad(Number(e.target.value))}
              />
            </div>

            {/* ESTRATEGIA */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de cálculo (Strategy)
              </label>
              <Select value={estrategia} onValueChange={setEstrategia}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (10% pérdida)</SelectItem>
                  <SelectItem value="highdensity">High Density (15% pérdida + 1.5x densidad)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BOTÓN REGISTRAR */}
            <div className="pt-2">
              <Button
                className="w-full bg-black text-white hover:bg-black/80"
                onClick={registrarLote}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Registrar Piezas Pintadas"}
              </Button>
            </div>
          </CardContent>
        </Card>
        </ProtectedComponent>

        {/* LISTA DE LOTES */}
        <ProtectedComponent componenteId={9}>
          <Card>
            <CardHeader>
              <CardTitle>Historial de producción</CardTitle>
            </CardHeader>
          <CardContent>
            {lotes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Todavía no hay piezas pintadas registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Fecha</th>
                          <th className="text-left py-1">Pieza</th>
                          <th className="text-left py-1">Cliente</th>
                      <th className="text-left py-1">Pintura</th>
                      <th className="text-right py-1">Cant.</th>
                      <th className="text-right py-1">Consumo (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                        {(() => {
                          const total = lotes.length;
                          const totalPages = Math.max(1, Math.ceil(total / pageSize));
                          const page = Math.min(Math.max(1, currentPage), totalPages);
                          const start = (page - 1) * pageSize;
                          const visibles = lotes.slice(start, start + pageSize);

                          return visibles.map((l) => (
                            <tr key={l.id_pieza_pintada} className="border-b">
                              <td className="py-1">{l.fecha}</td>
                              <td className="py-1">{l.pieza_detalle}</td>
                              <td className="py-1">{(l as any).cliente_nombre || "-"}</td>
                              <td className="py-1">
                                {l.marca} / {l.color} / {l.tipo}
                              </td>
                              <td className="py-1 text-right">{l.cantidad}</td>
                              <td className="py-1 text-right">
                                {l.consumo_estimado_kg} kg
                              </td>
                            </tr>
                          ));
                        })()}
                  </tbody>
                </table>
              </div>
            )}
                {/* Paginación */}
                {lotes.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const total = lotes.length;
                        const totalPages = Math.max(1, Math.ceil(total / pageSize));
                        const page = Math.min(Math.max(1, currentPage), totalPages);
                        const start = (page - 1) * pageSize + 1;
                        const end = Math.min(total, start + pageSize - 1);
                        return `Mostrando ${start} - ${end} de ${total}`;
                      })()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                      >
                        ← Anterior
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage * pageSize >= lotes.length}
                      >
                        Siguiente →
                      </Button>
                    </div>
                  </div>
                )}
          </CardContent>
        </Card>
        </ProtectedComponent>
      </div>
    </div>
  );
}

