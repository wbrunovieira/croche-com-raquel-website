# Identidade visual — Crochê com Raquel

Documento normativo da Etapa 1. Define paleta, tipografia, formas, textura, direção
fotográfica, logotipo e os tokens do Tailwind v4. É a fonte da verdade visual do
projeto: qualquer componente das etapas seguintes sai daqui.

Última atualização: 2026-08-30

---

## 1. Conceito

**Partido: "Estufa da Serra".** A marca é ancorada em duas coisas concretas e locais —
o **verde de ferro fundido do Palácio de Cristal** de Petrópolis e o **fio de algodão
cru** que a Raquel tem na mão. O site é papel cru com blocos profundos de verde
garrafa, e um rosa-goiaba saturado como acento. As bolsas são fotografadas contra o
verde escuro, dentro de uma máscara em **arco** — a forma da janela imperial e do
painel de macramê pendurado na parede.

Estou **rejeitando** três coisas explicitamente. (1) O bege-genérico + serifa fina +
oceano de espaço em branco: é o template Canva de artesanato, e um site inteiro de
neutros nivela por baixo a peça colorida que a Raquel faz. (2) O "vovó fazendo
crochê": nada de fundo de renda, script cursivo, coração, tons pastel dessaturados.
(3) O minimalismo de startup: nada de Inter, cinza-frio, cantos totalmente
arredondados e ilustração 3D.

O risco assumido é a **inversão cromática**: metade das seções do site são verde
escuro em vez de claras. Isso custa cuidado de contraste, mas é o que faz a bolsa
saltar e o que separa a marca de qualquer concorrente do nicho. Verde profundo tem um
segundo trabalho: quando a marca **já é verde**, o botão de WhatsApp deixa de ser um
corpo estranho e passa a ser família.

---

## 2. Paleta

### 2.1 Cores nomeadas

| Nome | Hex | Papel semântico |
|---|---|---|
| **Fio Cru** | `#F4EEE2` | Fundo padrão da página |
| **Papel** | `#FBF7EF` | Superfície elevada — card, modal, cabeçalho fixo |
| **Cru Fundo** | `#EDE4D3` | Superfície rebaixada — faixa alternada, input, skeleton |
| **Tinta** | `#241D16` | Texto principal (marrom-preto, nunca `#000`) |
| **Tinta Suave** | `#6A5C4C` | Texto secundário, legenda, meta |
| **Verde Cristal** | `#10402C` | **Primária** — botão sólido, links de navegação, logo |
| **Verde Musgo** | `#0A2E1F` | Hover/pressed da primária; fundo de rodapé |
| **Verde Fundo** | `#0C3323` | Fundo das seções invertidas (hero, destaques) |
| **Névoa** | `#C7D4C4` | Texto secundário **sobre** verde |
| **Goiaba** | `#C4425C` | Destaque: preenchimento de badge, sublinhado, marcador |
| **Goiaba Tinta** | `#A8324A` | Destaque quando é **texto ou link** em fundo claro |
| **Goiaba Clara** | `#F3D9DD` | Fundo de chip/badge ("Sob encomenda", "Novo") |
| **Rosa Fio** | `#E8A0AE` | Destaque **sobre** verde (o goiaba não tem contraste lá) |
| **Linha** | `#E3D8C4` | Hairline decorativa, divisória, borda de card |
| **Linha Forte** | `#8F7F62` | Borda de campo de formulário e de controle interativo |
| **Zap** | `#1E7B4F` | Botão de WhatsApp |
| **Zap Escuro** | `#1A6B45` | Hover do botão de WhatsApp |

### 2.2 Estados

| Estado | Hex | Uso |
|---|---|---|
| Sucesso | `#2E6B45` | Confirmação ("Mensagem copiada") |
| Atenção | `#75601C` | Aviso ("Prazo maior em dezembro") |
| Erro | `#9C4221` | Erro de formulário no admin |
| Foco | `#A8324A` | `outline: 2px solid` + `outline-offset: 2px` — sempre visível |

O anel de foco é **goiaba**, não verde: em cima de um botão verde o foco verde some.
Goiaba tem 5,64:1 contra o fundo claro e destaca nas duas superfícies.

### 2.3 O botão de WhatsApp

O problema: `#25D366` (verde oficial do WhatsApp) é ácido, tem luminância altíssima e
não convive com nada. Ele grita em qualquer paleta que não seja a do próprio app.

A solução aqui: **a marca já é verde**, então o CTA entra na família em vez de brigar
com ela. Três regras:

1. **CTA principal na página** (produto, hero, seção final) → sólido em **Verde
   Cristal `#10402C`** com texto branco e o glifo do WhatsApp em branco. Ele é o botão
   da marca; o ícone é o que comunica o canal.
2. **Botão flutuante / sticky do mobile** → **Zap `#1E7B4F`**, um verde-médio
   dessaturado que é reconhecível como "WhatsApp" à distância mas está a meio caminho
   entre o `#25D366` e o verde da marca. É o único lugar do site com esse tom, o que
   já o torna o elemento mais chamativo da tela sem estridência.
3. **`#25D366` é proibido como cor de superfície.** No máximo aparece dentro do glifo
   quando o ícone é usado sozinho sobre branco (ex.: lista de contatos no rodapé).

### 2.4 Contrastes WCAG (ratios calculados)

Todos os pares abaixo foram calculados pela fórmula de luminância relativa da WCAG 2.1.

**Pares principais — texto**

