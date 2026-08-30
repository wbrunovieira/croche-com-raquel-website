# Sistema de espaçamento e hierarquia — Crochê com Raquel

Documento normativo da Etapa 2. Complementa `identidade-visual.md`, que continua sendo a
fonte da verdade de **cor, tipografia, forma, sombra e fotografia**. Este aqui define a
única coisa que faltava: **quanto espaço, onde, e por quê** — e a tabela de hierarquia que
liga tamanho + peso + família + cor + espaço.

Nada aqui altera uma cor ou uma família tipográfica. Tudo aqui é distância.

Última atualização: 2026-08-30

---

## 0. O diagnóstico, em uma frase

O cliente disse "falta padrões de espaços, hierarquia". Ele está descrevendo dois sintomas
de uma causa só: **a escala de espaçamento do Tailwind v4 é infinita.**

`--spacing: 0.25rem` faz `p-N` funcionar para **qualquer** `N` — `p-7`, `p-13`, `p-14`,
`p-2.5`, `p-0.5`. Não existe atrito nenhum entre "quero mais ar aqui" e escrever `mt-3`. O
resultado está em `src/app/estilo/page.tsx`: `mt-1`, `mt-2`, `mt-2`, `mt-3`, `mt-4`,
`mt-6`, `mt-8`, `py-2`, `py-2.5`, `py-3`, `py-12`, `py-14`, `pb-5`, `p-3`, `p-5`, `p-8`,
`gap-2`, `gap-4`, `gap-6`, `gap-8`, `space-y-6`, `space-y-10` — **21 valores distintos em
uma página só**, nenhum deles errado isoladamente, todos juntos sem ritmo.

E a hierarquia sofre a mesma coisa: `text-t3` aparece como nome de produto no card
(linha 449) enquanto a identidade 7.1 manda `text-lead`; `text-t1` aparece dentro de um
`<h3>` (linha 416); `font-display text-base` aparece três vezes (linhas 254, 336, 347)
violando a regra 3.4 "Fraunces nunca abaixo de 1.375rem". Sem um documento que diga
**"nível N4 é isto, tem este tamanho e este espaço"**, cada componente reinventa.

A correção não é "usar espaçamento consistente". É: (a) uma escala fechada, (b) uma regra
de escolha entre degraus vizinhos, (c) uma proporção fixa de hierarquia, (d) tokens
nomeados para o que é estrutural, (e) uma lista de proibições verificável em CI.

---

## 1. A unidade base e a escala

### 1.1 A unidade: 4px

**Unidade base = 4px (`0.25rem`). Grade de trabalho = 8px.**

Por que 4 e não 8:

1. **A escala tipográfica já definida não fecha em 8.** `text-etiqueta` é 11px,
   `text-legenda` é 12px, `text-apoio` é 14px. Uma linha de etiqueta com `line-height: 1`
   mede 11px. Numa grade rígida de 8px, alinhar uma etiqueta de 11px a um título de 36px
   exige valores fracionários o tempo todo — e valor fracionário é a porta de entrada da
   deriva.
2. **O card de produto é apertado por natureza.** Etiqueta → nome → medidas são três linhas
   que precisam ler como **um** bloco. O único degrau que faz isso é 4px. Em grade de 8, o
   menor espaço disponível seria 8px, e a etiqueta descolaria do nome.
3. **A identidade já fixou dois valores que não são múltiplos de 8**: o botão de WhatsApp
   é `padding 14px 28px` (7.3) e o gap do glifo é `10px`. 14, 28 e 10 são todos múltiplos
   de 2 e nenhum é múltiplo de 8. Com base 4 + tokens nomeados eu preservo esses valores
   exatamente como estão, sem renegociar a identidade.
4. **Base 4 não significa usar todos os múltiplos de 4.** A escala abaixo é **fechada em 15
   degraus**. Acima de 24px ela pula de 8 em 8 e depois de 16 em 16. Na prática, o site
   inteiro roda em grade de 8 — a base 4 existe só para o degrau de contato e para a
   correção óptica.

Existe um degrau de exceção, `0.5` = **2px**, autorizado **só para correção óptica**
(alinhar um glifo com a linha de base, compensar o overshoot de uma borda de 1px). Nunca
como espaço entre dois conteúdos.

### 1.2 A escada de quatro patamares

Antes da tabela de degraus, a regra que resolve o problema real. **Você nunca escolhe um
valor. Você escolhe um patamar, e só depois o degrau dentro dele.**

| Patamar | Faixa | O que ele diz ao olho | Degraus |
|---|---|---|---|
| **Contato** | 2–8px | "estas duas linhas são a mesma coisa" | `0.5` `1` `2` |
| **Agrupamento** | 12–24px | "estes elementos são um componente" | `3` `4` `5` `6` |
| **Bloco** | 32–48px | "acabou um assunto, começou outro" | `8` `10` `12` |
| **Respiro** | 64–128px | "acabou uma seção" | `16` `20` `24` `32` |

O teste: leia em voz alta os dois elementos que você vai separar. Se eles formam **uma
frase** ("Transversal / Bolsa Serra"), é Contato. Se formam **um objeto** (foto + nome +
medida), é Agrupamento. Se são **dois objetos** (o título e a grade de cards), é Bloco. Se
são **dois assuntos** (a grade de cards e o depoimento), é Respiro.

Quem erra o patamar produz uma tela confusa. Quem erra o degrau dentro do patamar produz
uma tela levemente irregular. Errar o patamar é o erro caro.

### 1.3 A escala completa

Nome curto = o número do utilitário Tailwind (`p-4` = degrau 4). Nomes inventados para
espaçamento genérico foram **rejeitados de propósito**: `p-espaco-medio` não é mais legível
que `p-4`, e cria duas linguagens para a mesma coisa. Os nomes ficam reservados para o que
é **estrutural** (§8).

| Degrau | rem | px | Patamar | Quando usar **este** e não o vizinho |
|---|---|---|---|---|
| `0` | 0 | 0 | — | Reset. Primeiro filho de um container com padding **sempre** tem margem 0. |
| `0.5` | 0.125 | 2 | óptico | **Só correção óptica.** Alinhar glifo, compensar borda de 1px. Nunca entre conteúdos. |
| `1` | 0.25 | 4 | Contato | Duas linhas que são **a mesma informação**: etiqueta→nome de produto, nome→preço, número→unidade. Se você consegue ler as duas como uma frase, é 4. Subir para 8 aqui separa o que deveria estar colado. |
| `2` | 0.5 | 8 | Contato | Um elemento **rotula** o outro e o rótulo não sobrevive sozinho: eyebrow→título, `<label>`→campo, imagem→legenda, campo→mensagem de erro. Se o segundo elemento faz sentido isolado, suba para 12. |
| `3` | 0.75 | 12 | Agrupamento | O **menor degrau que separa de verdade**. Eyebrow→objeto (foto, amostra, painel), padding do card de produto, célula de tabela, gap entre chips, gap-y de fila de botões. |
| `4` | 1 | 16 | Agrupamento | **O default dentro de um componente.** Gap entre botões numa fila, entre parágrafos de `text-base`, `h3`→corpo, gap-x da grade no mobile. Em dúvida dentro de um componente: 16. |
| `5` | 1.25 | 20 | Agrupamento | **Uso restrito a dois casos:** espaço entre campos de formulário no mobile, e piso do `--spacing-painel` no mobile. É o degrau que mais convida à deriva — se você está escrevendo `p-5` fora desses dois casos, quer `4` ou `6`. |
| `6` | 1.5 | 24 | Agrupamento | Agrupamento largo: entre parágrafos de `text-leitura` (a entrelinha é 1.7, 16px cola), gap-x da grade no desktop, título do hero→corrente, entre campos no desktop, `space-y` de lista de amostras. |
| `8` | 2 | 32 | Bloco | **O degrau do "acabou um assunto".** Título→conteúdo do bloco, `h3` acima, padding de painel no desktop, entre sub-blocos da mesma seção. Se 32 faz dois blocos parecerem um, suba para 40. |
| `10` | 2.5 | 40 | Bloco | Gap-y da grade de cards no desktop, entre grupos de uma seção longa (os quatro grupos de cor da paleta). Use quando os blocos têm **texto embaixo** e 32 encosta o texto de um na foto do seguinte. |
| `12` | 3 | 48 | Bloco | Acima de um `h2` que **não** é o primeiro filho. Entre duas colunas grandes da página de produto (galeria ↔ ficha). Antes de uma divisória `corrente`. |
| `16` | 4 | 64 | Respiro | Acima de um `h1` que não é o primeiro filho. Piso do padding de seção. Altura do cabeçalho no mobile e da barra sticky do WhatsApp. |
| `20` | 5 | 80 | Respiro | Padding de seção no desktop médio. Altura do cabeçalho no desktop. Fim do conteúdo→rodapé. |
| `24` | 6 | 96 | Respiro | Teto do `--spacing-secao`. **Só via token**, nunca escrito à mão. |
| `32` | 8 | 128 | Respiro | Teto do `--spacing-secao-ampla` (hero, faixa verde de fechamento). **Só via token.** |

