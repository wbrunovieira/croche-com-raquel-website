import { Fraunces, Karla } from "next/font/google";

// Fraunces é variável: opsz + wght + SOFT + WONK.
// Não passar `weight` — assim o eixo wght inteiro fica disponível.
export const fraunces = Fraunces({
  subsets: ["latin"],            // pt-BR (ã õ ç é â) está todo no subset latin
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

export const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-karla",
});