| Par | Ratio | AA normal (4,5) | AA grande (3,0) | AAA (7,0) |
|---|---|---|---|---|
| Tinta `#241D16` sobre Fio Cru `#F4EEE2` | **14,40** | ✅ | ✅ | ✅ |
| Tinta `#241D16` sobre Papel `#FBF7EF` | **15,57** | ✅ | ✅ | ✅ |
| Tinta `#241D16` sobre Cru Fundo `#EDE4D3` | **13,18** | ✅ | ✅ | ✅ |
| Tinta Suave `#6A5C4C` sobre Fio Cru | **5,60** | ✅ | ✅ | ❌ |
| Tinta Suave `#6A5C4C` sobre Papel | **6,05** | ✅ | ✅ | ❌ |
| Verde Cristal `#10402C` sobre Fio Cru | **10,14** | ✅ | ✅ | ✅ |
| Goiaba Tinta `#A8324A` sobre Fio Cru | **5,64** | ✅ | ✅ | ❌ |

**Texto sobre a primária e sobre as seções escuras**

| Par | Ratio | AA normal | AAA |
|---|---|---|---|
| Branco `#FFFFFF` sobre Verde Cristal `#10402C` | **11,72** | ✅ | ✅ |
| Fio Cru `#F4EEE2` sobre Verde Cristal | **10,14** | ✅ | ✅ |
| Fio Cru `#F4EEE2` sobre Verde Fundo `#0C3323` | **12,01** | ✅ | ✅ |
| Névoa `#C7D4C4` sobre Verde Fundo | **7,61** | ✅ | ✅ |
| Rosa Fio `#E8A0AE` sobre Verde Cristal | **5,62** | ✅ | ❌ |
| Branco `#FFFFFF` sobre Zap `#1E7B4F` | **5,25** | ✅ | ❌ |
| Branco `#FFFFFF` sobre Zap Escuro `#1A6B45` | **6,50** | ✅ | ❌ |
| Branco `#FFFFFF` sobre Goiaba `#C4425C` | **4,91** | ✅ | ❌ |
| Branco `#FFFFFF` sobre Goiaba Tinta `#A8324A` | **6,52** | ✅ | ❌ |
| Tinta `#241D16` sobre Goiaba Clara `#F3D9DD` | **12,50** | ✅ | ✅ |

**Estados sobre Fio Cru**

| Par | Ratio |
|---|---|
| Sucesso `#2E6B45` | **5,50** ✅ |
| Atenção `#75601C` | **5,27** ✅ |
| Erro `#9C4221` | **5,65** ✅ |

**Componentes não textuais** (mínimo AA = 3,0)

| Par | Ratio | Nota |
|---|---|---|
| Linha Forte `#8F7F62` sobre Fio Cru | **3,38** ✅ | Borda de input e de controle |
| Linha `#E3D8C4` sobre Fio Cru | **1,22** ⚠️ | **Só decorativa.** Nunca em campo de formulário |

**Combinações proibidas** (calculadas e reprovadas — anote para não escorregar):

- Goiaba `#C4425C` como **texto** sobre Fio Cru = **4,25** ❌. Para texto/link use
  Goiaba Tinta `#A8324A`. Goiaba puro só como preenchimento ou texto ≥ 24px/19px-bold.
- Goiaba `#C4425C` sobre Verde Fundo `#0C3323` = **2,83** ❌. Sobre verde, use Rosa Fio.
- Verde Cristal `#10402C` sobre Goiaba `#C4425C` = **2,39** ❌.

### 2.5 Light-only. Sem dark mode. Por quê

O site é **exclusivamente claro**. Três razões, nessa ordem:

1. **É um catálogo de cor.** ~90% da tela é foto de fio tingido. A cliente decide a
   compra pela cor exata do barbante. Um tema escuro muda a percepção de saturação e
   de temperatura das mesmas fotos e cria duas verdades sobre o produto — e a
   reclamação "a cor não era essa" é o pior desfecho possível para uma peça sob
   encomenda que não tem troca.
2. **Decoração de casa se vende com luz.** A promessa é "toque único no seu lar", com
   ambiente iluminado e aconchegante. Uma marca de manta e almofada num fundo preto
   vende gadget, não casa.
3. **O ritmo de contraste já existe sem toggle.** O site alterna faixas cru e faixas
   verde-escuro por construção. O usuário já recebe o alívio visual que o dark mode
   normalmente entrega, e a Raquel/o admin recebem metade do QA de contraste, de foto
   e de screenshot.

Consequência prática: declarar `color-scheme: light` no `:root` para que os campos de
formulário nativos não sejam invertidos pelo sistema operacional.

---

## 3. Tipografia

### 3.1 O par

| Papel | Fonte | Pesos | Onde existe |
|---|---|---|---|
| **Display** | **Fraunces** (variável: `opsz`, `wght`, `SOFT`, `WONK`) | 400, 500, 600 | Google Fonts |
| **Texto/UI** | **Karla** (variável: `wght` 200–800, itálico) | 400, 500, 700 | Google Fonts |

Duas fontes. Só. (Regra da Chanel: antes de sair, tire um acessório — o terceiro tipo
para "legenda técnica" foi cortado; a Karla em maiúsculas com tracking resolve.)

### 3.2 Por que esse par

**Fraunces** é a única serifa do Google Fonts que expõe dois eixos variáveis chamados
literalmente `SOFT` (terminais amolecidos) e `WONK` (irregularidade, letras que
"entortam"). A tipografia da marca **codifica a proposta de valor**: irregularidade
controlada e amolecimento são exatamente o que separa a peça feita à mão da peça de
máquina. E o eixo `opsz` alto entrega uma serifa **encorpada e larga**, o oposto da
serifa fina de alto contraste do template artesanal — ela sustenta preço premium sem
parecer revista de moda dos anos 90.

