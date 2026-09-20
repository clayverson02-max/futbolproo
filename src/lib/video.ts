export type Proveedor = "youtube" | "vimeo";

export type VideoFuente = {
  proveedor: Proveedor;
  videoId: string;
  embedUrl: string;
  thumbnail: string | null;
};

/** Extrae el ID de un enlace de YouTube o Vimeo. Devuelve null si no es válido. */
export function parseVideoUrl(url: string): VideoFuente | null {
  const limpio = url.trim();
  if (!limpio) return null;

  const youtube =
    limpio.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ??
    null;
  if (youtube?.[1]) {
    const id = youtube[1];
    return {
      proveedor: "youtube",
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeo = limpio.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    const id = vimeo[1];
    return {
      proveedor: "vimeo",
      videoId: id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnail: null,
    };
  }

  return null;
}

export function embedUrlDesde(proveedor: string, videoId: string): string {
  return proveedor === "vimeo"
    ? `https://player.vimeo.com/video/${videoId}`
    : `https://www.youtube.com/embed/${videoId}`;
}
