import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSesion } from "@/hooks/useSesion";

const CHAVE_SESSAO = "futbolpro-auth";

export function AppHeader() {
  const { data: sesion } = useSesion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function sair() {
    queryClient.clear();
    window.sessionStorage.removeItem(CHAVE_SESSAO);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground font-black">
            F
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">FÚTBOL PRO</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
            {sesion?.nombre}
          </span>
          <Button variant="ghost" size="sm" onClick={sair} aria-label="Salir">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
