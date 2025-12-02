/**
 * Patrón Composite para la estructura RBAC
 * Módulo -> Formulario -> Componente
 * 
 * Permite tratar uniformemente módulos, formularios y componentes
 * con operaciones comunes: verificar acceso, obtener hijos, etc.
 */

// Interfaz común para todos los elementos del menú RBAC
export interface RBACComponent {
  getId(): number;
  getNombre(): string;
  getDescripcion(): string;
  isActivo(): boolean;
  
  // Operaciones uniformes en toda la jerarquía
  tieneAcceso(gruposUsuario: number[]): boolean;
  getChildren(): RBACComponent[];
  
  // Para identificar el tipo sin romper el polimorfismo
  getTipo(): 'modulo' | 'formulario' | 'componente';
}

// ============================================
// HOJA: Componente (nivel más bajo)
// ============================================
export class ComponenteLeaf implements RBACComponent {
  constructor(
    private id_componente: number,
    private nombre: string,
    private descripcion: string,
    private tipo: string,
    private activo: boolean,
    private gruposConAcceso: number[] = []
  ) {}

  getId(): number {
    return this.id_componente;
  }

  getNombre(): string {
    return this.nombre;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  isActivo(): boolean {
    return this.activo;
  }

  getTipo(): 'modulo' | 'formulario' | 'componente' {
    return 'componente';
  }

  // Un componente tiene acceso si alguno de los grupos del usuario está en gruposConAcceso
  tieneAcceso(gruposUsuario: number[]): boolean {
    if (!this.activo) return false;
    return gruposUsuario.some(g => this.gruposConAcceso.includes(g));
  }

  // Hoja no tiene hijos
  getChildren(): RBACComponent[] {
    return [];
  }

  // Métodos específicos del componente
  getTipoComponente(): string {
    return this.tipo;
  }

  getGruposConAcceso(): number[] {
    return [...this.gruposConAcceso];
  }
}

// ============================================
// COMPOSITE: Formulario (contiene Componentes)
// ============================================
export class FormularioComposite implements RBACComponent {
  private componentes: ComponenteLeaf[] = [];

  constructor(
    private id_formulario: number,
    private nombre: string,
    private ruta: string,
    private descripcion: string,
    private orden: number,
    private activo: boolean
  ) {}

  getId(): number {
    return this.id_formulario;
  }

  getNombre(): string {
    return this.nombre;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  isActivo(): boolean {
    return this.activo;
  }

  getTipo(): 'modulo' | 'formulario' | 'componente' {
    return 'formulario';
  }

  getRuta(): string {
    return this.ruta;
  }

  getOrden(): number {
    return this.orden;
  }

  // Agregar componente hijo
  agregar(componente: ComponenteLeaf): void {
    this.componentes.push(componente);
  }

  // Un formulario tiene acceso si está activo Y al menos un componente hijo tiene acceso
  tieneAcceso(gruposUsuario: number[]): boolean {
    if (!this.activo) return false;
    return this.componentes.some(c => c.tieneAcceso(gruposUsuario));
  }

  getChildren(): RBACComponent[] {
    return [...this.componentes];
  }

  // Obtener solo componentes accesibles
  getComponentesAccesibles(gruposUsuario: number[]): ComponenteLeaf[] {
    return this.componentes.filter(c => c.tieneAcceso(gruposUsuario));
  }
}

// ============================================
// COMPOSITE: Módulo (contiene Formularios)
// ============================================
export class ModuloComposite implements RBACComponent {
  private formularios: FormularioComposite[] = [];

  constructor(
    private id_modulo: number,
    private nombre: string,
    private descripcion: string,
    private icono: string,
    private orden: number,
    private activo: boolean
  ) {}

  getId(): number {
    return this.id_modulo;
  }

