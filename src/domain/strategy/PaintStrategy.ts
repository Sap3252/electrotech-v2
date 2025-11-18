export interface PaintStrategy {
  calcularConsumo(
    ancho_m: number,
    alto_m: number,
    espesor_um: number,
    densidad: number
  ): number;
}