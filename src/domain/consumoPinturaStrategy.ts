import { PaintStrategy } from "./strategy/PaintStrategy";
import { StandardPaintStrategy } from "./strategy/StandardPaintStrategy";
import { HighDensityPaintStrategy } from "./strategy/HighDensityPaintStrategy";

/**
 * Selecciona la estrategia adecuada según el tipo de pintura
 * @param densidad número que define si es pintura normal o de alta densidad
 */
export function getPaintStrategy(densidad: number): PaintStrategy {

  if (densidad >= 1.7) {
    return new HighDensityPaintStrategy();
  }

  return new StandardPaintStrategy();
}
