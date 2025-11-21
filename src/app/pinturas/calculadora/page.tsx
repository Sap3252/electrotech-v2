"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PaintCalculator } from "@/domain/strategy/PaintCalculator";
import { StandardPaintStrategy } from "@/domain/strategy/StandardPaintStrategy";
import { HighDensityPaintStrategy } from "@/domain/strategy/HighDensityPaintStrategy";

export default function CalculadoraPintura() {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [espesor, setEspesor] = useState("");
  const [densidad, setDensidad] = useState("");
  const [resultado, setResultado] = useState<number | null>(null);

  const [strategy, setStrategy] = useState<"standard" | "high">("standard");

  const calcular = () => {
    if (!ancho || !alto || !espesor || !densidad) {
      alert("Complete todos los campos antes de calcular");
      return;
    }

    const anchoNum = parseFloat(ancho);
    const altoNum = parseFloat(alto);
    const espesorNum = parseFloat(espesor);
    const densidadNum = parseFloat(densidad);

    const strategyObj =
      strategy === "standard"
        ? new StandardPaintStrategy()
        : new HighDensityPaintStrategy();

    const calculator = new PaintCalculator(strategyObj);

    const consumo = calculator.calcular(
      anchoNum,
      altoNum,
      espesorNum,
      densidadNum
    );

    setResultado(consumo);
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Calculadora Manual de Consumo de Pintura</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* SELECTOR DE STRATEGY */}
          <div className="flex gap-4">
            <Button
              className={
                strategy === "standard"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }
              onClick={() => setStrategy("standard")}
            >
              Strategy Estándar
            </Button>

            <Button
              className={
                strategy === "high"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }
              onClick={() => setStrategy("high")}
            >
              Strategy Alta Densidad
            </Button>
          </div>

          {/* CAMPOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ancho (m)</Label>
              <Input
                type="number"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
              />
            </div>

            <div>
              <Label>Alto (m)</Label>
              <Input
                type="number"
                value={alto}
                onChange={(e) => setAlto(e.target.value)}
              />
            </div>

            <div>
              <Label>Espesor (µm)</Label>
              <Input
                type="number"
                value={espesor}
                onChange={(e) => setEspesor(e.target.value)}
              />
            </div>

            <div>
              <Label>Densidad (g/cm³)</Label>
              <Input
                type="number"
                value={densidad}
                onChange={(e) => setDensidad(e.target.value)}
              />
            </div>
          </div>

          {/* BOTÓN CALCULAR */}
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={calcular}
          >
            Calcular Consumo
          </Button>

          {/* RESULTADO */}
          {resultado !== null && (
            <p className="text-xl font-semibold mt-4">
              Consumo estimado: {resultado.toFixed(4)} Kg
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
