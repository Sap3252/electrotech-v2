"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Auditoria = {
  id: number;
  fecha_hora_login: string;
  fecha_hora_logout: string | null;
  duracion_segundos: number | null;
};

interface ModalAuditoriasProps {
  usuarioId: number | null;
  usuarioNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalAuditorias({
  usuarioId,
  usuarioNombre,
  open,
  onOpenChange,
}: ModalAuditoriasProps) {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && usuarioId) {
      cargarAuditorias();
    }
  }, [open, usuarioId]);

  const cargarAuditorias = async () => {
    if (!usuarioId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}/auditorias`);
      if (res.ok) {
        const data = await res.json();
        setAuditorias(data);
      } else {
        console.error("Error al cargar auditorías");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatearDuracion = (segundos: number | null) => {
    if (!segundos) return "-";
    
    if (segundos < 60) {
      return `${segundos}s`;
    }
    
    const minutos = Math.floor(segundos / 60);
    
    if (minutos < 60) {
      return `${minutos}m`;
    }
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    return `${horas}h ${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Auditoría de Sesiones - {usuarioNombre}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando auditorías...
          </div>
        ) : auditorias.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay registros de auditoría para este usuario
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora Login</TableHead>
                  <TableHead>Fecha/Hora Logout</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditorias.map((auditoria) => (
                  <TableRow key={auditoria.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatearFecha(auditoria.fecha_hora_login)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {auditoria.fecha_hora_logout
                        ? formatearFecha(auditoria.fecha_hora_logout)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatearDuracion(auditoria.duracion_segundos)}
                    </TableCell>
                    <TableCell>
                      {auditoria.fecha_hora_logout ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Cerrada
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Activa
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
