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

const CATEGORIA_IDS_ANTIGOS: Record<string, string> = {
  "default-porteros": "11111111-1111-1111-1111-111111111111",
  "default-laterales": "22222222-2222-2222-2222-222222222222",
  "default-defensas": "33333333-3333-3333-3333-333333333333",
  "default-delanteros": "44444444-4444-4444-4444-444444444444",
  "default-tecnica": "55555555-5555-5555-5555-555555555555",
  "default-fisico": "66666666-6666-6666-6666-666666666666",
  "default-femenino": "77777777-7777-7777-7777-777777777777",
  "default-infantil": "88888888-8888-8888-8888-888888888888",
};

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
    return (Array.isArray(videos) ? videos : []).map((video) => ({
      ...video,
      categoria_id: CATEGORIA_IDS_ANTIGOS[video.categoria_id] ?? video.categoria_id,
    }));
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
