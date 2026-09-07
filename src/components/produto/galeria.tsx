"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Foto } from "@/components/ui/foto";
import { DURACAO, transicao } from "@/lib/movimento";
import type { ImagemDeProduto } from "@/lib/queries/tipos";

/**
 * Galeria da página de produto.
 *
 * Crochê vende pela textura, então a foto grande precisa poder ser ampliada.
 * Clicar abre a imagem em tela cheia; Esc e clique fora fecham.
 *
 * Duas coisas mudaram aqui, e as duas são de percepção:
 *
 * 1. **A troca de miniatura era um corte seco.** Uma foto sumindo e outra
 *    aparecendo no mesmo quadro lê como erro de carregamento; com 350ms de
 *    crossfade lê como a mesma peça vista de outro ângulo — que é o que é.
 * 2. **A lupa abria e fechava sem transição e sem cuidado com o foco.** Quem
 *    navega por teclado abria a foto ampliada e continuava tabulando a página
 *    ATRÁS dela, invisível; ao fechar, o foco voltava para o começo do
 *    documento. Agora o foco entra no dialogo, fica preso lá dentro e volta
 *    para o botão que abriu.
 *
 * O `initial={false}` no `AnimatePresence` não é enfeite: sem ele o `initial`
 * do motion viraria `style="opacity:0"` inline já no SSR, e a foto da peça —
 * candidata a LCP desta página — sairia do servidor invisível. Assim a primeira
 * foto é servida pintada e só as TROCAS animam.
 *
 * Sem acervo cadastrado ainda, cai no placeholder — e a galeria não quebra.
 */
export function Galeria({
  imagens,
  arco,
  nomeDoProduto,
}: {
  imagens: ImagemDeProduto[];
  arco: boolean;
  nomeDoProduto: string;
}) {
  const semMovimento = useReducedMotion();
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const dialogo = useRef<HTMLDivElement | null>(null);
  const gatilho = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ampliada) return;

    const caixa = dialogo.current;
    const focaveis = () =>
      Array.from(caixa?.querySelectorAll<HTMLElement>("button, [href]") ?? []);

    // O foco entra no dialogo pelo botão de fechar — a saída é sempre a
    // primeira coisa que a pessoa precisa achar.
    focaveis()[0]?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAmpliada(false);
        return;
      }
      if (e.key !== "Tab") return;

      // Prender o Tab: sem isto o foco escapa para a página atrás da foto, que
      // está coberta. A pessoa continua tabulando e não vê nada acontecer.
      const alvos = focaveis();
      if (alvos.length === 0) return;
      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];
      const ativo = document.activeElement;
      if (e.shiftKey && (ativo === primeiro || !caixa?.contains(ativo))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (ativo === ultimo || !caixa?.contains(ativo))) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = rolagemAnterior;
    };
  }, [ampliada]);

  // Devolver o foco a quem abriu. Roda também na montagem, quando `gatilho`
  // ainda é nulo — e aí não faz nada.
  useEffect(() => {
    if (!ampliada) gatilho.current?.focus();
  }, [ampliada]);

  const imagem = imagens[atual] ?? null;
  const forma = arco ? "arco" : "rounded-card";

  return (
    <div>
      {imagem ? (
        <button
          type="button"
          onClick={(e) => {
            gatilho.current = e.currentTarget;
            setAmpliada(true);
          }}
          className="block w-full cursor-zoom-in"
          aria-label={`Ampliar foto de ${nomeDoProduto}`}
        >
          <div className={`relative aspect-peca w-full overflow-hidden ${forma}`}>
            <AnimatePresence initial={false}>
              <motion.div
                key={imagem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transicao(DURACAO.troca, semMovimento)}
                className="absolute inset-0"
              >
                <Image
                  src={imagem.url}
                  alt={imagem.alt}
                  fill
                  // Só a foto de abertura corre pela LCP; as trocas vêm depois
                  // de a pessoa tocar numa miniatura.
                  priority={atual === 0}
                  sizes="(min-width: 64rem) 30rem, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </button>
      ) : (
        <Foto imagem={null} arco={arco} prioridade />
      )}

      {imagens.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-3">
          {imagens.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
                aria-current={i === atual}
                // Mesmo gesto do card de peça — subir ao passar, afundar sob o
                // dedo —, mas sem a classe `.card-peca`: ela mexe na cor da
                // borda, que aqui é justamente o que marca a foto em cena.
                className={`relative block size-20 overflow-hidden rounded-fio border transition-transform duration-200 ease-fio hover:-translate-y-0.5 active:translate-y-0 ${
                  i === atual ? "border-conteudo" : "border-borda"
                }`}
              >
                <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
                {/* Um véu claro sobre as que não estão em cena. Marcar a atual
                    só pela borda some numa foto que já é escura na beirada. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 bg-cru transition-opacity duration-200 ${
                    i === atual ? "opacity-0" : "opacity-30"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <AnimatePresence>
        {ampliada && imagem ? (
          <motion.div
            ref={dialogo}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ampliada de ${nomeDoProduto}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transicao(DURACAO.curta, semMovimento)}
            onClick={() => setAmpliada(false)}
            className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-verde-musgo/95 p-borda-pagina"
          >
            <motion.div
              // A foto sobe um pouco ao entrar, como quem aproxima a peça do
              // olho. Sem `scale`: reamostrar a textura do ponto é justamente
              // o que a pessoa abriu a lupa para ver.
              initial={semMovimento ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={semMovimento ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={transicao(DURACAO.troca, semMovimento)}
              className="relative max-h-full w-full max-w-produto"
            >
              <Image
                src={imagem.url}
                alt={imagem.alt}
                width={1600}
                height={2000}
                className="mx-auto h-auto max-h-[85vh] w-auto rounded-card object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setAmpliada(false)}
              className="absolute top-borda-pagina right-borda-pagina rounded-fio bg-cru px-btn-x py-btn-y text-apoio font-medium text-verde-cristal transition-transform active:translate-y-px"
            >
              Fechar
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