Configuração obrigatória do display, para não parecer "Fraunces default":
`font-variation-settings: "opsz" 144, "SOFT" 60, "WONK" 1;`

**Karla** é uma grotesca com personalidade própria — laterais achatadas, `a` e `g` com
desenho idiossincrático, `t` de topo cortado. Não é a Inter. Ela mantém a interface
moderna e legível sem virar neutra-corporativa, e o pouco de "esquisitice" dela rima
com o `WONK` da Fraunces sem imitá-lo.

Ambas têm o Latin completo — `ã õ ç é â ê í ú à` do pt-BR estão no subset `latin`, não
é preciso carregar `latin-ext`.

**Verificado** contra `next/font/google` do Next 16.3.3 (`font-data.json`):
`Fraunces` — eixos `SOFT` (0–100), `WONK` (0–1), `opsz` (9–144), `wght` (100–900),
subsets `latin`/`latin-ext`/`vietnamese`, itálico disponível.
`Karla` — eixo `wght` (200–800), subsets `latin`/`latin-ext`, itálico disponível.
Os valores usados aqui (`SOFT 60`, `WONK 1`, `opsz 144`) estão todos dentro da faixa.

### 3.3 Escala tipográfica

Razão ~1,22–1,25. Base 16px = 1rem.

| Token | rem | px | Altura de linha | Uso |
|---|---|---|---|---|
| `text-etiqueta` | 0.6875 | 11 | 1 | Eyebrow, categoria no card. Karla 500, `uppercase`, `tracking 0.12em` |
| `text-legenda` | 0.75 | 12 | 1.4 | Legenda de foto, nota de rodapé |
| `text-apoio` | 0.875 | 14 | 1.5 | Medidas, prazo, meta do card |
| `text-base` | 1 | 16 | 1.6 | Texto de interface, botão, formulário |
| `text-leitura` | 1.125 | 18 | 1.7 | **Corpo de texto longo** (sobre, FAQ, descrição) |
| `text-lead` | 1.375 | 22 | 1.45 | Nome do produto, parágrafo de abertura |
| `text-t3` | 1.75 | 28 | 1.25 | h3 |
| `text-t2` | 2.25 | 36 | 1.15 | h2 de seção |
| `text-t1` | 3 | 48 | 1.08 | h1 de página |
| `text-display` | 4.25 | 68 | 1.0 | Hero. Aplicar `clamp(2.5rem, 8vw, 4.25rem)` |

### 3.4 Regras de uso

- **Fraunces nunca abaixo de `1.375rem`**, com a única exceção do logotipo. Em corpo
  pequeno ela perde o `WONK` e vira serifa qualquer.
- **Fraunces nunca em caixa alta.** O `WONK` produz maiúsculas desalinhadas.
- **Fraunces nunca em parágrafo.** Só título, nome de produto e números grandes.
- **Karla faz todo o resto**: corpo, botão, formulário, navegação, tabela.
- **Comprimento de linha**: `max-width: 62ch` no texto longo, `44ch` em lead.
- **Números** (medidas, preço, prazo): Karla com `font-variant-numeric: tabular-nums`,
  para as colunas do card não dançarem.
- **Eyebrow** (`text-etiqueta`) é sempre Karla 500 + `uppercase` + `tracking-0.12em` +
  Tinta Suave. É o rótulo estrutural do site.
- **Sem itálico decorativo.** Itálico só em nome próprio e citação de depoimento.
- **Hifenização ligada** no pt-BR (`hyphens: auto; lang="pt-BR"`) — palavras longas
  como "personalizada" quebram feio em coluna estreita no mobile.

---

## 4. Formas e textura

### 4.1 Raios

| Token | Valor | Onde |
|---|---|---|
| `--radius-fio` | `2px` | Chip, badge, input, botão pequeno |
| `--radius-card` | `6px` | Card de produto, imagem de grid, modal |
| `--radius-arco` | `999px 999px 6px 6px` | **Só em bolsa** (ver abaixo) |
| `--radius-pilula` | `999px` | Exclusivo do botão flutuante do WhatsApp |

Nada de card totalmente arredondado. O crochê é uma malha ortogonal de pontos; a
geometria da marca é **quase reta, com um evento**.

### 4.2 O arco — elemento de assinatura

A máscara em arco (topo semicircular, base reta) tem **uma função semântica única:
marcar bolsa**. É a silhueta da janela do Palácio de Cristal e do painel de macramê
pendurado. Ela aparece em: foto do hero, cards da hub `/bolsas`, primeira imagem da
galeria da página de produto.

**Não aparece** em mesa posta, cozinha, bebê ou decoração — esses usam `--radius-card`
reto. Assim a forma não é enfeite: quem navega aprende, sem legenda, que "arco =
bolsa", e o carro-chefe ganha protagonismo estrutural, não só de posição.

```css
.arco { border-radius: 999px 999px 6px 6px; overflow: hidden; }
```

### 4.3 Sombras

Artesanato é matte. Sombra é rara, sempre quente (nunca preta pura) e sempre curta.

```css
--shadow-peca:  0 1px 2px rgba(36,29,22,.06), 0 6px 16px -8px rgba(36,29,22,.14);
--shadow-alta:  0 2px 4px rgba(36,29,22,.08), 0 16px 32px -12px rgba(36,29,22,.20);
--shadow-zap:   0 4px 14px -2px rgba(10,46,31,.35);
```

