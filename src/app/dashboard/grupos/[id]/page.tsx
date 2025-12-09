"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Componente = {
  id_componente: number;
  nombre: string;
  ruta: string;
  id_formulario: number;
  formulario: string;
  modulo: string;
  asignado: boolean;
};

type Grupo = {
  id_grupo: number;
  nombre: string;
  estado: string;
};

const JERARQUIA_GESTION_MAQUINARIAS: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Gestion Maquinarias", nivel: 0 },
  { nombre: "Tab Cabinas", nivel: 1 },
  { nombre: "Formulario Nueva Cabina", nivel: 2 },
  { nombre: "Ver Cards Cabinas", nivel: 2 },
  { nombre: "Boton Editar Cabina", nivel: 3 },
  { nombre: "Boton Eliminar Cabina", nivel: 3 },
  { nombre: "Tab Pistolas", nivel: 1 },
  { nombre: "Formulario Nueva Pistola", nivel: 2 },
  { nombre: "Ver Cards Pistolas", nivel: 2 },
  { nombre: "Boton Editar Pistola", nivel: 3 },
  { nombre: "Boton Eliminar Pistola", nivel: 3 },
  { nombre: "Boton Registrar Mantenimiento Pistola", nivel: 3 },
  { nombre: "Tab Hornos", nivel: 1 },
  { nombre: "Formulario Nuevo Horno", nivel: 2 },
  { nombre: "Ver Cards Hornos", nivel: 2 },
  { nombre: "Boton Editar Horno", nivel: 3 },
  { nombre: "Boton Eliminar Horno", nivel: 3 },
  { nombre: "Boton Registrar Mantenimiento Horno", nivel: 3 },
];

const JERARQUIA_REPORTES_MAQUINARIAS: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Reportes Maquinarias", nivel: 0 },
  { nombre: "Acceso Reporte Uso Cabinas", nivel: 1 },
  { nombre: "Acceso Reporte Productividad Diaria", nivel: 1 },
  { nombre: "Acceso Reporte Mantenimiento Pistolas", nivel: 1 },
  { nombre: "Acceso Reporte Mantenimiento Hornos", nivel: 1 },
  { nombre: "Acceso Reporte Consumo Gas", nivel: 1 },
];

const JERARQUIA_GESTION_EMPLEADOS: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Gestion Empleados", nivel: 0 },
  { nombre: "Formulario Nuevo Empleado", nivel: 1 },
  { nombre: "Tabla Listado Empleados", nivel: 1 },
  { nombre: "Boton Editar Empleado", nivel: 2 },
  { nombre: "Boton Desactivar Empleado", nivel: 2 },
  { nombre: "Boton Ver Asistencia", nivel: 2 },
  { nombre: "Boton Ver Recibos", nivel: 2 },
];

const JERARQUIA_ASISTENCIA: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Asistencia Empleado", nivel: 0 },
  { nombre: "Calendario Asistencia", nivel: 1 },
  { nombre: "Boton Auto-cargar Asistencias", nivel: 1 },
  { nombre: "Formulario Registrar Asistencia", nivel: 1 },
];

const JERARQUIA_RECIBOS_EMPLEADO: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Recibos Empleado", nivel: 0 },
  { nombre: "Tabla Historial Recibos", nivel: 1 },
  { nombre: "Boton Generar Recibo", nivel: 2 },
  { nombre: "Boton Ver Detalle Recibo", nivel: 2 },
  { nombre: "Boton Descargar PDF", nivel: 2 },
];

const JERARQUIA_GESTION_RECIBOS: { nombre: string; nivel: number }[] = [
  { nombre: "Acceso Gestion Recibos", nivel: 0 },
  { nombre: "Tabla Todos los Recibos", nivel: 1 },
  { nombre: "Boton Generar Recibos Masivo", nivel: 2 },
  { nombre: "Boton Ver Recibo Individual", nivel: 2 },
];

const JERARQUIA_GESTION_PIEZAS: { nombre: string; nivel: number }[] = [
  { nombre: "Formulario Nueva Pieza", nivel: 0 },
  { nombre: "Tabla Listado Piezas", nivel: 0 },
  { nombre: "Boton Editar Pieza", nivel: 1 },
  { nombre: "Botón Editar Pieza", nivel: 1 },
  { nombre: "Boton Eliminar Pieza", nivel: 1 },
  { nombre: "Botón Eliminar Pieza", nivel: 1 },
];

