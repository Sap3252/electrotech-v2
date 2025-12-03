/**
 * ==========================================
 * MACHINERY OBSERVER - PATRÓN OBSERVER
 * ==========================================
 * Implementación del patrón Observer para monitorear
 * el uso de maquinarias y generar alertas automáticas.
 * 
 * Este patrón permite:
 * - Control automático del límite diario de piezas
 * - Notificaciones cuando se acerca al límite
 * - Alertas de mantenimiento preventivo
 * - Registro de eventos para análisis
 */

// ==========================================
// INTERFACES
// ==========================================

export interface MaquinariaData {
  id_maquinaria: number;
  nombre: string;
  descripcion: string | null;
  horas_uso: number;
  max_piezas_diarias: number;
  estado: 'activa' | 'mantenimiento' | 'inactiva';
  piezas_hoy?: number;
}

export interface EventoMaquinaria {
  tipo: 'pintura' | 'mantenimiento' | 'alerta';
  id_maquinaria: number;
  cantidad_piezas?: number;
  mensaje?: string;
  fecha: Date;
}

export interface AlertaMaquinaria {
  id_maquinaria: number;
  tipo: 'limite_diario' | 'mantenimiento' | 'falla' | 'advertencia';
  mensaje: string;
  fecha: Date;
  nivel: 'info' | 'warning' | 'error';
}

// ==========================================
// OBSERVER INTERFACE
// ==========================================

export interface MaquinariaObserver {
  update(evento: EventoMaquinaria, maquinaria: MaquinariaData): void;
  getTipo(): string;
}

// ==========================================
// SUBJECT: MACHINERY SUBJECT
// ==========================================

export class MachinerySubject {
  private observers: MaquinariaObserver[] = [];
  private maquinarias: Map<number, MaquinariaData> = new Map();

  // Agregar un observer
  subscribe(observer: MaquinariaObserver): void {
    const exists = this.observers.some(obs => obs.getTipo() === observer.getTipo());
    if (!exists) {
      this.observers.push(observer);
      console.log(`[MachinerySubject] Observer registrado: ${observer.getTipo()}`);
    }
  }

  // Remover un observer
  unsubscribe(observer: MaquinariaObserver): void {
    const index = this.observers.findIndex(obs => obs.getTipo() === observer.getTipo());
    if (index !== -1) {
      this.observers.splice(index, 1);
      console.log(`[MachinerySubject] Observer removido: ${observer.getTipo()}`);
    }
  }

  // Notificar a todos los observers
  private notify(evento: EventoMaquinaria, maquinaria: MaquinariaData): void {
    for (const observer of this.observers) {
      observer.update(evento, maquinaria);
    }
  }

  // Registrar una maquinaria
  registrarMaquinaria(maquinaria: MaquinariaData): void {
    this.maquinarias.set(maquinaria.id_maquinaria, maquinaria);
  }

  // Actualizar datos de una maquinaria
  actualizarMaquinaria(id: number, datos: Partial<MaquinariaData>): void {
    const maquinaria = this.maquinarias.get(id);
    if (maquinaria) {
      Object.assign(maquinaria, datos);
    }
  }

  // Obtener una maquinaria
  getMaquinaria(id: number): MaquinariaData | undefined {
    return this.maquinarias.get(id);
  }

  // Registrar evento de pintura y notificar observers
  registrarPintura(id_maquinaria: number, cantidad_piezas: number): AlertaMaquinaria[] {
    const maquinaria = this.maquinarias.get(id_maquinaria);
    if (!maquinaria) {
      throw new Error(`Maquinaria ${id_maquinaria} no encontrada`);
    }

    // Actualizar piezas del día
    maquinaria.piezas_hoy = (maquinaria.piezas_hoy || 0) + cantidad_piezas;

    const evento: EventoMaquinaria = {
      tipo: 'pintura',
      id_maquinaria,
      cantidad_piezas,
      fecha: new Date(),
    };

    // Notificar a todos los observers
    this.notify(evento, maquinaria);

    // Recolectar alertas de los observers
    const alertas: AlertaMaquinaria[] = [];
    for (const observer of this.observers) {
      if (observer instanceof LimiteDiarioObserver) {
        const alerta = observer.getUltimaAlerta();
        if (alerta) alertas.push(alerta);
      }
    }

    return alertas;
  }

  // Verificar si la maquinaria puede pintar más piezas
  puedeUsarMaquinaria(id_maquinaria: number, cantidad_piezas: number): { 
    permitido: boolean; 
    mensaje: string;
    piezas_restantes: number;
    porcentaje_uso: number;
  } {
    const maquinaria = this.maquinarias.get(id_maquinaria);
    if (!maquinaria) {
      return { 
        permitido: false, 
        mensaje: 'Maquinaria no encontrada',
        piezas_restantes: 0,
        porcentaje_uso: 0
      };
    }

    if (maquinaria.estado !== 'activa') {
      return { 
        permitido: false, 
        mensaje: `Maquinaria en estado: ${maquinaria.estado}`,
        piezas_restantes: 0,
        porcentaje_uso: 100
      };
    }

    const piezas_hoy = maquinaria.piezas_hoy || 0;
    const piezas_restantes = maquinaria.max_piezas_diarias - piezas_hoy;
    const porcentaje_uso = (piezas_hoy / maquinaria.max_piezas_diarias) * 100;

    if (piezas_restantes < cantidad_piezas) {
      return { 
        permitido: false, 
        mensaje: `Solo quedan ${piezas_restantes} piezas disponibles para hoy`,
        piezas_restantes,
        porcentaje_uso
      };
    }

    return { 
      permitido: true, 
      mensaje: 'OK',
      piezas_restantes: piezas_restantes - cantidad_piezas,
      porcentaje_uso
    };
  }
}

