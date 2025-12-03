// ==========================================
// MACHINERY OBSERVER V2 - Cabinas, Pistolas, Hornos
// ==========================================
// Implementación del patrón Observer para el sistema de maquinaria
// Monitorea: límites de cabina, mantenimiento de pistolas/hornos, consumo de gas

// Tipos para el nuevo modelo
export interface Cabina {
  id_cabina: number;
  nombre: string;
  descripcion?: string;
  max_piezas_diarias: number;
  piezas_hoy: number;
  estado: 'activa' | 'mantenimiento' | 'inactiva';
  pistolas?: Pistola[];
  hornos?: Horno[];
}

export interface Pistola {
  id_pistola: number;
  nombre: string;
  descripcion?: string;
  horas_uso: number;
  horas_mantenimiento: number;
  ultimo_mantenimiento?: Date;
  estado: 'activa' | 'mantenimiento' | 'inactiva';
}

export interface Horno {
  id_horno: number;
  nombre: string;
  descripcion?: string;
  horas_uso: number;
  horas_mantenimiento: number;
  temperatura_max: number;
  gasto_gas_hora: number;
  ultimo_mantenimiento?: Date;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
}

export interface PaintingEvent {
  id_cabina: number;
  cabina?: Cabina;
  cantidad_piezas: number;
  horas_trabajo: number;
  fecha: Date;
}

export interface MachineryAlert {
  tipo_equipo: 'cabina' | 'pistola' | 'horno';
  id_equipo: number;
  nombre_equipo: string;
  tipo_alerta: 'limite_diario' | 'mantenimiento' | 'temperatura' | 'gas';
  mensaje: string;
  nivel: 'info' | 'warning' | 'critical';
  fecha: Date;
}

// ==========================================
// INTERFACE OBSERVER
// ==========================================
export interface MachineryObserver {
  update(event: PaintingEvent): MachineryAlert[];
}

// ==========================================
// SUBJECT (Observable)
// ==========================================
export class CabinaSubject {
  private observers: MachineryObserver[] = [];

  addObserver(observer: MachineryObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: MachineryObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(event: PaintingEvent): MachineryAlert[] {
    const allAlerts: MachineryAlert[] = [];
    for (const observer of this.observers) {
      const alerts = observer.update(event);
      allAlerts.push(...alerts);
    }
    return allAlerts;
  }

  // Método principal para registrar una operación de pintado
  registerPainting(event: PaintingEvent): MachineryAlert[] {
    return this.notifyObservers(event);
  }
}

// ==========================================
// OBSERVER: Límite Diario de Cabina
// ==========================================
export class LimiteDiarioCabinaObserver implements MachineryObserver {
  update(event: PaintingEvent): MachineryAlert[] {
    const alerts: MachineryAlert[] = [];
    const cabina = event.cabina;

    if (!cabina) return alerts;

    const nuevoTotal = cabina.piezas_hoy + event.cantidad_piezas;
    const porcentaje = (nuevoTotal / cabina.max_piezas_diarias) * 100;

    if (porcentaje >= 100) {
      alerts.push({
        tipo_equipo: 'cabina',
        id_equipo: cabina.id_cabina,
        nombre_equipo: cabina.nombre,
        tipo_alerta: 'limite_diario',
        mensaje: `¡LÍMITE ALCANZADO! Cabina "${cabina.nombre}" ha llegado al 100% de capacidad diaria (${nuevoTotal}/${cabina.max_piezas_diarias} piezas)`,
        nivel: 'critical',
        fecha: new Date()
      });
    } else if (porcentaje >= 90) {
      alerts.push({
        tipo_equipo: 'cabina',
        id_equipo: cabina.id_cabina,
        nombre_equipo: cabina.nombre,
        tipo_alerta: 'limite_diario',
        mensaje: `Cabina "${cabina.nombre}" al ${porcentaje.toFixed(0)}% de capacidad diaria (${nuevoTotal}/${cabina.max_piezas_diarias} piezas)`,
        nivel: 'warning',
        fecha: new Date()
      });
    } else if (porcentaje >= 75) {
      alerts.push({
        tipo_equipo: 'cabina',
        id_equipo: cabina.id_cabina,
        nombre_equipo: cabina.nombre,
        tipo_alerta: 'limite_diario',
        mensaje: `Cabina "${cabina.nombre}" al ${porcentaje.toFixed(0)}% de capacidad diaria`,
        nivel: 'info',
        fecha: new Date()
      });
    }

    return alerts;
  }
}

// ==========================================
// OBSERVER: Mantenimiento de Pistolas
// ==========================================
export class MantenimientoPistolaObserver implements MachineryObserver {
  update(event: PaintingEvent): MachineryAlert[] {
    const alerts: MachineryAlert[] = [];
    const cabina = event.cabina;

    if (!cabina || !cabina.pistolas) return alerts;

    for (const pistola of cabina.pistolas) {
      const nuevasHoras = pistola.horas_uso + event.horas_trabajo;
      const porcentaje = (nuevasHoras / pistola.horas_mantenimiento) * 100;

      if (porcentaje >= 100) {
        alerts.push({
          tipo_equipo: 'pistola',
          id_equipo: pistola.id_pistola,
          nombre_equipo: pistola.nombre,
          tipo_alerta: 'mantenimiento',
          mensaje: `¡MANTENIMIENTO REQUERIDO! Pistola "${pistola.nombre}" superó ${pistola.horas_mantenimiento} horas de uso (${nuevasHoras.toFixed(1)} hrs)`,
          nivel: 'critical',
          fecha: new Date()
        });
      } else if (porcentaje >= 90) {
        alerts.push({
          tipo_equipo: 'pistola',
          id_equipo: pistola.id_pistola,
          nombre_equipo: pistola.nombre,
          tipo_alerta: 'mantenimiento',
          mensaje: `Pistola "${pistola.nombre}" próxima a mantenimiento (${porcentaje.toFixed(0)}% - ${nuevasHoras.toFixed(1)}/${pistola.horas_mantenimiento} hrs)`,
          nivel: 'warning',
          fecha: new Date()
        });
      }
    }

    return alerts;
  }
}

// ==========================================
// OBSERVER: Mantenimiento de Hornos
// ==========================================
export class MantenimientoHornoObserver implements MachineryObserver {
  update(event: PaintingEvent): MachineryAlert[] {
    const alerts: MachineryAlert[] = [];
    const cabina = event.cabina;

    if (!cabina || !cabina.hornos) return alerts;

    for (const horno of cabina.hornos) {
      const nuevasHoras = horno.horas_uso + event.horas_trabajo;
      const porcentaje = (nuevasHoras / horno.horas_mantenimiento) * 100;

      if (porcentaje >= 100) {
        alerts.push({
          tipo_equipo: 'horno',
          id_equipo: horno.id_horno,
          nombre_equipo: horno.nombre,
          tipo_alerta: 'mantenimiento',
          mensaje: `¡MANTENIMIENTO REQUERIDO! Horno "${horno.nombre}" superó ${horno.horas_mantenimiento} horas de uso (${nuevasHoras.toFixed(1)} hrs)`,
          nivel: 'critical',
          fecha: new Date()
        });
      } else if (porcentaje >= 90) {
        alerts.push({
          tipo_equipo: 'horno',
          id_equipo: horno.id_horno,
          nombre_equipo: horno.nombre,
          tipo_alerta: 'mantenimiento',
          mensaje: `Horno "${horno.nombre}" próximo a mantenimiento (${porcentaje.toFixed(0)}% - ${nuevasHoras.toFixed(1)}/${horno.horas_mantenimiento} hrs)`,
          nivel: 'warning',
          fecha: new Date()
        });
      }
    }

    return alerts;
  }
}

// ==========================================
// OBSERVER: Consumo de Gas de Hornos
// ==========================================
export class ConsumoGasObserver implements MachineryObserver {
  private limiteGasDiario: number = 100; // m³ de gas diario máximo (configurable)