**Degraus proibidos**: `7` `9` `11` `13` `14` `15` `17` `18` `19` `21` `22` `23` `25` `26`
`28` `30` `36` `40` `44` `48` `52` `56` `60` `64` `72` `80` `96`, e qualquer fracionário
que não seja `0.5`. Ver §7 e §8.3 para como isso é verificado.

---

## 2. Ritmo vertical

### 2.1 A regra do 2:1

**O espaço acima de um título é o dobro do espaço abaixo dele.**

Esta é a espinha do documento inteiro. Um título pertence ao que vem **depois** dele. Se o
espaço acima e abaixo forem iguais, o olho não sabe a qual bloco ele pertence e a página
lê como uma lista de coisas soltas — que é exatamente o que acontece hoje em
`estilo/page.tsx`, onde o `<h2>` tem `py-14` acima (via padding da seção) e `mt-2` (8px)
abaixo em um caso e `mt-8` (32px) em outro.

A proporção se aplica em três lugares:

| Fronteira | Proporção | Exemplo concreto |
|---|---|---|
| Título ↔ seu conteúdo | **2:1** | `h2`: 48px acima, 24px abaixo (deck) / 32px abaixo (conteúdo direto) |
| Componente ↔ interior do componente | **≥ 3:1** | grade de cards: 40px de row-gap, 12px entre etiqueta e foto dentro do card |
| Seção ↔ bloco dentro da seção | **≥ 2:1** | `py-secao` 96px, `space-y` interno 40px |

Quando a proporção cai abaixo de 1,5:1, o agrupamento se desfaz. Quando passa de 4:1, o
bloco começa a parecer órfão da página. **A faixa saudável é 2:1 a 3:1.**

### 2.2 Espaço acima e abaixo por nível de título

**Regra de não-duplicação — leia antes da tabela.** O "espaço acima" só se aplica quando o
título **não é o primeiro filho** do seu container. Quando é o primeiro filho, o padding do
container (`py-secao`, `p-painel`) já fez o trabalho e a margem é **0**. Somar padding de
container com margem do primeiro filho é o bug de espaçamento nº 1 e a razão de metade das
telas ficarem com uma seção mais alta que as outras sem ninguém saber por quê.

| Nível | Tamanho | Acima (não-primeiro) | Abaixo → deck/subtítulo | Abaixo → conteúdo direto | Razão |
|---|---|---|---|---|---|
| `display` (hero) | clamp 40–68 | — (padding do hero) | 24 (`mt-6`) → corrente | 24 (`mt-6`) | — |
| `t1` | clamp 34–48 | **64** (`mt-16`) | **16** (`mt-4`) | **32** (`mt-bloco`) | 2:1 |
| `t2` | clamp 28–36 | **48** (`mt-12`) | **12** (`mt-3`) | **32** (`mt-bloco`) | 1,5:1 |
| `t3` | clamp 24–28 | **32** (`mt-8`) | **8** (`mt-2`) | **16** (`mt-4`) | 2:1 |
| `lead` (nome de produto) | clamp 20–22 | **4** (`mt-1`, após etiqueta) | — | **4** (`mt-1`) | contato |
| `etiqueta` (eyebrow) | 11 | herda o do bloco | **8** (`mt-2`) → título | **12** (`mt-3`) → objeto | — |

Depois do deck, o conteúdo entra com **32px** (`mt-bloco`). Sequência canônica de um bloco
de abertura de seção:

```
[ 48px acima ]           ← só se o h2 não for o primeiro filho
ETIQUETA DE SEÇÃO        ← text-etiqueta, Tinta Suave
  8px
Título da seção          ← t2, Fraunces 500
  12px
Deck de uma ou duas linhas em text-lead, Tinta Suave, máx. 44ch.
  32px
[ conteúdo do bloco ]
```

Verificação de proximidade: da etiqueta até o conteúdo há 8 + 12 + 32 = o bloco inteiro; da
etiqueta para cima há 48. **48 > 32.** O bloco de título gruda no que vem depois. ✓

### 2.3 Espaço entre corpos de texto

O espaço entre parágrafos é **função da entrelinha**, não do gosto. Regra: **espaço entre
parágrafos ≈ 0,8× a altura de linha**, arredondado para o degrau mais próximo.

| Estilo | Tamanho / entrelinha | Altura de linha | 0,8× | Degrau |
|---|---|---|---|---|
| `text-leitura` | 18px / 1.7 | 30,6px | 24,5 | **24** (`space-y-6`) |
| `text-base` | 16px / 1.6 | 25,6px | 20,5 | **16** (`space-y-4`) |
| `text-apoio` | 14px / 1.5 | 21px | 16,8 | **16** (`space-y-4`) |
| `text-legenda` | 12px / 1.4 | 16,8px | 13,4 | **12** (`space-y-3`) |

`text-base` cai em 20 por cálculo mas usa 16: 20 está na lista de uso restrito (§1.3) e a
diferença de 4px em texto de interface é invisível. `text-leitura` usa 24 porque em coluna
de 62ch com entrelinha 1.7, 16px de espaço entre parágrafos some dentro do próprio
interlinhamento e o texto vira um bloco cinza.

### 2.4 Lista, item de lista, definição

| Contexto | Espaço | Degrau |
|---|---|---|
| Entre itens de `<ul>` em texto corrido | 8 | `space-y-2` |
| Entre itens de lista com título próprio (FAQ fechado) | 16 | `space-y-4` |
| Entre linhas da ficha técnica (`<dl>` com hairline) | 12 acima + 12 abaixo da hairline | `py-3` por linha |
| Entre os três passos "Como encomendar" (01/02/03) | 32 | `space-y-8` |
| `<dt>` → `<dd>` na mesma linha lógica | 4 | `mt-1` ou `gap-1` |

---

## 3. Níveis de hierarquia

Este é o entregável central. **Onze níveis, todos os que este site tem.** Nenhum componente
das próximas etapas inventa um décimo segundo: se um caso novo aparecer, ele encaixa em um
destes ou o documento é revisado.

Convenções da tabela: "Acima" = margem superior quando o elemento **não é** o primeiro
filho do container (§2.2). "Abaixo" = margem inferior até o próximo elemento do fluxo
normal. Cores em fundo claro / entre parênteses a cor equivalente sobre as seções verdes.