`--shadow-peca` é o hover do card. `--shadow-alta` é modal e galeria em zoom.
`--shadow-zap` é exclusiva do botão flutuante. Card em repouso: **sem sombra**, só
`1px` de `Linha`.

### 4.4 Linhas — a "corrente"

A divisória padrão do site não é uma régua de 1px: é uma **corrente**, o ponto
corrente do crochê, feita só com CSS. Ela separa seções e sublinha o h1 do hero.

```css
.corrente {
  height: 12px;
  background-image: radial-gradient(ellipse 8px 6px at 50% 50%,
    transparent 0 58%, var(--color-linha-forte) 60% 82%, transparent 84%);
  background-size: 13px 12px;
  background-repeat: repeat-x;
}
/* sobre fundo verde */
.corrente--claro { background-image: radial-gradient(ellipse 8px 6px at 50% 50%,
    transparent 0 58%, rgba(244,238,226,.45) 60% 82%, transparent 84%); }
```

O `background-size` menor que a elipse faz os elos se sobreporem, como o ponto real.
Custo: 0 requisição, 0 imagem.

### 4.5 Textura de fio sem imagem pesada

Três camadas, todas CSS puro, todas `pointer-events: none`, somando < 1 KB.

**a) Grão de papel** — `feTurbulence` inline como data-URI, aplicado ao `body::after`
com `opacity: .05` e `mix-blend-mode: multiply`. Tira o "plástico" do fundo chapado.

```css
body::after {
  content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none;
  opacity: .05; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
```

**b) Trama diagonal** — só nas seções verdes, dois `repeating-linear-gradient`
cruzados a 45°/-45° que sugerem o entrelaçamento do fio. Quase subliminar (5% de
opacidade); a 100% de zoom você "sente" antes de enxergar.

```css
.trama { position: relative; }
.trama::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    repeating-linear-gradient( 45deg, rgba(244,238,226,.05) 0 1px, transparent 1px 6px),
    repeating-linear-gradient(-45deg, rgba(244,238,226,.05) 0 1px, transparent 1px 6px);
}
```

**c) Franja de macramê** — no rodapé, uma fileira de `linear-gradient` verticais de
alturas alternadas, imitando o acabamento de franja. Um único elemento de 24px.

### 4.6 Movimento

Discreto e orquestrado num lugar só: a **entrada do hero**, em que o arco cresce em
`clip-path` de baixo para cima (como a peça sendo tricotada) em 700ms com
`--ease-fio: cubic-bezier(.22,1,.36,1)`. Fora dele: só hover de card (elevação 2px +
`--shadow-peca`, 180ms) e transição de foco. Tudo dentro de
`@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none } }`.

---

## 5. Fotografia — direção de arte para a Raquel

Instruções para celular. A regra que resume tudo: **a foto precisa mostrar o relevo do
ponto e o tamanho real da peça.** Foto plana e sem escala é o que faz a cliente
perguntar no WhatsApp e desistir.

### 5.1 Fundo — só dois, sempre os mesmos

1. **Parede ou tábua clara e lisa** — branco quebrado, cimento claro ou madeira clara
   sem verniz brilhante.
2. **Tecido de linho cru esticado** (sem vinco! passe ou estique com fita por trás).

**Proibido:** mármore, granito da pia, colcha estampada, folhagem de plástico, chão de
cerâmica com rejunte, mesa com objetos aleatórios ao fundo, papel de parede.
Fundo repetido em todas as fotos = catálogo com cara de marca. Fundo variado = feed
de bazar.

### 5.2 Luz

- **Luz de janela, lateral, a ~45° da peça.** Nunca de frente, nunca de cima.
- **Flash nunca.** Lâmpada do teto acesa nunca (amarela e achata).
- Melhores horários: **8h–10h** e **15h–17h**.
- **Dia nublado de Petrópolis é o melhor cenário** — a neblina é um difusor gigante.
  Sol forte do meio-dia é o pior: estoura o cru e apaga o ponto.
- **A sombra é a protagonista.** Precisa existir uma sombra suave no lado oposto à
  janela: é ela que revela o relevo do ponto. Se a foto ficou sem sombra nenhuma,
  refaça — a peça vai parecer impressa.

### 5.3 O kit de 4 fotos — obrigatório por peça

| # | Foto | Como |
|---|---|---|
| 1 | **Inteira** | Peça centrada no fundo, de frente, com folga em volta. É a foto do card |
| 2 | **Macro do ponto** | ~15 cm de distância, focando a malha. Aproxime o corpo, **não use zoom** |
| 3 | **Escala humana** | Bolsa **no corpo**, transversal ou na mão, enquadrada do queixo à coxa |
| 4 | **Detalhe** | Fecho, alça, forro ou acabamento — o que justifica o preço |

A foto 3 é **obrigatória em toda bolsa**, sem exceção. Ela responde sozinha à pergunta
nº 1 do WhatsApp ("qual o tamanho?") e é o que transforma uma peça bonita num objeto
desejado. Quem posa deve usar **roupa lisa e neutra** (cru, branco, jeans escuro,
preto) — nada estampado competindo com a peça. Rosto pode ficar fora do quadro.

### 5.4 Enquadramento

- **Sempre vertical 4:5** (o site e o Instagram usam a mesma proporção — uma foto,
  dois destinos).
- A peça ocupa **60–70% do quadro**. Não encoste nas bordas.
- **Deixe ar sobrando em cima**: nas bolsas o site aplica a máscara em arco e o topo
  da imagem é cortado em curva.
