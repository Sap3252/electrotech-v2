"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const res = await fetch("/api/piezas-pintadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pieza: idPieza,
          id_pintura: idPintura,
          cantidad,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Error al registrar lote:", data);
        alert("Error al registrar piezas pintadas.");
        return;
      }

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
              <select
                className="w-full border rounded px-2 py-1"
                value={idPieza}
                onChange={(e) =>
                  setIdPieza(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">-- Seleccionar pieza --</option>
                {piezas.map((p) => (
                  <option key={p.id_pieza} value={p.id_pieza}>
                    {p.id_pieza} — {p.detalle} ({p.ancho_m}m x {p.alto_m}m)
                  </option>
                ))}
              </select>
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
