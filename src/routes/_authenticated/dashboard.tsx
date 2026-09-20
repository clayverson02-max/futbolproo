import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { useSesion } from "@/hooks/useSesion";
import { listarVideosLocais } from "@/lib/localVideos";

const DEFAULT_CATEGORIES = [
  { id: "default-porteros", nombre: "Porteros", slug: "porteros", orden: 1, icono: "🧤" },
  { id: "default-laterales", nombre: "Laterales", slug: "laterales", orden: 2, icono: "🏃" },
  { id: "default-defensas", nombre: "Defensas centrales", slug: "defensas-centrales", orden: 3, icono: "🛡️" },
  { id: "default-delanteros", nombre: "Delanteros", slug: "delanteros", orden: 4, icono: "🎯" },
  { id: "default-tecnica", nombre: "Técnica individual", slug: "tecnica-individual", orden: 5, icono: "⚽" },
  { id: "default-fisico", nombre: "Acondicionamiento físico", slug: "acondicionamiento-fisico", orden: 6, icono: "💪" },
  { id: "default-femenino", nombre: "Fútbol femenino", slug: "futbol-femenino", orden: 7, icono: "🌟" },
  { id: "default-infantil", nombre: "Fútbol infantil", slug: "futbol-infantil", orden: 8, icono: "👟" },
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Mi entrenamiento | Fútbol Pro" },
      { name: "description", content: "Tu biblioteca de entrenamiento de fútbol organizada por posiciones." },
      { property: "og:title", content: "Mi entrenamiento | Fútbol Pro" },
      { property: "og:description", content: "Tu biblioteca de entrenamiento de fútbol organizada por posiciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("orden");
        if (error || !data?.length) return DEFAULT_CATEGORIES;
        return data;
      } catch {
        return DEFAULT_CATEGORIES;
      }
    },
  });
}

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const locais = listarVideosLocais();

      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("fecha_creacion", { ascending: false });
        if (error) return locais;
        return [...locais, ...(data ?? [])];
      } catch {
        return locais;
      }
    },
  });
}

function Dashboard() {
  const { data: sesion } = useSesion();
  const { data: categorias = [] } = useCategorias();
  const { data: videos = [] } = useVideos();

  const conteos = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const v of videos) mapa[v.categoria_id] = (mapa[v.categoria_id] ?? 0) + 1;
    return mapa;
  }, [videos]);



  if (sesion && !sesion.activo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-sm text-muted-foreground">
          Tu acceso está desactivado. Si crees que es un error, contacta con soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Tu área de entrenamiento</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Hola, {sesion?.nombre ?? "jugador"} 👋
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Elige una categoría para entrar en tu plan de entrenamiento. Cada área fue organizada para que sepas exactamente qué desarrollar y por dónde empezar.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
          <div className="rounded-xl border border-border bg-card p-3"><span className="block text-lg font-bold">{categorias.length}</span><span className="text-[11px] text-muted-foreground">categorías</span></div>
          <div className="rounded-xl border border-border bg-card p-3"><span className="block text-lg font-bold">{videos.length}</span><span className="text-[11px] text-muted-foreground">entrenamientos</span></div>
          <div className="rounded-xl border border-border bg-card p-3"><span className="block text-lg font-bold">0%</span><span className="text-[11px] text-muted-foreground">completado</span></div>
        </div>


        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight">Biblioteca por categorías</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entra en una categoría para ver los entrenamientos y acompañar tu evolución.
            </p>
          </div>
          <div className="space-y-3">
            {categorias.map((c) => (
              <Link
                key={c.id}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/70 hover:bg-primary/5 sm:gap-4 sm:p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl sm:size-14">
                  {categoriasIconos[c.nombre] ?? c.icono ?? "⚽"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold sm:text-base">{c.nombre}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm">
                    {descripcionCategoria(c.slug, c.nombre)}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {conteos[c.id] ?? 0} {conteos[c.id] === 1 ? "entrenamiento" : "entrenamientos"}
                  </span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

const categoriasIconos: Record<string, string> = Object.fromEntries(DEFAULT_CATEGORIES.map((category) => [category.nombre, category.icono]));

const descripcionesCategorias: Record<string, string> = {
  porteros: "Reflejos, posicionamiento y seguridad bajo los tres palos.",
  laterales: "Velocidad, marca y apoyo para dominar los costados.",
  "defensas-centrales": "Cobertura, anticipación y salida de balón con confianza.",
  delanteros: "Finalización, movimientos y definición para marcar más.",
  "tecnica-individual": "Control, conducción y recursos para jugar con más calidad.",
  "acondicionamiento-fisico": "Resistencia, fuerza y explosión para rendir durante todo el partido.",
  "futbol-femenino": "Sesiones pensadas para la evolución de jugadoras.",
  "futbol-infantil": "Ejercicios claros y dinámicos para desarrollar desde la base.",
};

function descripcionCategoria(slug: string, nombre: string) {
  return descripcionesCategorias[slug] ?? `Entrenamientos de ${nombre.toLowerCase()} para avanzar con método.`;
}