  getNombre(): string {
    return this.nombre;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  isActivo(): boolean {
    return this.activo;
  }

  getTipo(): 'modulo' | 'formulario' | 'componente' {
    return 'modulo';
  }

  getIcono(): string {
    return this.icono;
  }

  getOrden(): number {
    return this.orden;
  }

  // Agregar formulario hijo
  agregar(formulario: FormularioComposite): void {
    this.formularios.push(formulario);
  }

  // Un módulo tiene acceso si está activo Y al menos un formulario hijo tiene acceso
  tieneAcceso(gruposUsuario: number[]): boolean {
    if (!this.activo) return false;
    return this.formularios.some(f => f.tieneAcceso(gruposUsuario));
  }

  getChildren(): RBACComponent[] {
    return [...this.formularios];
  }

  // Obtener solo formularios accesibles
  getFormulariosAccesibles(gruposUsuario: number[]): FormularioComposite[] {
    return this.formularios.filter(f => f.tieneAcceso(gruposUsuario));
  }
}

// ============================================
// BUILDER: Construye la estructura desde la BD
// ============================================
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export class RBACCompositeBuilder {
  
  /**
   * Construye toda la estructura RBAC desde la base de datos
   */
  static async buildFromDatabase(): Promise<ModuloComposite[]> {
    // 1. Obtener todos los módulos
    const [modulosRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_modulo, nombre, descripcion, icono, orden, activo 
       FROM Modulo ORDER BY orden`
    );

    // 2. Obtener todos los formularios
    const [formulariosRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_formulario, id_modulo, nombre, ruta, descripcion, orden, activo 
       FROM Formulario ORDER BY orden`
    );

    // 3. Obtener todos los componentes con sus grupos
    const [componentesRows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_componente, c.id_formulario, c.nombre, c.descripcion, c.tipo, c.activo,
              GROUP_CONCAT(gc.id_grupo) as grupos
       FROM Componente c
       LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente
       GROUP BY c.id_componente`
    );

    // 4. Construir la estructura
    const modulos: ModuloComposite[] = [];

    for (const m of modulosRows) {
      const modulo = new ModuloComposite(
        m.id_modulo,
        m.nombre,
        m.descripcion || '',
        m.icono || '',
        m.orden,
        m.activo === 1
      );

      // Agregar formularios del módulo
      const formulariosDelModulo = formulariosRows.filter(f => f.id_modulo === m.id_modulo);
      
      for (const f of formulariosDelModulo) {
        const formulario = new FormularioComposite(
          f.id_formulario,
          f.nombre,
          f.ruta,
          f.descripcion || '',
          f.orden,
          f.activo === 1
        );

        // Agregar componentes del formulario
        const componentesDelFormulario = componentesRows.filter(c => c.id_formulario === f.id_formulario);
        
        for (const c of componentesDelFormulario) {
          const grupos = c.grupos ? c.grupos.split(',').map(Number) : [];
          const componente = new ComponenteLeaf(
            c.id_componente,
            c.nombre,
            c.descripcion || '',
            c.tipo,
            c.activo === 1,
            grupos
          );
          formulario.agregar(componente);
        }

        modulo.agregar(formulario);
      }

      modulos.push(modulo);
    }

    return modulos;
  }

  /**
   * Obtiene la estructura filtrada por acceso del usuario
   */
  static async getMenuAccesible(gruposUsuario: number[]): Promise<ModuloComposite[]> {
    const todosModulos = await this.buildFromDatabase();
    return todosModulos.filter(m => m.tieneAcceso(gruposUsuario));
  }

  /**
   * Verifica si un usuario tiene acceso a una ruta específica
   */
  static async verificarAccesoRuta(ruta: string, gruposUsuario: number[]): Promise<boolean> {
    const modulos = await this.buildFromDatabase();
    
    for (const modulo of modulos) {
      for (const formulario of modulo.getChildren() as FormularioComposite[]) {
        if (formulario.getRuta() === ruta && formulario.tieneAcceso(gruposUsuario)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Verifica si un usuario tiene acceso a un componente específico
   */
  static async verificarAccesoComponente(idComponente: number, gruposUsuario: number[]): Promise<boolean> {
    const modulos = await this.buildFromDatabase();
    
    for (const modulo of modulos) {
      for (const formulario of modulo.getChildren() as FormularioComposite[]) {
        for (const componente of formulario.getChildren() as ComponenteLeaf[]) {
          if (componente.getId() === idComponente) {
            return componente.tieneAcceso(gruposUsuario);
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Obtiene los formularios accesibles en formato compatible con getAccesibleFormularios
   * Para mantener compatibilidad con el código existente
   */
  static async getFormulariosAccesiblesFormatted(gruposUsuario: number[]): Promise<{
    id_modulo: number;
    modulo: string;
    modulo_icono: string;
    modulo_orden: number;
    id_formulario: number;
    formulario: string;
    ruta: string;
    formulario_orden: number;
  }[]> {
    const modulos = await this.getMenuAccesible(gruposUsuario);
    const resultado: {
      id_modulo: number;
      modulo: string;
      modulo_icono: string;
      modulo_orden: number;
      id_formulario: number;
      formulario: string;
      ruta: string;
      formulario_orden: number;
    }[] = [];

    for (const modulo of modulos) {
      const formulariosAccesibles = modulo.getFormulariosAccesibles(gruposUsuario);
      
      for (const formulario of formulariosAccesibles) {
        resultado.push({
          id_modulo: modulo.getId(),
          modulo: modulo.getNombre(),
          modulo_icono: modulo.getIcono(),
          modulo_orden: modulo.getOrden(),
          id_formulario: formulario.getId(),
          formulario: formulario.getNombre(),
          ruta: formulario.getRuta(),
          formulario_orden: formulario.getOrden(),
        });
      }
    }

    return resultado;
  }

  /**
   * Obtiene los IDs de grupos activos de un usuario
   */
  static async getGruposActivosUsuario(idUsuario: number): Promise<number[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT gu.id_grupo 
       FROM GrupoUsuario gu
       JOIN Grupo g ON g.id_grupo = gu.id_grupo
       WHERE gu.id_usuario = ? AND g.id_estado = 1`,
      [idUsuario]
    );
    return rows.map(r => r.id_grupo);
  }
}
