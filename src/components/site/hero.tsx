"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ChevronRight, Hand, Package, Sparkles } from "lucide-react";
import { Foto } from "@/components/ui/foto";
import { IconeZap } from "@/components/ui/icone-zap";
import { DURACAO, transicao } from "@/lib/movimento";
import type { ImagemDeProduto } from "@/lib/queries/tipos";

/**
 * Hero da home.
 *
 * A aposta da identidade é a inversão cromática: fundo verde profundo para a
 * peça saltar. A foto entra na máscara em arco, que no site inteiro é
 * exclusiva de bolsa — e bolsa é o carro-chefe, então ela abre a página.
 *
 * A foto passa sozinha entre as bolsas em destaque: uma peça só na primeira
 * dobra vende uma peça, o rodízio vende o ateliê. Quem não quiser esperar
 * adianta pelo chevron.
 */
export function Hero({
  titulo,
  subtitulo,
  capas,
  whatsappNumero,
  cidade,
}: {
  titulo: string;
  subtitulo: string;
  capas: ImagemDeProduto[];
  whatsappNumero: string;
  cidade: string;
}) {
  const semMovimento = useReducedMotion();
  const secao = useRef<HTMLElement>(null);

  // Paralaxe curta na foto: 40px em toda a altura da seção. O suficiente para
  // dar profundidade sem que o texto e a imagem pareçam soltos um do outro.
  const { scrollYProgress } = useScroll({
    target: secao,
    offset: ["start start", "end start"],
  });
  const deslocamento = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Rodízio das fotos. Pausa quando o ponteiro está em cima ou quando algo ali
  // dentro tem o foco do teclado: trocar a foto embaixo do dedo de quem está
  // decidindo é o jeito mais rápido de perder a pessoa.
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const avancar = useCallback(() => {
    setAtual((i) => (i + 1) % Math.max(capas.length, 1));
  }, [capas.length]);

  useEffect(() => {
    // `semMovimento` desliga o rodízio inteiro — quem pediu menos movimento no
    // sistema não pediu uma foto trocando sozinha. O chevron continua valendo.
    if (semMovimento || pausado || capas.length < 2) return;
    const relogio = setInterval(avancar, 5000);
    return () => clearInterval(relogio);
  }, [semMovimento, pausado, capas.length, avancar]);

  return (
    <section ref={secao} className="trama relative overflow-hidden bg-inv-fundo text-inv-conteudo">
      {/* `secao--ampla`, com dois traços. Estava escrito com um só, e a classe
          simplesmente não existia: o hero rodou sem padding vertical nenhum, com
          a foto encostando no cabeçalho em cima e na corrente embaixo. O CSS
          definia a classe e ninguém a consumia. */}
      <div className="container-site secao--ampla">
        <div className="grid items-center gap-x-coluna gap-y-grade-linha lg:grid-cols-[1fr_minmax(0,21rem)]">
          <div>
            {/* A cascata é CSS puro (`.surgir`), não framer-motion. O `initial`
                do motion vira `style` inline no SSR, e o `<h1>` abaixo é o
                candidato a LCP: ele saía do servidor com `opacity: 0` e só
                aparecia depois da hidratação. Em keyframes, pinta no primeiro
                quadro. Ver `globals.css`. */}
            <p className="surgir font-texto text-etiqueta uppercase text-inv-suave">
              {cidade} · feito à mão
            </p>

            <h1 className="surgir surgir-2 mt-4 max-w-[14ch] font-display text-display">
              {titulo}
            </h1>

            <p className="surgir surgir-3 mt-6 max-w-texto text-leitura text-inv-suave">
              {subtitulo}
            </p>

            <div className="surgir surgir-4 mt-bloco flex flex-wrap gap-4">
              <Link
                href="/bolsas"
                className="inline-flex items-center gap-btn-icone rounded-fio bg-cru px-btn-x py-btn-y font-medium text-verde-cristal transition-[background-color,transform] duration-150 ease-fio active:translate-y-px hover:bg-papel"
              >
                Ver as bolsas
              </Link>
              <a
                href={`https://wa.me/${whatsappNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-btn-icone rounded-fio border border-inv-borda px-btn-x py-btn-y font-medium transition-[background-color,transform] duration-150 ease-fio active:translate-y-px hover:bg-white/10"
              >
                <IconeZap className="size-5" />
                Falar com a Raquel
              </a>
            </div>

            <ul className="surgir surgir-5 mt-respiro flex flex-wrap gap-x-8 gap-y-3 text-apoio text-inv-suave">
              {[
                { Icone: Hand, texto: "Feito à mão, peça por peça" },
                { Icone: Sparkles, texto: "Cor e tamanho à sua escolha" },
                { Icone: Package, texto: "Envio para todo o Brasil" },
              ].map(({ Icone, texto }) => (
                <li key={texto} className="flex items-center gap-2">
                  <Icone className="size-4 shrink-0" aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          {/* `tricotar`: o arco cresce de baixo para cima, como a peça sendo
              feita — é o que a identidade pediu (§4.6) e nunca tinha ganhado.
              Substitui o `scale: .96 → 1`, que reamostrava uma foto de 640×800
              e borrava justamente a textura do ponto. */}
          <div className="tricotar lg:mb-bloco">
            <div
              role="group"
              aria-roledescription="carrossel"
              aria-label="Bolsas em destaque"
              onMouseEnter={() => setPausado(true)}
              onMouseLeave={() => setPausado(false)}
              onFocusCapture={() => setPausado(true)}
              onBlurCapture={() => setPausado(false)}
            >
              <div className="relative">
                <motion.div style={semMovimento ? undefined : { y: deslocamento }}>
                  {capas.length === 0 ? (
                    <Foto imagem={null} arco prioridade sobreEscuro />
                  ) : (
                    <div className="arco relative aspect-peca w-full overflow-hidden">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={capas[atual].id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={transicao(DURACAO.entrada, semMovimento)}
                          className="absolute inset-0"
                        >
                          <Image
                            src={capas[atual].url}
                            alt={capas[atual].alt}
                            fill
                            // Só a primeira corre na primeira dobra; as demais
                            // só entram depois e não disputam a LCP.
                            priority={atual === 0}
                            sizes="(min-width: 64rem) 21rem, 100vw"
                            className="object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </div>

              {capas.length > 1 ? (
                <div className="mt-3 flex items-center justify-end gap-2">
                  <ul className="flex items-center gap-1.5">
                    {capas.map((c, i) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setAtual(i)}
                          aria-label={`Ver foto ${i + 1} de ${capas.length}`}
                          aria-current={i === atual}
                          // A área de toque de 44px mora no botão; o ponto
                          // visível é o filho de 6px.
                          className="grid size-11 place-items-center"
                        >
                          <span
                            className={`block size-1.5 rounded-pilula transition-colors ${
                              i === atual ? "bg-cru" : "bg-cru/40"
                            }`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={avancar}
                    aria-label="Próxima foto"
                    className="grid size-11 place-items-center rounded-pilula border border-inv-borda transition-colors hover:bg-white/10"
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="corrente corrente--claro absolute inset-x-0 bottom-0" aria-hidden="true" />
    </section>
  );
}
