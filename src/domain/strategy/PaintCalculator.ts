import { PaintStrategy } from "./PaintStrategy";

export class PaintCalculator {
  private strategy: PaintStrategy;

  constructor(strategy: PaintStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaintStrategy) {
    this.strategy = strategy;
  }

  calcular(ancho: number, alto: number, espesor: number, densidad: number): number {
    return this.strategy.calcularConsumo(
      ancho,
      alto,
      espesor,
      densidad
    );
  }
}
