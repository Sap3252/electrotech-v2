"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserSession = {
  id_usuario: number;
  email: string;
  grupos: string[];
};

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include"
        });
        
        if (!res.ok) {
          router.push("/login");
          return;
        }
        
        const data = await res.json();
        
        // Verificar que sea Admin
        if (!data.grupos.includes("Admin")) {
          router.push("/dashboard");
          return;
        }
        
        setSession(data);
        setLoading(false);
      } catch (error) {
        console.error("Error verificando sesión:", error);
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  if (loading || !session) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Gestión de Usuarios */}
        <Card className="shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Crear, editar y eliminar usuarios del sistema. Asignar usuarios a grupos.
            </p>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/dashboard/usuarios")}
            >
              Gestionar Usuarios
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Grupos y Permisos */}
        <Card className="shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Gestión de Grupos y Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Administrar grupos, estados y asignar permisos de acceso a componentes mediante RBAC.
            </p>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/dashboard/grupos")}
            >
              Gestionar Grupos
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Proveedores */}
        <Card className="shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Gestión de Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Registrar y administrar proveedores de pinturas y materiales.
            </p>
            <Button
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => router.push("/dashboard/proveedores")}
            >
              Gestionar Proveedores
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Clientes */}
        <Card className="shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Gestión de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Administrar clientes, datos de contacto y relaciones comerciales.
            </p>
            <Button
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => router.push("/dashboard/clientes")}
            >
              Gestionar Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
