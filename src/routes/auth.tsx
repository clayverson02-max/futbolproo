import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOGIN_USUARIO = "clientepro";
const LOGIN_SENHA = "1234";
const CHAVE_SESSAO = "futbolpro-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso de miembros | Fútbol Pro" },
      { name: "description", content: "Inicia sesión para acceder a tu entrenamiento de fútbol." },
      { property: "og:title", content: "Acceso de miembros | Fútbol Pro" },
      { property: "og:description", content: "Área exclusiva de miembros de Fútbol Pro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  function entrar(e: React.FormEvent) {
    e.preventDefault();

    if (
      usuario.trim().toLowerCase() !== LOGIN_USUARIO ||
      password !== LOGIN_SENHA
    ) {
      toast.error("Usuário ou senha inválidos.");
      return;
    }

    setCargando(true);
    window.sessionStorage.setItem(CHAVE_SESSAO, "true");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="campo-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-primary text-2xl font-black text-primary-foreground">
            F
          </span>
          <h1 className="text-2xl font-bold tracking-tight">FÚTBOL PRO</h1>
          <p className="mt-1 text-sm text-muted-foreground">Área exclusiva de membros</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-glow">
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Login</Label>
              <Input
                id="usuario"
                type="text"
                autoComplete="username"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu login"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Acesso exclusivo. Em caso de dificuldade, entre em contato com o suporte.
        </p>
      </div>
    </main>
  );
}
