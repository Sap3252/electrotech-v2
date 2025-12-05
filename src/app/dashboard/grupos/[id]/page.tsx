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

      // Cargar componentes disponibles con estado de asignación
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
      // Encontrar el componente objetivo
      const objetivo = prev.find((c) => c.id_componente === idComponente);
      if (!objetivo) return prev;

      const formulario = objetivo.formulario;
      const currentAsignado = !!objetivo.asignado;
      const nuevoAsignado = !currentAsignado;

      // CASO ESPECIAL: Si es "Acceso Reportes Maquinarias" (el padre de todos los reportes de maquinarias)
      if (objetivo.nombre === "Acceso Reportes Maquinarias") {
        if (!nuevoAsignado) {
          // Desactivar TODOS los reportes de maquinarias (hijos)
          return prev.map((c) => {
            if (c.id_componente === idComponente) return { ...c, asignado: false };
            // Desactivar todos los componentes que son reportes de maquinarias
            if (c.ruta?.startsWith("/reportes/maquinarias/")) return { ...c, asignado: false };
            return c;
          });
        }
        // Si estamos activando, solo activar el padre
        return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: true } : c));
      }

      // CASO ESPECIAL: Si es un reporte hijo de maquinarias, verificar que el padre esté activo
      if (objetivo.ruta?.startsWith("/reportes/maquinarias/") && nuevoAsignado) {
        const padre = prev.find((c) => c.nombre === "Acceso Reportes Maquinarias");
        if (padre && !padre.asignado) {
          alert("Debes activar primero: Acceso Reportes Maquinarias");
          return prev;
        }
        return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: true } : c));
      }

      // Si es un reporte hijo y estamos desactivando, solo desactivar ese
      if (objetivo.ruta?.startsWith("/reportes/maquinarias/") && !nuevoAsignado) {
        return prev.map((c) => (c.id_componente === idComponente ? { ...c, asignado: false } : c));
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
            alert(`Debes activar primero: ${anc.nombre} (nivel ${getNivel(anc.nombre, formulario)})`);
            return prev; // no permitir activar el hijo
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

      console.log('[guardarPermisos] Componentes seleccionados:', componentesAsignados);
      console.log('[guardarPermisos] Total componentes:', componentes.length);
      console.log('[guardarPermisos] Componentes asignados:', componentesAsignados.length);

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

  // Definir jerarquía visual de componentes para Maquinarias
  // Estructura: nombre -> { nivel, orden dentro del nivel }
  const JERARQUIA_MAQUINARIAS: { nombre: string; nivel: number }[] = [
    // Cabinas
    { nombre: "Tab Cabinas", nivel: 0 },
    { nombre: "Formulario Nueva Cabina", nivel: 1 },
    { nombre: "Ver Cards Cabinas", nivel: 1 },
    { nombre: "Botón Editar Cabina", nivel: 2 },
    { nombre: "Botón Eliminar Cabina", nivel: 2 },
    // Pistolas
    { nombre: "Tab Pistolas", nivel: 0 },
    { nombre: "Formulario Nueva Pistola", nivel: 1 },
    { nombre: "Ver Cards Pistolas", nivel: 1 },
    { nombre: "Botón Editar Pistola", nivel: 2 },
    { nombre: "Botón Eliminar Pistola", nivel: 2 },
    { nombre: "Botón Registrar Mantenimiento Pistola", nivel: 2 },
    // Hornos
    { nombre: "Tab Hornos", nivel: 0 },
    { nombre: "Formulario Nuevo Horno", nivel: 1 },
    { nombre: "Ver Cards Hornos", nivel: 1 },
    { nombre: "Botón Editar Horno", nivel: 2 },
    { nombre: "Botón Eliminar Horno", nivel: 2 },
    { nombre: "Botón Registrar Mantenimiento Horno", nivel: 2 },
  ];

  const JERARQUIA_REPORTES: { nombre: string; nivel: number }[] = [
    // Componente padre para Reportes de Maquinarias
    { nombre: "Acceso Reportes Maquinarias", nivel: 0 },
    // Reportes individuales (hijos)
    { nombre: "Acceso Reporte Uso de Cabinas", nivel: 1 },
    { nombre: "Acceso Reporte Productividad Diaria", nivel: 1 },
    { nombre: "Acceso Reporte Mantenimiento Pistolas", nivel: 1 },
    { nombre: "Acceso Reporte Mantenimiento Hornos", nivel: 1 },
    { nombre: "Acceso Reporte Consumo de Gas", nivel: 1 },
  ];

  // Ordenar componentes según jerarquía definida
  const ordenarPorJerarquia = (comps: Componente[], formulario: string) => {
    const jerarquia = formulario.includes("Reporte") ? JERARQUIA_REPORTES : JERARQUIA_MAQUINARIAS;
    
    return [...comps].sort((a, b) => {
      const idxA = jerarquia.findIndex(j => j.nombre === a.nombre);
      const idxB = jerarquia.findIndex(j => j.nombre === b.nombre);
      // Si no está en la jerarquía, va al final
      if (idxA === -1 && idxB === -1) return a.nombre.localeCompare(b.nombre);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  // Obtener nivel de un componente
  const getNivel = (nombre: string, formulario: string) => {
    const jerarquia = formulario.includes("Reporte") ? JERARQUIA_REPORTES : JERARQUIA_MAQUINARIAS;
    const item = jerarquia.find(j => j.nombre === nombre);
    return item?.nivel ?? 0;
  };

  // Generar prefijo visual de árbol
  const getPrefijoArbol = (nombre: string, formulario: string, comps: Componente[], idx: number) => {
    const jerarquia = formulario.includes("Reporte") ? JERARQUIA_REPORTES : JERARQUIA_MAQUINARIAS;
    const item = jerarquia.find(j => j.nombre === nombre);
    if (!item) return "";
    
    const nivel = item.nivel;
    if (nivel === 0) return "";
    
    // Buscar si hay más elementos del mismo nivel después
    const ordenados = ordenarPorJerarquia(comps, formulario);
    const miIdx = ordenados.findIndex(c => c.nombre === nombre);
    let esUltimo = true;
    
    for (let i = miIdx + 1; i < ordenados.length; i++) {
      const nivelSig = getNivel(ordenados[i].nombre, formulario);
      if (nivelSig === nivel) {
        esUltimo = false;
        break;
      }
      if (nivelSig < nivel) break;
    }
    
    let prefijo = "";
    for (let n = 1; n < nivel; n++) {
      prefijo += "│   ";
    }
    prefijo += esUltimo ? "└── " : "├── ";
    
    return prefijo;
  };

  // Extraer componentes que pertenecen específicamente a Reportes Maquinarias
  const reportesMaquinariaComps = componentes.filter((c) => {
    const ruta = c.ruta ?? "";
    const form = c.formulario ?? "";
    return (
      ruta.startsWith("/reportes/maquinarias") ||
      (form.toLowerCase().includes("reporte") && form.toLowerCase().includes("maquinari"))
    );
  });

  const reportesFormularios = new Set(reportesMaquinariaComps.map((c) => c.formulario));

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

                {Object.entries(formularios).map(([formulario, comps]) => (
                  reportesFormularios.has(formulario) ? null : (
                    <div key={formulario} className="ml-4 mb-4">
                      <h4 className="font-semibold text-md mb-2">{formulario}</h4>

                      <div className="space-y-1">
                        {ordenarPorJerarquia(comps, formulario).map((comp, idx) => {
                          const prefijo = getPrefijoArbol(comp.nombre, formulario, comps, idx);
                          const nivel = getNivel(comp.nombre, formulario);
                          const indent = nivel === 0 ? 0 : nivel * 12;

                          return (
                            <div
                              key={comp.id_componente}
                              className="flex items-center font-mono text-sm"
                              style={{ marginLeft: `${indent}px` }}
                            >
                              <span className="text-gray-400 select-none whitespace-pre">{prefijo}</span>
                              <Checkbox
                                id={`comp-${comp.id_componente}`}
                                checked={comp.asignado}
                                onCheckedChange={() => toggleComponente(comp.id_componente)}
                              />
                              <Label
                                htmlFor={`comp-${comp.id_componente}`}
                                className="cursor-pointer ml-2 font-sans"
                              >
                                {comp.nombre}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ))}

            {reportesMaquinariaComps.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Reportes Maquinarias</h3>

                <div className="space-y-1">
                  {/* Componente padre: Acceso Reportes Maquinarias */}
                  {reportesMaquinariaComps
                    .filter(c => c.nombre === "Acceso Reportes Maquinarias")
                    .map((comp) => (
                      <div key={comp.id_componente} className="flex items-center font-mono text-sm mb-2">
                        <Checkbox
                          id={`comp-${comp.id_componente}`}
                          checked={comp.asignado}
                          onCheckedChange={() => toggleComponente(comp.id_componente)}
                        />
                        <Label htmlFor={`comp-${comp.id_componente}`} className="cursor-pointer ml-2 font-sans font-semibold">
                          {comp.nombre}
                        </Label>
                      </div>
                    ))}

                  {/* Componentes hijos: Reportes individuales */}
                  {ordenarPorJerarquia(
                    reportesMaquinariaComps.filter(c => c.nombre !== "Acceso Reportes Maquinarias"),
                    "Reportes"
                  ).map((comp) => (
                    <div key={comp.id_componente} className="flex items-center font-mono text-sm ml-6">
                      <span className="text-gray-400 select-none whitespace-pre mr-2">├── </span>
                      <Checkbox
                        id={`comp-${comp.id_componente}`}
                        checked={comp.asignado}
                        onCheckedChange={() => toggleComponente(comp.id_componente)}
                      />
                      <Label htmlFor={`comp-${comp.id_componente}`} className="cursor-pointer ml-2 font-sans">
                        {comp.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
