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
import type { ImagemDeProduto } from "@/lib/queries/tipos";

const SUAVE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero da home.
 *
 * A aposta da identidade é a inversão cromática: fundo verde profundo para a
 * peça saltar. A foto entra na máscara em arco, que no site inteiro é
 * exclusiva de bolsa — e bolsa é o carro-chefe, então ela abre a página.
 *
 * As bolinhas de cor flutuando sobre a foto são as cores que o catálogo
 * realmente oferece, vindas do banco. Enfeite com cor que a Raquel não tem
 * seria promessa falsa na primeira dobra.
 *
 * A foto passa sozinha entre as bolsas em destaque: uma peça só na primeira
 * dobra vende uma peça, o rodízio vende o ateliê. Quem não quiser esperar
 * adianta pelo chevron.
 */
export function Hero({
  titulo,
  subtitulo,
  cores,
  capas,
  whatsappNumero,
  cidade,
}: {
  titulo: string;
  subtitulo: string;
  cores: { id: string; nome: string; hex: string }[];
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

  const entrada = (atraso: number) => ({
    initial: semMovimento ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: semMovimento ? 0 : atraso, ease: SUAVE },
  });

  return (
    <section ref={secao} className="trama relative overflow-hidden bg-inv-fundo text-inv-conteudo">
      <div className="container-site secao-ampla">
        <div className="grid items-center gap-x-coluna gap-y-grade-linha lg:grid-cols-[1fr_minmax(0,21rem)]">
          <div>
            <motion.p
              {...entrada(0)}
              className="font-texto text-etiqueta uppercase text-inv-suave"
            >
              {cidade} · feito à mão
            </motion.p>

            <motion.h1 {...entrada(0.08)} className="mt-4 max-w-[14ch] font-display text-display">
              {titulo}
            </motion.h1>

            <motion.p
              {...entrada(0.16)}
              className="mt-6 max-w-texto text-leitura text-inv-suave"
            >
              {subtitulo}
            </motion.p>

            <motion.div {...entrada(0.24)} className="mt-bloco flex flex-wrap gap-4">
              <Link
                href="/bolsas"
                className="inline-flex items-center gap-btn-icone rounded-fio bg-cru px-btn-x py-btn-y font-medium text-verde-cristal transition-colors hover:bg-papel"
              >
                Ver as bolsas
              </Link>
              <a
                href={`https://wa.me/${whatsappNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-btn-icone rounded-fio border border-inv-borda px-btn-x py-btn-y font-medium transition-colors hover:bg-white/10"
              >
                <IconeZap className="size-5" />
                Falar com a Raquel
              </a>
            </motion.div>

            <motion.ul
              {...entrada(0.32)}
              className="mt-respiro flex flex-wrap gap-x-8 gap-y-3 text-apoio text-inv-suave"
            >
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
            </motion.ul>
          </div>

          <motion.div
            initial={semMovimento ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: semMovimento ? 0 : 0.12, ease: SUAVE }}
            className="lg:mb-bloco"
          >
            <div
              role="group"
              aria-roledescription="carrossel"
              aria-label="Bolsas em destaque"
              onMouseEnter={() => setPausado(true)}
              onMouseLeave={() => setPausado(false)}
              onFocusCapture={() => setPausado(true)}
              onBlurCapture={() => setPausado(false)}
            >
              {/* Âncora do card de cores: ele se posiciona pela foto, não pelo
                  conjunto — senão os controles logo abaixo o empurram para
                  cima e ele cobre a peça. */}
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
                          transition={{ duration: 0.6, ease: SUAVE }}
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

                      {/* As cores moram sobre a foto, mas sem painel: um bloco
                          opaco aqui cobre justamente o corpo da bolsa. O que
                          sustenta a leitura é uma sombra curta na base, que
                          funciona tanto na peça clara quanto na escura.

                          O rótulo é descritivo, e não "escolha a cor": aqui
                          não se escolhe nada — quem escolhe é o seletor da
                          página da peça. Verbo no imperativo prometia um
                          controle que estas bolinhas não são. E "algumas"
                          porque a faixa mostra no máximo 8 das cadastradas. */}
                      {cores.length > 0 ? (
                        <motion.div
                          {...entrada(0.5)}
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-5 pb-5 pt-16"
                        >
                          <p className="font-texto text-etiqueta uppercase text-cru/90">
                            Algumas cores disponíveis
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {cores.map((c) => (
                              <li
                                key={c.id}
                                title={c.nome}
                                className="size-5 rounded-pilula ring-1 ring-cru/30"
                                style={{ backgroundColor: c.hex }}
                              >
                                <span className="sr-only">{c.nome}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Fora da foto: o card de cores ocupa justamente o canto de
                  baixo e engoliria os controles. */}
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
          </motion.div>
        </div>
      </div>

      <div className="corrente corrente--claro absolute inset-x-0 bottom-0" aria-hidden="true" />
    </section>
  );
}
