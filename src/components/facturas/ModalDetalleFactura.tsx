"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

export function ModalDetalleFactura({ facturaId, open, onOpenChange }: {
  facturaId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {

  const [detalle, setDetalle] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facturaId) return;
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/facturas/${facturaId}/detalle`);
      const data = await res.json();
      setDetalle(data);
      setLoading(false);
    };
    load();
  }, [facturaId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle de la Factura #{facturaId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : (
          <div className="mt-3">
            {detalle.length === 0 ? (
              <p className="text-gray-600">Esta factura no tiene items cargados.</p>
            ) : (
              <table className="w-full border rounded">
                <thead>
                  <tr className="border-b bg-slate-100">
                    <th className="p-2 text-left">Pieza</th>
                    <th className="p-2 text-left">Cantidad</th>
                    <th className="p-2 text-left">Precio Unit.</th>
                    <th className="p-2 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((d: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{d.descripcion}</td>
                      <td className="p-2">{d.cantidad}</td>
                      <td className="p-2">${d.precio_unitario}</td>
                      <td className="p-2">${d.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Button
                className="mt-4 bg-black text-white hover:bg-black/80"
                onClick={() => {
                    window.open(`/api/facturas/${facturaId}/imprimir`, "_blank");
                }}
                >
                Imprimir Factura (PDF)
            </Button>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
