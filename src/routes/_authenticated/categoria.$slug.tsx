import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, PlayCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useCategorias, useVideos } from "./dashboard";

const COPYS: Record<string, { titulo: string; descripcion: string; objetivo: string; icono: string }> = {
  porteros: {
    titulo: "Entrenamiento para porteros",
    descripcion: "Mejora tus reflejos, tu posicionamiento y la seguridad para defender cada balón.",
    objetivo: "Domina los fundamentos bajo los tres palos.",
    icono: "🧤",
  },
  laterales: {
    titulo: "Entrenamiento para laterales",
    descripcion: "Trabaja velocidad, marca, resistencia y apoyo para ser decisivo en los dos costados.",
    objetivo: "Gana intensidad y confianza por las bandas.",
    icono: "🏃",
  },
  "defensas-centrales": {
    titulo: "Entrenamiento para defensas centrales",
    descripcion: "Aprende a anticipar, cubrir espacios y salir jugando con más tranquilidad.",
    objetivo: "Defiende mejor y lidera la línea defensiva.",
    icono: "🛡️",
  },
  delanteros: {
    titulo: "Entrenamiento para delanteros",
    descripcion: "Perfecciona tus movimientos, tu finalización y tu capacidad para decidir dentro del área.",
    objetivo: "Crea más oportunidades y marca más goles.",
    icono: "🎯",
  },
  "tecnica-individual": {
    titulo: "Técnica individual",
    descripcion: "Control, conducción, regate y dominio del balón para jugar con más calidad.",
    objetivo: "Haz que cada toque tenga más intención.",
    icono: "⚽",
  },
  "acondicionamiento-fisico": {
    titulo: "Acondicionamiento físico",
    descripcion: "Desarrolla resistencia, fuerza y explosión para mantener tu rendimiento durante todo el partido.",
    objetivo: "Juega con energía del primer al último minuto.",
    icono: "💪",
  },
  "futbol-femenino": {
    titulo: "Fútbol femenino",
    descripcion: "Sesiones organizadas para acompañar la evolución técnica, física y táctica de las jugadoras.",
    objetivo: "Entrena con claridad y constancia.",
    icono: "🌟",
  },
  "futbol-infantil": {
    titulo: "Fútbol infantil",
    descripcion: "Ejercicios dinámicos y fáciles de aplicar para desarrollar fundamentos desde la base.",
    objetivo: "Aprende jugando y evoluciona paso a paso.",
    icono: "👟",
  },
};

export const Route = createFileRoute("/_authenticated/categoria/$slug")({
  head: () => ({
    meta: [
      { title: "Categoría de entrenamiento | Fútbol Pro" },
      { name: "description", content: "Entrenamientos organizados por categoría para avanzar en el fútbol." },
    ],
  }),
  component: CategoriaPage,
});

function normalizarSlug(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CategoriaPage() {
  const { slug } = useParams({ from: "/_authenticated/categoria/$slug" });
  const { data: categorias = [] } = useCategorias();
  const { data: videos = [], isLoading } = useVideos();

  const categoria = categorias.find(
    (item) => item.slug === slug || normalizarSlug(item.nombre) === slug,
  );
  const copy = COPYS[slug] ?? {
    titulo: categoria?.nombre ?? "Entrenamiento de fútbol",
    descripcion: "Entrenamientos organizados para ayudarte a avanzar con método y constancia.",
    objetivo: "Elige una sesión y comienza tu evolución.",
    icono: categoria?.icono ?? "⚽",
  };
  const videosDaCategoria = categoria
    ? videos.filter((video) => video.categoria_id === categoria.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dashboard">
            <ChevronLeft className="size-4" /> Volver a categorías
          </Link>
        </Button>

        <section className="mt-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-5 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-3xl sm:size-16">
              {copy.icono}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Área de entrenamiento</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{copy.titulo}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.descripcion}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-3 text-sm">
            <span className="size-2 rounded-full bg-primary" />
            <span className="font-semibold">Objetivo:</span>
            <span className="text-muted-foreground">{copy.objetivo}</span>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Sesiones disponibles</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sigue las sesiones en orden o elige la que quieres trabajar hoy.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {videosDaCategoria.length} {videosDaCategoria.length === 1 ? "sesión" : "sesiones"}
            </span>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando sesiones...</p>
          ) : videosDaCategoria.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <span className="text-3xl">{copy.icono}</span>
              <h3 className="mt-3 font-semibold">Esta área ya está preparada</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Los entrenamientos de esta categoría aparecerán aquí assim que los enlaces sean agregados.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videosDaCategoria.map((video, index) => (
                <Link
                  key={video.id}
                  to="/video/$videoId"
                  params={{ videoId: video.id }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg"
                >
                  <div className="relative aspect-video bg-secondary">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.titulo}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2 py-1 text-[11px] font-bold">
                      Sesión {index + 1}
                    </span>
                    <PlayCircle className="absolute inset-0 m-auto size-11 text-primary opacity-85 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-sm font-semibold">{video.titulo}</span>
                      {video.descripcion ? (
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{video.descripcion}</span>
                      ) : null}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
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
