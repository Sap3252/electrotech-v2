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

type Pieza = {
  id_pieza: number;
  detalle: string;
  ancho_m: number;
  alto_m: number;
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

export default function PiezasPintadasPage() {
  const router = useRouter();

  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [pinturas, setPinturas] = useState<Pintura[]>([]);
  const [lotes, setLotes] = useState<PiezaPintadaRow[]>([]);

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


  // Cargar combos y tabla
  useEffect(() => {
    const cargar = async () => {
      try {
        const [piezasRes, pinturasRes, lotesRes] = await Promise.all([
          fetch("/api/piezas"),
          fetch("/api/pinturas"),
          fetch("/api/piezas-pintadas"),
        ]);

        setPiezas(await piezasRes.json());
        setPinturas(await pinturasRes.json());
        setLotes(await lotesRes.json());
      } catch (err) {
        console.error("Error al cargar datos de Core 1:", err);
      }
    };
    cargar();
  }, []);

  const registrarLote = async () => {
    if (!idPieza || !idPintura || cantidad <= 0) {
      alert("Seleccioná pieza, pintura y una cantidad válida.");
      return;
    }

    // Validar stock disponible
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

      // Recargar tabla
      const lotesRes = await fetch("/api/piezas-pintadas");
      setLotes(await lotesRes.json());

      // Resetear solo cantidad
      setCantidad(1);
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
          Volver al Panel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORMULARIO */}
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
                  {piezas.map((p) => (
                    <SelectItem key={p.id_pieza} value={String(p.id_pieza)}>
                      {p.id_pieza} — {p.detalle} ({p.ancho_m}m x {p.alto_m}m)
                    </SelectItem>
                  ))}
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

        {/* LISTA DE LOTES */}
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
                      <th className="text-left py-1">Pintura</th>
                      <th className="text-right py-1">Cant.</th>
                      <th className="text-right py-1">Consumo (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((l) => (
                      <tr key={l.id_pieza_pintada} className="border-b">
                        <td className="py-1">{l.fecha}</td>
                        <td className="py-1">{l.pieza_detalle}</td>
                        <td className="py-1">
                          {l.marca} / {l.color} / {l.tipo}
                        </td>
                        <td className="py-1 text-right">{l.cantidad}</td>
                        <td className="py-1 text-right">
                          {l.consumo_estimado_kg} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
