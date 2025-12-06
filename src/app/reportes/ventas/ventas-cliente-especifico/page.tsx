"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ProtectedPage from "@/components/ProtectedPage";
import { formatearFecha } from "@/lib/utils";

type FacturaData = {
  id_factura: number;
  fecha: string;
  total: string;
};

type Cliente = {
  id_cliente: number;
  nombre: string;
};

function ReporteVentasClienteEspecifico() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [data, setData] = useState<FacturaData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((res) => setClientes(res))
      .catch((err) => console.error(err));
  }, []);

  const cargarFacturas = () => {
    if (!clienteSeleccionado) return;

    fetch(`/api/reportes/ventas-cliente-especifico?id_cliente=${clienteSeleccionado}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos para ver este reporte");
        }
        return res.json();
      })
      .then((res) => {
        if (Array.isArray(res)) {
          setData(res);
        } else {
          setError("Error al cargar datos");
        }
      })
      .catch((err) => setError(err.message));
  };

  return (
      <div className="min-h-screen bg-slate-100 p-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Ventas de Cliente Específico</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Label>Seleccionar Cliente</Label>
              <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={cargarFacturas} className="bg-black text-white hover:bg-black/80">
              Buscar Facturas
            </Button>

            {error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length === 0 ? (
              <p className="text-gray-500">Seleccione un cliente y busque sus facturas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="p-2 text-left">ID Factura</th>
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((f) => (
                      <tr key={f.id_factura} className="border-b">
                        <td className="p-2">{f.id_factura}</td>
                        <td className="p-2">{formatearFecha(f.fecha)}</td>
                        <td className="p-2">${Number(f.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/reportes/ventas")}
          >
            Volver a Reportes
          </Button>
        </div>
      </div>
  );
}

export default function ReporteVentasClienteEspecificoProtected() {
  return (
    <ProtectedPage ruta="/reportes/ventas/ventas-cliente-especifico">
      <ReporteVentasClienteEspecifico />
    </ProtectedPage>
  );
}