const JERARQUIA_GESTION_PINTURAS: { nombre: string; nivel: number }[] = [
  { nombre: "Formulario Nueva Pintura", nivel: 0 },
  { nombre: "Tabla Listado Pinturas", nivel: 0 },
  { nombre: "Boton Editar Pintura", nivel: 1 },
  { nombre: "Botón Editar Pintura", nivel: 1 },
  { nombre: "Boton Eliminar Pintura", nivel: 1 },
  { nombre: "Botón Eliminar Pintura", nivel: 1 },
];

const JERARQUIA_PIEZAS_PINTADAS: { nombre: string; nivel: number }[] = [
  { nombre: "Formulario Registrar Produccion", nivel: 0 },
  { nombre: "Formulario Registrar Producción", nivel: 0 },
  { nombre: "Selector Cabina", nivel: 1 },
  { nombre: "Selector Pistola", nivel: 1 },
  { nombre: "Selector Horno", nivel: 1 },
  { nombre: "Tabla Historial Produccion", nivel: 0 },
  { nombre: "Tabla Historial Producción", nivel: 0 },
  { nombre: "Boton Eliminar Pieza Pintada", nivel: 1 },
  { nombre: "Botón Eliminar Pieza Pintada", nivel: 1 },
];

// Facturación - Remitos
const JERARQUIA_REMITOS: { nombre: string; nivel: number }[] = [
  { nombre: "Formulario Cargar Remito", nivel: 0 },
  { nombre: "Tabla Listado Remitos", nivel: 0 },
  { nombre: "Boton Ver Detalle", nivel: 1 },
  { nombre: "Botón Ver Detalle", nivel: 1 },
  { nombre: "Boton Imprimir PDF", nivel: 1 },
  { nombre: "Botón Imprimir PDF", nivel: 1 },
];

// Facturación - Facturación
const JERARQUIA_FACTURACION: { nombre: string; nivel: number }[] = [
  { nombre: "Formulario Generar Factura", nivel: 0 },
  { nombre: "Tabla Listado Facturas", nivel: 0 },
  { nombre: "Boton Ver Detalle Factura", nivel: 1 },
  { nombre: "Botón Ver Detalle Factura", nivel: 1 },
  { nombre: "Boton Imprimir Factura", nivel: 1 },
  { nombre: "Botón Imprimir Factura", nivel: 1 },
];

// Reportes de Ventas
const JERARQUIA_REPORTES_VENTAS: { nombre: string; nivel: number }[] = [
  { nombre: "Página Principal Reportes Ventas", nivel: 0 },
  { nombre: "Pagina Principal Reportes Ventas", nivel: 0 },
  { nombre: "Acceso Participacion Clientes", nivel: 1 },
  { nombre: "Acceso Participación Clientes", nivel: 1 },
  { nombre: "Acceso Pintura Mas Utilizada", nivel: 1 },
  { nombre: "Acceso Pintura Más Utilizada", nivel: 1 },
  { nombre: "Acceso Ventas por Cliente", nivel: 1 },
  { nombre: "Acceso Evolucion de Ventas", nivel: 1 },
  { nombre: "Acceso Evolución de Ventas", nivel: 1 },
  { nombre: "Acceso Consumo Pintura por Mes", nivel: 1 },
  { nombre: "Acceso Ventas Cliente Especifico", nivel: 1 },
  { nombre: "Acceso Ventas Cliente Específico", nivel: 1 },
];

// Función para obtener la jerarquía según el formulario
const getJerarquiaParaFormulario = (formulario: string): { nombre: string; nivel: number }[] => {
  const formLower = formulario.toLowerCase();
  
  if (formLower.includes("gestion de maquinaria")) return JERARQUIA_GESTION_MAQUINARIAS;
  if (formLower.includes("reportes maquinaria")) return JERARQUIA_REPORTES_MAQUINARIAS;
  if (formLower.includes("gestion de empleado")) return JERARQUIA_GESTION_EMPLEADOS;
  if (formLower.includes("asistencia empleado")) return JERARQUIA_ASISTENCIA;
  if (formLower.includes("recibos empleado")) return JERARQUIA_RECIBOS_EMPLEADO;
  if (formLower.includes("gestion de recibo")) return JERARQUIA_GESTION_RECIBOS;
  if (formLower.includes("gestion de pieza") || formLower.includes("gestión de pieza")) return JERARQUIA_GESTION_PIEZAS;
  if (formLower.includes("gestion de pintura") || formLower.includes("gestión de pintura")) return JERARQUIA_GESTION_PINTURAS;
  if (formLower.includes("piezas pintadas")) return JERARQUIA_PIEZAS_PINTADAS;
  if (formLower.includes("remito")) return JERARQUIA_REMITOS;
  if (formLower.includes("facturacion") || formLower.includes("facturación")) return JERARQUIA_FACTURACION;
  if (formLower.includes("reportes ventas") || formLower.includes("ventas")) return JERARQUIA_REPORTES_VENTAS;
  if (formLower.includes("reporte")) return JERARQUIA_REPORTES_VENTAS;
  
  return [];
};