| # | Nível | Família | Tamanho | Peso | Cor | Acima | Abaixo | Onde aparece neste site |
|---|---|---|---|---|---|---|---|---|
| **N0** | Hero / display | Fraunces `opsz 144, SOFT 60, WONK 1` | `text-display` clamp 40→68 | 500 | `inv-conteudo` (Fio Cru) | padding do hero | **24** → corrente | **Um lugar só**: o `h1` do hero da home. Nunca reaparece. |
| **N1** | Título de página | Fraunces | `text-t1` clamp 34→48 | 500 | `conteudo` (`inv-conteudo`) | **64** | **16** deck · **32** conteúdo | `h1` de `/bolsas`, `/mesa-posta`, `/sobre`, `/contato`, `/estilo`; nome da peça na página de produto |
| **N2** | Título de seção | Fraunces | `text-t2` clamp 28→36 | 500 | `conteudo` (`inv-conteudo`) | **48** | **12** deck · **32** conteúdo | Todo `h2`: "Bolsas em destaque", "Como encomendar", "Sobre a Raquel", "Perguntas frequentes" |
| **N3** | Título de sub-bloco | Fraunces | `text-t3` clamp 24→28 | 500 | `conteudo` (`inv-conteudo`) | **32** | **8** deck · **16** corpo | `h3` dentro de seção: título de painel, cada pergunta do FAQ aberto, "Cuidados com a peça" |
| **N4** | Nome de produto | Fraunces | `text-lead` clamp 20→22 | 500 | `conteudo` | **4** (após N6) | **4** (→ N8 meta) | Card do catálogo, card de peças relacionadas, item da busca. **Nunca `t3`** — ver §3.2 |
| **N5** | Subtítulo / deck | Karla | `text-lead` clamp 20→22 | 400 | `conteudo-suave` (`inv-suave`) | **16** após N1 · **12** após N2 | **32** | Parágrafo de abertura sob o `h1` de página, deck de seção, subtítulo do hero (máx. **44ch**) |
| **N6** | Eyebrow / etiqueta | Karla `uppercase` `tracking .12em` | `text-etiqueta` 11 (fixo) | 500 | `conteudo-suave` (`inv-suave`) | herda o do bloco | **8** → título · **12** → objeto | Categoria no card ("TRANSVERSAL"), rótulo de seção, cabeçalho de tabela, texto do chip |
| **N7** | Corpo de leitura | Karla | `text-leitura` 18 (fixo) | 400 | `conteudo` (`inv-suave`) | **32** após título | **24** entre parágrafos | `/sobre`, FAQ, descrição do produto. Sempre com `max-w-texto` (62ch) e `hyphens: auto` |
| **N8** | Corpo de interface | Karla | `text-base` 16 (fixo) | 400 (500 em botão) | `conteudo` (`inv-conteudo`) | **16** | **16** | Botão, campo, navegação, célula de tabela, texto de card curto, breadcrumb |
| **N9** | Meta / apoio | Karla `tabular-nums` | `text-apoio` 14 (fixo) | 400 | `conteudo-suave` (`inv-suave`) | **4** após N4 · **8** solto | **8** | "32 × 24 cm · 15 dias", preço, prazo, ficha técnica, texto auxiliar de campo |
| **N10** | Legenda | Karla | `text-legenda` 12 (fixo) | 400 | `conteudo-suave` (`inv-suave`) | **8** após imagem | 0 | Legenda de foto da galeria, crédito, nota de rodapé, aviso de prazo em dezembro |

### 3.1 Como os níveis se combinam

Só existem **cinco combinações legítimas** neste site. Qualquer outra é sinal de que o
componente está errado, não de que falta um nível.

```
Abertura de página        N6 → N1 → N5 → [conteúdo]
Abertura de seção         N6 → N2 → N5 → [conteúdo]        (o N5 é opcional)
Sub-bloco                 N3 → N7                          (sem eyebrow: N3 já é o rótulo)
Card de produto           [foto] → N6 → N4 → N9
Card de conteúdo/painel   N6 → N3 → N8                     (painel do /estilo, FAQ)
```

Regras de combinação:

- **N6 nunca vem depois de N1/N2/N3.** O eyebrow rotula o título; se aparecer depois, ele
  é meta e o nível certo é N9.
- **N5 (deck) nunca aparece duas vezes seguidas.** Se você precisa de dois parágrafos de
  abertura, o segundo é N7.
- **N4 só existe dentro de um card.** Na página de produto o nome da peça é N1.
- **N0 é único no site inteiro.** Se um segundo `text-display` aparecer, o hero perdeu.
- **N3 pula N2:** um `h3` pode existir sem `h2` acima dentro de um painel, mas nunca com
  tamanho maior que o `h2` da seção que o contém.

### 3.2 Três conflitos que este documento resolve

Foram encontrados em `estilo/page.tsx` e ficam decididos aqui:

1. **Nome de produto no card: `text-lead` (N4), não `text-t3`.** A identidade 7.1 já dizia
   `text-lead`; a linha 449 do `/estilo` usa `text-t3`. Fica `text-lead`. Motivo: em grade
   de 4 colunas dentro de `max-w-medida` (1152px − 3×24 de gap = 1080/4 = **270px** por
   card), "Jogo Americano Trançado" em `t3` (28px) ocupa três linhas e a coluna de texto
   passa a competir com a foto. Em `lead` (22px) ele cabe em duas e a foto continua sendo
   o produto.
2. **`text-t1` dentro de `<h3>` (linha 416) é inválido.** Nível visual e nível semântico são
   a mesma escada. Um painel de destaque dentro de uma seção é N2 (`h2` + `text-t2`), ou
   N3 se estiver dentro de outro `h2`. Nunca um `h3` com corpo de `h1`.
3. **`font-display text-base` (linhas 254, 336, 347) viola a identidade 3.4.** Fraunces
   abaixo de `1.375rem` perde o `WONK` — que é exatamente o argumento pelo qual a fonte foi
   escolhida. Nesses três lugares o nível é **N8** (Karla `text-base`, peso 500 para dar o
   destaque que se buscava com a serifa).

### 3.3 Hierarquia sobre as seções verdes

A inversão cromática da identidade tem uma consequência de espaçamento que precisa estar
escrita: **superfície escura comprime opticamente.** O mesmo bloco lê ~10% mais apertado
sobre `Verde Fundo` do que sobre `Fio Cru`.

Compensação, e só esta: **o padding vertical de seção invertida sobe um degrau**
(`--spacing-secao` → `--spacing-secao-ampla`). O ritmo interno do bloco — os espaços da
tabela §3 — **não muda**. Duas escalas de espaçamento seriam a segunda origem de deriva
depois da escala infinita.

---

## 4. Densidade e escala responsiva

### 4.1 A regra que separa o que escala do que não escala

**Espaço de layout é fluido. Espaço de componente é fixo.**

| Categoria | Escala com a viewport? | Exemplos |
|---|---|---|
| **Layout** (≥ 32px) | **Sim**, via `clamp()` | padding de seção, gutter da página, padding de painel, gaps de grade, topo de página |
| **Componente** (≤ 24px) | **Não**, valor fixo | eyebrow→título, etiqueta→nome, padding de botão, padding de chip, entre parágrafos |

Por quê: um card de produto tem o mesmo trabalho em 375px e em 1440px — mostrar foto, nome
e medida como um objeto. Se os espaços internos encolherem no mobile, o card vira um
carimbo; se crescerem no desktop, ele se desmonta. O que muda entre telas é **quanto ar
existe entre os objetos**, não o que existe dentro deles.

Consequência prática, e ela é grande: **você quase nunca escreve `sm:` ou `lg:` em uma
classe de espaçamento.** Se você está escrevendo `p-4 lg:p-8`, ou o valor devia ser um
token de layout com `clamp()`, ou você está mexendo em espaço de componente sem motivo.

### 4.2 Os `clamp()` de layout

Todos usam a forma `clamp(mínimo, Avw + Brem, máximo)` em vez de `clamp(min, Nvw, max)`. A
forma com termo fixo tem inclinação menor e chega ao teto em uma largura razoável; a forma
com `vw` puro ou nunca atinge o teto em telas normais, ou atinge o piso cedo demais.

| Token | `clamp()` | 375px | 768px | 1024px | 1280px | 1440px+ |
|---|---|---|---|---|---|---|
| `--spacing-borda-pagina` | `clamp(1.25rem, 4vw, 2rem)` | 20 | 31 | 32 | 32 | 32 |
| `--spacing-pagina-topo` | `clamp(3rem, 4vw + 1rem, 5rem)` | 48 | 48 | 57 | 67 | 74 |
| `--spacing-secao` | `clamp(3.5rem, 4vw + 2rem, 6rem)` | 56 | 63 | 73 | 83 | 90 |
| `--spacing-secao-densa` | `clamp(2.5rem, 3vw + 1.25rem, 4rem)` | 40 | 43 | 51 | 58 | 63 |
| `--spacing-secao-ampla` | `clamp(4.5rem, 6vw + 1.5rem, 7.5rem)` | 72 | 72 | 85 | 101 | 110 |
| `--spacing-painel` | `clamp(1.25rem, 2vw + 0.5rem, 2rem)` | 20 | 23 | 29 | 32 | 32 |
| `--spacing-grade-col` | `clamp(1rem, 1.5vw + 0.25rem, 1.5rem)` | 16 | 16 | 19 | 23 | 24 |
| `--spacing-grade-linha` | `clamp(2rem, 2vw + 1rem, 2.5rem)` | 32 | 32 | 37 | 40 | 40 |

