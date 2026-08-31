# Plano de ação — Crochê com Raquel

Documento vivo. É atualizado a cada commit de etapa concluída.

**Legenda:** ✅ concluída · 🔵 em andamento · ⬜ pendente · ⏸️ bloqueada

Última atualização: 2026-08-31 — Etapa 11 concluída; catálogo real e primeira dobra revistos (antecipados da etapa 13)

---

## Visão do produto

Site institucional com catálogo para a artesã **Raquel Boaventura** (Petrópolis/RJ).
Peças de crochê e macramê feitas à mão, **sob encomenda**, personalizadas.

- **Não é e-commerce.** Sem carrinho, checkout, pagamento ou estoque.
- Cada produto tem **página própria e linkável** — é o link que a Raquel dispara no
  WhatsApp do cliente.
- A conversão acontece num **botão de WhatsApp** que abre a conversa com a mensagem
  já preenchida (produto, quantidade, cor, tamanho, personalização e link da página).
- Um **painel administrativo** permite a ela cadastrar produtos, categorias, cores e
  tamanhos. O site é montado dinamicamente a partir desses dados.
- **Bolsas são o carro-chefe** e têm tratamento privilegiado: hero da home,
  subcategorias próprias e página-hub dedicada.

## Arquitetura de conteúdo

**Categorias:** Bolsas (com subcategorias) · Mesa Posta · Casa & Decoração ·
Macramê · Cozinha · Bebê & Enxoval
**Subcategorias de bolsa:** transversal · ombro/tote · clutch/festa · praia ·
mochila · sacola/ecobag · necessaire
**Eixos transversais (filtros, não categorias):** coleções sazonais · personalizados

**Páginas:** Home · `/bolsas` (hub) · Catálogo · Produto · Sobre · Encomendas sob
medida · FAQ · Cuidados com as peças · Contato · Admin

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres · Prisma ·
Vercel Blob · Auth.js (credenciais) · deploy na Vercel · pnpm

---

## Etapas

### ✅ Etapa 0 — Fundação
Scaffold do Next.js 16 com TypeScript, Tailwind v4, ESLint, Turbopack e `src/`.
Repositório público criado em `wbrunovieira/croche-com-raquel-website`. Build verde.

### ✅ Etapa 1 — Identidade visual
Direção **"Estufa da Serra"**: papel cru com blocos profundos de verde garrafa
(Palácio de Cristal) e rosa-goiaba como acento. Light-only, sem dark mode.
Tipografia Fraunces (display, com os eixos SOFT/WONK ligados) + Karla (texto).
Máscara em **arco exclusiva de bolsas** — a forma codifica o carro-chefe.

Entregue: `docs/identidade-visual.md` (813 linhas, com contrastes WCAG calculados e
direção de arte fotográfica para a Raquel), tokens aplicados em `src/app/globals.css`,
fontes em `src/app/fonts.ts`, layout raiz em pt-BR com metadados da marca, home
provisória e a amostra em `/estilo`.

**Logotipo** (adicionado a pedido do Bruno): assinatura em duas linhas — "crochê" em
Fraunces caixa baixa sobre "COM RAQUEL" em Karla espaçada — com o **laço** como
símbolo isolado, em `src/components/brand/`. Favicon (`icon.svg`) e apple touch icon
gerados a partir do mesmo traçado.

*Mudanças em relação ao planejado:* a amostra ficou mais completa que o previsto e já
inclui card de produto e seção invertida, que eram da Etapa 4 — a Etapa 4 fica menor.
O laço foi desenhado direto em SVG e validado renderizando a 32px e 16px; as três
primeiras tentativas liam como pingente ou letra grega e foram descartadas.

