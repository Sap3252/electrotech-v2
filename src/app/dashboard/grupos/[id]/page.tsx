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
    setComponentes((prev) =>
      prev.map((c) =>
        c.id_componente === idComponente ? { ...c, asignado: !c.asignado } : c
      )
    );
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
                  <div key={formulario} className="ml-4 mb-4">
                    <h4 className="font-semibold text-md mb-2">{formulario}</h4>
                    
                    <div className="ml-4 space-y-2">
                      {comps.map((comp) => (
                        <div
                          key={comp.id_componente}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`comp-${comp.id_componente}`}
                            checked={comp.asignado}
                            onCheckedChange={() => toggleComponente(comp.id_componente)}
                          />
                          <Label
                            htmlFor={`comp-${comp.id_componente}`}
                            className="text-sm cursor-pointer"
                          >
                            {comp.nombre} ({comp.ruta})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
