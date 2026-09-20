import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { embedUrlDesde } from "@/lib/video";
import { useSesion } from "@/hooks/useSesion";

export const Route = createFileRoute("/_authenticated/video/$videoId")({
  head: () => ({
    meta: [
      { title: "Ver entrenamiento | Fútbol Pro" },
      { name: "description", content: "Reproduce tu sesión de entrenamiento y mira videos relacionados." },
      { property: "og:title", content: "Ver entrenamiento | Fútbol Pro" },
      { property: "og:description", content: "Reproduce tu sesión de entrenamiento y mira videos relacionados." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const { videoId } = useParams({ from: "/_authenticated/video/$videoId" });
  const { data: sesion } = useSesion();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const { data: video, error } = await supabase
        .from("videos")
        .select("*, categories(nombre)")
        .eq("id", videoId)
        .maybeSingle();
      if (error) throw error;
      if (!video) return null;
      const { data: relacionados } = await supabase
        .from("videos")
        .select("id, titulo, thumbnail_url")
        .eq("categoria_id", video.categoria_id)
        .neq("id", video.id)
        .limit(6);
      return { video, relacionados: relacionados ?? [] };
    },
  });

  const { data: progreso } = useQuery({
    queryKey: ["progreso", videoId, sesion?.userId],
    enabled: Boolean(sesion?.userId),
    queryFn: async () => {
      const { data: fila } = await supabase
        .from("progress")
        .select("completado")
        .eq("video_id", videoId)
        .eq("user_id", sesion!.userId)
        .maybeSingle();
      return fila?.completado ?? false;
    },
  });

  async function marcarCompletado() {
    if (!sesion) return;
    const { error } = await supabase
      .from("progress")
      .upsert(
        { user_id: sesion.userId, video_id: videoId, completado: !progreso, fecha: new Date().toISOString() },
        { onConflict: "user_id,video_id" },
      );
    if (error) {
      toast.error("No pudimos guardar tu progreso.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["progreso", videoId] });
    toast.success(progreso ? "Marcado como pendiente." : "¡Video completado!");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-4">
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link to="/dashboard">
            <ChevronLeft className="size-4" /> Volver
          </Link>
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : !data?.video ? (
          <p className="text-sm text-muted-foreground">Este video ya no está disponible.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <div className="aspect-video">
                <iframe
                  src={embedUrlDesde(data.video.proveedor, data.video.video_id)}
                  title={data.video.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {data.video.categories?.nombre}
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight">{data.video.titulo}</h1>
              {data.video.descripcion ? (
                <p className="mt-2 text-sm text-muted-foreground">{data.video.descripcion}</p>
              ) : null}
              <Button
                className="mt-4"
                variant={progreso ? "secondary" : "default"}
                onClick={marcarCompletado}
              >
                <CheckCircle2 className="size-4" />
                {progreso ? "Completado" : "Marcar como completado"}
              </Button>
            </div>

            {data.relacionados.length > 0 ? (
              <section className="mt-10">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Videos relacionados
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {data.relacionados.map((r) => (
                    <Link
                      key={r.id}
                      to="/video/$videoId"
                      params={{ videoId: r.id }}
                      className="overflow-hidden rounded-xl border border-border bg-card hover:border-primary"
                    >
                      <div className="aspect-video bg-secondary">
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt={r.titulo} loading="lazy" className="size-full object-cover" />
                        ) : null}
                      </div>
                      <p className="line-clamp-2 p-2 text-sm">{r.titulo}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