- Câmera na **altura da peça**, não olhando de cima para baixo.

### 5.5 Ajustes do celular

1. Limpe a lente com a camiseta. Sério — é o que mais estraga foto de macro.
2. Ligue a **grade 3×3** nos ajustes da câmera.
3. Toque na peça na tela para focar e **segure para travar** o foco/exposição (AE/AF
   Lock). Depois deslize o dedinho de sol para baixo se a foto estiver clara demais.
4. **Não use o modo Retrato** para foto de catálogo — o desfoque artificial come a
   textura do ponto, que é justamente o produto.
5. **Não use zoom digital.** Chegue perto com o corpo.
6. Ponha um **pedaço de papel branco** dentro do quadro na primeira foto de cada
   sessão: serve de referência para acertar o branco na edição.

### 5.6 Edição

Lightroom Mobile ou o próprio app Fotos. Sempre nesta ordem e nada além:
**Exposição** leve para cima → **Realces** para baixo → **Sombras** levemente para
cima → **Temperatura** até o papel branco ficar branco → **Saturação em 0**.

**Sem filtro. Sem vinheta. Sem preto e branco. Nunca aumente a saturação** — a cliente
vai comparar a foto com a peça que chegou.

---

## 6. Logotipo

### 6.1 Direção

**Assinatura em duas linhas, alinhada à esquerda.**

```
crochê          ← Fraunces, peso 500, opsz 144, SOFT 60, WONK 1, caixa baixa
COM RAQUEL      ← Karla 500, caixa alta, tracking 0.16em, ~38% do corpo da linha 1
```

Tudo em caixa baixa na linha 1: caixa baixa é mais quente, e a Fraunces com `WONK`
funciona bem em minúsculas e mal em maiúsculas. O contraste de escala e de eixo
(serifa grande orgânica / grotesca pequena espaçada) já dá hierarquia — sem
ornamento, sem moldura, sem "est. 2020".

### 6.2 Símbolo — o novelo-coração

**O símbolo é o que a Raquel já usava.** Novelo em forma de coração com as tramas do
fio, duas agulhas atravessando por trás, três coraçõezinhos acima e o fio solto em
cacho embaixo à direita. Ela apresentou a arte dela e **reprovou o laço** que este
documento propunha (registro em 02/09/2026).

A decisão é dela por um motivo que vale escrever: **a marca já circula**. Está na
etiqueta de couro costurada nas bolsas, no perfil, nos posts. Trocar por um símbolo
"melhor desenhado" custaria o reconhecimento que ela levou anos construindo, para
ganhar coerência de sistema — troca ruim.

**O traçado foi vetorizado da arte dela, não redesenhado.** A original é um raster de
640×640 com traço creme sobre rosa. O canal verde separa os dois com folga (rosa ~143,
creme ~238); dali sai uma máscara, ampliada 5× antes de limiarizar para o degrau do
JPEG não virar serrilha, e os contornos saem por marching squares. Redesenhar no olho
produziria "parecido" — e em marca, parecido é errado.

**É caminho preenchido, não traço.** O desenho dela tem espessura variável e junções
que um `stroke` de espessura única não reproduz. Exige `fill-rule="evenodd"`: sem ela
os vazados internos entopem.

Proporção **0,885:1** (largura:altura) — dimensione pela altura.

### 6.3 Favicon e versões

- **Favicon 32×32 e 16×16**: **não usa o traçado completo** — tramas, agulhas e
  coraçõezinhos fecham e viram mancha. Usa a **marca reduzida**: coração cheio em Fio
  Cru com três tramas vazadas, sobre quadrado sólido de Verde Cristal. Validada a
  150, 48, 32 e 16px.
- **Apple touch icon 180×180**: a mesma marca reduzida, gerada do `icon.svg`.
- **Versão principal**: Verde Cristal sobre Fio Cru.
- **Versão invertida**: Fio Cru sobre Verde Cristal (usada no rodapé e nas seções escuras).
- **Versão 1 cor / bordada**: contorno em traço único, **testada a 2 cm de largura** —
  a marca vai virar etiqueta costurada na peça e adesivo de embalagem, e o teste
  decisivo do logo não é a tela, é o bordado. Se o laço fecha a 2 cm em uma cor, está
  aprovado.
- **Tamanho mínimo em tela**: 120px de largura na assinatura completa; abaixo disso,
  só o símbolo. O símbolo completo **não desce abaixo de ~24px**: medido no cabeçalho
  a 24 × 28px CSS, em tela 2× fica nítido e em 1× as tramas finas caem abaixo de um
  pixel e acinzentam.
- **Área de proteção**: a altura do `c` de "crochê" em todos os lados.

### 6.4 O laço, e por que ele saiu

Fica registrado: antes do novelo-coração, este documento propunha um **laço de fio**
nascido do terminal do `ê` de "crochê". Ele foi desenhado, renderizado e corrigido em
ciclo — e **reprovado pela Raquel**, que já tinha símbolo próprio em uso. O trabalho
de desenho abaixo continua valendo como registro do que cada forma comunica:

| Tentativa | Por que foi descartada |
|---|---|
| Laço largo, pontas longas para baixo | Lê como **balão preso a um barbante** |
| Laço com pontas abertas para fora | Lê como **Ω grego** |
| Pontas perfeitamente simétricas | Lê como **laço de fita de campanha** |
| Elo do ponto corrente (amêndoa) | Lê como **alfinete de mapa** |
| Roseta de três elos | Lê como **trevo** |
| Agulha com laço de fio | Lê como **&** — ilegível abaixo de 48px |