**Sistema de espaçamento e hierarquia** (adicionado depois da crítica do Bruno, que
apontou falta de padrão de espaços e de hierarquia): `docs/sistema-de-espacamento.md`.
Unidade base 4px com grade de trabalho 8px, escala de 15 degraus, a **escada de quatro
patamares** (Contato / Agrupamento / Bloco / Respiro) que diz qual patamar usar antes
de escolher o degrau, a **regra do 2:1** no ritmo vertical, e **onze níveis de
hierarquia** com família, tamanho, cor, espaço acima e abaixo. Tokens integrados no
`globals.css` (espaçamento fluido com `clamp()`, classes `.container-site`, `.secao`,
`.grade-catalogo`, `.pilha`) e escala tipográfica agora responsiva.

A regra é executável: `pnpm check:espaco` reprova degrau fora da escala e valor
arbitrário de espaçamento. O `/estilo` foi refatorado pela auditoria do documento —
21 valores distintos viraram 11 degraus + 9 tokens, e caíram a zero os arbitrários, os
degraus fracionários e as violações da regra tipográfica.

*Pendência do logotipo:* a direção pede que o laço nasça do prolongamento do terminal
do `ê` de "crochê". Isso exige lettering customizado (desenhar o contorno da letra),
não dá para fazer com a fonte viva. Hoje o laço é um elemento do lockup, ao lado da
palavra. Se o Bruno quiser a versão desenhada, é trabalho de vetor à parte.

### ✅ Etapa 2 — Modelagem de dados
Schema Prisma: `Product`, `Category`, `Subcategory`, `Collection`, `OptionGroup`,
`OptionValue`, `ProductImage`, `Testimonial`, `SiteSettings`, `User`.
Pontos-chave: preço nullable, `featured` + ordem para curadoria da home,
`capacity` (texto) para bolsas, grupos de opções genéricos com tipo e obrigatoriedade.
Rodar a primeira migration e criar um seed com dados de exemplo.
*Banco já provisionado:* Neon (plano Free) instalado pelo Marketplace da Vercel no
escopo `brunoteam`, conectado ao projeto `croche-com-raquel-website` e com as
variáveis injetadas em production/preview/development. `DATABASE_URL` já está no
`.env.local` local (ignorado pelo git).
Entregue: Prisma 7.10 (fixado — o `@latest` resolvia para um release candidate),
`prisma/schema.prisma` com 12 modelos, migration `init` aplicada, seed idempotente
com 6 categorias, 7 subcategorias de bolsa, 8 produtos e 6 grupos de opção,
`src/lib/db.ts` com o cliente e `docs/modelo-de-dados.md` com as decisões.

*Além do planejado:* `pnpm db:resumo` imprime o catálogo no terminal e detalha um
produto — foi como validei que o modelo de opções responde à consulta que a página
de produto vai fazer. E `src/lib/db-url.ts` força `sslmode=verify-full`, porque o
driver `pg` vai enfraquecer o significado de `sslmode=require` na próxima major.

**Você vai ver:** `pnpm db:studio` para navegar nos dados, ou `pnpm db:resumo` para
o resumo no terminal.

### ✅ Etapa 3 — Camada de dados
`src/lib/queries/` com tipos de domínio serializáveis (nada de `Decimal` ou `Date`
atravessando para o cliente) e consultas de produto, categoria e configurações.
Toda consulta do site filtra `status: PUBLISHED` e opção `active: true`.

**Além do planejado:** `src/lib/whatsapp.ts`, a montagem da mensagem — o ponto de
conversão do site. É função pura e tem verificação própria (`pnpm check:whatsapp`),
que já pegou um bug real: sem opções escolhidas, o marcador `{opcoes}` sumia mas a
linha dele ficava, mandando uma linha em branco no meio da mensagem.

*Pendência:* o `/estilo` está sendo pré-renderizado estático com os dados do build.
Quando o admin existir (etapa 10) vai ser preciso revalidar as rotas ao publicar,
senão a alteração dela não aparece. Fica para as etapas 10 e 11.

