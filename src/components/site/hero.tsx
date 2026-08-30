"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Hand, Package, Sparkles } from "lucide-react";
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
 */
export function Hero({
  titulo,
  subtitulo,
  cores,
  capa,
  whatsappNumero,
  cidade,
}: {
  titulo: string;
  subtitulo: string;
  cores: { id: string; nome: string; hex: string }[];
  capa: ImagemDeProduto | null;
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
            className="relative lg:mb-bloco"
          >
            <motion.div style={semMovimento ? undefined : { y: deslocamento }}>
              <Foto imagem={capa} arco prioridade sobreEscuro />
            </motion.div>

            {cores.length > 0 ? (
              <motion.div
                {...entrada(0.5)}
                className="absolute bottom-6 -left-4 rounded-card border border-borda bg-superficie p-painel shadow-alta sm:-left-12"
              >
                <p className="font-texto text-etiqueta uppercase text-conteudo-suave">
                  Escolha a cor
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cores.map((c) => (
                    <li
                      key={c.id}
                      title={c.nome}
                      className="size-7 rounded-pilula border border-borda-forte/40"
                      style={{ backgroundColor: c.hex }}
                    >
                      <span className="sr-only">{c.nome}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>

      <div className="corrente corrente--claro absolute inset-x-0 bottom-0" aria-hidden="true" />
    </section>
  );
}
