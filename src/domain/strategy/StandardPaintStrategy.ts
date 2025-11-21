import { PaintStrategy } from "./PaintStrategy";

export class StandardPaintStrategy implements PaintStrategy {
  calcularConsumo(ancho: number, alto: number, espesor: number, densidad: number): number {
    // ancho, alto en metros
    // espesor en micras (µm) → convertir a metros: espesor / 1_000_000
    // densidad en g/cm³ → kg/m³: densidad * 1000
    // factor 1.1 = pérdida por aplicación (10%)
    // factor 0.7 = eficiencia de transferencia (70%)
    
    const area_m2 = ancho * alto;
    const espesor_m = espesor / 1_000_000;
    const volumen_m3 = area_m2 * espesor_m;
    const densidad_kg_m3 = densidad * 1000;
    
    return (volumen_m3 * densidad_kg_m3 * 1.1) / 0.7;
  }
}
