import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  // O painel nunca deve aparecer em buscador.
  robots: { index: false, follow: false },
};

export default function LayoutDoAdmin({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
