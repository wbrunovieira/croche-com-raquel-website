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
import { ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import { DURACAO, transicao } from "@/lib/movimento";
import { Logo } from "@/components/brand/logo";
import { Simbolo } from "@/components/brand/simbolo";
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

  // Histerese: desce a 32, sobe a 8. Com um limiar único, o rubber-band do iOS
  // faz o valor oscilar em torno dele e o cabeçalho anima `height` — que é
  // layout — repetidamente, forçando reflow do documento a cada quadro.
  useMotionValueEvent(scrollY, "change", (y) =>
    setRolou((estava) => (estava ? y > 8 : y > 32))
  );

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

  /**
   * Qual seção da home está sendo lida.
   *
   * Existe porque o indicador do menu estava quebrado em silêncio desde que o
   * site virou página única: `ativo()` comparava `caminho.startsWith(href)`, e
   * os itens viraram âncoras — `"/"` nunca começa com `"/#catalogo"`. Resultado:
   * na home NENHUM item ficava ativo, e o `layoutId` logo abaixo, escrito para
   * fazer o traço deslizar de um item para o outro, nunca chegou a renderizar.
   *
   * A faixa de decisão é fina e fica no meio da tela (`-40%` em cima, `-55%`
   * embaixo): assim a seção ativa troca quando ela passa pelo centro do olhar,
   * e não quando encosta na borda — que faria o traço pular cedo demais.
   */
  const [secaoAtiva, setSecaoAtiva] = useState<string | null>(null);

  useEffect(() => {
    // Fora da home não há âncora para observar. Não é preciso limpar o estado:
    // `ativo()` só olha `secaoAtiva` quando `caminho === "/"`, então um valor
    // velho aqui não pinta nada — e zerar em efeito dispara render em cascata.
    if (caminho !== "/") return;

    // Só os itens de primeiro nível que apontam para uma seção. Os filhos de
    // "Bolsas" são filtros (`/?categoria=…#catalogo`): compartilham a âncora
    // `#catalogo` com o item "Catálogo" e acenderiam o traço junto com ele.
    const alvos = itens
      .filter((i) => !i.href.includes("?"))
      .map((i) => i.href.split("#")[1])
      .filter((id): id is string => Boolean(id))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (alvos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setSecaoAtiva(visivel.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    alvos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [caminho, itens]);

  const ativo = (href: string) => {
    // Link com `?` é filtro de catálogo, não seção — nunca acende pela rolagem.
    const ancora = href.includes("?") ? undefined : href.split("#")[1];
    if (ancora) return caminho === "/" && secaoAtiva === ancora;
    return href === "/" ? caminho === "/" : caminho.startsWith(href);
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {aviso && avisoVisivel ? (
          <motion.div
            key="aviso"
            initial={semMovimento ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={semMovimento ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={semMovimento ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={transicao(0.28, semMovimento)}
            /* `trama` e `luz-de-janela` são os mesmos motivos das seções verdes
               do site, e a `corrente` embaixo é a divisória da marca. A faixa
               era um retângulo chapado com um texto; usando o vocabulário que
               já existe, ela ganha profundidade sem inventar linguagem nova —
               e a primeira coisa que a pessoa vê passa a parecer parte do
               conjunto, não um aviso pregado por cima. */
            className="trama luz-de-janela relative overflow-hidden bg-primaria text-sobre-primaria"
          >
            {/* Respiro assimétrico de propósito. A `corrente` do rodapé tem 12px e
                mora absoluta DENTRO deste padding, então um `py-2.5` simétrico
                deixava 14px de ar em cima e 2px embaixo — o botão encostava nos
                festões. O que a pessoa enxerga como respiro é a distância até a
                decoração, não até a borda da faixa. */}
            <div className="container-site flex items-center gap-4 pt-2.5 pb-5">
              {/* A faixa INTEIRA é o link. O texto convidava — "é só contar o
                  que você tem em mente" — e não havia como contar: a pessoa
                  lia um convite e ficava sem porta. Agora ela leva para a
                  seção de encomenda sob medida. */}
              <Link
                href="/#encomendas"
                className="group flex min-w-0 flex-1 items-center gap-3 py-1"
              >
                <Simbolo className="hidden h-5 w-auto shrink-0 opacity-70 sm:block" />

                <p className="min-w-0 flex-1 truncate text-apoio sm:whitespace-normal">
                  {aviso}
                </p>

                {/* Isto precisa PARECER um controle, e não parecia: era texto
                    pelado com um sublinhado que só aparecia no hover — quem não
                    passa o mouse nunca descobre que ali havia uma porta. Ganhou
                    contorno, fundo e respiro, que é o que faz alguém reconhecer
                    um botão sem ter que testar.

                    E o ícone mudou de lado e de desenho. A seta ficava à
                    direita, encostada no ✕, e uma seta aponta: ela apontava
                    para o botão de fechar, de modo que "Me conte →" lia como se
                    o destino fosse sair da faixa. À esquerda, o ícone não aponta
                    para nada. O balão de fala também diz o que a seta não dizia
                    — a seta significa "vai para algum lugar", e o que se quer
                    prometer aqui é conversa: contar o que se tem em mente. */}
                <span className="hidden shrink-0 items-center gap-1.5 rounded-fio border border-cru/25 bg-white/10 px-3 py-1.5 text-apoio font-medium transition-colors duration-[180ms] ease-fio group-hover:border-cru/45 group-hover:bg-white/20 sm:inline-flex">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Me conte
                </span>
              </Link>

              {/* Um fio entre o botão e o ✕: agora que "Me conte" tem contorno,
                  os dois encostados leriam como um par de controles irmãos, e
                  fechar o aviso não é irmão de encomendar. */}
              <span
                aria-hidden="true"
                className="hidden h-5 w-px shrink-0 bg-cru/20 sm:block"
              />

              <button
                type="button"
                onClick={() => setAvisoVisivel(false)}
                aria-label="Fechar aviso"
                className="-mr-2 shrink-0 rounded-fio p-2 transition-colors duration-[180ms] ease-fio hover:bg-white/10 active:scale-90"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* A corrente costura a faixa ao cabeçalho. Fica por cima da borda,
                não empurra layout, e some junto quando a faixa fecha. */}
            <div
              className="corrente corrente--claro absolute inset-x-0 bottom-0"
              aria-hidden="true"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.header
        // Antes de rolar o cabeçalho é alto e sem sombra, como parte da página.
        // Depois de 24px ele encolhe, ganha fundo com blur e uma borda de um
        // fio — o suficiente para se descolar do conteúdo sem virar caixa.
        animate={{
          height: rolou ? "var(--spacing-cabecalho)" : "var(--spacing-cabecalho-lg)",
          boxShadow: rolou ? "var(--shadow-peca)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={transicao(DURACAO.media, semMovimento)}
        className="sticky top-0 z-50"
      >
        {/* A superfície é uma camada própria, com opacidade animada.
            Antes era `backgroundColor` no próprio `<header>`, o que obriga a
            cor a ser chapada — degradê não interpola como cor. Separando, o
            cabeçalho ganha o degradê, o fio de luz na aresta e a borda que
            esmaece nas pontas, e continua aparecendo com o mesmo tempo de
            antes.

            O blur mora aqui junto: assim ele entra e sai com a superfície, em
            vez de ficar ligado o tempo todo. Antes de rolar não há fundo, e
            `backdrop-filter` sem fundo é custo puro — é dos filtros mais caros
            no celular. */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: rolou ? 1 : 0 }}
          transition={transicao(DURACAO.media, semMovimento)}
          className={`superficie-cabecalho pointer-events-none absolute inset-0 ${
            rolou ? "backdrop-blur-sm" : ""
          }`}
        />

        <div className="container-site relative flex h-full items-center justify-between gap-8">
          <Link href="/" aria-label="Crochê com Raquel — início" className="shrink-0">
            {/* A assinatura de lugar sai aqui: no cabeçalho ela mediria 5px.
                O corpo animado vira a altura do logotipo (`h-[1em]`). */}
            <motion.span
              className="block text-primaria"
              animate={{
                fontSize: rolou ? "var(--corpo-logo-rolado)" : "var(--corpo-logo)",
              }}
              transition={transicao(DURACAO.media, semMovimento)}
            >
              <Logo variante="linha" batendo className="h-[1em]" />
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
                className="botao-de-icone hidden p-2 sm:block"
              >
                <IconeInstagram className="size-5" />
              </a>
            ) : null}

            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-btn-icone rounded-fio bg-primaria px-btn-x py-btn-y text-apoio font-medium text-sobre-primaria transition-[background-color,transform] duration-[180ms] ease-fio active:translate-y-px hover:bg-primaria-hover sm:inline-flex"
            >
              <IconeZap className="size-4" />
              Falar com a Raquel
            </a>

            <button
              type="button"
              onClick={() => setGaveta(true)}
              aria-label="Abrir menu"
              aria-expanded={gaveta}
              className="rounded-fio p-2 transition-colors duration-[180ms] ease-fio hover:bg-superficie-baixa lg:hidden"
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
  // O traço desliza entre os itens com `layoutId`; quem pediu menos movimento
  // precisa que ele apenas apareça no item certo.
  const semMovimento = useReducedMotion();

  return (
    <Link
      href={href}
      className={`group relative block rounded-fio px-3 py-2 text-apoio transition-colors duration-[180ms] ease-fio duration-[180ms] ease-fio ${
        ativo ? "text-conteudo" : "text-conteudo-suave hover:text-conteudo"
      }`}
    >
      {children}

      {/* O hover PREVÊ o traço que o item vai receber.
          Antes era só a cor escurecendo — o alvo respondia, mas não dizia o que
          ia acontecer. Agora um fio cresce do centro para fora, na mesma
          posição e espessura do indicador de ativo, só que apagado: o item
          mostra de antemão para onde o traço goiaba vai deslizar.

          Só nos itens inativos. No ativo o fio de verdade já está ali, e dois
          traços sobrepostos no mesmo lugar é sujeira, não reforço.

          `scaleX` e `opacity` apenas — nada que provoque layout. E como é
          resposta a um gesto, não conta como laço: a regra de um só ciclo
          periódico na tela continua valendo para a batida do logotipo. */}
      {!ativo ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-0.5 block h-px origin-center scale-x-0 bg-borda-forte opacity-0 transition-[transform,opacity] duration-200 ease-fio group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100"
        />
      ) : null}

      {ativo ? (
        // layoutId faz o traço deslizar de um item para o outro em vez de
        // piscar — é o detalhe que separa "tem indicador" de "parece feito".
        <motion.span
          layoutId="indicador-do-menu"
          className="absolute inset-x-3 -bottom-0.5 block h-px bg-destaque"
          transition={transicao(DURACAO.media, semMovimento)}
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
          className="-ml-1 rounded-fio p-1 text-conteudo-suave transition-colors duration-[180ms] ease-fio hover:text-conteudo"
        >
          <motion.span
            className="block"
            animate={{ rotate: aberto ? 180 : 0 }}
            transition={transicao(DURACAO.curta, semMovimento)}
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
            transition={transicao(DURACAO.curta, semMovimento)}
            className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-card border border-borda bg-superficie shadow-alta"
          >
            <ul className="p-2">
              {item.filhos?.map((filho, i) => (
                <motion.li
                  key={filho.href}
                  initial={semMovimento ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...transicao(DURACAO.curta, semMovimento), delay: semMovimento ? 0 : 0.02 * i }}
                >
                  <Link
                    href={filho.href}
                    className="flex items-center justify-between gap-4 rounded-fio px-3 py-2 text-apoio transition-colors duration-[180ms] ease-fio hover:bg-superficie-baixa"
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
              className="block border-t border-borda px-5 py-3 text-apoio text-destaque-texto transition-colors duration-[180ms] ease-fio hover:bg-superficie-baixa"
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
            transition={transicao(DURACAO.curta, semMovimento)}
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
            transition={transicao(0.32, semMovimento)}
            className="trama fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-inv-fundo text-inv-conteudo lg:hidden"
          >
            <div className="flex items-center justify-between p-painel">
              <Logo className="h-14" />
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar menu"
                className="rounded-fio p-2 transition-colors duration-[180ms] ease-fio hover:bg-white/10"
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
                    transition={{ ...transicao(0.28, semMovimento), delay: semMovimento ? 0 : 0.06 + 0.04 * i }}
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
                className="flex w-full items-center justify-center gap-btn-icone rounded-fio bg-cru px-btn-x py-btn-y font-medium transition-transform duration-[180ms] ease-fio active:translate-y-px text-verde-cristal"
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
