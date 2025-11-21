"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

export function ModalDetalleRemito({ remitoId, open, onOpenChange }: {
  remitoId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [detalle, setDetalle] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!remitoId) return;
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/remitos/${remitoId}/detalle`);
      const data = await res.json();
      setDetalle(data);
      setLoading(false);
    };
    load();
  }, [remitoId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle del Remito #{remitoId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : (
          <div className="mt-3">
            {detalle.length === 0 ? (
              <p className="text-gray-600">Este remito no tiene piezas cargadas.</p>
            ) : (
              <table className="w-full border rounded">
                <thead>
                  <tr className="border-b bg-slate-100">
                    <th className="p-2 text-left">Pieza</th>
                    <th className="p-2 text-left">Medidas</th>
                    <th className="p-2 text-left">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((d) => (
                    <tr key={d.id_detalle} className="border-b">
                      <td className="p-2">{d.detalle}</td>
                      <td className="p-2">
                        {d.ancho_m}m x {d.alto_m}m
                      </td>
                      <td className="p-2">{d.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
                
              </table>
              
            )}
            <Button
                className="mt-4 bg-black text-white hover:bg-black/80"
                onClick={() => {
                    window.open(`/api/remitos/${remitoId}/imprimir`, "_blank");
                }}
                >
                Imprimir Remito (PDF)
            </Button>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
