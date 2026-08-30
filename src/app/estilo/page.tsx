import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { Laco } from "@/components/brand/laco";

export const metadata: Metadata = {
  title: "Amostra da identidade",
  description:
    "Paleta, tipografia, formas e componentes base do sistema visual Estufa da Serra.",
};

type Swatch = {
  nome: string;
  hex: string;
  classe: string;
  papel: string;
  escuro?: boolean;
};

const grupos: { titulo: string; cores: Swatch[] }[] = [
  {
    titulo: "Base clara",
    cores: [
      { nome: "Fio Cru", hex: "#F4EEE2", classe: "bg-cru", papel: "Fundo da página" },
      { nome: "Papel", hex: "#FBF7EF", classe: "bg-papel", papel: "Card, modal, header" },
      { nome: "Cru Fundo", hex: "#EDE4D3", classe: "bg-cru-fundo", papel: "Faixa alternada, input" },
      { nome: "Tinta", hex: "#241D16", classe: "bg-tinta", papel: "Texto principal", escuro: true },
      { nome: "Tinta Suave", hex: "#6A5C4C", classe: "bg-tinta-suave", papel: "Texto secundário", escuro: true },
    ],
  },
  {
    titulo: "Verde — a primária",
    cores: [
      { nome: "Verde Cristal", hex: "#10402C", classe: "bg-verde-cristal", papel: "Botão, link, logo", escuro: true },
      { nome: "Verde Musgo", hex: "#0A2E1F", classe: "bg-verde-musgo", papel: "Hover, rodapé", escuro: true },
      { nome: "Verde Fundo", hex: "#0C3323", classe: "bg-verde-fundo", papel: "Seção invertida", escuro: true },
      { nome: "Névoa", hex: "#C7D4C4", classe: "bg-nevoa", papel: "Texto suave sobre verde" },
    ],
  },
  {
    titulo: "Goiaba — o acento",
    cores: [
      { nome: "Goiaba", hex: "#C4425C", classe: "bg-goiaba", papel: "Preenchimento de destaque", escuro: true },
      { nome: "Goiaba Tinta", hex: "#A8324A", classe: "bg-goiaba-tinta", papel: "Destaque como texto", escuro: true },
      { nome: "Goiaba Clara", hex: "#F3D9DD", classe: "bg-goiaba-clara", papel: "Fundo de chip" },
      { nome: "Rosa Fio", hex: "#E8A0AE", classe: "bg-rosa-fio", papel: "Destaque sobre verde" },
    ],
  },
  {
    titulo: "Linha e WhatsApp",
    cores: [
      { nome: "Linha", hex: "#E3D8C4", classe: "bg-linha", papel: "Divisória, borda de card" },
      { nome: "Linha Forte", hex: "#8F7F62", classe: "bg-linha-forte", papel: "Borda de campo", escuro: true },
      { nome: "Zap", hex: "#1E7B4F", classe: "bg-zap", papel: "Botão flutuante", escuro: true },
      { nome: "Zap Escuro", hex: "#1A6B45", classe: "bg-zap-escuro", papel: "Hover do flutuante", escuro: true },
    ],
  },
];

const contrastes = [
  { par: "Tinta sobre Fio Cru", ratio: "14,40", nivel: "AAA" },
  { par: "Tinta Suave sobre Fio Cru", ratio: "5,60", nivel: "AA" },
  { par: "Verde Cristal sobre Fio Cru", ratio: "10,14", nivel: "AAA" },
  { par: "Goiaba Tinta sobre Fio Cru", ratio: "5,64", nivel: "AA" },
  { par: "Branco sobre Verde Cristal", ratio: "11,72", nivel: "AAA" },
  { par: "Fio Cru sobre Verde Cristal", ratio: "10,14", nivel: "AAA" },
  { par: "Névoa sobre Verde Fundo", ratio: "7,61", nivel: "AAA" },
  { par: "Branco sobre Zap", ratio: "5,25", nivel: "AA" },
];

