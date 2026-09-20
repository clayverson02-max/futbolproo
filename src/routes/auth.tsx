import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso de miembros | Fútbol Pro" },
      { name: "description", content: "Inicia sesión para acceder a tu entrenamiento de fútbol por categorías." },
      { property: "og:title", content: "Acceso de miembros | Fútbol Pro" },
      { property: "og:description", content: "Inicia sesión para acceder a tu entrenamiento de fútbol por categorías." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "recuperar">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      toast.error("No pudimos iniciar sesión. Revisa tu correo y contraseña.");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function recuperar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setCargando(false);
    if (error) {
      toast.error("No pudimos enviar el correo de recuperación.");
      return;
    }
    toast.success("Te enviamos un enlace para restablecer tu contraseña.");
    setModo("login");
  }

  return (
    <main className="campo-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">
            F
          </span>
          <h1 className="text-2xl font-bold tracking-tight">FÚTBOL PRO</h1>
          <p className="mt-1 text-sm text-muted-foreground">Área de miembros · entrenamiento por posiciones</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-glow">
          {modo === "login" ? (
            <form onSubmit={entrar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? "Entrando..." : "Entrar"}
              </Button>
              <button
                type="button"
                onClick={() => setModo("recuperar")}
                className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Olvidé mi contraseña
              </button>
            </form>
          ) : (
            <form onSubmit={recuperar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-rec">Correo electrónico</Label>
                <Input
                  id="email-rec"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                />
                <p className="text-xs text-muted-foreground">
                  Te enviaremos un enlace para crear una contraseña nueva.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar enlace"}
              </Button>
              <button
                type="button"
                onClick={() => setModo("login")}
                className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          El acceso se crea automáticamente al comprar el programa. ¿Problemas para entrar? Escríbenos.
        </p>
      </div>
    </main>
  );
}
