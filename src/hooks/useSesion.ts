import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Sesion = {
  userId: string;
  email: string;
  nombre: string;
  activo: boolean;
  esAdmin: boolean;
} | null;

export async function cargarSesion(): Promise<Sesion> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const [{ data: perfil }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("nombre, activo, email").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    userId: user.id,
    email: perfil?.email ?? user.email ?? "",
    nombre: perfil?.nombre ?? user.email?.split("@")[0] ?? "Jugador",
    activo: perfil?.activo ?? true,
    esAdmin: (roles ?? []).some((r) => r.role === "admin"),
  };
}

export function useSesion() {
  return useQuery({ queryKey: ["sesion"], queryFn: cargarSesion, staleTime: 60_000 });
}
