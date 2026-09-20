import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, PlayCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { useSesion } from "@/hooks/useSesion";

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
      const { data, error } = await supabase.from("categories").select("*").order("orden");
      if (error) throw error;
      return data;
    },
  });
}

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("fecha_creacion", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function Dashboard() {
  const { data: sesion } = useSesion();
  const { data: categorias = [] } = useCategorias();
  const { data: videos = [], isLoading } = useVideos();
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const conteos = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const v of videos) mapa[v.categoria_id] = (mapa[v.categoria_id] ?? 0) + 1;
    return mapa;
  }, [videos]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return videos.filter(
      (v) =>
        (!categoriaActiva || v.categoria_id === categoriaActiva) &&
        (!texto || v.titulo.toLowerCase().includes(texto)),
    );
  }, [videos, categoriaActiva, busqueda]);

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
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Hola, {sesion?.nombre ?? "jugador"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Elige una categoría y entrena hoy.</p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar un video..."
            className="pl-9"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <CategoriaChip
            nombre="Todas"
            cantidad={videos.length}
            activa={categoriaActiva === null}
            onClick={() => setCategoriaActiva(null)}
          />
          {categorias.map((c) => (
            <CategoriaChip
              key={c.id}
              nombre={c.nombre}
              cantidad={conteos[c.id] ?? 0}
              activa={categoriaActiva === c.id}
              onClick={() => setCategoriaActiva(c.id)}
            />
          ))}
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {categoriaActiva ? categorias.find((c) => c.id === categoriaActiva)?.nombre : "Todos los videos"}
          </h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando videos...</p>
          ) : visibles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Todavía no hay videos aquí. Se irán publicando pronto.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visibles.map((v) => (
                <Link
                  key={v.id}
                  to="/video/$videoId"
                  params={{ videoId: v.id }}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
                >
                  <div className="relative aspect-video bg-secondary">
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt={v.titulo}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                    <PlayCircle className="absolute inset-0 m-auto size-9 text-primary opacity-80 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium">{v.titulo}</p>
                    {v.duracion ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> {v.duracion}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function CategoriaChip({
  nombre,
  cantidad,
  activa,
  onClick,
}: {
  nombre: string;
  cantidad: number;
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-colors ${
        activa
          ? "border-primary bg-primary/15"
          : "border-border bg-card hover:border-primary/60"
      }`}
    >
      <span className="block text-sm font-semibold leading-tight">{nombre}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{cantidad} videos</span>
    </button>
  );
}
