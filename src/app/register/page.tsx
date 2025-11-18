"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Composite
import {
  LoginComposite,
  InputField,
} from "@/domain/loginComposite";

// shadcn ui
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Crear composite para register
const registerComposite = new LoginComposite();
registerComposite.agregar(new InputField("nombre", "Nombre"));
registerComposite.agregar(new InputField("apellido", "Apellido"));
registerComposite.agregar(new InputField("email", "Email", "email"));
registerComposite.agregar(new InputField("password", "Contraseña", "password"));

export default function RegisterPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const values = {
      nombre: String(form.get("nombre") || ""),
      apellido: String(form.get("apellido") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    // Validar campos con Composite
    const validation = registerComposite.validate(values);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors([data.error || "Ocurrió un error creando la cuenta"]);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Crear cuenta — ElectroTech
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Campos generados con Composite */}
            {registerComposite.render()}

            {/* Errores */}
            {errors.length > 0 && (
              <ul className="text-red-500 text-xs space-y-1">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarme"}
            </Button>

            <div className="flex justify-center pt-2 text-xs">
              <a href="/login" className="text-blue-600 hover:underline">
                Ya tengo cuenta
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}