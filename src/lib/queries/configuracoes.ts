import { cache } from "react";
import { db } from "@/lib/db";
import type { ConfiguracoesDoSite } from "./tipos";

/**
 * Configurações do site — linha única, editável no admin. Nada aqui é
 * hard-coded no código: número de WhatsApp, template da mensagem e textos da
 * home saem daqui.
 *
 * Envolvido em `cache()` do React: cabeçalho, rodapé e a página chamam esta
 * função na mesma renderização, e sem isto seriam três idas ao banco para
 * buscar exatamente a mesma linha.
 */
export const buscarConfiguracoes = cache(async function buscarConfiguracoes(): Promise<ConfiguracoesDoSite> {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });

  if (!s) {
    throw new Error(
      "SiteSettings não existe. Rode `pnpm db:seed` para criar a linha singleton."
    );
  }

  return {
    whatsappNumero: s.whatsappNumber,
    whatsappTemplate: s.whatsappTemplate,
    instagramUrl: s.instagramUrl,
    email: s.email,
    cidade: s.city,
    heroTitulo: s.heroTitle,
    heroSubtitulo: s.heroSubtitle,
    // Sem URL não existe foto. O alt cai para um texto honesto: a seção fala
    // da Raquel, e é isso que um leitor de tela precisa ouvir.
    sobreFoto: s.aboutImageUrl
      ? { url: s.aboutImageUrl, alt: s.aboutImageAlt || "Raquel, que faz as peças" }
      : null,
    avisoTexto: s.announcementText,
    avisoAtivo: s.announcementActive,
  };
});
