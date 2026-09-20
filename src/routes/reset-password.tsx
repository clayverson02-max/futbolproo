import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva contraseña | Fútbol Pro" },
      { name: "description", content: "Crea una contraseña nueva para tu cuenta de miembro." },
      { property: "og:title", content: "Nueva contraseña | Fútbol Pro" },
      { property: "og:description", content: "Crea una contraseña nueva para tu cuenta de miembro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setCargando(false);
    if (error) {
      toast.error("No pudimos actualizar la contraseña. Pide un enlace nuevo.");
      return;
    }
    toast.success("Contraseña actualizada.");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="campo-gradient flex min-h-screen items-center justify-center px-4">
      <form onSubmit={guardar} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-5">
        <h1 className="text-xl font-bold">Crear contraseña nueva</h1>
        <div className="space-y-2">
          <Label htmlFor="nueva">Nueva contraseña</Label>
          <Input
            id="nueva"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </main>
  );
}
