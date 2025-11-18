import { PaintStrategy } from "./PaintStrategy";

export class HighDensityPaintStrategy implements PaintStrategy {
  calcularConsumo(ancho: number, alto: number, espesor: number, densidad: number): number {
    return (ancho * alto * espesor * densidad * 1.15) / (100 * 0.7);
  }
}