### ✅ Etapa 4 — Design system
`Botao` (5 variantes × 3 tamanhos), `Chip`, `Etiqueta`, `Preco` (que centraliza a
regra do "sob consulta"), `Foto` (arco para bolsa, raio zero dentro de card,
placeholder quando não há acervo), `SeletorDeCor`, `SeletorDeOpcao`,
`CampoQuantidade`, `CampoTexto`, `CardDeProduto`/`GradeDeProdutos`, `Cabecalho` e
`Rodape`. Mais o `CampoDeCor` do admin: roda de cores, hex, ficha do fio e o botão
de desabilitar.

O `/estilo` agora puxa dados reais do banco e tem uma amostra viva dos controles da
página de produto, com a mensagem de WhatsApp montada de verdade ao lado.

**Cabeçalho refeito** (a pedido do Bruno, depois da etapa 5): Motion 13 e Lucide.
Barra de aviso animada e dispensável, cabeçalho fixo que encolhe ao rolar e ganha
fundo com blur, menu suspenso de bolsas com contagem por tipo, indicador de rota
ativa que desliza entre os itens (`layoutId`), e gaveta de tela cheia no mobile com
entrada escalonada. Tudo respeita `prefers-reduced-motion`.

Os ícones de marca saíram do Lucide, então o glifo do Instagram é desenhado à mão,
como o do WhatsApp.

**Você vai ver:** a rota `/estilo` com todos os componentes em seus estados.