**O laço final** encurtava as pontas até o cruzamento encostar na base — é isso que
trocava a leitura de "balão" por "nó de fio". Validado a 240px, 66px e 32px, e
descartado mesmo assim: nenhuma dessas medições responde à pergunta que importava, que
era se a artesã se reconhece na marca.

### 6.5 Construção do lockup

Três regras que sustentam a assinatura, todas medidas e não estimadas:

0. **O viewBox é apertado à tinta** (`0 0 24 27.12`), não a uma grade quadrada. Esta é
   a regra que sustenta as outras: com vazio na caixa, ele soma com o gap e o espaço
   escrito deixa de ser o espaço visto. A proporção é 0,885:1, então **o símbolo é
   dimensionado pela altura**, nunca por `size-*`.
1. **Altura do símbolo = 1,15em**, e não os 1,30em do laço. O bloco de tinta das duas
   linhas tem 1,30em de altura, mas o novelo é **43% mais largo que o laço na mesma
   altura** (0,885:1 contra 0,62:1): igualado à tinta, ele dominava a assinatura em
   vez de assiná-la. Recuado para 1,15em, a mancha do símbolo volta a pesar como a do
   texto. Mais `margin-top: 0.10em`, porque a caixa de linha da primeira linha não
   começa na tinta.
2. **Distância símbolo → palavra = 0,30em** (14,4px no corpo de 48px), medida de tinta
   a tinta.
3. **A subline é oticamente justificada à largura de "crochê".** A 0,38em ela media
   146,9px contra 137,1px da palavra — 9,8px mais larga, o que desalinha a borda
   direita. Corrigida para **0,345em**, fecha em 136,2px (0,9px de folga).
   Junto vai `margin-right: -0.16em`, que **mata o espaço que o tracking deixa depois
   da última letra** — sem isso a linha parece deslocada à direita mesmo com a
   largura certa. Se a subline mudar de texto, refazer a medida.

---

## 7. Aplicação

### 7.1 Card de produto

```
┌──────────────────────┐
│                      │   Imagem 4:5. Bolsa → .arco.
│      [ foto 4:5 ]    │   Demais → radius 6px.
│                      │   Fundo do slot: Cru Fundo.
└──────────────────────┘
  TRANSVERSAL            ← etiqueta: Karla 500 caps, tracking .12em, Tinta Suave
  Bolsa Serra            ← Fraunces 500, text-lead (1.375rem), Tinta
  32 × 24 cm · 15 dias   ← text-apoio, Tinta Suave, tabular-nums
  ┌─────────────┐
  │ sob encomenda│        ← chip: fundo Goiaba Clara, texto Tinta, radius-fio
  └─────────────┘
```

- Card em repouso: fundo **Papel**, borda `1px` **Linha**, **sem sombra**.
- Hover/focus: `translateY(-2px)` + `--shadow-peca`, 180ms `--ease-fio`. A imagem
  **não** dá zoom (zoom em foto de textura vira borrão).
- **Sem estrela de avaliação, sem "adicionar ao carrinho", sem badge de desconto.**
  Não é loja.
- Preço nulo → o chip lê **"sob consulta"**; nunca "R$ 0,00" nem espaço vazio.
- O card inteiro é um único link para a página do produto. O WhatsApp fica na página,
  não no card — a conversa precisa do contexto que só a página dá.

### 7.2 Hero da home

**A tese: uma bolsa, em tamanho real, contra o verde.** Sem headline gigante flutuando
sobre foto de banco de imagens, sem gradiente, sem número grande.

```
╔═══════════════════════════════════════════════════════╗
║  VERDE FUNDO #0C3323 + .trama + grão                  ║
║                                                       ║
║   ╭───────────────╮   PETRÓPOLIS · RJ                 ║
║   │               │                                   ║
║   │   foto 4:5    │   Bolsas de crochê               ║
║   │   da bolsa    │   feitas uma a uma.              ║
║   │   NO CORPO    │   ~~~~~~~~~~~~~~~~ (corrente)    ║
║   │               │                                   ║
║   │   .arco       │   Você escolhe o modelo, a cor    ║
║   ╰───────────────╯   e o tamanho. Eu faço.           ║
║                                                       ║
║                       [ Falar no WhatsApp ] [Ver bolsas]║
╚═══════════════════════════════════════════════════════╝
```

- Foto: a **nº 3 do kit** (escala humana), em `.arco`, sangrando à esquerda no desktop.
- Título em Fraunces 500, `clamp(2.5rem, 8vw, 4.25rem)`, em Fio Cru.
- A **corrente** (`.corrente--claro`) sublinha o título — é o único ornamento.
- Subtítulo em Karla, `text-leitura`, cor Névoa `#C7D4C4`, máx. 44ch.
- Botões: primário sólido Verde Cristal com texto branco **não funciona sobre o verde
  escuro** — aqui o primário inverte: **fundo Fio Cru, texto Verde Cristal** (10,14:1).
  O secundário "Ver bolsas" é fantasma: borda `1px rgba(244,238,226,.35)`, texto Fio Cru.
- Animação de entrada: `clip-path` do arco subindo, 700ms.
- Mobile: foto em cima, texto embaixo, mesma ordem no DOM.

### 7.3 Botão de WhatsApp

**Na página (CTA principal)**