const escala = [
  { classe: "text-display", nome: "display", tam: "4,25rem", uso: "Hero da home", display: true },
  { classe: "text-t1", nome: "t1", tam: "3rem", uso: "Título de página", display: true },
  { classe: "text-t2", nome: "t2", tam: "2,25rem", uso: "Título de seção", display: true },
  { classe: "text-t3", nome: "t3", tam: "1,75rem", uso: "Nome do produto", display: true },
  { classe: "text-lead", nome: "lead", tam: "1,375rem", uso: "Subtítulo, chamada" },
  { classe: "text-leitura", nome: "leitura", tam: "1,125rem", uso: "Texto longo (Sobre, FAQ)" },
  { classe: "text-base", nome: "base", tam: "1rem", uso: "Corpo padrão" },
  { classe: "text-apoio", nome: "apoio", tam: "0,875rem", uso: "Descrição de campo" },
  { classe: "text-legenda", nome: "legenda", tam: "0,75rem", uso: "Legenda de foto, meta" },
];

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="secao border-t border-borda">
      <h2 className="font-display text-t2">{titulo}</h2>
      {descricao ? (
        <p className="mt-3 max-w-texto text-conteudo-suave">{descricao}</p>
      ) : null}
      <div className="mt-bloco">{children}</div>
    </section>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-texto text-etiqueta uppercase text-conteudo-suave">
      {children}
    </span>
  );
}

/* Placeholder de foto: o acervo real da Raquel entra na etapa 13. */
function Foto({
  arco = false,
  dentroDeCard = false,
}: {
  arco?: boolean;
  dentroDeCard?: boolean;
}) {
  // Raio interno = raio externo − padding. Dentro do card (raio 6, padding 12)
  // isso dá 0 e a foto fica reta. O arco é a exceção e continua.
  const forma = arco ? "arco" : dentroDeCard ? "rounded-none" : "rounded-card";
  return (
    <div
      className={`aspect-peca w-full bg-verde-fundo trama grid place-items-center ${forma}`}
    >
      <span className="text-inv-suave text-legenda uppercase tracking-[0.12em]">
        foto {arco ? "de bolsa" : "do produto"}
      </span>
    </div>
  );
}

function IconeZap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.25.69-1.44 1.32-1.99 1.37-.53.05-1.02.24-3.44-.72-2.89-1.14-4.73-4.1-4.87-4.29-.14-.19-1.16-1.55-1.16-2.96 0-1.4.74-2.09 1-2.38.26-.29.57-.36.76-.36l.55.01c.17.01.41-.07.64.49.25.6.84 2.07.91 2.22.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.03 1.12.99 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.19.73-.85.92-1.15.19-.29.39-.24.65-.14.26.1 1.66.78 1.94.92.29.14.48.22.55.34.07.12.07.7-.18 1.39Z" />
    </svg>
  );
}

