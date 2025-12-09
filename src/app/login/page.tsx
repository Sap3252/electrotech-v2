"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

//PATRON COMPOSITE
import {
  LoginComposite,
  InputField,
} from "@/domain/loginComposite";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const loginComposite = new LoginComposite();
loginComposite.agregar(new InputField("email", "Email", "email"));
loginComposite.agregar(new InputField("password", "Contraseña", "password"));


export default function LoginPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const values = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    // Validación en loginComposite
    const validation = loginComposite.validate(values);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    // Llamado al backend API
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setErrors([data.error || "Credenciales inválidas"]);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg border border-slate-200">
        <CardHeader>
          <div className="flex justify-center">
            <Image
              src="/electrotech logo nombre.png"
              alt="ElectroTech Logo"
              width={150}
              height={50}
              priority
            />
          </div>
          <CardTitle className="text-center text-xl font-semibold mt-2">
            Iniciar Sesión
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* RENDERIZAR EL COMPOSITE */}
            {loginComposite.render()}

            {/* ERRORES */}
            {errors.length > 0 && (
              <ul className="text-red-500 text-xs space-y-1 pt-1">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            {/* BOTÓN */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            {/* LINKS */}
            <div className="flex justify-between text-xs pt-2">
              <a href="/register" className="text-blue-600 hover:underline">
                Crear cuenta
              </a>
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}