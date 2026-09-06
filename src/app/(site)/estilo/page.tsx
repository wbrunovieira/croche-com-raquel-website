import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { Simbolo } from "@/components/brand/simbolo";
import { PalavraCroche, PalavraRaquel } from "@/components/brand/assinatura";
import { Botao } from "@/components/ui/botao";
import { Chip } from "@/components/ui/chip";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Foto } from "@/components/ui/foto";
import { IconeZap } from "@/components/ui/icone-zap";
import { GradeDeProdutos } from "@/components/produto/card-de-produto";
import { buscarProdutoPorSlug, listarDestaques } from "@/lib/queries/produtos";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { DemoCadastroDeCor, DemoInterativa } from "./demo-interativa";

export const metadata: Metadata = {
  title: "Amostra da identidade",
  description:
    "Paleta, tipografia, formas e componentes base do sistema visual Estufa da Serra.",
  // Página de trabalho, para conferir o sistema visual. Não é conteúdo do
  // site: fica fora do sitemap e fora do buscador.
  robots: { index: false, follow: false },
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

export default async function EstiloPage() {
  const [produto, destaques, config] = await Promise.all([
    buscarProdutoPorSlug("bolsa-serra"),
    listarDestaques(4),
    buscarConfiguracoes(),
  ]);

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
        descricao="&ldquo;Raquel · novelo · Crochê&rdquo;, com a assinatura de lugar embaixo. As peças são todas dela; o que foi feito aqui é hierarquia e peso — o nome manda, o símbolo entra entre as palavras e é costurado a elas por um fio que sai do l, enrola no novelo e vira o C."
      >
        <div className="grid gap-x-grade-col gap-y-grade-linha lg:grid-cols-2">
          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Versão principal</Etiqueta>
            <div className="mt-6">
              <Logo className="h-20 text-primaria" />
            </div>
          </div>

          <div className="trama rounded-card bg-inv-fundo p-painel">
            <span className="font-texto text-etiqueta uppercase text-inv-suave">
              Versão invertida
            </span>
            <div className="mt-6 text-inv-conteudo">
              <Logo className="h-20" />
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Símbolo isolado · o novelo</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              Abaixo de 120px de largura o nome deixa de ser legível e fica só ele.
            </p>
            <div className="mt-6 flex items-end gap-8">
              <Simbolo className="h-20 w-auto text-primaria" />
              <Simbolo className="h-12 w-auto text-primaria" />
              <Simbolo className="h-8 w-auto text-primaria" />
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel">
            <Etiqueta>Teste do bordado · 1 cor a 2 cm</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              O teste decisivo não é a tela, é a etiqueta costurada na peça. Se o
              novelo fecha a 2 cm em uma cor, está aprovado.
            </p>
            <div className="mt-6 flex items-end gap-6">
              <div className="h-[3.23cm]">
                <Simbolo className="h-full w-auto text-tinta" />
              </div>
              <div className="h-[1.94cm]">
                <Simbolo className="h-full w-auto text-tinta" />
              </div>
              <div className="rounded-fio bg-tinta p-3">
                <Simbolo className="h-[2cm] w-auto text-cru" />
              </div>
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel lg:col-span-2">
            <Etiqueta>A letra da Raquel</Etiqueta>
            <p className="mt-2 max-w-texto text-apoio text-conteudo-suave">
              Não é fonte: é o desenho dela, vetorizado da arte das etiquetas de
              couro. Testei 38 scripts conhecidos antes e nenhum bate — o traço é
              de caneta de assinatura, provavelmente fonte comercial. Existem só
              estas duas palavras: a escrita é ligada, não dá para recortar letras
              e escrever outra coisa.
            </p>
            <p className="mt-3 max-w-texto text-apoio text-conteudo-suave">
              É por isso que a marca diz <strong>Raquel Crochê</strong> e não
              &ldquo;Crochê com Raquel&rdquo;. O logotipo dela veio antes do
              domínio; o nome do site segue no título, no texto e no que o leitor
              de tela anuncia.
            </p>
            <div className="mt-6 flex flex-wrap items-start gap-x-6 gap-y-4 text-primaria">
              <PalavraCroche className="h-16 w-auto" />
              <PalavraRaquel className="h-16 w-auto" />
              <PalavraCroche className="h-9 w-auto" />
              <PalavraRaquel className="h-9 w-auto" />
            </div>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel lg:col-span-2">
            <Etiqueta>Por que ele deixou de parecer amador</Etiqueta>
            <p className="mt-2 max-w-texto text-apoio text-conteudo-suave">
              A primeira montagem repetia a arte dela: símbolo empilhado sobre o
              nome, com 181% da altura da escrita. Uma ilustração cheia de detalhe
              nesse tamanho não convive com um script fino — ela vence, o nome
              vira legenda. Deitado, o símbolo deixa de competir e passa a costurar
              as duas palavras. De quebra o nome ficou maior: 54px de escrita no
              cabeçalho contra 36px do empilhado, e numa barra menor. Os vãos são
              diferentes dos dois lados — 26 à esquerda, 16 à direita — porque o
              <strong>C</strong> abre com uma barriga larga e vazia, e o mesmo vão
              dos dois lados fazia o buraco parecer maior à direita.
            </p>
            <p className="mt-3 max-w-texto text-apoio text-conteudo-suave">
              <strong>O símbolo tem dois pesos.</strong> Na arte, símbolo e escrita
              têm a mesma caneta de 5px — mas ela desenhou o símbolo com 259px de
              altura e o nome com 143px. Em escala de logotipo o traço dele caía
              para 49% do da escrita e os dois deixavam de conversar. Engrossar
              tudo por igual corrigiu isso e criou outro problema: o novelo virou
              mancha. Então o contorno é dilatado 2,2px e a trama interna só 0,8px
              — quem carrega a forma é o contorno, as voltas do fio são textura. A
              separação sai da geometria: preenchendo os buracos e medindo a
              distância até a borda, o contorno fica na beirada e as tramas no
              meio. Dá 59% de contorno para 41% de trama.
            </p>
            <p className="mt-3 max-w-texto text-apoio text-conteudo-suave">
              <strong>Os dois fios.</strong> O novelo dela já terminava numa ponta
              solta; ela agora vai até o <strong>C</strong> de Crochê, e um segundo
              fio sai do <strong>l</strong> de Raquel e entra no novelo. Lidos
              juntos são um fio só, que atravessa a marca inteira.
            </p>
          </div>

          <div className="rounded-card border border-borda bg-superficie p-painel lg:col-span-2">
            <Etiqueta>Favicon · pixel real</Etiqueta>
            <p className="mt-2 text-apoio text-conteudo-suave">
              Só o novelo, em Fio Cru sobre Verde Cristal — em 16px a letra viraria
              mancha. Traço de 3,5px no 32×32, acima do mínimo de 3px. Os PNGs
              saem de <code>src/app/icon.svg</code>, que é o favicon de verdade.
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
              <Foto imagem={null} arco />
            </div>
          </div>
          <div>
            <Etiqueta>card · demais categorias</Etiqueta>
            <div className="mt-3">
              <Foto imagem={null} />
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
          <Botao variante="primaria">
            <IconeZap className="size-5" />
            Pedir pelo WhatsApp
          </Botao>
          <Botao variante="secundaria">Ver todas as bolsas</Botao>
          <Botao variante="texto">Encomenda sob medida</Botao>
          <Chip>Sob encomenda</Chip>
          <Botao variante="zap" className="h-zap-flutua px-6">
            <IconeZap className="size-5" />
            Flutuante
          </Botao>
          <Botao variante="primaria" disabled>
            Desabilitado
          </Botao>
          <Botao variante="secundaria" tamanho="sm">
            Pequeno
          </Botao>
          <Botao variante="primaria" tamanho="lg">
            Grande
          </Botao>
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
        descricao="Vindo do banco. Bolsa recebe a máscara em arco; as outras categorias, card reto. Preço nulo aparece como “sob consulta” — nunca como R$ 0,00."
      >
        <GradeDeProdutos produtos={destaques} />
      </Secao>

      <Secao
        titulo="Controles do produto"
        descricao="Os seletores da página de produto, ligados a uma peça real do catálogo. A mensagem ao lado é montada de verdade pelo template do admin."
      >
        {produto ? (
          <DemoInterativa
            grupos={produto.grupos}
            nomeDoProduto={produto.nome}
            slugDoProduto={produto.slug}
            template={config.whatsappTemplate}
          />
        ) : (
          <p className="text-conteudo-suave">
            Produto de exemplo não encontrado. Rode <code>pnpm db:seed</code>.
          </p>
        )}
      </Secao>

      <Secao
        titulo="Cadastro de cor (admin)"
        descricao="Três informações com papéis diferentes: o hex desenha a bolinha no site; a linha e o código do fio são o que a Raquel usa para recomprar. Desabilitar tira a cor do ar sem apagá-la — apagar removeria a cor de todos os produtos que já a usavam."
      >
        <DemoCadastroDeCor />
      </Secao>

    </main>
  );
}
