"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";

export type ItemDeMenu = {
  rotulo: string;
  href: string;
  /** Só "Bolsas" tem filhos — é o carro-chefe e merece o desdobramento. */
  filhos?: { rotulo: string; href: string; total: number }[];
};

export function Navegacao({
  itens,
  whatsappNumero,
  instagramUrl,
  aviso,
}: {
  itens: ItemDeMenu[];
  whatsappNumero: string;
  instagramUrl: string | null;
  aviso: string | null;
}) {
  const caminho = usePathname();
  const semMovimento = useReducedMotion();
  const { scrollY } = useScroll();

  const [rolou, setRolou] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const [avisoVisivel, setAvisoVisivel] = useState(Boolean(aviso));

  useMotionValueEvent(scrollY, "change", (y) => setRolou(y > 24));

  // Trocar de página fecha a gaveta — senão ela fica aberta por cima da rota
  // nova. Ajustado durante a renderização, não por efeito: um efeito aqui
  // renderizaria a gaveta aberta na rota nova e só então a fecharia, que é o
  // render em cascata que o React pede para evitar.
  const [caminhoAnterior, setCaminhoAnterior] = useState(caminho);
  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho);
    setGaveta(false);
  }

  // Com a gaveta aberta, a página atrás não pode rolar.
  useEffect(() => {
    if (!gaveta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [gaveta]);

  useEffect(() => {
    if (!gaveta) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setGaveta(false);
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [gaveta]);

  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho.startsWith(href);

  return (
    <>
      <AnimatePresence initial={false}>
        {aviso && avisoVisivel ? (
          <motion.div
            key="aviso"
            initial={semMovimento ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={semMovimento ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={semMovimento ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-primaria text-sobre-primaria"
          >
            <div className="container-site flex items-center justify-between gap-4 py-2">
              <p className="text-apoio">{aviso}</p>
              <button
                type="button"
                onClick={() => setAvisoVisivel(false)}
                aria-label="Fechar aviso"
                className="-mr-2 rounded-fio p-2 transition-colors hover:bg-white/10"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.header
        // Antes de rolar o cabeçalho é alto e sem sombra, como parte da página.
        // Depois de 24px ele encolhe, ganha fundo com blur e uma borda de um
        // fio — o suficiente para se descolar do conteúdo sem virar caixa.
        animate={{
          height: rolou ? "var(--spacing-cabecalho)" : "var(--spacing-cabecalho-lg)",
          backgroundColor: rolou ? "rgba(251,247,239,0.88)" : "rgba(251,247,239,0)",
          borderBottomColor: rolou ? "var(--color-borda)" : "rgba(227,216,196,0)",
          boxShadow: rolou ? "var(--shadow-peca)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: semMovimento ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
      >
        <div className="container-site flex h-full items-center justify-between gap-8">
          <Link href="/" aria-label="Crochê com Raquel — início" className="shrink-0">
            <motion.span
              className="block text-primaria"
              animate={{ fontSize: rolou ? "1.25rem" : "1.5rem" }}
              transition={{ duration: semMovimento ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo />
            </motion.span>
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {itens.map((item) =>
                item.filhos?.length ? (
                  <ItemComFilhos key={item.href} item={item} ativo={ativo(item.href)} />
                ) : (
                  <li key={item.href}>
                    <LinkDeMenu href={item.href} ativo={ativo(item.href)}>
                      {item.rotulo}
                    </LinkDeMenu>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hidden rounded-fio p-2 text-conteudo-suave transition-colors hover:bg-superficie-baixa hover:text-conteudo sm:block"
              >
                <IconeInstagram className="size-5" />
              </a>
            ) : null}

            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-btn-icone rounded-fio bg-primaria px-btn-x py-btn-y text-apoio font-medium text-sobre-primaria transition-colors hover:bg-primaria-hover sm:inline-flex"
            >
              <IconeZap className="size-4" />
              Falar com a Raquel
            </a>

            <button
              type="button"
              onClick={() => setGaveta(true)}
              aria-label="Abrir menu"
              aria-expanded={gaveta}
              className="rounded-fio p-2 transition-colors hover:bg-superficie-baixa lg:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      <Gaveta
        aberta={gaveta}
        aoFechar={() => setGaveta(false)}
        itens={itens}
        ativo={ativo}
        whatsappNumero={whatsappNumero}
        instagramUrl={instagramUrl}
        semMovimento={Boolean(semMovimento)}
      />
    </>
  );
}

function LinkDeMenu({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative block rounded-fio px-3 py-2 text-apoio transition-colors ${
        ativo ? "text-conteudo" : "text-conteudo-suave hover:text-conteudo"
      }`}
    >
      {children}
      {ativo ? (
        // layoutId faz o traço deslizar de um item para o outro em vez de
        // piscar — é o detalhe que separa "tem indicador" de "parece feito".
        <motion.span
          layoutId="indicador-do-menu"
          className="absolute inset-x-3 -bottom-0.5 block h-px bg-destaque"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}
    </Link>
  );
}

function ItemComFilhos({ item, ativo }: { item: ItemDeMenu; ativo: boolean }) {
  const [aberto, setAberto] = useState(false);
  const fechar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idMenu = useId();
  const semMovimento = useReducedMotion();

  // Pequeno atraso ao sair: sem ele o menu fecha no meio do caminho entre o
  // rótulo e a lista, e a pessoa precisa acertar o mouse em linha reta.
  function agendarFechamento() {
    fechar.current = setTimeout(() => setAberto(false), 120);
  }
  function cancelarFechamento() {
    if (fechar.current) clearTimeout(fechar.current);
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        cancelarFechamento();
        setAberto(true);
      }}
      onMouseLeave={agendarFechamento}
      onFocus={() => setAberto(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setAberto(false);
      }}
    >
      <div className="flex items-center">
        <LinkDeMenu href={item.href} ativo={ativo}>
          {item.rotulo}
        </LinkDeMenu>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls={idMenu}
          aria-label={`${aberto ? "Fechar" : "Abrir"} tipos de ${item.rotulo.toLowerCase()}`}
          className="-ml-1 rounded-fio p-1 text-conteudo-suave transition-colors hover:text-conteudo"
        >
          <motion.span
            className="block"
            animate={{ rotate: aberto ? 180 : 0 }}
            transition={{ duration: semMovimento ? 0 : 0.2 }}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {aberto ? (
          <motion.div
            id={idMenu}
            initial={semMovimento ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={semMovimento ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={semMovimento ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-card border border-borda bg-superficie shadow-alta"
          >
            <ul className="p-2">
              {item.filhos?.map((filho, i) => (
                <motion.li
                  key={filho.href}
                  initial={semMovimento ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: semMovimento ? 0 : 0.02 * i, duration: 0.2 }}
                >
                  <Link
                    href={filho.href}
                    className="flex items-center justify-between gap-4 rounded-fio px-3 py-2 text-apoio transition-colors hover:bg-superficie-baixa"
                  >
                    <span>{filho.rotulo}</span>
                    <span className="tabular text-legenda text-conteudo-suave">
                      {filho.total}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link
              href={item.href}
              className="block border-t border-borda px-5 py-3 text-apoio text-destaque-texto transition-colors hover:bg-superficie-baixa"
            >
              Ver todas as bolsas →
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function Gaveta({
  aberta,
  aoFechar,
  itens,
  ativo,
  whatsappNumero,
  instagramUrl,
  semMovimento,
}: {
  aberta: boolean;
  aoFechar: () => void;
  itens: ItemDeMenu[];
  ativo: (href: string) => boolean;
  whatsappNumero: string;
  instagramUrl: string | null;
  semMovimento: boolean;
}) {
  return (
    <AnimatePresence>
      {aberta ? (
        <>
          <motion.div
            key="veu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={aoFechar}
            className="fixed inset-0 z-50 bg-verde-musgo/50 lg:hidden"
          />
          <motion.div
            key="gaveta"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={semMovimento ? { opacity: 0 } : { x: "100%" }}
            animate={semMovimento ? { opacity: 1 } : { x: 0 }}
            exit={semMovimento ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="trama fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-inv-fundo text-inv-conteudo lg:hidden"
          >
            <div className="flex items-center justify-between p-painel">
              <Logo className="text-t3" />
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar menu"
                className="rounded-fio p-2 transition-colors hover:bg-white/10"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Menu" className="flex-1 overflow-y-auto px-painel">
              <ul>
                {itens.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={semMovimento ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: semMovimento ? 0 : 0.06 + 0.04 * i, duration: 0.28 }}
                    className="border-b border-inv-borda"
                  >
                    <Link
                      href={item.href}
                      className={`block py-4 font-display text-t3 ${
                        ativo(item.href) ? "text-inv-destaque" : ""
                      }`}
                    >
                      {item.rotulo}
                    </Link>
                    {item.filhos?.length ? (
                      <ul className="pb-4 -mt-1">
                        {item.filhos.map((filho) => (
                          <li key={filho.href}>
                            <Link
                              href={filho.href}
                              className="block py-1.5 text-apoio text-inv-suave"
                            >
                              {filho.rotulo}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-4 p-painel">
              <a
                href={`https://wa.me/${whatsappNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-btn-icone rounded-fio bg-cru px-btn-x py-btn-y font-medium text-verde-cristal"
              >
                <IconeZap className="size-5" />
                Falar com a Raquel
              </a>
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-apoio text-inv-suave"
                >
                  <IconeInstagram className="size-4" />
                  @croche.comraquel
                </a>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
