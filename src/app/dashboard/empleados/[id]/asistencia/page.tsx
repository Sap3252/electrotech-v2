"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Asistencia {
  id_asistencia: number;
  fecha: string;
  presente: boolean;
  es_sabado: boolean;
  horas_extra: number;
  justificada: boolean | null;
  motivo: string | null;
}

interface ResumenAsistencia {
  dias_presentes: number;
  ausencias_justificadas: number;
  ausencias_injustificadas: number;
  total_horas_extra: number;
  sabados_trabajados: number;
}

interface DiaCalendario {
  fecha: Date;
  diaNumero: number;
  esMesActual: boolean;
  esHoy: boolean;
  esFinde: boolean;
  esDomingo: boolean;
  asistencia?: Asistencia;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AsistenciaEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [resumen, setResumen] = useState<ResumenAsistencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del calendario
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);

  // Modal de registro
  const [modalOpen, setModalOpen] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaCalendario | null>(null);
  const [formAsistencia, setFormAsistencia] = useState({
    presente: true,
    es_sabado: false,
    horas_extra: "",
    justificada: true,
    motivo: "",
  });
  const [saving, setSaving] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [id, mesActual, anioActual]);

  useEffect(() => {
    generarCalendario();
  }, [mesActual, anioActual, asistencias]);

  async function cargarDatos() {
    try {
      setLoading(true);
      const res = await fetch(`/api/asistencias/${id}?mes=${mesActual}&anio=${anioActual}`);
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar datos");
      }

      const data = await res.json();
      setEmpleado(data.empleado);
      setAsistencias(data.asistencias);
      setResumen(data.resumen);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function generarCalendario() {
    const primerDia = new Date(anioActual, mesActual - 1, 1);
    const ultimoDia = new Date(anioActual, mesActual, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias: DiaCalendario[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Días del mes anterior
    const diasMesAnterior = new Date(anioActual, mesActual - 1, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const fecha = new Date(anioActual, mesActual - 2, diasMesAnterior - i);
      dias.push({
        fecha,
        diaNumero: diasMesAnterior - i,
        esMesActual: false,
        esHoy: false,
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        esDomingo: fecha.getDay() === 0,
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anioActual, mesActual - 1, dia);
      const fechaStr = fecha.toISOString().split("T")[0];
      const asistencia = asistencias.find((a) => {
        const asistFecha = new Date(a.fecha).toISOString().split("T")[0];
        return asistFecha === fechaStr;
      });

      dias.push({
        fecha,
        diaNumero: dia,
        esMesActual: true,
        esHoy: fecha.getTime() === hoy.getTime(),
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        esDomingo: fecha.getDay() === 0,
        asistencia,
      });
    }

    // Días del mes siguiente (completar 6 filas)
    const diasRestantes = 42 - dias.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(anioActual, mesActual, dia);
      dias.push({
        fecha,
        diaNumero: dia,
        esMesActual: false,
        esHoy: false,
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        esDomingo: fecha.getDay() === 0,
      });
    }

    setDiasCalendario(dias);
  }

  function abrirModalDia(dia: DiaCalendario) {
    // No permitir domingos
    if (dia.esDomingo) {
      return;
    }

    // No permitir fechas futuras
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (dia.fecha > hoy) {
      return;
    }

    setDiaSeleccionado(dia);

    if (dia.asistencia) {
      setFormAsistencia({
        presente: dia.asistencia.presente,
        es_sabado: dia.asistencia.es_sabado,
        horas_extra: dia.asistencia.horas_extra?.toString() || "",
        justificada: dia.asistencia.justificada ?? true,
        motivo: dia.asistencia.motivo || "",
      });
    } else {
      setFormAsistencia({
        presente: true,
        es_sabado: dia.fecha.getDay() === 6,
        horas_extra: "",
        justificada: true,
        motivo: "",
      });
    }

    setModalOpen(true);
  }

  async function handleSubmitAsistencia(e: React.FormEvent) {
    e.preventDefault();
    if (!diaSeleccionado) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        id_empleado: parseInt(id),
        fecha: diaSeleccionado.fecha.toISOString().split("T")[0],
        presente: formAsistencia.presente,
        es_sabado: formAsistencia.es_sabado,
        horas_extra: formAsistencia.horas_extra ? parseFloat(formAsistencia.horas_extra) : 0,
        justificada: formAsistencia.presente ? undefined : formAsistencia.justificada,
        motivo: formAsistencia.presente ? undefined : formAsistencia.motivo,
      };

      const res = await fetch("/api/asistencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar asistencia");
      }

      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function mesAnterior() {
    if (mesActual === 1) {
      setMesActual(12);
      setAnioActual(anioActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  }

  function mesSiguiente() {
    if (mesActual === 12) {
      setMesActual(1);
      setAnioActual(anioActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  }

  function getEstiloDia(dia: DiaCalendario): string {
    if (!dia.esMesActual) {
      return "bg-gray-50 text-gray-400";
    }

    // Domingos siempre en gris oscuro y no clickeables
    if (dia.esDomingo) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (dia.asistencia) {
      if (dia.asistencia.presente) {
        return dia.asistencia.es_sabado
          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
          : "bg-green-100 text-green-800 hover:bg-green-200";
      } else {
        return dia.asistencia.justificada
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          : "bg-red-100 text-red-800 hover:bg-red-200";
      }
    }

    if (dia.esHoy) {
      return "bg-blue-500 text-white hover:bg-blue-600";
    }

    if (dia.esFinde) {
      return "bg-gray-100 text-gray-600 hover:bg-gray-200";
    }

    return "bg-white hover:bg-gray-100";
  }

  async function autoCargarAsistencias() {
    setAutoLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Calcular primer día del mes seleccionado
      const fechaDesde = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`;
      
      // Calcular último día del mes o último día laborable completo, lo que sea menor
      const ultimoDiaMes = new Date(anioActual, mesActual, 0).getDate();
      const hoy = new Date();
      const mesActualEsActual = hoy.getFullYear() === anioActual && (hoy.getMonth() + 1) === mesActual;
      
      let fechaHasta: string;
      
      if (mesActualEsActual) {
        // Si estamos en el mes actual, cargar hasta hoy
        const hoy = new Date();
        fechaHasta = hoy.toISOString().split('T')[0];
      } else {
        // Para meses pasados, usar el último día del mes
        fechaHasta = `${anioActual}-${String(mesActual).padStart(2, '0')}-${ultimoDiaMes}`;
      }

      const res = await fetch("/api/asistencias/auto-cargar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empleado: id,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al auto-cargar asistencias");
      }

      setSuccessMsg(`${data.registros_creados} asistencias cargadas automáticamente`);
      cargarDatos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAutoLoading(false);
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
    <ProtectedPage ruta="/dashboard/empleados/[id]/asistencia">
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Asistencia: {empleado.apellido}, {empleado.nombre}
            </h1>
            <p className="text-gray-600">DNI: {empleado.dni}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/empleados")}>
            Volver a Empleados
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

        {/* Botón Auto-cargar */}
        <div className="mb-4">
          <ProtectedComponent componenteId={79}>
            <Button 
              onClick={autoCargarAsistencias} 
              disabled={autoLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {autoLoading ? "Cargando..." : "Auto-cargar Asistencias del Mes"}
            </Button>
          </ProtectedComponent>
          <span className="ml-3 text-sm text-gray-600">
            Marca automáticamente como presente todos los días pasados (lunes a viernes)
          </span>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{resumen?.dias_presentes || 0}</p>
              <p className="text-sm text-gray-600">Días Presentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{resumen?.ausencias_justificadas || 0}</p>
              <p className="text-sm text-gray-600">Faltas Justif.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-600">{resumen?.ausencias_injustificadas || 0}</p>
              <p className="text-sm text-gray-600">Faltas Injustif.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{resumen?.total_horas_extra || 0}h</p>
              <p className="text-sm text-gray-600">Horas Extra</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{resumen?.sabados_trabajados || 0}</p>
              <p className="text-sm text-gray-600">Sábados Trab.</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={mesAnterior}>
                ← Anterior
              </Button>
              <CardTitle>
                {MESES[mesActual - 1]} {anioActual}
              </CardTitle>
              <Button variant="outline" onClick={mesSiguiente}>
                Siguiente →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border rounded"></div>
                <span>Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border rounded"></div>
                <span>Sábado trabajado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
                <span>Falta justificada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border rounded"></div>
                <span>Falta injustificada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 border rounded"></div>
                <span>Domingo (no laboral)</span>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-center font-semibold text-gray-600 py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {diasCalendario.map((dia, index) => (
                <div
                  key={index}
                  onClick={() => dia.esMesActual && !dia.esDomingo && abrirModalDia(dia)}
                  className={`
                    h-20 p-2 rounded transition-colors border
                    ${getEstiloDia(dia)}
                    ${!dia.esMesActual || dia.esDomingo ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="font-semibold">{dia.diaNumero}</div>
                  {dia.esDomingo && dia.esMesActual && (
                    <div className="text-xs mt-1 text-gray-500">No laboral</div>
                  )}
                  {!dia.esDomingo && dia.asistencia && (
                    <div className="text-xs mt-1">
                      {dia.asistencia.presente ? (
                        <>
                          ✓
                          {dia.asistencia.horas_extra > 0 && (
                            <span className="ml-1">+{dia.asistencia.horas_extra}h</span>
                          )}
                        </>
                      ) : (
                        <span>{dia.asistencia.justificada ? "J" : "I"}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Asistencia */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Registrar Asistencia - {diaSeleccionado?.fecha.toLocaleDateString("es-AR")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAsistencia}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={formAsistencia.presente ? "presente" : "ausente"}
                    onValueChange={(v) =>
                      setFormAsistencia({ ...formAsistencia, presente: v === "presente" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presente">Presente</SelectItem>
                      <SelectItem value="ausente">Ausente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formAsistencia.presente && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="es_sabado"
                        checked={formAsistencia.es_sabado}
                        onChange={(e) =>
                          setFormAsistencia({ ...formAsistencia, es_sabado: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="es_sabado">Es sábado (horas con extra)</Label>
                    </div>

                    <div>
                      <Label htmlFor="horas_extra">Horas Extra</Label>
                      <Input
                        id="horas_extra"
                        type="number"
                        step="0.5"
                        min="0"
                        max="12"
                        value={formAsistencia.horas_extra}
                        onChange={(e) =>
                          setFormAsistencia({ ...formAsistencia, horas_extra: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                {!formAsistencia.presente && (
                  <>
                    <div>
                      <Label>¿Es justificada?</Label>
                      <Select
                        value={formAsistencia.justificada ? "si" : "no"}
                        onValueChange={(v) =>
                          setFormAsistencia({ ...formAsistencia, justificada: v === "si" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí, justificada</SelectItem>
                          <SelectItem value="no">No, injustificada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="motivo">Motivo de la ausencia</Label>
                      <Input
                        id="motivo"
                        value={formAsistencia.motivo}
                        onChange={(e) =>
                          setFormAsistencia({ ...formAsistencia, motivo: e.target.value })
                        }
                        placeholder="Ej: Enfermedad, trámite personal..."
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <ProtectedComponent componenteId={80}>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
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
