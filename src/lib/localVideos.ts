export type VideoLocal = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria_id: string;
  video_url: string;
  proveedor: string;
  video_id: string;
  thumbnail_url: string | null;
  duracion: string | null;
  fecha_creacion: string;
};

const CHAVE_VIDEOS = "futbolpro-videos";

function gerarId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function listarVideosLocais(): VideoLocal[] {
  if (typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(CHAVE_VIDEOS);
    const videos = salvo ? JSON.parse(salvo) : [];
    return Array.isArray(videos) ? videos : [];
  } catch {
    return [];
  }
}

export function salvarVideoLocal(
  video: Omit<VideoLocal, "id" | "fecha_creacion">,
  id?: string | null,
) {
  const videos = listarVideosLocais();
  const videoSalvo: VideoLocal = {
    ...video,
    id: id ?? gerarId(),
    fecha_creacion: new Date().toISOString(),
  };
  const indice = videos.findIndex((item) => item.id === videoSalvo.id);

  if (indice >= 0) {
    videos[indice] = videoSalvo;
  } else {
    videos.unshift(videoSalvo);
  }

  window.localStorage.setItem(CHAVE_VIDEOS, JSON.stringify(videos));
  return videoSalvo;
}

export function eliminarVideoLocal(id: string) {
  const videos = listarVideosLocais().filter((video) => video.id !== id);
  window.localStorage.setItem(CHAVE_VIDEOS, JSON.stringify(videos));
}