### ✅ Etapa 5 — Página de produto ⭐ *o coração do projeto*
Galeria com zoom, descrição, medidas, prazo de produção, preço (ou "sob consulta"),
seletores de opção, quantidade, capacidade em linguagem real, cuidados,
peças relacionadas, compartilhar, e o **botão de WhatsApp sticky no mobile** que
monta a mensagem com todas as escolhas + link da página.
Entregue: `/produtos/[slug]` com trilha, galeria com ampliação, preço (ou "sob
consulta"), prazo, descrição, capacidade, seletores, quantidade, personalização,
ficha da peça, cuidados, compartilhar e "combina com". Todas as 8 peças do seed
são geradas estaticamente, com metadados e canônica por página.

O botão de WhatsApp fica desabilitado enquanto falta escolha obrigatória e diz o
que falta. No mobile ele também vira barra fixa no rodapé da viewport.

**Além do planejado:** `pnpm check:produto` abre a página num navegador de
verdade, escolhe as opções e confere o link que sai — é a verificação do caminho
de conversão, que é a funcionalidade central do site.

*Adiantado da etapa 6:* `/bolsas`, `/bolsas/[tipo]` e `/categorias/[slug]` em
versão mínima, e o cabeçalho e o rodapé ligados ao layout. Sem isso a navegação
da página de produto daria 404 na revisão. A etapa 6 constrói essas páginas de
verdade — hub com conteúdo indexável, filtros e SEO.

**Você vai ver:** http://localhost:3000/produtos/bolsa-serra — escolha as opções e
clique no botão; a mensagem chega pronta no seu WhatsApp.

### ✅ Etapa 6 — Catálogo e hub de bolsas
`/bolsas` virou landing de verdade: cabeçalho em seção verde, os tipos como cards,
a grade filtrável e o texto longo indexável no fim. `/catalogo` reúne todas as
peças com filtro por categoria e cor. `/bolsas/[tipo]` e `/categorias/[slug]`
ganharam trilha, contagem e o mesmo filtro.

**O filtro mora na URL, não em estado de componente** — sobrevive ao recarregar,
volta certo no botão de voltar, e a Raquel consegue mandar para a cliente um link
já filtrado ("olha as bolsas em terracota").

`Category.longDescription` foi ao banco para a Raquel poder editar o texto do hub
no admin, em vez de ele ficar preso no código. Renderizado por um markdown mínimo
próprio (parágrafo, `## `, `**negrito**`) — biblioteca de markdown abriria porta
para HTML arbitrário vindo do banco.

**Você vai ver:** http://localhost:3000/bolsas e http://localhost:3000/catalogo

### ✅ Etapa 7 — Home *(feita antes da 6, a pedido do Bruno)*
Hero em seção verde com a máscara em arco, título e subtítulo vindos das
configurações, dois CTAs, linha de garantias e **as cores reais do catálogo**
flutuando sobre a foto. Paralaxe curta de 40px na imagem, entrada escalonada.

Depois: peças em destaque (curadoria da Raquel), navegar por tipo de bolsa com a
contagem, demais categorias, o texto do "quem faz" em seção invertida e o CTA
final de encomenda sob medida. Tudo revelado ao entrar na tela, uma vez só.

*Fora por enquanto:* depoimentos (não há nenhum cadastrado) e o feed do
Instagram. Entram quando houver conteúdo.

**Você vai ver:** http://localhost:3000/

### ✅ Etapa 8 — Páginas institucionais
`/sobre`, `/cuidados`, `/perguntas-frequentes`, `/encomendas`, `/contato` e
`/politicas/[slug]` (trocas e privacidade). Rodapé refeito em quatro colunas.

Dois modelos novos: **`Page`** (para ela criar página nova sem migration) e
**`FaqItem`** (par pergunta/resposta, formato que alimenta o `FAQPage` da etapa 11).
Todo o texto institucional está no banco, editável — o ponto de partida vive em
`prisma/conteudo.ts`.

O **briefing de encomenda não grava nada**: monta a mensagem e abre o WhatsApp.
Nenhum campo é obrigatório, e campo em branco não vira linha vazia na mensagem.

O FAQ usa `<details>`: **a resposta fica no HTML mesmo com o item fechado** — que
é o que o buscador precisa ler — e funciona sem JavaScript.

**Você vai ver:** o site institucional inteiro navegável, pelo rodapé.

### ✅ Etapa 9 — Autenticação do admin
Auth.js v5 (beta — é o caminho padrão para App Router há tempos) com provedor de
credenciais, sessão JWT em cookie e `src/proxy.ts` protegendo `/admin`.

**Hash com scrypt do `node:crypto`**, não bcrypt: é um KDF de senha de verdade,
recomendado pela OWASP, e não entra dependência nova nem módulo nativo para
compilar no deploy. Os parâmetros vão gravados junto do hash, então mudá-los no
futuro não invalida as senhas antigas.

Duas defesas contra vazamento de informação: e-mail inexistente ainda paga o
custo do scrypt (senão o tempo de resposta entregaria quais e-mails existem) e a
mensagem de erro é uma só, sem dizer qual campo errou.

O site público foi para o grupo de rotas `(site)`, para o painel não herdar o
cabeçalho e o rodapé da loja.

`pnpm admin:criar "Nome" email@exemplo.com` cria a usuária — a senha é digitada,
nunca vai na linha de comando, onde ficaria no histórico do shell.

**Você vai ver:** http://localhost:3000/admin — e `pnpm check:login` exercita o
fluxo inteiro num navegador, criando e apagando a própria usuária de teste.

### ✅ Etapa 10 — Painel administrativo
CRUD de produtos (rascunho/publicado, ordenação), categorias e subcategorias,
grupos de opções e valores (com hex da cor), upload e reordenação de imagens no
Vercel Blob, depoimentos, e configurações globais (número do WhatsApp, template da
mensagem, textos da home, banner de aviso).
Prioridade: **usabilidade para uma pessoa não técnica** — formulário único,
upload por arrastar, preview do resultado.
Oito telas: início (com aviso de peça sem foto), peças, cores e opções,
categorias, textos do site, perguntas, depoimentos e configurações.

Decisões que valem registro:
- **Peça nova nasce rascunho** e **não publica sem foto** — o painel recusa e diz
  por quê. Peça sem foto vira um espaço vazio no site.
- **Foto sobe na hora de escolher**, não ao salvar o formulário: guardar o
  arquivo até o submit faria ela perder o envio se o resto do formulário
  falhasse. Apagar a peça apaga as fotos do Blob junto.
- **Apagar um valor de opção é bloqueado quando ele está em uso** — a mensagem
  manda desligar, que é o que ela quer em 99% dos casos.
- **O modelo da mensagem do WhatsApp exige `{produto}` e `{link}`**: sem eles a
  Raquel recebe as escolhas sem saber de qual peça são.
- Toda ação chama `exigirSessao()` antes de escrever: o proxy protege a rota, mas
  uma ação de servidor pode ser chamada direto.
- **A revalidação foi resolvida** (pendência da etapa 3): salvar no painel
  atualiza o site.

**Você vai ver:** `pnpm admin:criar "Seu Nome" seu@email.com`, depois
http://localhost:3000/admin. E `pnpm check:painel` cadastra uma peça de ponta a
ponta — com foto de verdade no Blob — e limpa tudo no fim.

### ✅ Etapa 11 — SEO e metadados
`metadataBase` no layout raiz (sem ela, canônica e Open Graph relativos saem
sem domínio) e **canônica em toda rota pública**, inclusive a home. `robots.ts`
e `sitemap.ts` montados do banco.

JSON-LD em `src/components/seo/dados-estruturados.tsx`: **LocalBusiness** no
layout do site, **Product** e **BreadcrumbList** na página de peça, **FAQPage**
nas perguntas — que já valiam a pena desde a etapa 8, quando o FAQ foi feito
com `<details>` justamente para a resposta ficar no HTML.

Imagens de compartilhamento geradas: uma para o site e uma **por peça**, com o
laço, o nome, o preço (ou "sob consulta"), o prazo e as bolinhas das cores
reais do catálogo.

Decisões que valem registro:
- **Sem preço fechado, nenhuma oferta é declarada.** Inventar um valor para
  "aparecer melhor" seria mentir para a cliente e para o buscador. Com preço, a
  disponibilidade é `MadeToOrder` — que é o que a página diz.
- **Fora de produção o site inteiro é `Disallow: /`.** Um preview no ar
  competindo com o domínio real é difícil de perceber e chato de desfazer.
- **Rascunho e prateleira vazia ficam fora do sitemap** — mandar o buscador
  para uma página sem nada gasta rastreamento e não ajuda ninguém.
- `/estilo` é página de trabalho: `noindex`, e fora do sitemap.
- As fontes das imagens são **TTF lidos do disco**, não os WOFF2 do
  `next/font` (o gerador não lê WOFF2) e não via `fetch` de `file:` (só
  funciona no Edge). O `outputFileTracingIncludes` leva os arquivos no deploy —
  sem ele, a imagem quebraria só em produção.
- `buscarConfiguracoes` e `listarCategorias` entraram no `cache()` do React:
  cabeçalho, rodapé e página pediam a mesma linha três vezes por renderização.

**Você vai ver:** `pnpm check:seo` (com o `pnpm dev` de pé) — 25 verificações
do que o buscador encontra em cada página. E, no navegador, a imagem de
compartilhamento de qualquer peça em `/produtos/<slug>/opengraph-image`.

### ⬜ Etapa 12 — Deploy
Deploy na Vercel, variáveis de ambiente, domínio, preview e produção.
**Você vai ver:** o site no ar.

### 🔵 Etapa 13 — Conteúdo real e handoff

**Feito (antecipado, a pedido do Bruno, para a Raquel ver o site):** o catálogo
de exemplo saiu e entraram **7 peças reais** dela, lidas das fotos do
@croche.comraquel — quatro bolsas (transversal caramelo, saco café, ombro bordô,
saco terracota) e três de mesa posta (sousplat de folhas, jogo mandala, centro de
mesa rendado). As fotos estão no Blob e a home já abre com uma bolsa de verdade.

Decisões que valem registro:
- **Preço, medidas, capacidade e prazo entraram nulos de propósito.** São
  compromissos que só a Raquel pode assumir; um número chutado aqui viraria
  promessa no site. A UI já trata — tudo aparece como "sob consulta" — e ela
  preenche no painel. Descrição e material vêm do que a foto mostra (ponto,
  alça, fecho, acabamento) e nada afirma o que não dá para ver.
- O seed **não sobe binário**: `prisma/catalogo.ts` guarda os dados,
  `pnpm fotos:importar` leva as fotos de `prisma/fotos/` ao Blob. O caminho no
  Blob é fixo, sem sufixo aleatório, e é isso que deixa rodar de novo sem
  duplicar.
- A remoção das peças de exemplo é uma **lista explícita de slugs**, e não
  "apague o que não está no catálogo": um dia ela vai cadastrar peça pelo
  painel, e um seed que varre o desconhecido apagaria o trabalho dela.
- `check:produto` e `check:seo` estavam presos a `bolsa-serra`. Agora o
  `check:seo` tira os slugs do sitemap e confere a regra que de fato importa —
  **a oferta do JSON-LD é a mesma coisa que a página mostra** —, comparando com
  o `data-preco` do componente de preço.

**Rodízio de fotos no hero e seção "quem faz"** (segunda leva, a pedido do
Bruno):

- A primeira dobra passou a **rodar entre as bolsas em destaque** — uma peça só
  vende uma peça; o rodízio vende o ateliê. Troca a cada 5s, com chevron e
  pontos para adiantar. **Pausa com o ponteiro em cima ou com o foco do teclado
  dentro**: trocar a foto embaixo do dedo de quem está decidindo é o jeito mais
  rápido de perder a pessoa. Com `prefers-reduced-motion` o rodízio não roda
  sozinho — o chevron continua valendo.
- Os controles ficam **fora da foto**: o card "escolha a cor" ocupa exatamente o
  canto de baixo e engolia o chevron. Só bolsa entra no rodízio, porque o arco é
  exclusivo dela.
- A faixa do "quem faz" ganhou **foto ao lado do texto** e hierarquia: o
  primeiro parágrafo virou o `h2` da seção, em display, e os seguintes são
  corpo. A Raquel controla isso escrevendo — sem campo separado de título.
  Ganhou também um caminho para `/sobre`.
- `SiteSettings.aboutImageUrl` + `aboutImageAlt`, com envio pelo painel
  (imediato, como as fotos de peça; a anterior é apagada do Blob **depois** da
  nova subir, senão uma falha deixaria a home sem nada).

**Falta:** as fotos são recortes de capa de reel (640 × 800) e trazem a
marca-d'água do Instagram; o acervo definitivo depende de ela fotografar.
**Não existe foto utilizável da Raquel no acervo** — a única com o rosto dela é
um recorte de 160 × 310 dentro de uma colagem, com adesivo atravessado. A faixa
está com o crochê em andamento no lugar, e ela troca pelo painel. Falta também o
guia curto do painel escrito para ela.

**Você vai ver:** `pnpm db:seed && pnpm fotos:importar`, depois a home e o
catálogo com as peças dela.

---

## Decisões em aberto

- **Fotos:** existem duas com escala humana (a saco terracota sendo usada e a
  saco café na mão) e elas já estão marcadas como tal. Mas todas são recorte de
  capa de reel, em 640 × 800 e com marca-d'água — servem para ela ver o site,
  não para o site no ar. Fotografar o acervo em resolução boa continua sendo a
  mudança de maior impacto na conversão, e independe de código.
- **Domínio definitivo** (para `NEXT_PUBLIC_SITE_URL`). O número do WhatsApp
  está confirmado: o `5524992087591` do seed bate com a etiqueta de couro que
  aparece na foto da bolsa caramelo.
