"use client";

import { useState } from "react";

/**
 * Compartilhar a peça. A Raquel usa muito: ela abre a página e manda o link
 * direto para a cliente. No celular abre o menu nativo; no desktop copia.
 */
export function Compartilhar({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // A pessoa cancelou o menu nativo — não é erro, e não vale cair na
        // cópia sem ela pedir.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className="py-2 -my-2 text-apoio text-destaque-texto underline underline-offset-4 hover:no-underline"
    >
      <span aria-live="polite">{copiado ? "Link copiado" : "Compartilhar esta peça"}</span>
    </button>
  );
}
