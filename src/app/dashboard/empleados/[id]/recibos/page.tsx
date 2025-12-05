"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from "@/components/ProtectedPage";
import ProtectedComponent from "@/components/ProtectedComponent";

interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  dni: string;
  salario_base: number;
}

interface Recibo {
  id_recibo: number;
  id_empleado: number;
  periodo_quincena: number;
  periodo_mes: number;
  periodo_anio: number;
  fecha_desde: string;
  fecha_hasta: string;
  salario_base: number;
  presentismo: number;
  horas_extra_monto: number;
  bonificaciones: number;
  descuento_ausencias: number;
  otros_descuentos: number;
  total_haberes: number;
  total_descuentos: number;
  total_neto: number;
  dias_trabajados: number;
  dias_ausentes_justificados: number;
  dias_ausentes_injustificados: number;
  total_horas_extra: number;
  observaciones: string | null;
  generado_at: string;
  nombre?: string;
  apellido?: string;
  funcion?: string;
  direccion?: string;
  telefono?: string;
  fecha_ingreso?: string;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function RecibosEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal generar recibo
  const [modalGenerarOpen, setModalGenerarOpen] = useState(false);
  const [formGenerar, setFormGenerar] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    quincena: 1,
    bonificaciones: "",
    otros_descuentos: "",
    observaciones: "",
  });
  const [generating, setGenerating] = useState(false);

  // Modal ver recibo
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [reciboSeleccionado, setReciboSeleccionado] = useState<Recibo | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    try {
      setLoading(true);

      // Cargar empleado
      const resEmp = await fetch(`/api/empleados/${id}`);
      if (!resEmp.ok) {
        if (resEmp.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar empleado");
      }
      const empData = await resEmp.json();
      setEmpleado(empData);

      // Cargar recibos
      const resRec = await fetch(`/api/recibos?id_empleado=${id}`);
      if (resRec.ok) {
        const recData = await resRec.json();
        setRecibos(recData);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerarRecibo(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const payload = {
        id_empleado: parseInt(id),
        mes: formGenerar.mes,
        anio: formGenerar.anio,
        quincena: formGenerar.quincena,
        bonificaciones: formGenerar.bonificaciones ? parseFloat(formGenerar.bonificaciones) : 0,
        otros_descuentos: formGenerar.otros_descuentos ? parseFloat(formGenerar.otros_descuentos) : 0,
        observaciones: formGenerar.observaciones || null,
      };

      const res = await fetch("/api/recibos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar recibo");
      }

      setModalGenerarOpen(false);
      cargarDatos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function verRecibo(recibo: Recibo) {
    try {
      const res = await fetch(`/api/recibos/${recibo.id_recibo}`);
      if (!res.ok) throw new Error("Error al cargar recibo");
      const data = await res.json();
      setReciboSeleccionado(data);
      setModalVerOpen(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function generarPDF() {
    if (!reciboSeleccionado || !empleado) return;

    const r = reciboSeleccionado;
    const quincenaStr = r.periodo_quincena === 1 ? "Primera" : "Segunda";

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Sueldo - ${empleado.apellido} ${empleado.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          .conceptos { margin-bottom: 20px; }
          .conceptos h3 { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .neto-row { font-weight: bold; background-color: #e8f5e9; font-size: 16px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .firma { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ELECTROTECH S.A.</h1>
          <p>Recibo de Sueldo</p>
          <p>${quincenaStr} Quincena - ${MESES[r.periodo_mes - 1]} ${r.periodo_anio}</p>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>DATOS DEL EMPLEADO</h3>
            <p><strong>Nombre:</strong> ${r.apellido || empleado.apellido}, ${r.nombre || empleado.nombre}</p>
            <p><strong>DNI:</strong> ${r.dni || empleado.dni}</p>
            <p><strong>Función:</strong> ${r.funcion || "-"}</p>
            <p><strong>Fecha Ingreso:</strong> ${r.fecha_ingreso ? new Date(r.fecha_ingreso).toLocaleDateString("es-AR") : "-"}</p>
          </div>
          <div class="info-box">
            <h3>PERÍODO</h3>
            <p><strong>Desde:</strong> ${new Date(r.fecha_desde).toLocaleDateString("es-AR")}</p>
            <p><strong>Hasta:</strong> ${new Date(r.fecha_hasta).toLocaleDateString("es-AR")}</p>
            <p><strong>Días Trabajados:</strong> ${r.dias_trabajados}</p>
            <p><strong>Horas Extra:</strong> ${r.total_horas_extra}h</p>
          </div>
        </div>

        <div class="conceptos">
          <h3>HABERES</h3>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Salario Base (Quincenal)</td>
                <td class="text-right">$ ${r.salario_base.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Presentismo (9%)</td>
                <td class="text-right">$ ${r.presentismo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Horas Extra</td>
                <td class="text-right">$ ${r.horas_extra_monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Bonificaciones</td>
                <td class="text-right">$ ${r.bonificaciones.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL HABERES</td>
                <td class="text-right">$ ${r.total_haberes.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="conceptos">
          <h3>DESCUENTOS</h3>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Descuento por Ausencias Injustificadas (${r.dias_ausentes_injustificados} día/s)</td>
                <td class="text-right">$ ${r.descuento_ausencias.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Otros Descuentos</td>
                <td class="text-right">$ ${r.otros_descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL DESCUENTOS</td>
                <td class="text-right">$ ${r.total_descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table>
          <tbody>
            <tr class="neto-row">
              <td>NETO A COBRAR</td>
              <td class="text-right">$ ${r.total_neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        ${r.observaciones ? `<p style="margin-top: 20px;"><strong>Observaciones:</strong> ${r.observaciones}</p>` : ""}

        <div class="footer">
          <div class="firma">Firma Empleador</div>
          <div class="firma">Firma Empleado</div>
        </div>

        <script>window.print();</script>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Empleado no encontrado</p>
      </div>
    );
  }

  return (
    <ProtectedPage ruta="/dashboard/empleados/[id]/recibos">
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Recibos: {empleado.apellido}, {empleado.nombre}
            </h1>
            <p className="text-gray-600">DNI: {empleado.dni} | Salario Base: ${empleado.salario_base?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex gap-2">
            <ProtectedComponent componenteId={83}>
              <Button onClick={() => setModalGenerarOpen(true)}>
                + Generar Recibo
              </Button>
            </ProtectedComponent>
            <Button variant="outline" onClick={() => router.push("/dashboard/empleados")}>
              ← Volver a Empleados
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Historial de Recibos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Salario Base</TableHead>
                  <TableHead className="text-right">Presentismo</TableHead>
                  <TableHead className="text-right">Horas Extra</TableHead>
                  <TableHead className="text-right">Descuentos</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay recibos generados
                    </TableCell>
                  </TableRow>
                ) : (
                  recibos.map((rec) => (
                    <TableRow key={rec.id_recibo}>
                      <TableCell>
                        {rec.periodo_quincena === 1 ? "1ra" : "2da"} Quincena - {MESES[rec.periodo_mes - 1]} {rec.periodo_anio}
                      </TableCell>
                      <TableCell className="text-right">
                        ${rec.salario_base.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${rec.presentismo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${rec.horas_extra_monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -${rec.total_descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        ${rec.total_neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <ProtectedComponent componenteId={84}>
                          <Button size="sm" variant="outline" onClick={() => verRecibo(rec)}>
                            Ver Detalle
                          </Button>
                        </ProtectedComponent>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Generar Recibo */}
        <Dialog open={modalGenerarOpen} onOpenChange={setModalGenerarOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Recibo de Sueldo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerarRecibo}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Mes</Label>
                    <Select
                      value={formGenerar.mes.toString()}
                      onValueChange={(v) => setFormGenerar({ ...formGenerar, mes: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MESES.map((mes, idx) => (
                          <SelectItem key={idx} value={(idx + 1).toString()}>
                            {mes}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Año</Label>
                    <Input
                      type="number"
                      value={formGenerar.anio}
                      onChange={(e) => setFormGenerar({ ...formGenerar, anio: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Quincena</Label>
                    <Select
                      value={formGenerar.quincena.toString()}
                      onValueChange={(v) => setFormGenerar({ ...formGenerar, quincena: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Primera (1-15)</SelectItem>
                        <SelectItem value="2">Segunda (16-fin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bonificaciones</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formGenerar.bonificaciones}
                      onChange={(e) => setFormGenerar({ ...formGenerar, bonificaciones: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Otros Descuentos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formGenerar.otros_descuentos}
                      onChange={(e) => setFormGenerar({ ...formGenerar, otros_descuentos: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Input
                    value={formGenerar.observaciones}
                    onChange={(e) => setFormGenerar({ ...formGenerar, observaciones: e.target.value })}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalGenerarOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating ? "Generando..." : "Generar Recibo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Ver Recibo */}
        <Dialog open={modalVerOpen} onOpenChange={setModalVerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Detalle del Recibo - {reciboSeleccionado?.periodo_quincena === 1 ? "1ra" : "2da"} Quincena {MESES[(reciboSeleccionado?.periodo_mes || 1) - 1]} {reciboSeleccionado?.periodo_anio}
              </DialogTitle>
            </DialogHeader>
            {reciboSeleccionado && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="font-semibold">
                      {new Date(reciboSeleccionado.fecha_desde).toLocaleDateString("es-AR")} - {new Date(reciboSeleccionado.fecha_hasta).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Días Trabajados</p>
                    <p className="font-semibold">{reciboSeleccionado.dias_trabajados} días</p>
                  </div>
                </div>

                <div className="border rounded p-4 mb-4">
                  <h4 className="font-semibold mb-2 text-green-700">HABERES</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Salario Base</span>
                      <span>${reciboSeleccionado.salario_base.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Presentismo (9%)</span>
                      <span>${reciboSeleccionado.presentismo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas Extra ({reciboSeleccionado.total_horas_extra}h)</span>
                      <span>${reciboSeleccionado.horas_extra_monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonificaciones</span>
                      <span>${reciboSeleccionado.bonificaciones.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Total Haberes</span>
                      <span>${reciboSeleccionado.total_haberes.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4 mb-4">
                  <h4 className="font-semibold mb-2 text-red-700">DESCUENTOS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ausencias Injustificadas ({reciboSeleccionado.dias_ausentes_injustificados} día/s)</span>
                      <span>${reciboSeleccionado.descuento_ausencias.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Otros Descuentos</span>
                      <span>${reciboSeleccionado.otros_descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Total Descuentos</span>
                      <span>${reciboSeleccionado.total_descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="flex justify-between text-lg font-bold text-green-800">
                    <span>NETO A COBRAR</span>
                    <span>${reciboSeleccionado.total_neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {reciboSeleccionado.observaciones && (
                  <p className="mt-4 text-sm text-gray-600">
                    <strong>Observaciones:</strong> {reciboSeleccionado.observaciones}
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalVerOpen(false)}>
                Cerrar
              </Button>
              <ProtectedComponent componenteId={85}>
                <Button onClick={generarPDF}>
                  Descargar PDF
                </Button>
              </ProtectedComponent>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </ProtectedPage>
  );
}
