"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setMsg("");
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) return setError(data.error);

    setMsg("Revisá tu correo electrónico para continuar.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {msg && <p className="text-green-600 text-sm">{msg}</p>}

            <Button type="submit" className="w-full">
              Enviar enlace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