Todos os valores intermediários caem dentro dos patamares da §1.2 — a interpolação nunca
produz um número que quebre a leitura, porque a distância entre patamares é grande o
bastante para absorver alguns pixels.

### 4.3 Tipografia responsiva

A identidade fixou os **tetos** (§3.3 de `identidade-visual.md`). O que falta é o **piso no
mobile**. `text-t1` a 48px em uma tela de 375px com 20px de gutter deixa 335px úteis:
"Bolsas de crochê" quebra em três linhas e o `WONK` da Fraunces, que já desalinha, fica
serrilhado.

**Só os cinco degraus grandes ganham `clamp()`.** De `text-leitura` para baixo tudo é fixo:
texto de leitura e de interface tem tamanho ótimo absoluto, não relativo à janela.

| Token | Valor novo | Mobile 375 | Tablet 768 | Desktop 1024+ |
|---|---|---|---|---|
| `--text-display` | `clamp(2.5rem, 8vw, 4.25rem)` *(já na identidade)* | 40 | 61 | 68 |
| `--text-t1` | `clamp(2.125rem, 2.5vw + 1.5rem, 3rem)` | 34 | 43 | 48 |
| `--text-t2` | `clamp(1.75rem, 1.5vw + 1.25rem, 2.25rem)` | 28 | 32 | 36 |
| `--text-t3` | `clamp(1.5rem, 1vw + 1.125rem, 1.75rem)` | 24 | 26 | 28 |
| `--text-lead` | `clamp(1.25rem, 0.5vw + 1.125rem, 1.375rem)` | 20 | 22 | 22 |
| `--text-leitura` … `--text-etiqueta` | **fixos** | — | — | — |

Nenhum teto muda. As linhas de `--line-height` e `--letter-spacing` da identidade ficam
como estão: em `clamp()`, `line-height` unitless acompanha sozinho.

Razão da escala no mobile: 40 / 34 / 28 / 24 / 20 / 18 / 16 / 14 / 12 / 11 → passo médio
**1,18**. No desktop: 68 / 48 / 36 / 28 / 22 / 18 / 16 / 14 / 12 / 11 → passo médio
**1,25**. Escala mais apertada no mobile é o comportamento correto: menos largura, menos
espaço para diferenciar por tamanho, mais trabalho para peso e cor.

### 4.4 Duas densidades, não três

| Densidade | Onde | Regra |
|---|---|---|
| **Confortável** (padrão) | Todo o site público | A tabela §3 como está |
| **Compacta** | Ficha técnica, tabela de contraste, listagens do admin | Espaços **internos** descem um degrau (24→20, 20→16, 16→12, 12→8). Nunca abaixo de 8. Espaços de **layout** não mudam. |

Não existe densidade "espaçosa". O hero e as faixas verdes já usam `--spacing-secao-ampla`;
isso resolve o único caso real de "quero mais ar".

### 4.5 Breakpoints

Os padrão do Tailwind v4, sem customização: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. O
site tem três layouts de verdade — **coluna única** (< 768), **duas ou três colunas**
(768–1023) e **grade cheia** (≥ 1024) — e três layouts não justificam breakpoints
próprios. `xl` e `2xl` não são usados: acima de 1024 quem cresce é o `clamp()`, não o
número de colunas.

---

## 5. Ritmo de seção e página

### 5.1 Container

| Token | Valor | Uso |
|---|---|---|
| `--container-medida` | 72rem (1152px) | Container padrão. Catálogo, grades, seções gerais |
| `--container-texto` | 38rem (608px) | Texto longo (~62ch em `text-leitura`). `/sobre`, FAQ, descrição |
| `--container-produto` | 60rem (960px) *(novo)* | Coluna dupla da página de produto — 1152 deixa a galeria grande demais e a ficha órfã à direita |
| — | 44ch | Deck e subtítulo de hero. Aplicado direto: `max-w-[44ch]` é a única largura permitida como valor arbitrário |

Gutter horizontal: **`--spacing-borda-pagina`** (20 → 32px). Aplicado no container, nunca na
seção — para que a faixa verde sangre de borda a borda enquanto o conteúdo dela respeita a
mesma medida.

```
| gutter |          max-w-medida 1152          | gutter |
   32                                              32     → 1216 total
```

Sangria (`full-bleed`): só a foto do hero e as faixas de fundo colorido. A regra é que o
**fundo** sangra e o **conteúdo** não. Nunca uma foto de card sangrando.

### 5.2 Padding vertical de seção

| Tipo de seção | Token | Valor | Onde |
|---|---|---|---|
| Padrão | `--spacing-secao` | 56 → 96 | Catálogo, "Sobre", FAQ, depoimentos |
| Densa | `--spacing-secao-densa` | 40 → 64 | Peças relacionadas, faixa de categorias, breadcrumb + filtros |
| Ampla | `--spacing-secao-ampla` | 72 → 120 | Hero, toda faixa `bg-inv-fundo`, CTA de fechamento, rodapé |

**A regra da costura entre seções.** Duas seções adjacentes com o **mesmo** fundo somam
padding (96 + 96 = 192px de vazio) e o olho lê uma seção só, gigante e vazia. Duas seções
com fundos **diferentes** têm a troca de cor fazendo a separação.

| Situação | O que fazer |
|---|---|
| Fundos diferentes (cru → verde) | Padding cheio nos dois lados. A cor separa. |
| Mesmo fundo, assuntos diferentes | **Divisória obrigatória**: `border-t border-borda` ou `.corrente`, e o padding do segundo cai para `--spacing-secao-densa` |
| Mesmo fundo, mesmo assunto | Não são duas seções. Junte em uma com `space-y-10` interno. |

### 5.3 A grade

Doze colunas na página de produto e em layouts editoriais. Fora disso, grades nomeadas com
contagem explícita — 12 colunas para posicionar quatro cards é indireção sem retorno.

**Gap: `column-gap` e `row-gap` são diferentes. Sempre.**

`row-gap` = **`--spacing-grade-linha`** (32 → 40). `column-gap` = **`--spacing-grade-col`**
(16 → 24). Razão ~1,6:1.

Motivo: cada card do catálogo termina em **texto** (etiqueta, nome, medidas). Com gaps
iguais, o texto do card de cima fica à mesma distância da foto do card de baixo que da sua
própria foto — e o olho, que agrupa por proximidade, lê a medida da Bolsa Serra como se
fosse legenda da Bolsa Cristal. Row-gap maior consertando isso é a diferença entre uma
grade que se lê e uma que se decifra.

| Grade | < 768 | 768–1023 | ≥ 1024 | `column-gap` | `row-gap` |
|---|---|---|---|---|---|
| **Catálogo de produtos** | **2** col | **3** col | **4** col | `grade-col` | `grade-linha` |
| Peças relacionadas | 2 | 2 | 4 | `grade-col` | `grade-linha` |
| Categorias (destaques da home) | 1 | 3 | 3 | `grade-col` | `grade-linha` |
| Painéis de conteúdo | 1 | 1 | 2 | 24 | 40 |
| Página de produto (galeria ↔ ficha) | 1 | 1 | 12 col: **7 / 5** | **48** (`gap-x-12`) | 40 |
| Miniaturas da galeria | 4 | 4 | 4 | 8 | 8 |
| Rodapé | 1 | 2 | 4 | 32 | 40 |

**Duas colunas no mobile, não uma.** Foto 4:5 em coluna única a 375px tem 335×419px — é
uma foto por rolagem, e um catálogo de encomenda vive de comparação lado a lado (a cliente
está escolhendo *a cor*). Em 2 colunas com gap 16 dá 159×199px por card, suficiente para a
malha do ponto aparecer e para quatro peças caberem na tela. As miniaturas da galeria são a
única grade que ignora a escala de gap: 8px, porque elas são um controle, não conteúdo.