```
Fundo Verde Cristal #10402C · texto e glifo #FFFFFF (11,72:1)
Karla 500 · text-base · padding 14px 28px · radius-fio 2px
Glifo do WhatsApp 20px à esquerda, gap 10px
Hover: fundo Verde Musgo #0A2E1F · Ativo: translateY(1px)
Foco: outline 2px #A8324A, offset 2px
Rótulo: "Pedir pelo WhatsApp" — verbo que descreve o que acontece
```

**Flutuante / sticky do mobile**

```
Fundo Zap #1E7B4F · glifo #FFFFFF (5,25:1) · radius-pilula
Sombra --shadow-zap · 56px de altura
Mobile: barra sticky no rodapé da página de produto, largura total,
        com o nome da peça à esquerda e o botão à direita
Desktop: pílula fixa no canto inferior direito, 24px de margem
Hover: Zap Escuro #1A6B45
```

Em nenhum dos dois o `#25D366` aparece como fundo. Um único botão flutuante por tela.

**A mensagem** é sempre pré-preenchida e escrita da posição da cliente, em primeira
pessoa, com o link:

> Oi, Raquel! Vi a **Bolsa Serra** (transversal, cor terracota, 32×24 cm) no site e
> queria encomendar. Link: https://…/bolsas/bolsa-serra

### 7.4 Página de produto

O coração do projeto. Ordem da coluna, mobile-first:

1. **Galeria** — as 4 fotos do kit. A primeira em `.arco` se for bolsa; miniaturas
   embaixo como quadrados de 6px de raio; toque abre em tela cheia com zoom.
2. **Etiqueta** de categoria + **nome** em Fraunces `text-t1`.
3. **Preço** em Karla 500 `text-lead` tabular — ou o chip **"sob consulta"**.
4. **Descrição** em `text-leitura`, máx. 62ch. Voz da Raquel, primeira pessoa.
5. **Seletores de opção** (cor, tamanho, personalização). Cor = círculo de 36px com o
   hex real, borda `1px Linha Forte`, e o **nome escrito ao lado** — nunca só a bolinha
   (a cliente precisa saber dizer o nome da cor no WhatsApp).
