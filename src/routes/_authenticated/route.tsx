import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";

// Layout pathless: tudo abaixo de `_authenticated/` exige sessão válida.
// `ssr: false` porque o token vive no localStorage (só existe no cliente).
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().hasValidToken()) {
      throw redirect({ to: "/login", search: { redirect: location.href }, replace: true });
    }
  },
  component: () => <Outlet />,
});
