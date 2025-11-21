import { PaintStrategy } from "./PaintStrategy";

export class HighDensityPaintStrategy implements PaintStrategy {
  calcularConsumo(ancho: number, alto: number, espesor: number, densidad: number): number {
    // ancho, alto en metros
    // espesor en micras (µm) → convertir a metros: espesor / 1_000_000
    // densidad en g/cm³ → kg/m³: densidad * 1000 * 1.5
    // factor 1.15 = pérdida por aplicación (15%)
    // factor 0.7 = eficiencia de transferencia (70%)
    
    const area_m2 = ancho * alto;
    const espesor_m = espesor / 1_000_000;
    const volumen_m3 = area_m2 * espesor_m;
    const densidad_kg_m3 = densidad * 1000 * 1.5;
    
    return (volumen_m3 * densidad_kg_m3 * 1.15) / 0.7;
  }
}
