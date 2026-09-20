import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fútbol Pro | Entrenamiento por posiciones" },
      {
        name: "description",
        content: "Área de miembros con entrenamientos de fútbol en video por posición: porteros, defensas, delanteros y más.",
      },
      { property: "og:title", content: "Fútbol Pro | Entrenamiento por posiciones" },
      {
        property: "og:description",
        content: "Área de miembros con entrenamientos de fútbol en video por posición: porteros, defensas, delanteros y más.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  return (
    <main className="campo-gradient flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">
        F
      </span>
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">FÚTBOL PRO</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Entrenamiento en video por posición: porteros, laterales, centrales, delanteros, técnica, físico,
        fútbol femenino e infantil.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild size="lg">
          <Link to="/auth">Entrar a mi cuenta</Link>
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        El acceso se activa automáticamente tras la compra.
      </p>
    </main>
  );
}
