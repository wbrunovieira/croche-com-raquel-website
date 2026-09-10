"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import { classesDeBotao } from "@/components/ui/botao";

/**
 * Compartilhar a peça — a Raquel usa muito: abre a página e manda o link para
 * a cliente.
 *
 * Era um link sublinhado só, "Compartilhar esta peça", que no celular abria o
 * menu nativo e no desktop copiava. Funcionava e não parecia nada. Agora são
 * botões dos dois lugares onde ela realmente divulga.
 *
 * **WhatsApp** é compartilhamento de verdade: `wa.me/?text=` abre o app com a
 * mensagem pronta e ela escolhe o contato.
 *
 * **Instagram não aceita link pré-preenchido pela web** — não existe URL de
 * compartilhamento equivalente, e nenhum truque de `intent://` funciona no
 * navegador. Então o botão faz o que dá para fazer de verdade: copia o link e
 * abre o Instagram para ela colar no story ou na direct. O rótulo diz
 * exatamente isso, porque prometer "compartilhar no Instagram" e entregar uma
 * aba aberta seria mentir para quem usa.
 */
export function Compartilhar({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState<"link" | "instagram" | null>(null);

  const noWhatsapp = `https://wa.me/?text=${encodeURIComponent(`${titulo}\n${url}`)}`;

  async function copiar(quem: "link" | "instagram") {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(quem);
      setTimeout(() => setCopiado(null), 2500);
      return true;
    } catch {
      setCopiado(null);
      return false;
    }
  }

  return (
    <div>
      <span className="block text-legenda text-conteudo-suave">Compartilhar esta peça</span>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={noWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={classesDeBotao("secundaria", "sm")}
        >
          <IconeZap className="size-4" />
          WhatsApp
        </a>

        <button
          type="button"
          onClick={async () => {
            await copiar("instagram");
            // Abre depois de copiar: se a cópia falhar, ela não fica com uma
            // aba do Instagram e nada na área de transferência.
            window.open("https://instagram.com", "_blank", "noopener,noreferrer");
          }}
          className={classesDeBotao("secundaria", "sm")}
        >
          <IconeInstagram className="size-4" />
          {copiado === "instagram" ? "Link copiado — cole lá" : "Copiar para o Instagram"}
        </button>

        <button
          type="button"
          onClick={() => copiar("link")}
          className="inline-flex items-center gap-2 py-2 text-apoio text-conteudo-suave underline underline-offset-4 transition-colors hover:text-conteudo hover:no-underline"
        >
          <Link2 className="size-4" aria-hidden="true" />
          {copiado === "link" ? "Link copiado" : "Copiar link"}
        </button>
      </div>

      {/* Um aviso só, fora dos botões: dois `aria-live` na mesma região fazem o
          leitor de tela anunciar duas vezes. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copiado ? "Link copiado para a área de transferência." : ""}
      </span>
    </div>
  );
}