export default function EstiloPage() {
  return (
    <main className="container-site pb-secao">
      <header className="pt-pagina-topo">
        <Etiqueta>Identidade visual · Crochê com Raquel</Etiqueta>
        <h1 className="mt-2 font-display text-t1">Estufa da Serra</h1>
        <p className="mt-4 max-w-texto text-lead text-conteudo-suave">
          Papel cru com blocos profundos de verde garrafa e um rosa-goiaba saturado
          como acento. O verde vem do Palácio de Cristal; o cru, do fio de algodão.
        </p>
        <div className="corrente mt-bloco" aria-hidden="true" />
      </header>

      <Secao
        titulo="Logotipo"
        descricao="Assinatura em duas linhas alinhada à esquerda, com o laço como símbolo isolado. O contraste de escala e de eixo — serifa grande orgânica sobre grotesca pequena espaçada — já dá a hierarquia, sem ornamento e sem moldura."
      >
        <div className="grid gap-x-grade-col gap-y-grade-linha lg:grid-cols-2">
          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Versão principal</Etiqueta>
            <div className="mt-6">
              <Logo className="text-t1 text-primaria" />
            </div>
          </div>

          <div className="trama rounded-card bg-inv-fundo p-painel">
            <span className="font-texto text-etiqueta uppercase text-inv-suave">
              Versão invertida
            </span>
            <div className="mt-6 text-inv-conteudo">
              <Logo className="text-t1" />
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Símbolo isolado · o laço</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              Abaixo de 120px de largura, a assinatura completa sai e fica só ele.
            </p>
            <div className="mt-6 flex items-end gap-8">
              <Laco className="size-20 text-primaria" />
              <Laco className="size-12 text-primaria" />
              <Laco className="size-8 text-primaria" />
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Teste do bordado · 1 cor a 2 cm</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              O teste decisivo não é a tela, é a etiqueta costurada na peça. Se o laço
              fecha a 2 cm em uma cor, está aprovado.
            </p>
            <div className="mt-6 flex items-end gap-6">
              <div className="w-[2cm]">
                <Laco className="w-full text-tinta" />
              </div>
              <div className="w-[1.2cm]">
                <Laco className="w-full text-tinta" />
              </div>
              <div className="rounded-fio bg-tinta p-3">
                <Laco className="w-[2cm] text-cru" />
              </div>
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel lg:col-span-2">
            <Etiqueta>Favicon · pixel real</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              Só o laço, em Fio Cru sobre Verde Cristal — em 16px a letra viraria
              mancha. Traço de 3,5px no 32×32, acima do mínimo de 3px.
            </p>
            <div className="mt-6 flex items-end gap-8">
              <div className="text-center">
                <Image src="/marca/favicon-32.png" alt="Favicon 32 pixels" width={32} height={32} />
                <span className="mt-2 block text-legenda text-conteudo-suave">32px</span>
              </div>
              <div className="text-center">
                <Image src="/marca/favicon-16.png" alt="Favicon 16 pixels" width={16} height={16} />
                <span className="mt-2 block text-legenda text-conteudo-suave">16px</span>
              </div>
              <div className="text-center">
                <Image
                  src="/marca/favicon-32.png"
                  alt="Favicon 32 pixels ampliado"
                  width={128}
                  height={128}
                  className="[image-rendering:pixelated]"
                  unoptimized
                />
                <span className="mt-2 block text-legenda text-conteudo-suave">
                  32px ampliado 4×
                </span>
              </div>
            </div>
          </div>
        </div>
      </Secao>

      <Secao
        titulo="Paleta"
        descricao="Use sempre os papéis semânticos (fundo, superfície, primária, destaque) na UI. Os nomes de marca existem para definir os papéis, não para serem chamados direto."
      >
        <div className="space-y-10">
          {grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <Etiqueta>{grupo.titulo}</Etiqueta>
              <ul className="mt-3 grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                {grupo.cores.map((c) => (
                  <li
                    key={c.hex}
                    className="overflow-hidden rounded-card border border-borda bg-superficie"
                  >
                    <div
                      className={`${c.classe} grid h-24 place-items-center ${
                        c.escuro ? "text-white/70" : "text-tinta/50"
                      }`}
                    >
                      <span className="text-legenda tabular">{c.hex}</span>
                    </div>
                    <div className="p-3">
                      <p className="font-texto text-base font-medium">{c.nome}</p>
                      <p className="mt-1 text-legenda text-conteudo-suave">{c.papel}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Secao>

      <Secao
        titulo="Contraste"
        descricao="Ratios calculados pela fórmula de luminância da WCAG 2.1. Goiaba #C4425C reprova como texto (4,25) — por isso existe Goiaba Tinta."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-md text-left">
            <thead>
              <tr className="border-b border-borda">
                <th className="py-3 pr-6 text-etiqueta uppercase text-conteudo-suave font-medium">Par</th>
                <th className="py-3 pr-6 text-etiqueta uppercase text-conteudo-suave font-medium">Ratio</th>
                <th className="py-3 text-etiqueta uppercase text-conteudo-suave font-medium">Nível</th>
              </tr>
            </thead>
            <tbody>
              {contrastes.map((c) => (
                <tr key={c.par} className="border-b border-borda/60">
                  <td className="py-3 pr-6 text-apoio">{c.par}</td>
                  <td className="py-3 pr-6 text-apoio tabular">{c.ratio}:1</td>
                  <td className="py-3">
                    <span className="rounded-fio bg-goiaba-clara px-chip-x py-1 text-etiqueta uppercase">
                      {c.nivel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao
        titulo="Tipografia"
        descricao="Fraunces no display, com os eixos SOFT 60 e WONK 1 ligados — são eles que amolecem e desalinham a letra, e é isso que faz a tipografia parecer feita à mão. Karla no texto."
      >
        <ul className="space-y-6">
          {escala.map((e) => (
            <li key={e.nome} className="border-b border-borda/60 pb-6">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <Etiqueta>{e.nome}</Etiqueta>
                <span className="text-legenda text-conteudo-suave tabular">{e.tam}</span>
                <span className="text-legenda text-conteudo-suave">· {e.uso}</span>
              </div>
              <p
                className={`mt-2 ${e.classe} ${
                  e.display ? "font-display" : "font-texto"
                }`}
              >
                Bolsa transversal de fio de malha
              </p>
            </li>
          ))}
          <li>
            <Etiqueta>etiqueta · 0,6875rem · eyebrow, meta</Etiqueta>
            <p className="mt-2 text-etiqueta uppercase">Sob encomenda · Petrópolis, RJ</p>
          </li>
        </ul>
      </Secao>

      <Secao
        titulo="Formas e sombras"
        descricao="Raios quase retos: o crochê já é a curva da página. A sombra é quente (marrom, nunca cinza) e usada com parcimônia."
      >
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {[
            { r: "rounded-fio", n: "fio · 2px", u: "Botão, badge, input" },
            { r: "rounded-card", n: "card · 6px", u: "Card, foto, painel" },
            { r: "rounded-pilula", n: "pilula · 999px", u: "Só o botão flutuante" },
          ].map((f) => (
            <div key={f.n}>
              <div className={`${f.r} h-20 border border-borda-forte bg-superficie`} />
              <p className="mt-2 font-texto text-base font-medium">{f.n}</p>
              <p className="mt-1 text-legenda text-conteudo-suave">{f.u}</p>
            </div>
          ))}
          {[
            { s: "shadow-peca", n: "peça", u: "Card em repouso" },
            { s: "shadow-alta", n: "alta", u: "Card em hover, modal" },
            { s: "shadow-zap", n: "zap", u: "Botão flutuante" },
          ].map((f) => (
            <div key={f.n}>
              <div className={`${f.s} rounded-card h-20 bg-superficie`} />
              <p className="mt-2 font-texto text-base font-medium">{f.n}</p>
              <p className="mt-1 text-legenda text-conteudo-suave">{f.u}</p>
            </div>
          ))}
        </div>
      </Secao>

      <Secao
        titulo="Assinaturas da marca"
        descricao="Três elementos que só existem aqui. O arco é exclusivo de bolsas — a forma codifica o carro-chefe em vez de decorar."
      >
        <div className="grid gap-x-grade-col gap-y-grade-linha sm:grid-cols-3">
          <div>
            <Etiqueta>arco · só bolsas</Etiqueta>
            <div className="mt-3">
              <Foto arco />
            </div>
          </div>
          <div>
            <Etiqueta>card · demais categorias</Etiqueta>
            <div className="mt-3">
              <Foto />
            </div>
          </div>
          <div>
            <Etiqueta>ponto corrente · divisória</Etiqueta>
            <div className="mt-3 space-y-6 rounded-card border border-borda bg-superficie p-painel">
              <div className="corrente" aria-hidden="true" />
              <p className="text-apoio text-conteudo-suave">
                Feito em CSS puro com gradiente radial — sem imagem, sem requisição.
              </p>
              <div className="corrente" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Secao>

      <Secao
        titulo="Botões"
        descricao="O CTA principal é o verde da marca com o glifo do WhatsApp; o ícone comunica o canal. O verde-médio Zap fica reservado ao flutuante do mobile, único lugar do site com esse tom."
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <button className="rounded-fio bg-primaria px-btn-x py-btn-y text-sobre-primaria transition-colors hover:bg-primaria-hover inline-flex items-center gap-btn-icone">
            <IconeZap className="size-5" />
            Pedir pelo WhatsApp
          </button>
          <button className="rounded-fio border border-borda-forte px-btn-x py-btn-y transition-colors hover:bg-superficie-baixa">
            Ver todas as bolsas
          </button>
          <button className="py-2 -my-2 text-destaque-texto underline underline-offset-4">
            Encomenda sob medida
          </button>
          <span className="rounded-fio bg-goiaba-clara px-chip-x py-chip-y text-etiqueta uppercase">
            Sob encomenda
          </span>
          <button className="inline-flex h-zap-flutua items-center gap-btn-icone rounded-pilula bg-zap px-6 text-white shadow-zap transition-colors hover:bg-zap-escuro">
            <IconeZap className="size-5" />
            Flutuante
          </button>
        </div>
      </Secao>

      <Secao
        titulo="Seção invertida"
        descricao="Metade do site é verde escuro — é o que faz a bolsa saltar. Sobre o verde, o texto suave vira Névoa e o destaque vira Rosa Fio, porque o goiaba perde contraste aqui."
      >
        <div className="trama rounded-card bg-inv-fundo px-painel py-secao-densa text-inv-conteudo">
          <span className="font-texto text-etiqueta uppercase text-inv-suave">
            Carro-chefe
          </span>
          <h3 className="mt-2 max-w-texto font-display text-t2">
            Bolsas que você carrega por anos
          </h3>
          <p className="mt-3 max-w-texto text-leitura text-inv-suave">
            Cada peça é feita à mão sob encomenda, na cor e no tamanho que você
            escolher. Fio de malha de algodão, alça reforçada e acabamento que
            aguenta o dia a dia.
          </p>
          <p className="mt-4 text-apoio text-inv-destaque">
            Pronta em 7 a 10 dias · Envio para todo o Brasil
          </p>
          <div className="corrente corrente--claro mt-bloco" aria-hidden="true" />
          <button className="mt-bloco inline-flex items-center gap-btn-icone rounded-fio bg-cru px-btn-x py-btn-y text-verde-cristal transition-colors hover:bg-papel">
            <IconeZap className="size-5" />
            Pedir pelo WhatsApp
          </button>
        </div>
      </Secao>

      <Secao
        titulo="Card de produto"
        descricao="Preço é opcional: quando a peça não tem valor fechado, o card mostra “sob consulta” no lugar."
      >
        <ul className="grade-catalogo">
          {[
            { nome: "Bolsa Serra", cat: "Transversal", preco: "R$ 320", bolsa: true },
            { nome: "Bolsa Cristal", cat: "Tote", preco: null, bolsa: true },
            { nome: "Jogo Americano Trançado", cat: "Mesa posta", preco: "R$ 45", bolsa: false },
            { nome: "Manta Petrópolis", cat: "Casa & decoração", preco: null, bolsa: false },
          ].map((p) => (
            <li
              key={p.nome}
              className="group rounded-card border border-borda bg-superficie p-card"
            >
              <Foto arco={p.bolsa} dentroDeCard />
              <p className="mt-3 text-etiqueta uppercase text-conteudo-suave">{p.cat}</p>
              <h3 className="mt-1 font-display text-lead leading-tight">{p.nome}</h3>
              <p className="mt-1 text-apoio">
                {p.preco ? (
                  <span className="tabular">{p.preco}</span>
                ) : (
                  <span className="text-conteudo-suave">Sob consulta</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Secao>
    </main>
  );
}