// Obtener nivel de un componente
const getNivel = (nombre: string, formulario: string) => {
  const jerarquia = getJerarquiaParaFormulario(formulario);
  const item = jerarquia.find(j => j.nombre === nombre);
  return item?.nivel ?? 0;
};

// Ordenar componentes según jerarquía definida
const ordenarPorJerarquia = (comps: Componente[], formulario: string) => {
  const jerarquia = getJerarquiaParaFormulario(formulario);
  
  if (jerarquia.length === 0) {
    return [...comps].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  return [...comps].sort((a, b) => {
    const idxA = jerarquia.findIndex(j => j.nombre === a.nombre);
    const idxB = jerarquia.findIndex(j => j.nombre === b.nombre);
    if (idxA === -1 && idxB === -1) return a.nombre.localeCompare(b.nombre);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
};

export default function EditarPermisosGrupo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setIdGrupo(Number(resolvedParams.id));
    };
    loadParams();
  }, [params]);

  const cargarDatos = useCallback(async () => {
    if (!idGrupo) return;

    try {
      setLoading(true);

      // Cargar información del grupo
      const resGrupo = await fetch(`/api/grupos/${idGrupo}`);
      if (!resGrupo.ok) throw new Error("Error al cargar grupo");
      const dataGrupo = await resGrupo.json();
      setGrupo(dataGrupo);

      const resComponentes = await fetch(`/api/rbac/componentes?id_grupo=${idGrupo}`);
      if (!resComponentes.ok) throw new Error("Error al cargar componentes");
      const dataComponentes = await resComponentes.json();
      setComponentes(dataComponentes);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar datos");
      router.push("/dashboard/grupos");
    } finally {
      setLoading(false);
    }
  }, [idGrupo, router]);

  useEffect(() => {
    if (idGrupo) {
      cargarDatos();
    }
  }, [idGrupo, cargarDatos]);

  const toggleComponente = (idComponente: number) => {
    setComponentes((prev) => {
      const objetivo = prev.find((c) => c.id_componente === idComponente);
      if (!objetivo) return prev;

      const formulario = objetivo.formulario;
      const modulo = objetivo.modulo;
      const currentAsignado = !!objetivo.asignado;
      const nuevoAsignado = !currentAsignado;

      // ========== CASO ESPECIAL: REPORTES ==========
      const esModuloReportes = modulo.toLowerCase().includes("reporte");
      const esPaginaPrincipalReportes = objetivo.nombre.toLowerCase().includes("pagina principal") || 
                                         objetivo.nombre.toLowerCase().includes("página principal");
      
      if (esModuloReportes) {
        if (esPaginaPrincipalReportes && !nuevoAsignado) {
          return prev.map((c) => {
            if (c.modulo.toLowerCase().includes("reporte")) {
              return { ...c, asignado: false };
            }
            return c;
          });
        }
        
        if (!esPaginaPrincipalReportes && nuevoAsignado) {
          const paginaPrincipal = prev.find((c) => 
            c.modulo.toLowerCase().includes("reporte") && 
            (c.nombre.toLowerCase().includes("pagina principal") || c.nombre.toLowerCase().includes("página principal"))
          );
          
          if (!paginaPrincipal || !paginaPrincipal.asignado) {
            return prev;
          }
        }
        
        return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: nuevoAsignado } : c));
      }

      const nivelObjetivo = getNivel(objetivo.nombre, formulario);

      // Si estamos DESACTIVANDO el componente, también desactivamos en cascada
      // a todos los hijos (niveles mayores) que estén dentro del mismo formulario.
      if (!nuevoAsignado) {
        // Ordenar componentes del mismo formulario según la jerarquía visual
        const compsFormulario = ordenarPorJerarquia(
          prev.filter((p) => p.formulario === formulario),
          formulario
        );

        const idx = compsFormulario.findIndex((c) => c.id_componente === idComponente);
        if (idx === -1) {
          // no encontrado en esa lista, fallback: solo desactivar el objetivo
          return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: nuevoAsignado } : c));
        }

        const idsAHacerFalse: number[] = [];

        for (let i = idx + 1; i < compsFormulario.length; i++) {
          const nivelSig = getNivel(compsFormulario[i].nombre, formulario);
          // si el siguiente elemento es de un nivel mayor, es hijo; si es menor o igual, se rompe
          if (nivelSig > nivelObjetivo) {
            idsAHacerFalse.push(compsFormulario[i].id_componente);
          } else {
            break;
          }
        }

        return prev.map((c) => {
          if (c.id_componente === idComponente) return { ...c, asignado: nuevoAsignado };
          if (idsAHacerFalse.includes(c.id_componente)) return { ...c, asignado: false };
          return c;
        });
      }

      // Si estamos ACTIVANDO, validar que todos los ancestros estén activos.
      if (nuevoAsignado) {
        // Si el componente es de nivel 0 no hay ancestros que validar
        if (nivelObjetivo === 0) {
          return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: nuevoAsignado } : c));
        }

        // Construir la lista de componentes del formulario ordenados
        const compsFormulario = ordenarPorJerarquia(
          prev.filter((p) => p.formulario === formulario),
          formulario
        );
        const idxTarget = compsFormulario.findIndex((c) => c.id_componente === idComponente);
        if (idxTarget === -1) return prev;

        // Recolectar los ancestros necesarios (primer elemento con nivel menor, luego su ancestro, etc.)
        const ancestros: Componente[] = [];
        let nivelCursor = nivelObjetivo;
        for (let i = idxTarget - 1; i >= 0; i--) {
          const nivelI = getNivel(compsFormulario[i].nombre, formulario);
          if (nivelI < nivelCursor) {
            ancestros.push(compsFormulario[i]);
            nivelCursor = nivelI;
            if (nivelCursor === 0) break;
          }
        }

        // Verificar que todos los ancestros estén asignados en el estado actual
        for (const anc of ancestros) {
          const ancEstado = prev.find((p) => p.id_componente === anc.id_componente);
          if (!ancEstado || !ancEstado.asignado) {
            return prev; // no permitir activar el hijo si el padre no está activo
          }
        }

        // Todos los ancestros están activos -> permitir activar el componente
        return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: nuevoAsignado } : c));
      }

      // Por defecto, togglear (caso ya cubierto arriba)
      return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: nuevoAsignado } : c));
    });
  };

  const guardarPermisos = async () => {
    if (!idGrupo) return;

    try {
      setGuardando(true);

      const componentesAsignados = componentes
        .filter((c) => c.asignado)
        .map((c) => c.id_componente);

      const res = await fetch(`/api/rbac/asignar-componentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_grupo: idGrupo,
          componentes: componentesAsignados,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar permisos");
      }

      alert("Permisos actualizados exitosamente");
      router.push("/dashboard/grupos");
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al guardar permisos");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-slate-100 p-10">
        <p>Grupo no encontrado</p>
      </div>
    );
  }

  // Agrupar componentes por módulo y formulario
  const componentesPorModulo = componentes.reduce((acc, comp) => {
    if (!acc[comp.modulo]) {
      acc[comp.modulo] = {};
    }
    if (!acc[comp.modulo][comp.formulario]) {
      acc[comp.modulo][comp.formulario] = [];
    }
    acc[comp.modulo][comp.formulario].push(comp);
    return acc;
  }, {} as Record<string, Record<string, Componente[]>>);

  // Verificar si es el último elemento de su nivel bajo el mismo padre
  const esUltimoDeNivel = (nombre: string, formulario: string, comps: Componente[], idx: number) => {
    const ordenados = ordenarPorJerarquia(comps, formulario);
    const nivelActual = getNivel(nombre, formulario);
    
    for (let i = idx + 1; i < ordenados.length; i++) {
      const nivelSig = getNivel(ordenados[i].nombre, formulario);
      if (nivelSig === nivelActual) return false;
      if (nivelSig < nivelActual) return true;
    }
    return true;
  };

  // Verificar si debe mostrar línea vertical en un nivel específico
  const tieneHermanoPosterior = (nombre: string, formulario: string, comps: Componente[], idx: number, nivelCheck: number) => {
    const ordenados = ordenarPorJerarquia(comps, formulario);
    
    for (let i = idx + 1; i < ordenados.length; i++) {
      const nivelSig = getNivel(ordenados[i].nombre, formulario);
      if (nivelSig === nivelCheck) return true;
      if (nivelSig < nivelCheck) return false;
    }
    return false;
  };

  // Componente para renderizar un item del árbol
  const TreeItem = ({ comp, formulario, comps, idx }: { 
    comp: Componente; 
    formulario: string; 
    comps: Componente[];
    idx: number;
  }) => {
    const nivel = getNivel(comp.nombre, formulario);
    const esUltimo = esUltimoDeNivel(comp.nombre, formulario, comps, idx);
    
    const getLineasVerticales = () => {
      const lineas: boolean[] = [];
      for (let n = 0; n < nivel; n++) {
        lineas.push(tieneHermanoPosterior(comp.nombre, formulario, comps, idx, n + 1));
      }
      return lineas;
    };
    
    const lineasVerticales = getLineasVerticales();
    
    return (
      <div className="flex items-stretch">
        {Array.from({ length: nivel }).map((_, n) => (
          <div key={n} className="w-5 relative flex items-center justify-center">
            {(n < nivel - 1 ? lineasVerticales[n] : true) && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-px bg-slate-400"
                style={{
                  top: 0,
                  bottom: n === nivel - 1 && esUltimo ? '50%' : 0,
                }}
              />
            )}
            {n === nivel - 1 && (
              <div className="absolute left-1/2 right-0 h-px bg-slate-400 top-1/2" />
            )}
          </div>
        ))}
        
        <div className="flex items-center py-1">
          <Checkbox
            id={`comp-${comp.id_componente}`}
            checked={comp.asignado}
            onCheckedChange={() => toggleComponente(comp.id_componente)}
          />
          <Label
            htmlFor={`comp-${comp.id_componente}`}
            className={`cursor-pointer ml-2 text-sm ${nivel === 0 ? 'font-semibold' : ''}`}
          >
            {comp.nombre}
          </Label>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permisos: {grupo.nombre}</h1>
          <p className="text-gray-600 mt-1">Estado: {grupo.estado}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/grupos")}>
          Volver a Grupos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Componentes Disponibles</CardTitle>
          <p className="text-sm text-gray-600">
            Selecciona los componentes a los que este grupo tendrá acceso
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(componentesPorModulo).map(([modulo, formularios]) => (
              <div key={modulo} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">{modulo}</h3>

                {Object.entries(formularios).map(([formulario, comps]) => {
                  // Agrupar los reportes de maquinarias en una sola sección
                  const esReporteMaquinaria = formulario.toLowerCase().includes("reporte") && 
                    modulo.toLowerCase().includes("maquinaria");
                  
                  if (esReporteMaquinaria && formulario !== "Reportes Maquinarias Principal") {
                    return null; // Se renderizará con el formulario principal
                  }

                  // Si es el formulario principal de reportes maquinarias, agrupar todos
                  if (formulario === "Reportes Maquinarias Principal") {
                    const todosReportes = componentes.filter(c => 
                      c.modulo === modulo && 
                      c.formulario.toLowerCase().includes("reporte")
                    );
                    
                    return (
                      <div key={formulario} className="ml-4 mb-4">
                        <h4 className="font-semibold text-md mb-3">Reportes de Maquinarias</h4>
                        <div>
                          {ordenarPorJerarquia(todosReportes, "reportes maquinarias").map((comp, idx) => (
                            <TreeItem 
                              key={comp.id_componente}
                              comp={comp}
                              formulario="reportes maquinarias"
                              comps={todosReportes}
                              idx={idx}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Agrupar los reportes de ventas en una sola sección
                  const esReporteVentas = modulo === "Reportes" && 
                    (formulario.includes("Ventas") || formulario.includes("Participación") || 
                     formulario.includes("Pintura") || formulario.includes("Evolución") || 
                     formulario.includes("Consumo"));
                  
                  if (esReporteVentas && formulario !== "Reportes Ventas Principal") {
                    return null; // Se renderizará con el formulario principal
                  }

                  // Si es el formulario principal de reportes ventas, agrupar todos
                  if (formulario === "Reportes Ventas Principal") {
                    const todosReportesVentas = componentes.filter(c => 
                      c.modulo === "Reportes"
                    );
                    
                    return (
                      <div key={formulario} className="ml-4 mb-4">
                        <h4 className="font-semibold text-md mb-3">Reportes de Ventas</h4>
                        <div>
                          {ordenarPorJerarquia(todosReportesVentas, "reportes ventas").map((comp, idx) => (
                            <TreeItem 
                              key={comp.id_componente}
                              comp={comp}
                              formulario="reportes ventas"
                              comps={todosReportesVentas}
                              idx={idx}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={formulario} className="ml-4 mb-4">
                      <h4 className="font-semibold text-md mb-3">{formulario}</h4>

                      <div>
                        {ordenarPorJerarquia(comps, formulario).map((comp, idx) => (
                          <TreeItem 
                            key={comp.id_componente}
                            comp={comp}
                            formulario={formulario}
                            comps={comps}
                            idx={idx}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <Button onClick={guardarPermisos} disabled={guardando} className="flex-1">
              {guardando ? "Guardando..." : "Guardar Permisos"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/grupos")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
