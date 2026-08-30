import type { Metadata } from "next";
import { fraunces, karla } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Crochê com Raquel — peças feitas à mão em Petrópolis",
    template: "%s · Crochê com Raquel",
  },
  description:
    "Bolsas, peças de mesa posta e decoração em crochê e macramê, feitas à mão sob encomenda em Petrópolis/RJ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${karla.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