### 5.4 Cabeçalho, rodapé, sticky

| Elemento | Altura / padding | Nota |
|---|---|---|
| Cabeçalho fixo | **64** mobile / **80** desktop (`h-cabecalho` / `lg:h-cabecalho-lg`) | Fundo `Papel`, `border-b border-borda` |
| `scroll-margin-top` de âncoras | altura do cabeçalho + **24** | `scroll-mt-[calc(var(--spacing-cabecalho)+1.5rem)]` |
| Barra sticky do WhatsApp (mobile) | **64** + `env(safe-area-inset-bottom)` | Só na página de produto |
| Folga no `<body>` quando a barra está ativa | `pb-16` extra | Senão o último bloco fica sob a barra |
| Botão flutuante do WhatsApp (desktop) | **56** de altura, **24** de margem da borda | Identidade 7.3 |
| Rodapé | `--spacing-secao-ampla` vertical | Fundo `Verde Musgo` + franja de macramê |

---

## 6. Componentes

### 6.1 A relação entre padding e raio

A identidade fixou raios minúsculos e propositais: `--radius-fio` 2px, `--radius-card` 6px.
Três regras derivam disso:

1. **Padding mínimo = 2× o raio.** Raio 2 → padding ≥ 4. Raio 6 → padding ≥ 12. Abaixo
   disso o conteúdo entra na curva e o canto parece cortado.
2. **Raio interno = raio externo − padding, com piso em 0.** Como os raios da marca são 2 e
   6 e o menor padding real é 12, **todo elemento aninhado é reto**. Consequência direta:
   **foto dentro de card com padding usa `rounded-none`.** Foto com `rounded-card` dentro de
   card `rounded-card` produz duas curvas concêntricas desalinhadas — o defeito de
   acabamento mais visível em card de e-commerce.
   **Exceção única: `.arco`.** Ele é máscara de assinatura, não canto, e ignora a regra.
3. **O raio nunca escala com o tamanho.** Botão `lg` continua com 2px. Painel de 600px
   continua com 6px. Raio crescente é a estética de startup que a identidade §1 rejeita.

### 6.2 Card

| Card | Padding | Raio | Interior |
|---|---|---|---|
| **Produto** | **12** (`p-card`) | `rounded-card` 6 | Foto `aspect-peca` reta (ou `.arco`) → **12** → N6 → **4** → N4 → **4** → N9 |
| **Painel de conteúdo** | `--spacing-painel` (20→32) | `rounded-card` 6 | N6 → **8** → N3 → **16** → N8 |
| **Faixa invertida** (painel verde) | `px-painel` + `py-secao-densa` | `rounded-card` 6 | Ritmo da §3, sem alteração |
| **Chip / badge** | **8** vertical, **12** horizontal | `rounded-fio` 2 | `text-etiqueta uppercase`, altura resultante 27px |

Card de produto em repouso: fundo `Papel`, `border border-borda`, **sem sombra**. Hover:
`translateY(-2px)` + `--shadow-peca`, 180ms. O padding **não muda** no hover — mudança de
padding em hover causa reflow da grade inteira.

### 6.3 Botão

Regra de proporção: **`padding-x` ≈ 2 × `padding-y`**. Ela é o que faz um botão parecer
botão: mais largo que alto, com ar suficiente na horizontal para o rótulo não encostar na
borda.

| Tamanho | Padding Y / X | Tipo | Altura | Onde |
|---|---|---|---|---|
| **sm** | **8 / 16** (`py-btn-sm-y px-btn-sm-x`) | `text-apoio` 500 | **37** | Filtro de categoria, paginação, ação de linha de tabela |
| **md** (padrão) | **14 / 28** (`py-btn-y px-btn-x`) | `text-base` 500 | **54** | CTA de WhatsApp na página, secundário fantasma, botão de formulário. **Valor exato da identidade 7.3** |
| **lg** | **18 / 36** (`py-btn-lg-y px-btn-lg-x`) | `text-base` 500 | **62** | Só o CTA do hero e o CTA de fechamento. No mobile vira largura total |

- Glifo do WhatsApp: **20px**, `gap` **10px** (`gap-btn-icone`) — valores exatos da
  identidade 7.3. Em `lg`, glifo 24px e `gap` 12.
- Entre botões numa fila: `gap-x-4` (16) e `gap-y-3` (12) — quando quebram linha, 16 na
  vertical faz duas filas parecerem dois grupos.
- **Link de texto (botão terciário)** tem `py-2` (8) e `-my-2` para não empurrar o fluxo:
  sem isso a área de toque fica em 21px, abaixo do mínimo de 44px da WCAG 2.5.5 quando
  somada ao line-height.
- `outline: 2px solid Goiaba Tinta` com `outline-offset: 2px` — o offset **não** conta
  como espaçamento e não entra em nenhum cálculo de layout.

**Nota de conciliação:** 14px e 28px não são múltiplos de 4 e por isso **não** são
escritos como `py-3.5 px-7`. Eles existem como tokens nomeados (`--spacing-btn-y`,
`--spacing-btn-x`), o que preserva a identidade 7.3 ao pé da letra **e** mantém os
degraus 3.5 e 7 fora da escala numérica. É exatamente para isso que tokens nomeados
existem: guardar o valor específico de um componente sem contaminar a escala geral.

### 6.4 Campo de formulário

| Propriedade | Valor |
|---|---|
| Padding | **14 / 16** (`py-campo-y px-campo-x`) |
| Altura resultante | **54px** — idêntica ao botão md, para que campo e botão alinhem numa fila |
| Raio | `rounded-fio` 2 |
| Borda | `1px` `Linha Forte` — **nunca** `Linha` (1,22:1, reprova) |
| `<label>` (N6) → campo | **8** |
| Campo → texto auxiliar / erro (N9) | **8** |
| Entre campos | **20** mobile / **24** desktop |
| Entre grupos de campos | **32** |
| Campo → botão de envio | **32** |
| Fundo | `Cru Fundo` |

O `54px` compartilhado entre botão md e campo é o motivo de `--spacing-controle` existir
como token: `h-controle` garante que um `<input>` e um `<button>` lado a lado tenham
exatamente a mesma altura mesmo quando o conteúdo difere.

### 6.5 Chip, badge, seletor de cor

| Elemento | Padding / tamanho | Gap |
|---|---|---|
| Chip "sob encomenda" | **8 / 12**, `rounded-fio` | — |
| Badge em célula de tabela | **4 / 12**, `rounded-fio` | — |
| Entre chips | — | **8** |
| Seletor de cor (círculo) | **36px** de diâmetro, `border 1px Linha Forte` | **12** entre círculo e nome, **16** entre opções |
| Seletor de tamanho (pílula) | **8 / 16**, `rounded-fio` | **8** |

Razão `padding-x : padding-y` do chip = **1,5:1**, não 2:1. Chip não tem ícone e o rótulo é
`text-etiqueta` com `tracking .12em` — o tracking já adiciona ar horizontal, e 2:1 deixaria
o chip parecendo um botão pequeno, que é justamente o que ele **não** é (não é clicável).

### 6.6 Tabela

| Propriedade | Valor |
|---|---|
| Padding vertical da célula | **12** (`py-3`) — densidade compacta: **8** |
| Padding horizontal entre colunas | **24** (`pr-6`) — última coluna sem padding |
| Cabeçalho | N6, `py-3`, `border-b border-borda` |
| Linha | `border-b border-borda/60` |
| Largura mínima antes do scroll | `min-w-md` (28rem) com `overflow-x-auto` no pai |

---

## 7. Regras anti-deriva

Escritas para quem vai implementar as próximas 12 etapas. Cada uma existe porque o erro
correspondente já apareceu ou vai aparecer.

1. **Não escreva valor arbitrário de espaçamento.** `p-[13px]`, `mt-[38px]`, `gap-[18px]`
   são proibidos sem exceção. Se um degrau parece faltar, o problema é o layout, não a
   escala. A única largura arbitrária permitida no site é `max-w-[44ch]`.
2. **Não use degrau fora da allowlist.** 7, 9, 11, 13, 14, 15, 18, 22 e companhia. Se você
   escreveu `py-7`, você queria `py-6` ou `py-8` e não decidiu qual.