  constructor(limiteGasDiario?: number) {
    if (limiteGasDiario) {
      this.limiteGasDiario = limiteGasDiario;
    }
  }

  update(event: PaintingEvent): MachineryAlert[] {
    const alerts: MachineryAlert[] = [];
    const cabina = event.cabina;

    if (!cabina || !cabina.hornos) return alerts;

    for (const horno of cabina.hornos) {
      const gasConsumido = horno.gasto_gas_hora * event.horas_trabajo;
      
      // Alerta si el consumo de gas por operación es alto
      if (gasConsumido > 10) { // Más de 10 m³ por operación
        alerts.push({
          tipo_equipo: 'horno',
          id_equipo: horno.id_horno,
          nombre_equipo: horno.nombre,
          tipo_alerta: 'gas',
          mensaje: `Alto consumo de gas en horno "${horno.nombre}": ${gasConsumido.toFixed(2)} m³`,
          nivel: 'info',
          fecha: new Date()
        });
      }
    }

    return alerts;
  }
}

// ==========================================
// OBSERVER: Estadísticas y Logging
// ==========================================
export class EstadisticasCabinaObserver implements MachineryObserver {
  private registros: Map<number, { total_piezas: number; total_horas: number }> = new Map();

  update(event: PaintingEvent): MachineryAlert[] {
    const registro = this.registros.get(event.id_cabina) || { total_piezas: 0, total_horas: 0 };
    registro.total_piezas += event.cantidad_piezas;
    registro.total_horas += event.horas_trabajo;
    this.registros.set(event.id_cabina, registro);

    // Este observer no genera alertas, solo trackea estadísticas
    return [];
  }

  getEstadisticas(id_cabina: number) {
    return this.registros.get(id_cabina) || { total_piezas: 0, total_horas: 0 };
  }

  getAllEstadisticas() {
    return Object.fromEntries(this.registros);
  }
}

// ==========================================
// FACTORY: Crear Subject con todos los observers
// ==========================================
export function createCabinaSubjectWithObservers(): CabinaSubject {
  const subject = new CabinaSubject();
  
  subject.addObserver(new LimiteDiarioCabinaObserver());
  subject.addObserver(new MantenimientoPistolaObserver());
  subject.addObserver(new MantenimientoHornoObserver());
  subject.addObserver(new ConsumoGasObserver());
  subject.addObserver(new EstadisticasCabinaObserver());
  
  return subject;
}

// Singleton para uso global
let cabinaSubjectInstance: CabinaSubject | null = null;

export function getCabinaSubject(): CabinaSubject {
  if (!cabinaSubjectInstance) {
    cabinaSubjectInstance = createCabinaSubjectWithObservers();
  }
  return cabinaSubjectInstance;
}
