"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

// Definir jerarquía de permisos
// Si no tenés el padre, no podés ver los hijos
const JERARQUIA_PERMISOS: Record<string, string[]> = {
  // Cabinas
  "Tab Cabinas": [
    "Ver Cards Cabinas",
    "Formulario Nueva Cabina",
    "Boton Editar Cabina",
    "Boton Eliminar Cabina",
  ],
  "Ver Cards Cabinas": [
    "Boton Editar Cabina",
    "Boton Eliminar Cabina",
  ],
  // Pistolas
  "Tab Pistolas": [
    "Ver Cards Pistolas",
    "Formulario Nueva Pistola",
    "Boton Editar Pistola",
    "Boton Eliminar Pistola",
    "Boton Registrar Mantenimiento Pistola",
  ],
  "Ver Cards Pistolas": [
    "Boton Editar Pistola",
    "Boton Eliminar Pistola",
    "Boton Registrar Mantenimiento Pistola",
  ],
  // Hornos
  "Tab Hornos": [
    "Ver Cards Hornos",
    "Formulario Nuevo Horno",
    "Boton Editar Horno",
    "Boton Eliminar Horno",
    "Boton Registrar Mantenimiento Horno",
  ],
  "Ver Cards Hornos": [
    "Boton Editar Horno",
    "Boton Eliminar Horno",
    "Boton Registrar Mantenimiento Horno",
  ],
};

// Función para obtener los padres requeridos de un componente
function getPadresRequeridos(nombreComponente: string): string[] {
  const padres: string[] = [];
  for (const [padre, hijos] of Object.entries(JERARQUIA_PERMISOS)) {
    if (hijos.includes(nombreComponente)) {
      padres.push(padre);
      // Buscar recursivamente padres del padre
      padres.push(...getPadresRequeridos(padre));
    }
  }
  return padres;
}

type PermisosContextType = {
  permisos: Set<number>;
  cargando: boolean;
  tienePermiso: (componenteId: number) => boolean;
  tienePermisoNombre: (nombreComponente: string) => boolean;
  recargar: () => Promise<void>;
};

const PermisosContext = createContext<PermisosContextType>({
  permisos: new Set(),
  cargando: true,
  tienePermiso: () => false,
  tienePermisoNombre: () => false,
  recargar: async () => {},
});

export function PermisosProvider({ 
  children, 
  ruta 
}: { 
  children: ReactNode; 
  ruta: string;
}) {
  const [permisos, setPermisos] = useState<Set<number>>(new Set());
  const [permisosNombre, setPermisosNombre] = useState<Map<string, boolean>>(new Map());
  const [cargando, setCargando] = useState(true);

  const cargarPermisos = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/rbac/permisos-formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruta }),
      });

      if (res.ok) {
        const data = await res.json();
        // data.componentes = [{ id_componente, nombre, tieneAcceso }, ...]
        const idsConAcceso = new Set<number>(
          data.componentes
            .filter((c: { tieneAcceso: boolean }) => c.tieneAcceso)
            .map((c: { id_componente: number }) => c.id_componente)
        );
        const nombresConAcceso = new Map<string, boolean>();
        data.componentes.forEach((c: { nombre: string; tieneAcceso: boolean }) => {
          nombresConAcceso.set(c.nombre, c.tieneAcceso);
        });
        
        setPermisos(idsConAcceso);
        setPermisosNombre(nombresConAcceso);
      }
    } catch (error) {
      console.error("Error cargando permisos:", error);
    } finally {
      setCargando(false);
    }
  }, [ruta]);

  useEffect(() => {
    cargarPermisos();
  }, [cargarPermisos]);

  const tienePermiso = (componenteId: number): boolean => {
    return permisos.has(componenteId);
  };

  const tienePermisoNombre = (nombreComponente: string): boolean => {
    // Primero verificar si tiene el permiso directo
    const tieneDirecto = permisosNombre.get(nombreComponente) ?? false;
    if (!tieneDirecto) return false;
    
    // Luego verificar que tenga todos los padres requeridos
    const padresRequeridos = getPadresRequeridos(nombreComponente);
    for (const padre of padresRequeridos) {
      if (!(permisosNombre.get(padre) ?? false)) {
        return false; // No tiene un padre requerido
      }
    }
    
    return true;
  };

  return (
    <PermisosContext.Provider value={{ 
      permisos, 
      cargando, 
      tienePermiso, 
      tienePermisoNombre,
      recargar: cargarPermisos 
    }}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisos() {
  return useContext(PermisosContext);
}

// Componente wrapper que usa el contexto
export function Protegido({ 
  nombre, 
  children, 
  fallback = null 
}: { 
  nombre: string; 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const { tienePermisoNombre, cargando } = usePermisos();
  
  if (cargando) return null;
  if (!tienePermisoNombre(nombre)) return <>{fallback}</>;
  
  return <>{children}</>;
}