3. **Não some padding de container com margem do primeiro filho.** O primeiro filho tem
   margem 0. Sempre. `space-y-*` e `first:mt-0` existem para isso.
4. **Não deixe o espaço acima de um título menor ou igual ao de baixo.** Regra do 2:1
   (§2.1). Se o título parece grudado no bloco errado, é sempre isto.
5. **Não use `gap` igual em x e y numa grade de cards com texto embaixo.** `row-gap` maior
   que `column-gap`, razão ~1,6:1 (§5.3).
6. **`gap` para flex/grid. `space-y-*` para pilha vertical simples. `mt-*` só no par
   título↔conteúdo.** Margem solta entre irmãos é o que produz `mt-2 / mt-3 / mt-4 / mt-6 /
   mt-8` na mesma tela. O valor de `mt` só é legítimo quando ele depende do **nível de
   hierarquia** (§3), não do container.
7. **`space-y-*` não funciona em grade com wrap.** Ele aplica margem a todo filho menos o
   primeiro, na ordem do DOM, ignorando as quebras de linha visuais. Use `gap`.
8. **Não escale espaço de componente com breakpoint.** `p-4 lg:p-8` num card é erro (§4.1).
   Layout usa `clamp()` via token; componente é fixo.
9. **Não crie um token novo para "esse caso".** O caso encaixa em um dos onze níveis da §3
   ou o design está errado. Token novo exige alterar este documento primeiro.
10. **Não crie um quarto tamanho de botão, uma terceira densidade, um décimo segundo
    nível.** Todo sistema que apodrece apodrece por adição.
11. **Nada de `<br>` nem `<div className="h-8" />` como espaçador.** Espaço é propriedade de
    um elemento com conteúdo, não um elemento.
12. **Nada de `!important` para consertar espaçamento herdado.** Se precisou, a
    especificidade do CSS está errada — e no v4, com `.secao` e `.secao--ampla` na mesma
    camada e mesma especificidade, quem vence é a **ordem no arquivo**. Modificadores vêm
    sempre depois da base.
13. **Não mude padding em `:hover`.** Reflow da grade inteira. Hover mexe em `transform`,
    `box-shadow` e cor. Só.
14. **Não meça em `px` no `padding-block` de seção.** Sempre `rem` ou o token. `px` ignora
    o ajuste de fonte do sistema operacional e quebra a acessibilidade da vizinha da Raquel
    que aumentou a fonte do navegador.
15. **Toda revisão de PR abre este documento na §3.** Se a nova tela não se descreve com os
    níveis de lá, ela não entra.

---

## 8. Tokens prontos

### 8.1 Bloco `@theme` — só o que é novo

Cole **dentro do `@theme` existente** de `src/app/globals.css`, depois do bloco `/* Layout */`.
Nenhuma cor e nenhuma família tipográfica é repetida aqui.

```css
@theme {
  /* ==================== ESPAÇAMENTO ====================
     --spacing continua 0.25rem (padrão do v4). p-4 = 16px.
     Ver §8.2 para a decisão e a consequência. */

  /* ---- Layout: fluidos (clamp) ---- */
  --spacing-borda-pagina:  clamp(1.25rem, 4vw, 2rem);            /*  20 →  32 */
  --spacing-pagina-topo:   clamp(3rem, 4vw + 1rem, 5rem);        /*  48 →  80 */
  --spacing-secao:         clamp(3.5rem, 4vw + 2rem, 6rem);      /*  56 →  96 */
  --spacing-secao-densa:   clamp(2.5rem, 3vw + 1.25rem, 4rem);   /*  40 →  64 */
  --spacing-secao-ampla:   clamp(4.5rem, 6vw + 1.5rem, 7.5rem);  /*  72 → 120 */
  --spacing-painel:        clamp(1.25rem, 2vw + 0.5rem, 2rem);   /*  20 →  32 */
  --spacing-grade-col:     clamp(1rem, 1.5vw + 0.25rem, 1.5rem); /*  16 →  24 */
  --spacing-grade-linha:   clamp(2rem, 2vw + 1rem, 2.5rem);      /*  32 →  40 */

  /* ---- Ritmo vertical: fixos ---- */
  --spacing-bloco:    2rem;   /* 32 — título → conteúdo do bloco   */
  --spacing-titulo:   3rem;   /* 48 — acima de um h2 não-primeiro   */
  --spacing-respiro:  4rem;   /* 64 — acima de um h1 não-primeiro   */
  --spacing-coluna:   3rem;   /* 48 — gap-x entre colunas grandes   */

  /* ---- Componentes: fixos ---- */
  --spacing-card:       0.75rem;   /* 12 — padding do card de produto */
  --spacing-btn-y:      0.875rem;  /* 14 — identidade 7.3 */
  --spacing-btn-x:      1.75rem;   /* 28 — identidade 7.3 */
  --spacing-btn-icone:  0.625rem;  /* 10 — identidade 7.3 */
  --spacing-btn-sm-y:   0.5rem;    /*  8 */
  --spacing-btn-sm-x:   1rem;      /* 16 */
  --spacing-btn-lg-y:   1.125rem;  /* 18 */
  --spacing-btn-lg-x:   2.25rem;   /* 36 */
  --spacing-campo-y:    0.875rem;  /* 14 */
  --spacing-campo-x:    1rem;      /* 16 */
  --spacing-chip-y:     0.5rem;    /*  8 */
  --spacing-chip-x:     0.75rem;   /* 12 */

  /* ---- Alturas de controle e de cromo ---- */
  --spacing-controle:     3.375rem; /* 54 — botão md e campo, alinhados */
  --spacing-controle-sm:  2.25rem;  /* 36 — botão sm, seletor de cor */
  --spacing-cabecalho:    4rem;     /* 64 — cabeçalho mobile, barra sticky */
  --spacing-cabecalho-lg: 5rem;     /* 80 — cabeçalho desktop */
  --spacing-zap-flutua:   3.5rem;   /* 56 — botão flutuante (identidade 7.3) */

  /* ==================== GRADE E PROPORÇÃO ==================== */
  --aspect-peca: 4 / 5;             /* foto de produto — identidade 5.4 */
  --container-produto: 60rem;       /* 960 — coluna dupla da página de produto */
}
```

E este bloco **substitui** cinco linhas de tamanho já existentes no `@theme` (não é
duplicação — é a versão responsiva das mesmas cinco; os tetos são idênticos aos da
identidade 3.3, e as linhas `--text-*--line-height` e `--text-*--letter-spacing` ficam
intactas):

```css
@theme {
  --text-display: clamp(2.5rem, 8vw, 4.25rem);            /* 40 → 68 */
  --text-t1:      clamp(2.125rem, 2.5vw + 1.5rem, 3rem);  /* 34 → 48 */
  --text-t2:      clamp(1.75rem, 1.5vw + 1.25rem, 2.25rem); /* 28 → 36 */
  --text-t3:      clamp(1.5rem, 1vw + 1.125rem, 1.75rem);   /* 24 → 28 */
  --text-lead:    clamp(1.25rem, 0.5vw + 1.125rem, 1.375rem); /* 20 → 22 */
}
```

Utilitários gerados: `px-borda-pagina`, `py-secao`, `py-secao-ampla`, `p-painel`, `p-card`,
`mt-bloco`, `mt-titulo`, `mt-respiro`, `gap-x-grade-col`, `gap-y-grade-linha`,
`py-btn-y`, `px-btn-x`, `gap-btn-icone`, `h-controle`, `h-cabecalho`, `aspect-peca`,
`max-w-produto`.

### 8.2 A decisão sobre `--spacing`: manter, e cercar

**Decisão: `--spacing` fica em `0.25rem`. Não é sobrescrito, não é desligado.**

O que está em jogo. No Tailwind v4, `--spacing` é um **multiplicador dinâmico**: qualquer
utilitário de espaçamento resolve para `calc(var(--spacing) * N)` com `N` livre. Isso
alimenta não só `p-*` e `m-*`, mas `w-*`, `h-*`, `size-*`, `gap-*`, `space-*`, `inset-*`,
`translate-*`, `scroll-m-*`, `text-indent-*` e `basis-*`.

Três caminhos foram considerados:

| Opção | O que acontece | Veredicto |
|---|---|---|
| **A. `--spacing: initial`** — desliga a escala dinâmica | `p-4`, `gap-2`, `size-5`, `space-y-6`, `translate-y-2` deixam de existir. Restam só os `--spacing-*` nomeados. Ícones viram `size-[1.25rem]`, offsets viram `translate-y-[2px]` | **Rejeitado.** Troca deriva de degraus por deriva de valores arbitrários, que é pior: o arbitrário não é nem inspecionável. E quebra todo snippet de terceiro, todo exemplo da doc, e as 40+ ocorrências que já existem no repo |
| **B. `--spacing: 0.5rem`** — base 8 no multiplicador | `p-4` passa a valer 32px silenciosamente. Cada classe já escrita muda de significado sem aviso | **Rejeitado.** Reinterpretação retroativa em massa. `p-3` no `/estilo` viraria 24px, `py-2.5` viraria 20px. Bug invisível em cada tela |
| **C. Manter `0.25rem` + tokens nomeados + allowlist** | `p-4` continua 16px. A escala fechada é uma **convenção verificada**, não uma restrição do compilador | **Escolhido** |

**A consequência para quem escreve `p-4` no dia a dia**, dita com todas as letras:

- `p-4` continua valendo exatamente 16px. Nada do que você já sabe sobre Tailwind muda.
- O compilador **não vai te impedir** de escrever `p-7`. A escala fechada não é uma
  garantia técnica; é uma convenção. Quem garante é a §8.3 e o code review.
- Você tem **duas linguagens** e precisa saber quando usar cada uma:
  **degrau numérico** (`p-4`, `mt-8`, `gap-6`) para espaço **local** dentro de um
  componente; **token nomeado** (`py-secao`, `p-painel`, `px-btn-x`) para espaço
  **estrutural** que se repete no site e que precisa mudar em um lugar só. A pergunta é:
  *"se este número mudar, quantos arquivos eu preciso abrir?"* Um arquivo → numérico. Mais
  de um → token.
- Todo valor que aparece **duas vezes ou mais** em componentes diferentes vira token
  nomeado na próxima revisão. Essa é a válvula de escape do sistema.

### 8.3 Como a allowlist é verificada

O sistema só sobrevive se a regra for executável. Duas linhas em CI:

```bash
# 1) degraus fora da allowlist
grep -rEn --include='*.tsx' --include='*.ts' \
  '\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(7|9|11|13|14|15|17|18|19|21|22|23|25|26|28|30|36|40|44|48|52|56|60|64|72|80|96)\b' src/ \
  && { echo "Degrau fora da escala — ver docs/sistema-de-espacamento.md §1.3"; exit 1; }

# 2) valores arbitrários de espaçamento
grep -rEn --include='*.tsx' --include='*.ts' \
  '\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[' src/ \
  && { echo "Valor arbitrário de espaçamento proibido — ver §7.1"; exit 1; }
```

`grep` retorna 0 quando **encontra** algo, então `&& exit 1` é a polaridade correta: falha
o build quando há violação.

**Implementado em `scripts/check-espacamento.sh`**, exposto como `pnpm check:espaco`.

Uma exceção foi aberta na implementação: **`src/components/brand/` fica fora da
verificação.** O lockup do logotipo usa medidas em `em` (`gap-[0.42em]`,
`h-[1.28em]`, `mt-[0.06em]`) que são **relações tipográficas**, não espaçamento de
layout — elas precisam escalar junto com o corpo da assinatura. Prendê-las à escala
de 4px quebraria o logo em qualquer tamanho diferente do atual. Ver
`identidade-visual.md` §6.5. Esta é a única exceção; abrir outra exige o mesmo tipo
de justificativa por escrito.

### 8.4 Companheiro em `@layer components`

O Tailwind v4 não tem namespace de tema para `grid-template-columns`. As grades e o
container ficam como classes, declaradas **depois** do bloco `@layer components` existente
da identidade:

```css
@layer components {
  /* Container do site — o gutter mora aqui, nunca na seção */
  .container-site {
    width: 100%;
    margin-inline: auto;
    max-width: var(--container-medida);
    padding-inline: var(--spacing-borda-pagina);
  }
  .container-site--texto   { max-width: var(--container-texto); }
  .container-site--produto { max-width: var(--container-produto); }

  /* Seções. Modificadores DEPOIS da base: mesma especificidade, vence a ordem. */
  .secao         { padding-block: var(--spacing-secao); }
  .secao--densa  { padding-block: var(--spacing-secao-densa); }
  .secao--ampla  { padding-block: var(--spacing-secao-ampla); }

  /* Grade do catálogo — 2 / 3 / 4, row-gap sempre maior que column-gap */
  .grade-catalogo {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--spacing-grade-col);
    row-gap: var(--spacing-grade-linha);
  }
  @media (width >= 48rem) { .grade-catalogo { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (width >= 64rem) { .grade-catalogo { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

  /* Pilha de blocos dentro de uma seção */
  .pilha > * + * { margin-block-start: var(--spacing-bloco); }
}
```

---

## 9. Auditoria de `src/app/estilo/page.tsx`

Roteiro de refatoração, literal e completo. Toda ocorrência de espaçamento do arquivo, em
ordem de linha. **✓ mantém** = o valor já está correto (troca só de nome, quando indicado).

### 9.1 Componente `Secao` (linhas 93–99)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 93 | `py-14` (56 fixo) | `py-secao` (56→96) | Padding de seção é layout, escala com `clamp()` (§4.1). 56 vira o piso mobile |
| 96 | `mt-2` (8) na descrição | `mt-3` (12) | N5 (deck) depois de N2 = 12 (§2.2). 8 é degrau de Contato, deck não é rótulo do título |
| 98 | `mt-8` (32) | `mt-bloco` (32) | Mesmo valor, nome estrutural. É a fronteira título→conteúdo, definida em um lugar só |

### 9.2 `main` e `header` (linhas 136–145)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 136 | `px-6` (24 fixo) | `px-borda-pagina` (20→32) | Gutter é layout. 24 é apertado em 1440 e largo em 375 |
| 136 | `pb-24` (96) | `pb-secao` | Fim de página é ritmo de seção, não número solto |
| 137 | `pt-16` (64) | `pt-pagina-topo` (48→80) | 64 fixo salta demais no mobile depois do cabeçalho de 64px |
| 137 | `pb-4` (16) | **remover** | Duplica o `py-secao` da primeira `Secao`. §7.3: padding de container + margem do filho |
| 139 | `mt-3` (12) etiqueta→h1 | `mt-2` (8) | N6 → título = 8 (§2.2). 12 é o valor para N6 → objeto |
| 140 | `mt-4` (16) h1→deck | `mt-4` ✓ | N1 → deck = 16. Correto |
| 144 | `corrente mt-8` (32) | `mt-bloco` (32) | ✓ valor, nome estrutural |
| 155, 164 | `text-[3.25rem]` (52) | `text-t1` | Valor arbitrário de tipo. 52 não existe na escala; a amostra do logo é N1 |

### 9.3 Seção "Logotipo" (linhas 151–229)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 151 | `gap-6` (24 nos dois eixos) | `gap-x-grade-col gap-y-grade-linha` | Painéis empilham; row-gap tem que ser maior que column-gap (§5.3) |
| 152, 159, 168, 180, 199 | `p-8` (32 fixo) | `p-painel` (20→32) | 32 de padding em painel de 335px no mobile come 19% da largura |
| 154, 163 | `mt-6` (24) etiqueta→amostra | `mt-6` ✓ | N6 → objeto grande. Aceito como Agrupamento largo |
| 170, 182, 201 | `mt-2` (8) etiqueta→parágrafo | `mt-2` ✓ | N6 → N9 = 8. Correto |
| 173, 205 | `mt-6` (24) | `mt-6` ✓ | Correto |
| 173, 205 | `gap-8` (32) entre amostras | `gap-8` ✓ | Amostras isoladas, patamar Bloco. Correto |
| 174–176 | `size-20 / size-12 / size-8` | ✓ | 80 / 48 / 32 — todos na escala |
| 186 | `mt-6` + `gap-6` | ✓ | Correto |
| 193 | `p-3` (12) na moldura do laço | `p-3` ✓ | Raio `fio` 2 exige padding ≥ 4 (§6.1). 12 passa |
| 208, 211, 223 | `mt-2` (8) imagem→legenda | `mt-2` ✓ | N10 depois de imagem = 8. Correto |

