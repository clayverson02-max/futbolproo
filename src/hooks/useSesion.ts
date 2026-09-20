import { useQuery } from "@tanstack/react-query";

const CHAVE_SESSAO = "futbolpro-auth";

export type Sesion = {
  userId: string;
  email: string;
  nombre: string;
  activo: boolean;
  esAdmin: boolean;
} | null;

export function cargarSesion(): Sesion {
  if (
    typeof window === "undefined" ||
    window.sessionStorage.getItem(CHAVE_SESSAO) !== "true"
  ) {
    return null;
  }

  return {
    userId: "local-clientepro",
    email: "",
    nombre: "clientepro",
    activo: true,
    esAdmin: true,
  };
}

export function useSesion() {
  return useQuery({
    queryKey: ["sesion"],
    queryFn: cargarSesion,
    staleTime: 60_000,
  });
}
