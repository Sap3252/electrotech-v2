import { PaintStrategy } from "./PaintStrategy";

export class StandardPaintStrategy implements PaintStrategy {
  calcularConsumo(ancho: number, alto: number, espesor: number, densidad: number): number {
    return (ancho * alto * espesor * densidad) / (100 * 0.7);
  }
}