6. **Ficha técnica** em lista de definição, hairline `Linha` entre as linhas: fio e
   composição, medidas em cm, capacidade em linguagem real ("cabe carteira, celular e
   uma garrafinha de 500 ml"), prazo de produção, se tem forro.
7. **"Como encomendar"** — três passos **numerados 01/02/03**. A numeração é legítima
   aqui e **só aqui**: é uma sequência real que a cliente vai executar (escolher →
   mandar mensagem → confirmar e aguardar o prazo). Em nenhuma outra seção do site
   existe marcador numerado.
8. **Cuidados com a peça** em acordeão, fechado por padrão.
9. **Peças relacionadas** — mesma subcategoria, 4 cards.
10. **Barra sticky de WhatsApp** no mobile, aparecendo depois que o CTA principal sai
    da viewport.

---

## 8. Tokens prontos

### 8.1 `src/app/globals.css`

```css
@import "tailwindcss";

/* Fontes vêm de next/font (variáveis no <html>) — por isso @theme inline. */
@theme inline {
  --font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-texto: var(--font-karla), ui-sans-serif, system-ui, sans-serif;
}

@theme {
  /* ---------- Cor: nomes da marca ---------- */
  --color-cru:            #F4EEE2;
  --color-papel:          #FBF7EF;
  --color-cru-fundo:      #EDE4D3;
  --color-tinta:          #241D16;
  --color-tinta-suave:    #6A5C4C;
  --color-verde-cristal:  #10402C;
  --color-verde-musgo:    #0A2E1F;
  --color-verde-fundo:    #0C3323;
  --color-nevoa:          #C7D4C4;
  --color-goiaba:         #C4425C;
  --color-goiaba-tinta:   #A8324A;
  --color-goiaba-clara:   #F3D9DD;
  --color-rosa-fio:       #E8A0AE;
  --color-linha:          #E3D8C4;
  --color-linha-forte:    #8F7F62;
  --color-zap:            #1E7B4F;
  --color-zap-escuro:     #1A6B45;
  --color-sucesso:        #2E6B45;
  --color-atencao:        #75601C;
  --color-erro:           #9C4221;

  /* ---------- Cor: papéis semânticos (use estes na UI) ---------- */
  --color-fundo:            var(--color-cru);
  --color-superficie:       var(--color-papel);
  --color-superficie-baixa: var(--color-cru-fundo);
  --color-conteudo:         var(--color-tinta);
  --color-conteudo-suave:   var(--color-tinta-suave);
  --color-primaria:         var(--color-verde-cristal);
  --color-primaria-hover:   var(--color-verde-musgo);
  --color-sobre-primaria:   #FFFFFF;
  --color-destaque:         var(--color-goiaba);
  --color-destaque-texto:   var(--color-goiaba-tinta);
  --color-borda:            var(--color-linha);
  --color-borda-forte:      var(--color-linha-forte);
  --color-foco:             var(--color-goiaba-tinta);
  /* sobre seções escuras */
  --color-inv-fundo:        var(--color-verde-fundo);
  --color-inv-conteudo:     var(--color-cru);
  --color-inv-suave:        var(--color-nevoa);
  --color-inv-destaque:     var(--color-rosa-fio);
  --color-inv-borda:        rgba(244, 238, 226, 0.22);

  /* ---------- Tipografia ---------- */
  --text-etiqueta: 0.6875rem;
  --text-etiqueta--line-height: 1;
  --text-etiqueta--letter-spacing: 0.12em;
  --text-etiqueta--font-weight: 500;

  --text-legenda: 0.75rem;
  --text-legenda--line-height: 1.4;

  --text-apoio: 0.875rem;
  --text-apoio--line-height: 1.5;

  --text-base: 1rem;
  --text-base--line-height: 1.6;

  --text-leitura: 1.125rem;
  --text-leitura--line-height: 1.7;

  --text-lead: 1.375rem;
  --text-lead--line-height: 1.45;
  --text-lead--letter-spacing: -0.005em;

  --text-t3: 1.75rem;
  --text-t3--line-height: 1.25;
  --text-t3--letter-spacing: -0.01em;

  --text-t2: 2.25rem;
  --text-t2--line-height: 1.15;
  --text-t2--letter-spacing: -0.015em;

  --text-t1: 3rem;
  --text-t1--line-height: 1.08;
  --text-t1--letter-spacing: -0.02em;

  --text-display: 4.25rem;
  --text-display--line-height: 1;
  --text-display--letter-spacing: -0.025em;

  /* ---------- Forma ---------- */
  --radius-fio:     2px;
  --radius-card:    6px;
  --radius-pilula:  999px;

  /* ---------- Sombra ---------- */
  --shadow-peca: 0 1px 2px rgba(36,29,22,.06), 0 6px 16px -8px rgba(36,29,22,.14);
  --shadow-alta: 0 2px 4px rgba(36,29,22,.08), 0 16px 32px -12px rgba(36,29,22,.20);
  --shadow-zap:  0 4px 14px -2px rgba(10,46,31,.35);

  /* ---------- Movimento ---------- */
  --ease-fio: cubic-bezier(.22, 1, .36, 1);

  /* ---------- Layout ---------- */
  /* namespace --container-* => utilitários max-w-medida / max-w-texto no v4 */
  --container-medida: 72rem;   /* largura máx. do container do site */
  --container-texto:  38rem;   /* ~62ch em text-leitura */
}

/* ---------- Base ---------- */
:root { color-scheme: light; }

@layer base {
  html { -webkit-text-size-adjust: 100%; }
  body {
    background-color: var(--color-fundo);
    color: var(--color-conteudo);
    font-family: var(--font-texto);
    font-size: var(--text-base);
    line-height: 1.6;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, .display {
    font-family: var(--font-display);
    font-variation-settings: "opsz" 144, "SOFT" 60, "WONK" 1;
    font-weight: 500;
  }
  p, li { hyphens: auto; }
  :focus-visible {
    outline: 2px solid var(--color-foco);
    outline-offset: 2px;
    border-radius: 2px;
  }
  ::selection { background: var(--color-goiaba-clara); color: var(--color-tinta); }
  .tabular { font-variant-numeric: tabular-nums; }
}

/* ---------- Assinaturas da marca ---------- */
@layer components {
  /* arco: EXCLUSIVO de bolsas */
  .arco { border-radius: 999px 999px var(--radius-card) var(--radius-card); overflow: hidden; }

  /* ponto corrente: divisória e sublinhado */
  .corrente {
    height: 12px;
    background-repeat: repeat-x;
    background-size: 13px 12px;
    background-image: radial-gradient(ellipse 8px 6px at 50% 50%,
      transparent 0 58%, var(--color-linha-forte) 60% 82%, transparent 84%);
  }
  .corrente--claro {
    background-image: radial-gradient(ellipse 8px 6px at 50% 50%,
      transparent 0 58%, rgba(244,238,226,.45) 60% 82%, transparent 84%);
  }

  /* trama: só em seção verde */
  .trama { position: relative; isolation: isolate; }
  .trama::before {
    content: ""; position: absolute; inset: 0; pointer-events: none; z-index: -1;
    background-image:
      repeating-linear-gradient( 45deg, rgba(244,238,226,.05) 0 1px, transparent 1px 6px),
      repeating-linear-gradient(-45deg, rgba(244,238,226,.05) 0 1px, transparent 1px 6px);
  }
}

/* grão de papel global */
body::after {
  content: ""; position: fixed; inset: 0; z-index: 60;
  pointer-events: none; opacity: .05; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
```

### 8.2 `src/app/fonts.ts`

```ts
import { Fraunces, Karla } from "next/font/google";

// Fraunces é variável: opsz + wght + SOFT + WONK.
// Não passar `weight` — assim o eixo wght inteiro fica disponível.
export const fraunces = Fraunces({
  subsets: ["latin"],            // pt-BR (ã õ ç é â) está todo no subset latin
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

export const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-karla",
});
```

### 8.3 `src/app/layout.tsx` (trecho)

```tsx
import { fraunces, karla } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${karla.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 8.4 Uso das classes geradas

| Intenção | Classe |
|---|---|
| Fundo da página | `bg-fundo text-conteudo` |
| Card | `bg-superficie border border-borda rounded-card` |
| Seção invertida | `bg-inv-fundo text-inv-conteudo trama` |
| Título de seção | `font-display text-t2` |
| Eyebrow | `font-texto text-etiqueta uppercase text-conteudo-suave` |
| Corpo longo | `text-leitura max-w-texto` |
| Botão primário | `bg-primaria text-sobre-primaria hover:bg-primaria-hover rounded-fio` |
| Botão WhatsApp flutuante | `bg-zap hover:bg-zap-escuro text-white rounded-pilula shadow-zap` |
| Chip "sob encomenda" | `bg-goiaba-clara text-conteudo text-etiqueta uppercase rounded-fio` |
| Foto de bolsa | `arco` · demais categorias: `rounded-card` |
