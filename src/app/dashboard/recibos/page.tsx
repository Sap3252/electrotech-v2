"use client";

import { useEffect, useState } from "react";
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

interface Recibo {
  id_recibo: number;
  id_empleado: number;
  periodo_quincena: number;
  periodo_mes: number;
  periodo_anio: number;
  salario_base: number;
  presentismo: number;
  horas_extra_monto: number;
  total_haberes: number;
  total_descuentos: number;
  total_neto: number;
  nombre: string;
  apellido: string;
  dni: string;
  funcion: string;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function RecibosPage() {
  const router = useRouter();
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros
  const [filtroMes, setFiltroMes] = useState<string>("");
  const [filtroAnio, setFiltroAnio] = useState<string>(new Date().getFullYear().toString());
  const [filtroQuincena, setFiltroQuincena] = useState<string>("");

  // Modal generación masiva
  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);
  const [formMasivo, setFormMasivo] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    quincena: 1,
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    cargarRecibos();
  }, [filtroMes, filtroAnio, filtroQuincena]);

  async function cargarRecibos() {
    try {
      setLoading(true);
      let url = "/api/recibos?";

      if (filtroMes) url += `mes=${filtroMes}&`;
      if (filtroAnio) url += `anio=${filtroAnio}&`;
      if (filtroQuincena) url += `quincena=${filtroQuincena}&`;

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar recibos");
      }

      const data = await res.json();
      setRecibos(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerarMasivo(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/recibos/generar-masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes: formMasivo.mes,
          anio: formMasivo.anio,
          quincena: formMasivo.quincena,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al generar recibos");
      }

      setSuccessMsg(data.mensaje);
      setModalMasivoOpen(false);
      cargarRecibos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  // Calcular totales
  const totales = recibos.reduce(
    (acc, rec) => ({
      haberes: acc.haberes + parseFloat(rec.total_haberes?.toString() || "0"),
      descuentos: acc.descuentos + parseFloat(rec.total_descuentos?.toString() || "0"),
      neto: acc.neto + parseFloat(rec.total_neto?.toString() || "0"),
    }),
    { haberes: 0, descuentos: 0, neto: 0 }
  );

  if (loading && recibos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <ProtectedPage ruta="/dashboard/recibos">
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Recibos de Sueldo</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMsg}
            <button className="float-right" onClick={() => setSuccessMsg(null)}>×</button>
          </div>
        )}

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">Total Haberes</p>
              <p className="text-2xl font-bold text-green-600">
                ${totales.haberes.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">Total Descuentos</p>
              <p className="text-2xl font-bold text-red-600">
                ${totales.descuentos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">Total Neto a Pagar</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totales.neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <CardTitle>Recibos Generados</CardTitle>
              <ProtectedComponent componenteId={88}>
                <Button onClick={() => setModalMasivoOpen(true)}>
                  Generar Recibos Masivo
                </Button>
              </ProtectedComponent>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-40">
                <Label>Mes</Label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {MESES.map((mes, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label>Año</Label>
                <Input
                  type="number"
                  value={filtroAnio}
                  onChange={(e) => setFiltroAnio(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Label>Quincena</Label>
                <Select value={filtroQuincena} onValueChange={setFiltroQuincena}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">Primera</SelectItem>
                    <SelectItem value="2">Segunda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Salario Base</TableHead>
                    <TableHead className="text-right">Presentismo</TableHead>
                    <TableHead className="text-right">Total Haberes</TableHead>
                    <TableHead className="text-right">Descuentos</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recibos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No hay recibos para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    recibos.map((rec) => (
                      <TableRow key={rec.id_recibo}>
                        <TableCell className="font-medium">
                          {rec.apellido}, {rec.nombre}
                        </TableCell>
                        <TableCell>{rec.dni}</TableCell>
                        <TableCell>
                          {rec.periodo_quincena === 1 ? "1ra" : "2da"} Q - {MESES[rec.periodo_mes - 1]} {rec.periodo_anio}
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(rec.salario_base?.toString() || "0").toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(rec.presentismo?.toString() || "0").toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(rec.total_haberes?.toString() || "0").toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -${parseFloat(rec.total_descuentos?.toString() || "0").toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ${parseFloat(rec.total_neto?.toString() || "0").toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <ProtectedComponent componenteId={89}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/empleados/${rec.id_empleado}/recibos`)}
                            >
                              Ver
                            </Button>
                          </ProtectedComponent>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Generación Masiva */}
        <Dialog open={modalMasivoOpen} onOpenChange={setModalMasivoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Recibos Masivo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerarMasivo}>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-gray-600">
                  Se generarán recibos para todos los empleados activos con salario configurado.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Mes</Label>
                    <Select
                      value={formMasivo.mes.toString()}
                      onValueChange={(v) => setFormMasivo({ ...formMasivo, mes: parseInt(v) })}
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
                      value={formMasivo.anio}
                      onChange={(e) => setFormMasivo({ ...formMasivo, anio: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Quincena</Label>
                    <Select
                      value={formMasivo.quincena.toString()}
                      onValueChange={(v) => setFormMasivo({ ...formMasivo, quincena: parseInt(v) })}
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalMasivoOpen(false)}>
                  Cancelar
                </Button>
                <ProtectedComponent componenteId={88}>
                  <Button type="submit" disabled={generating}>
                    {generating ? "Generando..." : "Generar Recibos"}
                  </Button>
                </ProtectedComponent>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </ProtectedPage>
  );
}
