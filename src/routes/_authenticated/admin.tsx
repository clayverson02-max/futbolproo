import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSesion } from "@/hooks/useSesion";
import { parseVideoUrl } from "@/lib/video";
import { useCategorias, useVideos } from "./dashboard";
import { eliminarVideoLocal, salvarVideoLocal } from "@/lib/localVideos";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel de administración | Fútbol Pro" },
      { name: "description", content: "Agrega, edita y elimina los videos del programa de entrenamiento." },
      { property: "og:title", content: "Panel de administración | Fútbol Pro" },
      { property: "og:description", content: "Agrega, edita y elimina los videos del programa de entrenamiento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Formulario = {
  id: string | null;
  titulo: string;
  categoria_id: string;
  video_url: string;
  descripcion: string;
  thumbnail_url: string;
  duracion: string;
};

const vacio: Formulario = {
  id: null,
  titulo: "",
  categoria_id: "",
  video_url: "",
  descripcion: "",
  thumbnail_url: "",
  duracion: "",
};

const CATEGORIAS_PADRAO = [
  { id: "default-porteros", nombre: "Porteros", slug: "porteros", orden: 1, icono: "🧤" },
  { id: "default-laterales", nombre: "Laterales", slug: "laterales", orden: 2, icono: "🏃" },
  { id: "default-defensas", nombre: "Defensas centrales", slug: "defensas-centrales", orden: 3, icono: "🛡️" },
  { id: "default-delanteros", nombre: "Delanteros", slug: "delanteros", orden: 4, icono: "🎯" },
  { id: "default-tecnica", nombre: "Técnica individual", slug: "tecnica-individual", orden: 5, icono: "⚽" },
  { id: "default-fisico", nombre: "Acondicionamiento físico", slug: "acondicionamiento-fisico", orden: 6, icono: "💪" },
  { id: "default-femenino", nombre: "Fútbol femenino", slug: "futbol-femenino", orden: 7, icono: "🌟" },
  { id: "default-infantil", nombre: "Fútbol infantil", slug: "futbol-infantil", orden: 8, icono: "👟" },
];


function AdminPage() {
  const { data: sesion, isLoading: cargandoSesion } = useSesion();
  const { data: categorias = [] } = useCategorias();
  const { data: videos = [] } = useVideos();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Formulario>(vacio);
  const [guardando, setGuardando] = useState(false);

  const conteos = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const v of videos) mapa[v.categoria_id] = (mapa[v.categoria_id] ?? 0) + 1;
    return mapa;
  }, [videos]);

  if (cargandoSesion) {
    return <p className="p-6 text-sm text-muted-foreground">Cargando...</p>;
  }

  if (!sesion?.esAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">No tienes permiso para ver el panel de administración.</p>
        <Button asChild variant="secondary">
          <Link to="/dashboard">Ir a mi entrenamiento</Link>
        </Button>
      </div>
    );
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const fuente = parseVideoUrl(form.video_url);
    if (!fuente) {
      toast.error("Pega un enlace válido de YouTube o Vimeo.");
      return;
    }
    if (!form.categoria_id) {
      toast.error("Elige una categoría.");
      return;
    }

    setGuardando(true);
    const fila = {
      titulo: form.titulo,
      descripcion: form.descripcion || null,
      categoria_id: form.categoria_id,
      video_url: form.video_url.trim(),
      proveedor: fuente.proveedor,
      video_id: fuente.videoId,
      thumbnail_url: form.thumbnail_url.trim() || fuente.thumbnail,
      duracion: form.duracion.trim() || null,
    };

    try {
      if (!form.id && form.categoria_id.startsWith("default-")) {
        const categoriaPadrao = CATEGORIAS_PADRAO.find((item) => item.id === form.categoria_id);
        if (categoriaPadrao) {
          const { error: errorCategoria } = await supabase
            .from("categories")
            .upsert(categoriaPadrao, { onConflict: "id" });
          if (errorCategoria) throw errorCategoria;
        }
      }

      const resultado = form.id
        ? await supabase.from("videos").update(fila).eq("id", form.id)
        : await supabase.from("videos").insert(fila);

      if (resultado.error) throw resultado.error;

      toast.success(form.id ? "Video actualizado." : "Video agregado.");
      setForm(vacio);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      await queryClient.invalidateQueries({ queryKey: ["categorias"] });
    } catch (error) {
      const idLocal = form.id?.startsWith("local-") ? form.id : null;
      salvarVideoLocal(fila, idLocal);
      toast.success(
        form.id
          ? "Video actualizado en este navegador."
          : "Video guardado. Ya aparece en la biblioteca.",
      );
      setForm(vacio);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });

      if (error instanceof Error) {
        console.warn("Supabase no disponible; video guardado localmente:", error.message);
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (id.startsWith("local-")) {
      eliminarVideoLocal(id);
      toast.success("Video eliminado.");
      if (form.id === id) setForm(vacio);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      return;
    }

    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      toast.success("Video eliminado.");
      if (form.id === id) setForm(vacio);
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Revisa la conexión con el banco de datos.";
      toast.error(`No pudimos eliminar el video: ${detalle.slice(0, 140)}`);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Panel de administración</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {categorias.map((c) => (
            <span key={c.id} className="rounded-full border border-border bg-card px-3 py-1 text-xs">
              {c.nombre}: <strong className="text-primary">{conteos[c.id] ?? 0}</strong>
            </span>
          ))}
        </div>

        <form onSubmit={guardar} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{form.id ? "Editar video" : "Agregar video"}</h2>
            {form.id ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(vacio)}>
                <X className="size-4" /> Cancelar
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej. Reflejos para porteros"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <select
              id="categoria"
              required
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Enlace del video (YouTube o Vimeo)</Label>
            <Input
              id="url"
              required
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="thumb">Miniatura (opcional)</Label>
              <Input
                id="thumb"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="Se toma de YouTube automáticamente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (opcional)</Label>
              <Input
                id="duracion"
                value={form.duracion}
                onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                placeholder="12:30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Descripción (opcional)</Label>
            <Textarea
              id="desc"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : form.id ? "Guardar cambios" : "Agregar video"}
          </Button>
        </form>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Videos ({videos.length})
          </h2>
          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-secondary">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt={v.titulo} loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{v.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {categorias.find((c) => c.id === v.categoria_id)?.nombre}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar"
                  onClick={() =>
                    setForm({
                      id: v.id,
                      titulo: v.titulo,
                      categoria_id: v.categoria_id,
                      video_url: v.video_url,
                      descripcion: v.descripcion ?? "",
                      thumbnail_url: v.thumbnail_url ?? "",
                      duracion: v.duracion ?? "",
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminar(v.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
            {videos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Aún no has agregado videos.
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