// ==========================================
// OBSERVER: LIMITE DIARIO
// ==========================================

export class LimiteDiarioObserver implements MaquinariaObserver {
  private ultimaAlerta: AlertaMaquinaria | null = null;

  update(evento: EventoMaquinaria, maquinaria: MaquinariaData): void {
    if (evento.tipo !== 'pintura') return;

    const piezas_hoy = maquinaria.piezas_hoy || 0;
    const porcentaje = (piezas_hoy / maquinaria.max_piezas_diarias) * 100;

    this.ultimaAlerta = null;

    // Alerta cuando se alcanza el 100%
    if (porcentaje >= 100) {
      this.ultimaAlerta = {
        id_maquinaria: maquinaria.id_maquinaria,
        tipo: 'limite_diario',
        mensaje: `⛔ LÍMITE ALCANZADO: ${maquinaria.nombre} ha llegado al máximo de piezas diarias (${piezas_hoy}/${maquinaria.max_piezas_diarias})`,
        fecha: new Date(),
        nivel: 'error'
      };
      console.log(`[LimiteDiarioObserver] ${this.ultimaAlerta.mensaje}`);
    }
    // Advertencia al 90%
    else if (porcentaje >= 90) {
      this.ultimaAlerta = {
        id_maquinaria: maquinaria.id_maquinaria,
        tipo: 'advertencia',
        mensaje: `⚠️ ADVERTENCIA: ${maquinaria.nombre} está al ${porcentaje.toFixed(0)}% de su capacidad diaria (${piezas_hoy}/${maquinaria.max_piezas_diarias})`,
        fecha: new Date(),
        nivel: 'warning'
      };
      console.log(`[LimiteDiarioObserver] ${this.ultimaAlerta.mensaje}`);
    }
    // Info al 75%
    else if (porcentaje >= 75) {
      this.ultimaAlerta = {
        id_maquinaria: maquinaria.id_maquinaria,
        tipo: 'advertencia',
        mensaje: `ℹ️ INFO: ${maquinaria.nombre} ha usado el ${porcentaje.toFixed(0)}% de su capacidad diaria`,
        fecha: new Date(),
        nivel: 'info'
      };
      console.log(`[LimiteDiarioObserver] ${this.ultimaAlerta.mensaje}`);
    }
  }

  getTipo(): string {
    return 'LimiteDiario';
  }

  getUltimaAlerta(): AlertaMaquinaria | null {
    return this.ultimaAlerta;
  }
}

// ==========================================
// OBSERVER: MANTENIMIENTO PREVENTIVO
// ==========================================

export class MantenimientoObserver implements MaquinariaObserver {
  private horasParaMantenimiento: number = 500; // Cada 500 horas

  update(evento: EventoMaquinaria, maquinaria: MaquinariaData): void {
    // Verificar si necesita mantenimiento basado en horas de uso
    if (maquinaria.horas_uso >= this.horasParaMantenimiento) {
      const mantenimientosPendientes = Math.floor(maquinaria.horas_uso / this.horasParaMantenimiento);
      console.log(
        `[MantenimientoObserver] 🔧 ${maquinaria.nombre} requiere mantenimiento. ` +
        `Horas de uso: ${maquinaria.horas_uso}. Mantenimientos pendientes: ${mantenimientosPendientes}`
      );
    }
  }

  getTipo(): string {
    return 'Mantenimiento';
  }

  setHorasParaMantenimiento(horas: number): void {
    this.horasParaMantenimiento = horas;
  }
}

// ==========================================
// OBSERVER: ESTADÍSTICAS
// ==========================================

export class EstadisticasObserver implements MaquinariaObserver {
  private estadisticas: Map<number, { total_piezas: number; eventos: number }> = new Map();

  update(evento: EventoMaquinaria, maquinaria: MaquinariaData): void {
    if (evento.tipo !== 'pintura') return;

    const stats = this.estadisticas.get(maquinaria.id_maquinaria) || { total_piezas: 0, eventos: 0 };
    stats.total_piezas += evento.cantidad_piezas || 0;
    stats.eventos += 1;
    this.estadisticas.set(maquinaria.id_maquinaria, stats);

    console.log(
      `[EstadisticasObserver] 📊 ${maquinaria.nombre}: ` +
      `Total sesión: ${stats.total_piezas} piezas en ${stats.eventos} operaciones`
    );
  }

  getTipo(): string {
    return 'Estadisticas';
  }

  getEstadisticas(id_maquinaria: number) {
    return this.estadisticas.get(id_maquinaria);
  }

  getTodasEstadisticas() {
    return Object.fromEntries(this.estadisticas);
  }
}

// ==========================================
// FACTORY: CREAR MACHINERY SYSTEM
// ==========================================

export function crearSistemaMaquinaria(): {
  subject: MachinerySubject;
  limiteDiarioObserver: LimiteDiarioObserver;
  mantenimientoObserver: MantenimientoObserver;
  estadisticasObserver: EstadisticasObserver;
} {
  const subject = new MachinerySubject();
  const limiteDiarioObserver = new LimiteDiarioObserver();
  const mantenimientoObserver = new MantenimientoObserver();
  const estadisticasObserver = new EstadisticasObserver();

  // Suscribir observers
  subject.subscribe(limiteDiarioObserver);
  subject.subscribe(mantenimientoObserver);
  subject.subscribe(estadisticasObserver);

  return {
    subject,
    limiteDiarioObserver,
    mantenimientoObserver,
    estadisticasObserver
  };
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

let sistemaMaquinaria: ReturnType<typeof crearSistemaMaquinaria> | null = null;

export function getSistemaMaquinaria() {
  if (!sistemaMaquinaria) {
    sistemaMaquinaria = crearSistemaMaquinaria();
  }
  return sistemaMaquinaria;
}