### 9.4 Seção "Paleta" (linhas 236–262)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 236 | `space-y-10` (40) entre grupos | `space-y-10` ✓ | Patamar Bloco, grupos com texto embaixo. Correto |
| 240 | `mt-3` (12) etiqueta→grade | `mt-3` ✓ | N6 → objeto = 12. Correto |
| 240 | `gap-4` (16 nos dois eixos) | `gap-x-4 gap-y-6` | Cada swatch tem duas linhas de texto embaixo. 16 na vertical cola a legenda de um no bloco do seguinte |
| 247 | `h-24` (96) | ✓ | Na escala |
| 253 | `p-3` (12) na legenda do swatch | `p-3` ✓ | Raio `card` 6 exige padding ≥ 12 (§6.1). Exatamente no mínimo |
| 254 | `font-display text-base` | `font-texto text-base font-medium` | Fraunces a 16px viola identidade 3.4. É N8 |
| 255 | `text-legenda` sem margem | `mt-1` (4) | N10 depois de N8 no mesmo bloco = Contato |

### 9.5 Seção "Contraste" (linhas 269–292)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 270 | `min-w-[28rem]` | `min-w-md` | 28rem é exatamente o `--container-md` do v4. Arbitrário desnecessário |
| 273–275 | `py-2 pr-4` no `<th>` | `py-3 pr-6` | Padding de célula = 12 / 24 (§6.6) |
| 281–283 | `py-2.5 pr-4` no `<td>` | `py-3 pr-6` | 2.5 (10px) é fracionário fora do permitido. §1.3 |
| 284 | `px-2 py-0.5` no badge | `px-chip-x py-1` (12 / 4) | 0.5 (2px) é reservado a correção óptica. Badge em célula = 4 / 12 (§6.5) |

### 9.6 Seção "Tipografia" (linhas 299–320)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 299 | `space-y-6` (24) | `space-y-6` ✓ | Correto |
| 301 | `pb-5` (20) | `pb-6` (24) | 20 é uso restrito (§1.3) e aqui soma com o `space-y-6` num total de 44 — número que não existe na escala |
| 302 | `gap-x-3` (12) na linha de meta | `gap-x-3` ✓ | Agrupamento apertado. Correto |
| 308 | `mt-2` (8) meta→espécime | `mt-2` ✓ | Correto |
| 317–318 | `mt-2` (8) | `mt-2` ✓ | Correto |

### 9.7 Seção "Formas e sombras" (linhas 327–350)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 327 | `gap-6` (24 nos dois eixos) | `gap-x-6 gap-y-10` | Duas fileiras de amostra com legenda embaixo. Row-gap maior (§5.3) |
| 334, 345 | `h-20` (80) | ✓ | Na escala |
| 335, 346 | `mt-2 font-display text-base` | `mt-2 font-texto text-base font-medium` | Fraunces a 16px viola identidade 3.4. É N8 |
| 336, 347 | `text-legenda` sem margem | `mt-1` (4) | N10 depois de N8 = Contato |

### 9.8 Seção "Assinaturas da marca" (linhas 357–380)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 357 | `gap-8` (32 nos dois eixos) | `gap-x-grade-col gap-y-grade-linha` | Grade de três com conteúdo alto. Column-gap 32 é largo demais; row-gap 32 é curto demais |
| 360, 365, 370 | `mt-3` (12) etiqueta→foto | `mt-3` ✓ | N6 → objeto = 12. Correto |
| 372 | `p-5` (20) no painel | `p-painel` (20→32) | Padding de painel é layout. 20 vira o piso mobile |
| 372 | `space-y-6` (24) | `space-y-6` ✓ | Correto |

### 9.9 Seção "Botões" (linhas 387–405)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 387 | `gap-4` (16 nos dois eixos) | `gap-x-4 gap-y-3` | Ao quebrar linha, 16 vertical faz duas filas parecerem dois grupos (§6.3) |
| 388, 392 | `px-6 py-3` (24 / 12) | `px-btn-x py-btn-y` (28 / 14) | Valor exato da identidade 7.3, que este arquivo estava aproximando |
| 388, 401 | `gap-2` (8) botão↔glifo | `gap-btn-icone` (10) | Identidade 7.3 especifica 10px |
| 388, 401 | `size-5` (20) no glifo | ✓ | Identidade 7.3 especifica 20px |
| 395 | link sem padding | `py-2 -my-2` | Área de toque de 21px. WCAG 2.5.5 pede 44 (§6.3) |
| 398 | `px-2.5 py-1` (10 / 4) no chip | `px-chip-x py-chip-y` (12 / 8) | Chip padrão = 8 / 12, altura 27px (§6.5). 2.5 é fracionário proibido |
| 401 | `px-5 py-3` (20 / 12) no flutuante | `h-zap-flutua px-6` | Identidade 7.3 fixa 56px de altura; `py` derivado não garante isso |

### 9.10 Seção "Seção invertida" (linhas 412–432)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 412 | `px-6 py-12 sm:px-10` | `px-painel py-secao-densa` | Três valores para uma coisa só. O token entrega 20→32 na horizontal e 40→64 na vertical, sem breakpoint |
| 416 | `<h3 className="text-t1">` | `<h2 className="text-t2">` | N2. Nível semântico e visual são a mesma escada (§3.2) |
| 416 | `mt-3` (12) etiqueta→título | `mt-2` (8) | N6 → título = 8 |
| 419 | `mt-4` (16) título→deck | `mt-3` (12) | N2 → deck = 12 |
| 424 | `mt-4` (16) parágrafo→meta | `mt-4` ✓ | Agrupamento padrão. Correto |
| 427 | `corrente mt-8` (32) | `mt-bloco` (32) | ✓ valor, nome estrutural |
| 428 | `mt-8` (32) corrente→botão | `mt-bloco` (32) | ✓ valor, nome estrutural |
| 428 | `px-6 py-3` | `px-btn-x py-btn-y` | Identidade 7.3 |
| 428 | `gap-2` | `gap-btn-icone` | Identidade 7.3 |

### 9.11 Seção "Card de produto" (linhas 439–458)

| Linha | Hoje | Deveria ser | Por quê |
|---|---|---|---|
| 439 | `grid gap-6 sm:grid-cols-2 lg:grid-cols-4` | `.grade-catalogo` | 2 / 3 / 4 com column-gap 16→24 e row-gap 32→40 (§5.3). Hoje o mobile é 1 coluna, e catálogo de cor precisa de comparação lado a lado |
| 446 | `<li className="group">` sem moldura | `+ bg-superficie border border-borda rounded-card p-card` | Identidade 7.1: card em repouso tem fundo Papel e borda Linha. Padding 12 (§6.2) |
| 447 | `<Foto>` com `rounded-card` | `rounded-none` quando não é bolsa | Raio interno = externo − padding = 0 (§6.1). `.arco` é a exceção e continua |
| 448 | `mt-3` (12) foto→etiqueta | `mt-3` ✓ | N6 → depois de objeto = 12. Correto |
| 449 | `mt-1 font-display text-t3` | `mt-1 font-display text-lead` | Nome de produto é **N4** = `text-lead`. `t3` estoura a coluna de 270px (§3.2) |
| 450 | `mt-1 text-apoio` | `mt-1` ✓ | N4 → N9 = 4. Correto |

### 9.12 Resumo numérico

| | Antes | Depois |
|---|---|---|
| Valores distintos de espaçamento na página | **21** | **11 degraus + 9 tokens nomeados** |
| Valores arbitrários (`-[...]`) | 3 | **0** |
| Degraus fracionários fora do permitido | 3 (`2.5`, `0.5`, `2.5`) | **0** |
| Violações da identidade 3.4 (Fraunces < 1.375rem) | 3 | **0** |
| Níveis de hierarquia usados fora da tabela §3 | 3 | **0** |
| Classes de espaçamento com breakpoint | 1 (`sm:px-10`) | **0** |
