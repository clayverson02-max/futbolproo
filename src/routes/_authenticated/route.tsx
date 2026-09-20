import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const CHAVE_SESSAO = "futbolpro-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const autenticado =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(CHAVE_SESSAO) === "true";

    if (!autenticado) throw redirect({ to: "/auth" });

    return { user: { id: "local-clientepro" } };
  },
  component: () => <Outlet />,
});
