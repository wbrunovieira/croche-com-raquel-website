import type { Metadata } from "next";
import { fraunces, karla } from "./fonts";
import "./globals.css";
import { urlDoSite } from "@/lib/site";

export const metadata: Metadata = {
  // Sem metadataBase, canonical e Open Graph relativos saem sem domínio.
  metadataBase: new URL(urlDoSite()),
  title: {
    default: "Crochê com Raquel — peças feitas à mão em Petrópolis",
    template: "%s · Crochê com Raquel",
  },
  description:
    "Bolsas, peças de mesa posta e decoração em crochê e macramê, feitas à mão sob encomenda em Petrópolis/RJ.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Crochê com Raquel",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${karla.variable} h-full`}
    >
      <head>
        {/* Marca que há JavaScript, antes da primeira pintura.
            É o que autoriza o `.revelar` a esconder o conteúdo: o estado
            escondido só pode existir se existir quem o desfaça. Sem script, ou
            com script lento, nada some — a regra em `globals.css` está atrás
            de `.js`. Precisa ser inline e síncrono no `head`; num efeito, o
            conteúdo piscaria. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
