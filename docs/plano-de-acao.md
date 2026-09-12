# Plano de ação — Crochê com Raquel

Documento vivo. É atualizado a cada commit de etapa concluída.

> **O board é a fonte da verdade do andamento.** As etapas abaixo viraram issues
> no projeto *Croche-com-raquel-website* do WB Project Manager, organizadas em
> cinco milestones (Fase 1 a Fase 5). Este documento segue valendo pelo que o
> board não guarda: o **porquê** de cada decisão. Para mexer no board, use a
> skill `track-work` (`.claude/skills/track-work/`).

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
gerados a partir do mesmo traçado. *(Nada disso sobreviveu: a Raquel reprovou o laço,
substituído pelo novelo-coração dela, e na Etapa 16 a hierarquia inverteu — hoje o
elemento maior é o nome dela, com a letra dela.)*

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

*Pendência do logotipo — resolvida na Etapa 16.* A direção pedia que o laço nascesse
do prolongamento do terminal do `ê` de "crochê", o que exigiria lettering customizado.
A pendência morreu por outro caminho: o laço saiu, e o lettering que entrou é o da
própria Raquel.

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

### ✅ Etapa 15 — Painel enxuto *(pedido do Bruno)*

O painel tinha **oito telas com o mesmo peso**, e duas delas respondiam **HTTP
500** havia tempo sem ninguém notar — `/admin/perguntas` e `/admin/depoimentos`
compartilhavam um componente de cliente que recebia funções vindas do servidor.
Passaram despercebidas porque o `check:painel` só exercita o cadastro de peça:
sete das oito telas não eram abertas por verificação nenhuma.

**Decisão: remover, não consertar.** A Raquel não está à vontade com tecnologia
e o trabalho dela é cadastrar e tirar peça; FAQ e depoimentos ela pede ao Bruno.
Menos portas, menos medo.

- O **seed virou a fonte da verdade do FAQ** e passou a reconciliar: pergunta que
  sai de `prisma/conteudo.ts` sai do banco. A chave é o texto da pergunta, então
  reescrever o enunciado criava uma duplicata — armadilha que só apareceu quando
  editar pelo seed virou o único caminho.
- **Depoimentos não aparecem no site**: a seção nunca foi construída e nenhum
  componente lê o modelo. Remover a tela não tirou nada de visível.
- Nasceu o **`pnpm check:telas`**, que abre todas as telas do painel e reprova se
  alguma não responder 200. Erro de renderização em componente de servidor não
  aparece em build nem em lint — só quando alguém visita. O check é esse alguém.

Depois saiu também **Textos do site** (`/admin/paginas`): o trabalho dela é
cadastrar, excluir e desativar peça, e marcar destaque. Texto institucional ela
pede ao Bruno. O conteúdo segue no banco e renderizando — `sobre` na faixa "quem
faz", `cuidados` como seção da home, as políticas em `/politicas/[slug]` — e a
edição é por `prisma/conteudo.ts` + `pnpm db:seed`.

O seed reconcilia as páginas também: página que sai de `conteudo.ts` sai do
banco. Sem isso sobraria endereço fantasma, porque `listarSlugsDePagina` gera
`/politicas/<slug>` a partir do banco.

Por fim saíram **Categorias** e **Configurações**. O menu do painel caiu de
**oito telas para três**: Início, Peças, Cores e opções.

- **Cores fica porque é fluxo diário dela**: para cadastrar uma peça, ela
  escolhe as cores daquela peça, e a cor precisa existir antes.
- **O que ela perdeu, e vale saber:** trocar a própria foto da faixa "quem faz"
  e ligar o aviso do topo ("estou de férias até dia 20"). Eram as duas únicas
  coisas do painel que ela mudaria sozinha sem risco. Agora passam pelo Bruno.
- **O seed virou dono das configurações.** Ele fazia `update: {}` para não
  sobrescrever o que ela editasse na tela; sem a tela, isso significaria que
  ninguém consegue mudar nada. A foto do "quem faz" fica de fora: vem do Blob,
  pelo `pnpm fotos:importar`.
- O `check:telas` passou a **caçar link morto**: a tela de início ficou com um
  atalho para `/admin/perguntas` depois que ela foi removida, e link morto não
  quebra build, lint nem tipo — só o dia da Raquel.

### 🔵 Etapa 12 — Deploy
Deploy na Vercel, variáveis de ambiente, domínio, preview e produção.

**Domínio comprado:** `crochecomraquel.com.br`.

**Feito: a estreia em duas portas.** Enquanto o catálogo não abre, o domínio
mostra uma **página de obra** — só tipografia, sem o logotipo, a pedido do
Bruno — e o site completo fica em `preview.crochecomraquel.com.br`.

- O `src/proxy.ts` decide pelo host, por **allowlist**: host desconhecido cai
  na obra. Blocklist vazaria o site inacabado no dia em que alguém apontasse um
  alias novo.
- **O gate do `/admin` mudou de lugar, e isso não era opcional.** Passar um
  middleware próprio ao `auth()` do next-auth faz o `handleAuth` cair num
  `else if` que **descarta o retorno do callback `authorized`** — a proteção
  sumiria em silêncio. A regra agora é explícita no proxy, e o
  `auth.config.ts` carrega o comentário para ninguém devolvê-la para lá.
- **Preview não indexa.** Os dois hosts vivem no mesmo deploy, então
  `VERCEL_ENV` não os distingue: quem distingue é o host. O `robots.ts` decide
  por ele e o proxy ainda manda `X-Robots-Tag: noindex` em tudo que sai do
  preview — cobre imagem e OG, que o robots.txt não cobriria.
- Com a obra ligada o `robots.txt` do domínio **não aponta o sitemap**: ele
  levaria o buscador a dezenas de URLs que hoje respondem todas a mesma página.
- **`SITE_NO_AR=true`** derruba a obra no dia do lançamento, sem tocar em código.

`pnpm check:hospedagem` cobre tudo isso. Ele usa `node:http`, e não `fetch`: o
fetch do Node trata `Host` como header proibido e ignora em silêncio — os
testes por host passariam medindo o localhost.

**Falta:** apontar o DNS, subir para a Vercel e setar as variáveis.
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
- Os controles ficam **fora da foto**: o "escolha a cor" ocupa o canto de baixo
  e engolia o chevron. Só bolsa entra no rodízio, porque o arco é exclusivo dela.
- **O "escolha a cor" perdeu o painel** (crítica do Bruno: cobria metade da
  bolsa). As bolinhas continuam sobre a foto — a promessa de escolher a cor vale
  na primeira dobra —, mas agora numa faixa baixa, sustentada por uma sombra
  curta na base em vez de um bloco opaco. Funciona na peça clara e na escura.
- E o rótulo virou **"Algumas cores disponíveis"**: no imperativo ele prometia
  um controle que aquelas bolinhas não são — quem escolhe é o seletor da página
  da peça. "Algumas" porque a faixa mostra no máximo 8 das cadastradas.
- As cores da faixa são **as do banco, não uma amostra decorativa**: só as
  ligadas a peça publicada, só as ativas, só as que têm hex, na ordem que a
  Raquel definir no painel. Desligar uma cor no admin tira ela da home.
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

### ✅ Etapa 14 — Página única *(pedido do Bruno)*

O site passou a ser **uma página só**, com duas exceções: `/produtos/[slug]`,
que são os links que a Raquel manda no WhatsApp, e **`/bolsas`**, o hub do
carro-chefe — a única página com texto longo escrito para ranquear. As
políticas seguem com URL própria porque precisam ser linkáveis de e-mail e de
recibo.

Viraram seção com âncora: catálogo filtrável, quem faz, cuidados, perguntas,
encomenda sob medida e contato.

- **O custo foi consciente e é de descoberta, não de conversão.** O sitemap caiu
  de 25 para 13 URLs e sumiu a cauda longa de `/categorias/[slug]`. O caminho de
  conversão fica intacto: as páginas de peça não mudaram. O tráfego dela vem do
  Instagram, então a troca se paga.
- **`/bolsas/[tipo]` ficou de pé.** Manter o hub pelo SEO do carro-chefe e
  jogar fora os sete endereços de cauda longa dele seria incoerente.
- **As rotas antigas redirecionam (308), não somem.** A Raquel já mandou
  `/perguntas-frequentes` por WhatsApp; link compartilhado virando 404 é
  confiança perdida. `/categorias/:slug` vira `/?categoria=:slug#catalogo`.
- **O filtro continua na URL**, agora como parâmetro da home. O preço é a home
  deixar de ser estática — ler `searchParams` torna a rota dinâmica. Vale:
  link filtrado é recurso de venda dela.
- **O texto do `/sobre` mudou de lugar, não sumiu.** É o conteúdo que constrói
  confiança, e segue editável pelo painel, renderizado abaixo da faixa verde.

`pnpm check:seo` cobre os redirecionamentos e a existência de cada âncora — um
redirecionamento apontando para uma âncora que não existe cai no vazio em
silêncio.

### ✅ Etapa 16 — A letra da Raquel no logotipo *(pedido do Bruno)*

Ela já tem um logotipo próprio, nas etiquetas de couro costuradas nas peças:
"Raquel Crochê" num script de assinatura. O nome no site estava em Karla caixa
alta — tipografia de sistema onde ela já tem letra.

**Primeiro tentei identificar a fonte, como o Bruno pediu.** Recortei "Raquel
Crochê" da arte dela, limiarizei e comparei contra **38 scripts conhecidos** do
Google Fonts (Sacramento, Allura, Alex Brush, Parisienne, Great Vibes, Corinthia,
Zeyada, Kristi, La Belle Aurore, Meddon…), renderizados lado a lado com a
referência. **Nenhum bate.** O traço é de caneta de assinatura — monolinear, com
borda irregular, `R` e `C` de barriga muito aberta e minúsculas pequenas quase
soltas —, provavelmente uma fonte comercial fora do Google Fonts. Numa assinatura
de marca, "parecido" é pior que idêntico: ficou o desenho dela.

**Vetorizadas as DUAS palavras**, em `src/components/brand/assinatura.tsx`.
A primeira tentativa fez só o "Raquel" e deixou "crochê" em Fraunces; o Bruno
reprovou na hora — *"não ficou igual, e crochê também usa a mesma fonte"*. Estava
certo: na arte dela as duas palavras são a mesma letra, e trocar uma só não
reproduz logotipo nenhum. Saindo do mesmo recorte, saem com a mesma escala e o
mesmo peso de traço.

Mesmo pipeline do símbolo: canal verde do JPEG, ampliação 8×, limiar em 195
**calibrado por cobertura de tinta** contra o original na resolução nativa (8,34%
contra 8,81%) em vez de chutado, contornos por marching squares com tolerância
1.0 — a 0.7 o arquivo dobra e a diferença some já a 120px de altura. 20,7 kB de
`path`, ~6 kB no gzip.

**O `viewBox` das duas cobre a altura inteira da marca (0–100), não a caixa de
cada palavra.** É o que faz o alinhamento sair sem número mágico: na mesma altura
CSS, as linhas de base coincidem sozinhas. Só o "com" precisa de conta, por ser
texto — e a margem é **dividida pelo corpo dele**, porque `em` numa margem
resolve contra a `font-size` do próprio elemento e não a do pai. Sem isso ele
sobe e vira expoente (aconteceu, e apareceu na prova visual).

**Terceira volta: é "Raquel Crochê", e o desenho anda junto com o nome.** Eu tinha
montado "Crochê com Raquel" numa linha, com "com" em Karla no meio. O Bruno cortou:
*"o certo é Raquel Crochê e precisa estar coligado o desenho com texto"*. Olhando a
arte inteira dela, o logotipo é empilhado — símbolo em cima, nome embaixo. Não era
para eu compor um logotipo novo; era para reproduzir o que ela já tem.

**Quarta volta, e a que valeu: hierarquia.** Reproduzido fielmente, o empilhado
continuava parecendo caseiro — *"ainda parece um pouco amador"* —, e ele deu a
direção: o desenho no meio de "Raquel Crochê". Eu montei seis direções (símbolo
entre as palavras em dois pesos, nome-herói com brasão, selo, casa de moda) e
comparei nos tamanhos reais. A escolhida foi **`Raquel · novelo · Crochê`, com
"FEITO À MÃO EM PETRÓPOLIS" embaixo**.

O diagnóstico do "amador" era de proporção, não de arranjo: no empilhado o símbolo
tinha **181% da altura do nome**. Uma ilustração cheia de detalhe nesse tamanho não
convive com um script fino — ela vence e o nome vira legenda. Deitado, o símbolo
deixa de competir e passa a costurar as duas palavras.

Três coisas vieram junto, e as três saíram de observação dele:

- **O tamanho se resolveu sozinho.** Deitado o logotipo cabe numa barra fina: a
  escrita sai a **54px** no cabeçalho contra 36px do empilhado — e o cabeçalho
  voltou aos 5/6,5rem originais. A forma vertical estava custando altura de página
  *e* entregando um nome menor.
- **Os dois fios.** O novelo já terminava numa ponta solta; ela agora vai até o `C`
  de Crochê, e um segundo fio sai do `l` de Raquel e entra no novelo. Lidos juntos
  são um fio só atravessando a marca. As pontas foram medidas na arte, não
  escolhidas no olho — e a do fio solto vem da própria vetorização do símbolo, então
  acompanha se o peso dele mudar. **O fio da direita custou três tentativas, e a
  causa não era o meu trajeto.** Descer-e-subir lia como nó (*"poderia fazer um
  trajeto mais simples"*); um arco só ainda tinha barriga (*"ainda está uma
  curva"*); e a reta ficou inorgânica. Foi o Bruno quem nomeou o problema: *"o
  problema era o S antes"* — o fio dela termina numa volta sobre si mesmo, e
  qualquer emenda depois dela lê como nó. **A volta saiu do símbolo.** O fio fica
  cortado no fim do trecho reto, ainda em movimento, e a continuação sai dali na
  tangente e sobe para o `C` numa curva só. É a única coisa removida do desenho
  dela — o resto foi só redistribuição de peso.
- **O peso do símbolo levou quatro rodadas de crítica dele, e o aprendizado é
  medível.** Na arte, símbolo e escrita têm a mesma caneta de 5px, mas ela desenhou
  o símbolo com 259px de altura e o nome com 143px: encolhido para caber ao lado das
  palavras, o traço dele cai para **49% do da escrita** e some. Engrossar até casar a
  espessura corrigiu isso — e criou o problema seguinte: *"agora está muito forte"*.

  **O alvo errado era a espessura; o certo é a mancha.** Símbolo é denso: muitos
  traços numa área pequena. Casando só a espessura, a mancha do símbolo foi parar em
  **2,61× a da escrita**. A referência estava na arte dela o tempo todo — ali a razão
  é **1,80**, justamente porque o símbolo é grande e os traços ficam espalhados.

  Ainda no caminho, duas correções dele: as **agulhas** ficam na borda da silhueta,
  então caíam junto com o contorno e levavam a dilatação cheia — retas e longas,
  espetavam o novelo; e os **coraçõezinhos** são figura cheia, não traço, então
  dilatá-los só fazia bolinha (*"os corações também, eles estavam bom"*).

  Calibrado contra as duas medidas ao mesmo tempo: contorno do coração +1,4px,
  agulhas e fio +0,4px, trama interna erodida, coraçõezinhos intocados. Dá traço de
  **5,00px** — exatamente o da escrita dela — com mancha em **1,88×**, o equilíbrio
  da própria arte. As fatias saem da geometria: uma abertura morfológica separa o
  miolo das saliências finas, e a distância até a borda do preenchimento separa
  contorno de trama.

  *Os coraçõezinhos ficaram.* Eu tinha proposto tirá-los do lockup — são o elemento
  que mais lê como artesanato caseiro — e ele pediu para manter. No peso certo eles
  param de brigar.

A assinatura de lugar usa `textLength` com `lengthAdjust="spacing"`: a entreletra é
calculada para a linha medir exatamente 72% da largura do logotipo, então a
justificação óptica é a mesma com a Karla carregada ou na fonte de reserva. Ela sai
na variante `linha` do cabeçalho, onde mediria 5px.

Conferido no cabeçalho a 1280 e 390px (topo e rolado), no rodapé invertido, no menu
do mobile, na entrada do painel e no `/estilo`, que foi reescrito. *De carona:* os
PNGs de `public/marca/` ainda mostravam o laço reprovado duas etapas antes —
regerados de `src/app/icon.svg`; e o rodapé repetia "feito à mão / Petrópolis", que
agora está na assinatura do logotipo.
### ✅ Etapa 17 — A batida do coração *(pedido do Bruno)*

O novelo bate como um coração no cabeçalho: duas batidas curtas seguidas e um
repouso longo. Pulso único e regular lê como respiração, não como batida; e numa
barra que fica na tela o tempo todo, ritmo rápido vira tique nervoso — daí o ciclo
de 3s, com 2,2s de descanso.

**A amplitude de 4,5% é geometria, não gosto.** Com a origem no centro do novelo, a
borda dele anda ~1,5 unidade do lockup no pico, e os dois fios que o ligam ao `l` e
ao `C` têm 3 de espessura: o deslocamento cabe dentro do próprio traço e a emenda
nunca abre. Conferido congelando a animação no pico (escala 1,045, medida no DOM) e
no repouso. Acima disso, o fio descola no auge da batida.

**Bate um por página** — só no cabeçalho. Dois logotipos batendo fora de sincronia
na mesma tela viram duas coisas disputando o olho; rodapé e entrada do painel ficam
parados. A prop é `batendo`, e o `/estilo` documenta a regra com um exemplo vivo.

*Detalhe de SVG que custaria um bug:* são **dois `g` aninhados**. O de fora carrega
o `transform` de atributo que posiciona o símbolo; o de dentro fica livre para a
animação. Em SVG2 a propriedade CSS `transform` **substitui** o atributo — num `g`
só, a batida jogaria o novelo para fora do lockup.

Acessibilidade sai de graça: o bloco global de `prefers-reduced-motion` do
`globals.css` já desliga a animação.
### ✅ Etapa 18 — Os defeitos de movimento *(auditoria + pedido do Bruno)*

O Bruno pediu um especialista em movimento para elevar a experiência. A auditoria
achou coisas melhores que ideias novas: **quatro defeitos reais, dois deles no ar**.
Esta etapa fecha só os defeitos; o acabamento (galeria da peça, card ao toque,
filtro com estado pendente) ficou para depois.

**1. O site saía do servidor invisível.** O `initial` do framer-motion vira `style`
inline já no SSR. A home era servida com **31 elementos em `opacity: 0`**, incluindo
o `<h1>` do hero — o candidato a LCP. Ele só aparecia depois de baixar, parsear e
hidratar o bundle: para quem vem do Instagram, em webview, é tela verde por tempo
que não precisa existir. Não era estética, era a métrica que decide quem volta para
o feed.

A entrada virou CSS (`@keyframes surgir`, classes `.surgir`/`.surgir-2..6`), e o
`Revelar` foi reescrito sem framer-motion: quem esconde é o CSS, e só onde há
script para desfazer. **Sem JavaScript o site inteiro continua legível** —
conferido com o JS desligado. Resultado medido: de 31 elementos invisíveis para
**zero**.

*Correção depois da Etapa 19:* a primeira versão perguntava "tem script?" com uma
classe `.js` posta na raiz por um `<script>` inline. Custava caro por dois
motivos, e o primeiro apareceu no console do Bruno: mexer no `className` do
`<html>` antes da hidratação faz o React acusar **mismatch de hidratação** a cada
navegação; e um script inline vira pedra no sapato no dia que entrar CSP. Quem
pergunta agora é o próprio CSS, com **`@media (scripting: enabled)`** — sem
script nenhum. Onde a consulta não existir, nada se aplica e o conteúdo aparece
inteiro sem animação, que é o lado certo para errar. Verificado: com JS a
consulta casa e 18 dos 23 blocos abaixo da dobra esperam escondidos; sem JS ela
não casa e **zero** ficam invisíveis.

De carona, o arco do hero ganhou o `clip-path` que a identidade especificou em §4.6
e nunca tinha recebido — a peça cresce de baixo para cima, como sendo tricotada. Ele
substitui o `scale: .96 → 1`, que reamostrava uma foto de 640×800 e borrava
justamente a textura do ponto.

*Pré-requisito que quase passou batido:* o bloco global de `prefers-reduced-motion`
zerava `animation-duration` mas **não** `animation-delay`. Com `fill: both`, quem
pede menos movimento ficaria olhando `opacity: 0` pelo tempo do atraso. Corrigido no
mesmo commit — sem isso a mudança **pioraria** a acessibilidade.

**2. O indicador do menu nunca funcionou.** O `layoutId` está no código desde a
Etapa 7, com comentário dizendo que é "o detalhe que separa 'tem indicador' de
'parece feito'". Mas `ativo()` comparava `caminho.startsWith(href)` e os itens
viraram âncoras na Etapa 14: `"/"` nunca começa com `"/#catalogo"`. **Na home nenhum
item ficava ativo e o traço nunca chegou a renderizar.** Quebrou em silêncio e
ninguém viu porque o defeito é a ausência de uma coisa.

Agora um `IntersectionObserver` com faixa fina no meio da tela (`-40%` em cima,
`-55%` embaixo) diz qual seção está sendo lida, e o traço desliza. Os filhos de
"Bolsas" são filtros (`/?categoria=…#catalogo`) e compartilham a âncora com
"Catálogo" — acendiam junto, e por isso links com `?` são excluídos.
Varredura da página inteira: Início → Catálogo → Sob medida, nas alturas certas.

**3. O grão passava por cima de tudo.** `z-index: 60`, acima do cabeçalho, da gaveta
e da **foto ampliada** — a cliente abria a peça para ver a textura do crochê e via
através de ruído. Foi para `z-index: 0`. Saiu junto o `mix-blend-mode: multiply`:
blend numa camada fixa de tela cheia obriga o compositor a remisturar a área inteira
a cada repintura embaixo. Comparado lado a lado, a diferença é de 1,4% na média — a
textura de papel se mantém, o verde escuro fica um respiro mais claro. Reversível
numa linha se a direção preferir o anterior.

**4. Dois desperdícios de cinco minutos.** O `<pre>` do briefing tinha
`key={mensagem}`: desmontava e remontava **a cada tecla digitada**, piscando de 0,4
para 1 — quem escrevia "Bolsa transversal" via o painel piscar dezoito vezes, e num
Android médio era um remount de nó de texto por keystroke. E o `backdrop-blur` do
cabeçalho ficava ligado 100% do tempo, inclusive antes de rolar, quando o fundo é
transparente e ele não produz efeito visível nenhum. O gatilho do cabeçalho também
ganhou histerese (desce a 32, sobe a 8): com limiar único, o rubber-band do iOS
oscilava em torno dele e o cabeçalho animava `height` — que é layout — em loop.

*O que a auditoria recomendou NÃO fazer, e eu concordo:* zoom na foto no hover (as
fotos têm marca-d'água; ampliar revela artefato, não ponto), View Transitions para
`/produtos/[slug]` (é a página que ela cola no WhatsApp, quase sempre a primeira da
visita), cascata nos cards do catálogo (a grade se montando na frente de quem está
comparando atrasa a tarefa real) e botão de WhatsApp pulsando.

*Regra de ritmo que ficou:* **um ciclo periódico por vez na tela, e ele é da marca.**
A batida do logotipo vale ~2px de amplitude; uma segunda animação ociosa teria de ser
menor que isso para não roubar atenção — e abaixo de 2px, num celular, não se vê
nada. Todo o resto tem de ser disparado por evento. Nenhuma mudança desta etapa
acrescenta um ciclo.

### ✅ Etapa 19 — A camada de encantamento *(pedido do Bruno)*

A Etapa 18 fechou os **defeitos**; esta é a parte que o Bruno pediu desde o começo
e que tinha ficado para depois: o site funcionar bem já estava feito, faltava
impressionar. Nenhum ciclo novo entrou na tela — a batida do logotipo continua
sendo o único movimento periódico do site, e tudo aqui é disparado por evento.

**1. As seções ganharam vocabulário de entrada.** Toda seção entrava com o mesmo
`Revelar` (fade + 24px): correto e sem caráter — o catálogo, a faixa verde e o
texto de leitura chegavam como se fossem a mesma coisa. Agora o `Revelar` tem um
`entrada` com cinco gestos, todos em `transform`/`opacity` e todos desenhados no
`globals.css`:

- **`ponto`** — cabeçalho de seção. Quem entra em cascata são os *filhos*
  (etiqueta → título → apoio), curto e preciso, três a quatro itens.
- **`grade`** — catálogo. **Só opacidade, sem deslocamento e sem cascata.** Quem
  chega ali está comparando peças; uma grade se montando na frente da pessoa
  atrasa a tarefa real. Mantém a recomendação da Etapa 18.
- **`trama` / `trama-inversa`** — seções verdes. O fio atravessa na horizontal, e
  as duas metades vêm de lados opostos: é o desenho que a `.trama` já faz no fundo
  daquelas seções, agora em movimento. As seções ganharam `overflow-x-clip` porque
  20px de deslocamento horizontal, sem corte, viram rolagem lateral no celular.
- **`texto`** — blocos de leitura. Assenta devagar e quase não se desloca.
- **`fio`** — o padrão de antes, para o resto.

De carona, a corrente da página de bolsas passou a se **costurar** da esquerda
para a direita ao entrar na tela (`clip-path` numa faixa de 12px): o ornamento da
marca fazendo o que ele representa.

**2. O card de peça responde ao toque.** Tinha só `transition-shadow`. Agora tem o
que a identidade §7.1 pede — subir 2px e ganhar `--shadow-peca` em 180ms — e, o que
importa mais, um `:active` que o afunda sob o dedo. **No celular o `hover:` do
Tailwind v4 nem chega a valer**: ele mora atrás de `@media (hover: hover)`,
confirmado no CSS gerado. Sem `:active`, o elemento mais repetido do site era o
único que não dava retorno nenhum a quem veio do Instagram. O estilo mora no `<a>`,
e não no `<article>`: o Safari do iPhone só aplica `:active` de forma confiável em
elemento clicável. **A foto continua sem zoom** — as fotos têm marca-d'água.

O mesmo `:active` foi para os controles que montam o pedido (seletor de opção,
seletor de cor, quantidade, todos os CTAs de WhatsApp) — é a identidade §7.3, que
especificava `translateY(1px)` no ativo e nunca tinha sido implementada.

**3. A página de produto.** A troca de miniatura era um corte seco (lê como erro de
carregamento) e virou crossfade de 350ms. A lupa abria e fechava sem transição
**e sem cuidado nenhum com o foco**: quem navega por teclado abria a foto e
continuava tabulando a página atrás dela, invisível; ao fechar, o foco voltava para
o começo do documento. Agora o foco entra no diálogo, o Tab fica preso lá dentro e
volta para o botão que abriu.

E o botão de WhatsApp **marca o instante em que o pedido fica completo**: antes o
`<button disabled>` virava `<a>` e a única mudança visível era o cinza sair. Agora
o botão assenta uma vez e um anel se abre em volta — 500ms, uma vez só, no próprio
botão. O anel é `::after` com `pointer-events: none`: nada pode atrapalhar este
clique. A linha de status passou a dizer "Tudo escolhido. É só mandar." pelo mesmo
`role="status"` que já anunciava o que faltava.

**4. O filtro de cor não tinha estado pendente.** `router.push` sem `useTransition`:
a pessoa tocava numa bolinha e **nada acontecia** até o servidor responder — em 4G,
meio segundo achando que o toque não pegou, e o segundo toque cancelando o primeiro.
A correção que importa é otimista: o anel de selecionado vai para a cor tocada na
hora, porque é estado local; a URL confirma depois. Junto veio um "filtrando…" —
sem laço e sem girar, que seria um ciclo. O `<details>` das perguntas passou a abrir
em altura animada (`::details-content` + `interpolate-size: allow-keywords`); onde o
navegador não tiver a regra, abre seco como sempre abriu, e a resposta continua no
HTML para o FAQPage.

**5. Os tokens de movimento viraram um lugar só.** `[0.22, 1, 0.36, 1]` estava
copiado literal em oito arquivos e o `--ease-fio` do CSS — a mesma curva — não era
usado por nenhum JS: duas fontes da verdade para uma decisão só. Agora
`src/lib/movimento.ts` exporta `FIO`, `DURACAO` (nomes de intenção, não de número) e
`transicao(duracao, semMovimento)`, que já embute o `prefers-reduced-motion` — que
em JS não chega sozinho, porque o `motion` anima por `requestAnimationFrame` e passa
por fora do bloco global do CSS.

*Conferido, e não só escrito:* o HTML continua saindo pintado (`opacity:0` inline =
**0** na home, na página de peça e na página filtrada); nada fica invisível depois
de revelado, em celular, desktop e com `prefers-reduced-motion: reduce`; não há
rolagem lateral a 390px; a resposta da pergunta abre passando por alturas
intermediárias; o foco entra, fica e volta na lupa; o anel do botão de pedido
aparece na virada e some sozinho, sem virar laço.

*O que continua fora, de propósito:* zoom na foto, View Transitions entre rotas,
cascata na grade do catálogo, qualquer laço decorativo e paralaxe além da curta que
o hero já tem.

### ✅ Etapa 20 — O ritmo da página *(pedido do Bruno)*

O diagnóstico dele, na íntegra: *"seção história e cuidados não têm separação"*.
Estava certo, e o problema era maior do que duas seções — **da história até as
perguntas a home era uma parede de creme**: mesmo fundo, mesma largura de texto,
mesmo cabeçalho, três assuntos diferentes lidos como um só. O sistema de
espaçamento já previa isso na §5.2 ("duas seções adjacentes com o mesmo fundo
somam padding e o olho lê uma seção só"); ninguém tinha aplicado.

**1. A sequência ganhou pulso, e não listras.** Da faixa verde de "quem faz" em
diante o fundo alterna, mas com **três superfícies**, não duas:

| Seção | Superfície | Por quê |
|---|---|---|
| Quem faz (faixa) | Verde Fundo + `trama` | como já era |
| A história | **Cru Fundo**, sangrando | terceira cor de papel da paleta — separa das duas faixas verdes que a cercam sem acrescentar uma quarta faixa verde |
| Cuidados | **Verde Fundo** + `trama` + `luz-de-janela` | o pedido do Bruno |
| Perguntas | Fio Cru | volta ao papel padrão |
| Encomendas | Verde Fundo + `trama` | como já era |
| Contato | Fio Cru | fecho |

A escolha de não deixar a história verde é deliberada: com quatro faixas verdes
seguidas a `.trama` deixa de significar "seção verde" e vira papel de parede.
Cru Fundo é o mesmo recurso que a hub `/bolsas` já usava no texto longo dela.

Junto, o padding das faixas invertidas subiu para `secao--ampla`, que é o que a
§3.3 manda desde sempre ("superfície escura comprime opticamente") e que nunca
tinha sido aplicado em "quem faz" nem em "encomendas".

**2. Cuidados: verde com luz, e o texto virou grade.** A classe `.luz-de-janela`
(nova, exclusiva desta faixa) é uma única mancha clara no alto à esquerda,
resolvida em um `radial-gradient` sem repetição. Não é uma segunda textura —
duas texturas somadas viram ruído; é a **luz** que a direção de fotografia da
marca (§5.2 da identidade) já manda entrar lateral, a 45°. O pico é ~8,5% de Fio
Cru, o mesmo salto que existe entre Verde Fundo e Verde Cristal: a faixa não
ganha cor nova. E a emenda entre o claro e o escuro é uma `corrente`, que se
costura da esquerda para a direita quando a seção entra.

O corpo deixou de ser coluna corrida: cada `## ` do texto do painel virou uma
**ficha** de uma grade de duas colunas, com fio no alto. Instrução de cuidado é
consultada, não lida de cabo a rabo — a cliente quer achar "secagem" de relance,
com a peça molhada na mão. A faixa escura encolheu ~40% de altura de quebra.
`agruparPorSubtitulo` mora no `texto-longo.tsx`, ao lado do resto do markdown
mínimo, e se a Raquel apagar os subtítulos a seção volta a ser a coluna de
sempre.

**3. Quatro geometrias seguidas, nenhuma repetida.** História: título pendurado
na margem esquerda, preso pelo `sticky` enquanto o texto corre. Cuidados:
cabeçalho **centrado** — o único centrado do site — e grade embaixo. Perguntas:
duas colunas assimétricas, com o cartão "ficou com outra dúvida?" subindo para a
calha da esquerda (a ordem no DOM continua cabeçalho → perguntas → cartão, que é
a ordem certa de leitura; só o posicionamento muda a partir de `lg`). Contato:
convite em linha cheia com o botão na ponta direita, e os três fatos viraram uma
**fita de três colunas** com fio no alto.

**4. A régua do fio — o único movimento preso à rolagem.** Uma linha de 1px na
calha da história que se preenche conforme a pessoa desce: o fio sendo puxado
enquanto ela lê. É CSS puro (`animation-timeline: view()`), sem listener e sem
observador, animando só `transform: scaleY` de uma faixa de 1px. A faixa é
`cover 15% → 85%`: `contain` seria mais elegante e é inútil aqui, porque o texto
mede 944px numa tela de 900px e o fio saltaria de vazio a cheio num quadro
(medido). **O estado sem animação é o estado cheio** — fora do `@supports`, e
para quem pediu menos movimento, sobra uma régua inteira, que é um ornamento
legítimo. Nenhum gesto de entrada novo entrou: o vocabulário da Etapa 19 deu
conta.

**5. `pnpm check:classes` (novo), e o bug que ele achou no primeiro minuto.**
`.secao--ampla` e `.secao--densa` têm **dois** traços; escritas com um só, não
são classe nenhuma e a seção roda sem padding vertical, em silêncio. Estava
acontecendo: `secao-densa` em `(site)/page.tsx` (duas vezes) e em
`(site)/bolsas/page.tsx` — as faixas "Que bolsa você procura?", "Além das
bolsas" e "Todas as bolsas" estavam com padding zero desde que foram escritas.
O check tem duas passagens: a primeira reprova todo token que começa com uma
classe do `globals.css` sem ser ela; a segunda, depois de `pnpm build`, compara
cada classe com os seletores realmente presentes no CSS de produção — é o que
pega `bg-inv-fundoo` e companhia. Sem build, ela avisa e se cala.

*Conferido, e não só escrito:* `opacity:0` inline = **0** na home, na hub e na
página de peça; rolagem lateral = **0** a 320px, 390px, 820px e 1280px; a régua
mede scaleY 0 → 0,16 → 0,52 → 0,88 → 1 ao longo da rolagem e `none` com
`prefers-reduced-motion: reduce`; `pnpm lint`, `build`, `check:espaco`,
`check:classes`, `check:whatsapp`, `check:produto`, `check:telas` e `check:seo`
passando.

*O que ficou de fora, de propósito:* numeração de seção (a identidade §7.4
reserva o marcador numerado ao "como encomendar" da página de produto, e só a
ele); uma quarta faixa verde; segunda textura de fundo; e divisória entre as
seções creme do topo (destaques → tipos → catálogo), que continuam sem fio entre
elas — vale uma `corrente` acima do "Catálogo" numa próxima passada.
### ✅ Etapa 22 — Cadastro de vitrine *(pedido do Bruno)*

*"Está muito complicado, reduza os campos para ela criar. É o primeiro site dela,
não vamos vender por ele, é uma vitrine. Detalhes do produto ela vai esclarecer no
atendimento."*

O formulário de peça tinha **dezoito campos** e tinha sido desenhado para loja.
Ficaram **oito**: nome, fotos, descrição, preço, categoria, tipo, destaque e
situação.

Saíram medidas, material, o que cabe dentro, cuidados, prazo mínimo e máximo, e as
duas ordens. **As colunas continuam no banco de propósito:** as peças já cadastradas
guardam o que têm, a página da peça mostra cada bloco só quando ele existe, e o dia
que fizer sentido pedir isso de volta o dado não precisa ser reconstruído.

**Os grupos de opção saíram inteiros** — Cor, Tamanho, Alça, Forro, Fecho,
Personalização. Foi decisão dele, tomada com as consequências na mesa: sai o filtro
por cor do catálogo, saem as bolinhas do hero e da arte de compartilhamento, e a
mensagem do WhatsApp deixa de vir com a escolha pré-preenchida. No lugar delas, uma
linha na página da peça: *"Cor, tamanho e acabamento a Raquel combina com você na
conversa."*

O painel caiu para **duas telas**: Início e Peças. "Cores e opções" perdeu a razão
de existir e `/admin/opcoes` responde 404 — o que a verificação de telas agora exige.

**Duas armadilhas que a remoção abriu, e as duas já tinham mordido este projeto:**

1. **Campo fora do formulário mas dentro do schema.** `position` tinha `.catch(0)`:
   salvar uma peça mandaria a ordem dela para zero em silêncio. É o mesmo defeito
   que apareceu nas categorias na Etapa 15. Os campos saíram do schema junto.
2. **`deleteMany` com `notIn: []`.** Sem grupos no formulário a lista chega vazia, e
   `notIn` de lista vazia casa com **tudo** — salvar qualquer peça apagaria os grupos
   dela. O bloco inteiro saiu, então os dados ficam intactos em vez de sumirem por
   acidente.

A ordem do destaque, que ela não preenche mais, passou a ser decidida no código:
peça marcada que ainda não tinha lugar entra no fim da fila. Não dá para deixar em
nulo — a home ordena por `featuredPosition asc` e no Postgres **nulo vem por
último**, então a recém-marcada cairia fora das oito que a home mostra.

*Detalhe que evitou um vazamento:* o marcador `{opcoes}` continua na lista de
substituições do `whatsapp.ts`, sempre vazio. Os modelos de mensagem já gravados no
banco escrevem esse marcador; tirá-lo da lista faria o texto literal `{opcoes}`
chegar no WhatsApp da cliente.

*Schema do Prisma e migrações intocados:* as tabelas de opção ficam onde estão, com
os dados dentro. Apagar isso é decisão do Bruno, não consequência automática.
### ✅ Etapa 23 — Sai o "Tipo", saem as páginas de tipo *(pedido do Bruno)*

Duas remoções pedidas juntas, e a primeira tinha uma consequência que valia
levantar antes: era a subcategoria que alimentava `/bolsas/transversal`,
`/bolsas/ombro-tote` e o submenu "Bolsas ▾".

**Sem quem alimente, lista vira mentira aos poucos** — bolsa nova nunca apareceria
lá. Com isso na mesa ele escolheu **aposentar as páginas de tipo**, e não deixá-las
apodrecendo. Ficou `/bolsas` como hub único, com todas.

O que saiu: o campo `Tipo` do cadastro, a rota `/bolsas/[tipo]`, o submenu do
cabeçalho, a seção "Que bolsa você procura?" da home, a lista de tipos dentro do
hub e as URLs de tipo do sitemap.

**As URLs antigas redirecionam (308) para `/bolsas`, não somem.** Já foram
compartilhadas, e link que vira 404 é confiança perdida — mesma regra da Etapa 14.
Conferido nos três tipos.

**E saiu a cobrança por mais de uma foto.** A marcação "alguém usando a peça" e o
aviso *"falta uma foto com alguém usando a bolsa"* eram uma boa ideia de catálogo e
uma má ideia de vitrine: cobravam da Raquel um trabalho de produção fotográfica que
ela não vai fazer para cada peça. A dica agora diz o contrário — *"uma foto já basta
para a peça ir ao ar"*. A coluna `hasHumanScale` fica no banco; o site nunca a
renderizou de forma diferente, era pressão só de painel.

O cadastro fechou em **sete campos**: nome, fotos, descrição, preço, categoria,
destaque e situação.
### ✅ Etapa 24 — Cadastro numa tela só *(pedido do Bruno)*

*"Está ruim a criação em duas etapas. Coloque tudo no primeiro formulário e, quando
fizer o upload das fotos, mostre o preview antes de salvar. Criar o produto ficou
simples, não precisamos ter duas etapas — estamos apenas dificultando o processo.
Lembre UX sempre."*

As duas etapas existiam por um motivo que deixou de valer: o cadastro tinha dezoito
campos, e criar primeiro era uma forma de não assustar. Com sete, dividir só fazia a
peça parecer inacabada — dois formulários, duas confirmações.

Agora é uma submissão: nome, categoria, descrição, preço, fotos com prévia, destaque
e situação. Ao fim volta para a **lista**, e não para uma segunda tela — ir para
outro formulário era justamente o que dava a sensação de que faltava algo.

Duas travas são conferidas **antes** de criar qualquer coisa: para nascer no ar, a
peça precisa de foto e de descrição. Página publicada sem foto é pior que peça que
ainda não estreou, e recusar depois de criar deixaria peça pela metade no banco.

**Dois defeitos de UX que só apareceram por causa disto, e valiam por si:**

1. **O formulário se apagava depois de um aviso.** O React 19 limpa os campos quando
   uma ação passada em `<form action>` termina — inclusive em erro. Ela digitava
   tudo, esbarrava numa regra e recebia o formulário **vazio** com o aviso em cima.
   Perder o que se escreveu por causa de um aviso é o tipo de coisa que faz alguém
   desistir do painel.
2. **Controlar os campos não bastou.** O reset mexe no DOM, e num `<select>` cujo
   valor de estado não mudou o React não reescreve o elemento: nome, descrição e
   preço voltavam, mas categoria e situação continuavam em branco — o pior dos
   mundos, porque o formulário *parecia* preenchido. A correção foi enviar por
   `onSubmit` com `preventDefault`, que não dispara reset nenhum.

O mesmo conserto foi aplicado à tela de edição, que tinha o defeito idêntico: editar
um preço, esbarrar num aviso e ver os campos voltarem ao que estava salvo.

A verificação do painel foi reescrita para o fluxo novo e ganhou asserções: que a
recusa acontece **sem criar nada pela metade**, que a prévia aparece antes de salvar,
e que a peça nasce no ar numa submissão só.
### ✅ Etapa 25 — Sob medida em um campo *(pedido do Bruno)*

*"Se o cliente tiver muitos campos para preencher, ele posterga. Então simplifique,
que na conversa a Raquel esclarece todas as dúvidas."*

O briefing tinha cinco campos — peça, cores, medidas, prazo, detalhes. Cada um era
uma pergunta razoável; juntos viravam um formulário. Quem chega com vontade de
encomendar bate numa lista de perguntas e adia, e do outro lado a conversa ia
acontecer de qualquer jeito.

**Ficou um campo:** *"O que você tem em mente?"*, com um `placeholder` de exemplo.

A orientação não sumiu, mudou de lugar: o que era rótulo de campo virou exemplo no
texto de apoio e no `placeholder`. Cinco caixas vazias cobram; uma frase de exemplo
convida. Quem quiser detalhar tem por onde começar, quem só quer perguntar escreve
uma linha e manda.

`montarMensagemDeEncomenda` deixou de montar ficha ("Peça: … / Cores: …") e passou a
concatenar a saudação com o texto livre. **A mensagem nunca sai vazia** — sem uma
palavra digitada, a Raquel ainda recebe uma saudação que diz do que se trata, e isso
virou asserção no `check:whatsapp`.

*De carona, um defeito de acessibilidade que a captura revelou:* o rótulo e os dois
parágrafos de apoio usavam as cores do tema **claro** dentro da faixa verde —
**2,15:1** de contraste, abaixo do mínimo de 4,5:1 e na prática ilegíveis. O rótulo
passava batido porque herda a cor invertida da seção; os parágrafos não herdavam
nada. Com `text-inv-suave` foram para **9,01:1**. Valia desde que a seção virou
verde, e só apareceu porque desta vez eu medi em vez de olhar.
### ✅ Etapa 26 — Três defeitos que uma captura revelou

O Bruno abriu o link `/#encomendas` que eu mandei e achou três coisas de uma vez.

**1. O texto digitado era invisível: 1,08:1.** O campo tem fundo claro mas mora na
faixa verde, então herdava a cor invertida — creme sobre creme. Ela escrevia e não
via o que escreveu. Fundo próprio pede cor própria: com `text-conteudo`, foi para
**15,57:1**. É o mesmo defeito de herança que apareceu na etapa anterior no texto de
apoio, agora no lugar que mais importa.

**2. A âncora não chegava.** Abrir `/#encomendas` parava a **182px** de uma seção
que fica a **8.300px**. A causa é o `scroll-behavior: smooth` do `globals.css`: ao
abrir a URL o navegador começa uma rolagem suave de milhares de pixels, e qualquer
coisa que mexa na rolagem no caminho a interrompe. Medido lado a lado — com `smooth`
para em 182, com `auto` (o que acontece sob `prefers-reduced-motion`) chega certinho.

Tirar o `smooth` resolveria e custaria o deslizar dos cliques de menu. Então a
chegada por âncora virou `AncoraNaAbertura`: um efeito que salta **instantâneo** ao
montar. A primeira tentativa pedia `behavior: "auto"` só no salto e ainda falhava em
duas das seis seções — porque a rolagem suave que o navegador já iniciou continua
correndo por baixo e briga. Zerar `scroll-behavior` no `html` antes do salto cancela
a que estava em curso; o valor volta no quadro seguinte.

E virou verificação: o `check:seo` agora **abre cada uma das seis URLs com âncora e
mede onde a página parou**. Só conferir que a seção existe no HTML nunca pegaria
isso — ela estava lá o tempo todo. Testado nos dois sentidos: com o conserto
desligado, as seis reprovam.

**3. A prévia da mensagem saiu.** Ela existia quando o briefing tinha cinco campos e
montava uma ficha; com um campo de texto livre, ela só repetia o que a pessoa acabou
de escrever, ao lado do próprio campo. Repetir não informa: ocupa.
### ✅ Etapa 27 — "Ativo/Desativado", botões de compartilhar, e a limpeza de um vacilo meu

**1. "No ar / Fora do ar" virou "Ativo / Desativado"**, e a peça **nasce ativa**.
Quem entra em "Nova peça" está cadastrando algo para aparecer no site; obrigar um
clique a mais no caso comum é atrito sem contrapartida. Desativado continua a um
clique para quem quer deixar pronto e publicar depois. O vocabulário foi trocado em
todos os lugares — criação, edição, lista, painel inicial e as mensagens de erro —,
porque metade em cada língua é pior que qualquer das duas. E virou asserção: o
`check:painel` reprova se alguém mudar o padrão, antes de ela cadastrar dez peças
que não apareceram.

**2. Compartilhar ganhou botões.** Era um link sublinhado que no celular abria o menu
nativo e no desktop copiava — funcionava e não parecia nada. Agora são **WhatsApp**,
**Copiar para o Instagram** e um "copiar link" discreto.

*O Instagram merece nota:* ele **não aceita link pré-preenchido pela web**. Não existe
URL de compartilhamento equivalente à do WhatsApp, e nenhum truque de `intent://`
funciona no navegador. O botão faz o que dá para fazer de verdade — copia o link e
abre o Instagram para ela colar no story ou na direct — e o rótulo diz exatamente
isso. Prometer "compartilhar no Instagram" e entregar uma aba aberta seria mentir
para quem usa.

De carona, a mensagem do WhatsApp deixou de levar o sufixo da marca: era
"Bolsa Transversal Caramelo · Crochê com Raquel" antes do link, e o sufixo serve ao
`<title>` da aba, não a uma mensagem que a própria Raquel manda.

**3. Limpei dez peças de teste do banco — quatro delas estavam NO AR.** Foram criadas
por mim validando os fluxos de cadastro contra o banco de produção, e eu não limpei
atrás. Elas apareciam no catálogo e no "Combina com" das peças reais. O catálogo
voltou às 7 peças de verdade, e as fotos saíram do Blob junto.

*Fica a lição registrada:* validar fluxo de escrita contra o banco de produção exige
limpar na mesma passada. O `check:painel` faz isso sozinho (tem um `limpar()` no
`finally`); os testes que eu escrevo à mão no meio de uma conversa, não.

### ✅ Etapa 28 — A faixa, o cabeçalho e a escada de cantos *(pedido do Bruno)*

Primeira rodada de revisão local — ele está usando a página e passando as correções.
**Nada foi para o ar:** commit sim, push só quando ele pedir.

**1. O branco na borracha da rolagem.** Puxando a home para cima, aparecia fundo
branco atrás do topo. Não é o `body` — é o elemento raiz, cuja cor de fundo é a que
o navegador propaga para a *canvas*, inclusive a área de `overscroll`. Um
`html { background-color: var(--color-verde-fundo) }` resolve.

**2. A faixa de aviso.** Ela estava correta e sem mão nenhuma. Agora a faixa inteira
é o link para `/#encomendas`, traz o símbolo da marca, o fundo tem `.trama` com
`luz-de-janela`, o fecho é "Me conte →" com a seta deslizando no hover, e uma
`.corrente` fecha a base. É a primeira coisa que a pessoa vê; valia parecer feita.

**3. O cabeçalho.** Ele pediu que continuasse limpo — ele separa a faixa do hero — mas
com hover de gente grande e alguma profundidade. A superfície virou uma camada
própria com gradiente e um fio branco interno, animada por opacidade conforme a
rolagem (medido: 0 no topo, 1 rolado). Os itens de menu ganharam uma linha-fantasma
que se desenha do centro no hover (medido: `scale-x` 0 → 1, 73px). E o botão do
Instagram largou o quadrado bege-quente por um `.botao-de-icone` circular com 8% do
verde da marca — o rosa que ele apontou vinha de herdar a cor da marca do Instagram,
que não é cor desta casa.

**4. A escada de cantos, que tinha uma voz a mais.** Ele perguntou se card
arredondado com botão pontiagudo era erro de design. Não é — imagem expressiva com
controle contido é sistema legítimo. O problema era outro: `--radius-fio` valia
**2px**, e 2px é um valor indeciso. Não é 0, que leria como reto de propósito, nem 6,
que conversa com o card; no tamanho de um botão ninguém lê 2px como escolha, lê como
arredondamento pela metade. E o degrau aparecia toda vez que um botão de 2px morava
dentro de um card de 6px. Ele escolheu **6px para tudo**: controle e superfície agora
falam a mesma língua, e o 999px do arco fica sendo o único gesto expressivo — que é o
que faz o arco significar alguma coisa.

*Correção minha no caminho:* eu havia apontado uma inconsistência entre o CTA de
WhatsApp do cabeçalho (2px) e o flutuante (999px). Falei sem conferir — a variante
pílula só existe na página `/estilo`. Não havia inconsistência no site.

**5. As curvas do cabeçalho, que eram quatro.** Um levantamento mostrou `0.18s` da
marca convivendo com `0.15s` e com a curva padrão do Tailwind em sete hovers que
usavam `transition-colors` pelado. Tudo unificado em 180ms na `--ease-fio` (os dois
`200ms` que sobraram são gestos de desenho — a seta e a linha-fantasma —, mais lentos
de propósito que uma troca de cor).

Verificado: `build`, `lint`, `check:classes` (372 classes), `check:espaco`,
`check:whatsapp`, `check:seo` (as 6 âncoras chegando) e `check:produto`.

### ✅ Etapa 29 — O convite da faixa *(pedido do Bruno)*

Ele olhou a faixa que acabou de nascer e achou três coisas, todas certas.

**1. A seta apontava para o botão de fechar.** "Me conte →" tinha a seta à direita,
encostada no ✕. Seta aponta — e essa apontava para sair da faixa, de modo que o
convite lia como se o destino fosse fechá-la. O ícone foi para a **esquerda**, onde
não aponta para nada.

**2. E virou balão de fala.** A seta significa "vai para algum lugar"; o que se quer
prometer aqui é conversa — contar o que se tem em mente. O balão diz isso, e diz
sem prometer WhatsApp, que seria mentira: a faixa leva para a seção de encomenda,
não para o aplicativo.

**3. "Me conte" não parecia clicável.** Era texto pelado com sublinhado que só
aparecia no hover — quem não passa o mouse nunca descobria que ali havia uma porta.
Ganhou contorno, fundo e respiro. Um fio vertical separa o botão do ✕: agora que
"Me conte" tem forma, os dois encostados leriam como controles irmãos, e fechar o
aviso não é irmão de encomendar.

**4. O respiro abaixo do botão, que o padding não explicava.** Ele apontou que
faltava ar embaixo, e o padding era simétrico — 14px em cima, 14 embaixo. O culpado
era a `corrente` do rodapé: 12px de altura, absoluta DENTRO desse padding, deixando
**2px** entre o botão e os festões. *O que a pessoa enxerga como respiro é a
distância até a decoração, não até a borda do elemento* — quando há um ornamento
posicionado por cima, o padding simétrico mente. O respiro de baixo virou `pb-5`,
dando à corrente espaço próprio: 14px de ar em cima, 12px até ela embaixo.

Verificado: `build`, `lint`, `check:classes` (377), `check:espaco`, `check:whatsapp`
e `check:seo`.

### ✅ Etapa 30 — O cabeçalho ganha mão *(pedido do Bruno)*

**1. O hover do Instagram não se via — e o problema não era o que parecia.** Medi o
lavado de 8% do verde contra o creme: **ΔE 5,5**, que em teoria é diferença que se lê
sem esforço. Subir a opacidade seria tratar o sintoma errado. O que falta num alvo de
36px quase todo ocupado pelo ícone é **aresta**: um tom sem borda, em área pequena,
não dá ao olho onde pegar. Entrou um anel de 1px a 22% junto com o lavado (agora 11%),
e o alvo passou a existir.

*Lição que vale além daqui:* quando um estado não é percebido, medir o contraste
responde só metade. A outra metade é se a forma tem contorno.

**2. Os hovers ficaram mais lentos.** Ele pediu para suavizar. Os do cabeçalho foram
de 180ms para **240ms**, e a costura que se desenha no hover do menu, para **320ms** —
tinta que espalha, não interruptor que estala. A curva continua a `--ease-fio`.

*Corrigi um defeito meu da etapa 28 no caminho:* o `LinkDeMenu` estava com
`duration-[180ms] ease-fio` **duplicado** — meu `sed` daquela rodada somou a curva a
uma classe que já a tinha.

**3. O plus de design: o indicador virou ponto corrido.** Era um fio liso de 1px —
correto e mudo. Agora é uma **costura à mão** (`.ponto-corrido`, um
`repeating-linear-gradient` de 3px cheio, 3px vazio, 2px de altura): o menu passa a
dizer de que ofício é este site, e custa um pixel a mais de altura. O hover usa o
mesmo desenho, apagado, então o item inativo mostra de antemão a costura que vai
receber — o traço goiaba continua deslizando entre os itens com `layoutId`.

**4. E um fio separa navegar de agir.** O ícone do Instagram flutuava entre "Sob
medida" e o botão verde sem pertencer a nenhum grupo. Uma divisória de 1px resolve —
mesma solução da faixa acima, e só aparece quando o menu aparece: sem ele não há dois
grupos a separar.

Verificado: `build`, `lint`, `check:classes` (382), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`, e o indicador acompanhando a rolagem (Início → Catálogo
→ Sob medida).

### ✅ Etapa 31 — O chão do cabeçalho e o botão que responde *(pedido do Bruno)*

**1. Um degradê que dá chão ao cabeçalho.** Entrou como camada própria
(`.brilho-cabecalho`), e o que a separa da `.superficie-cabecalho` é o tempo: aquela
é a superfície opaca que chega com a rolagem, esta é um véu de cor que existe **desde
o topo**. São duas manchas radiais fraquíssimas — o verde da marca atrás do logotipo,
a goiaba atrás dos botões —, de modo que o creme ganha uma deriva de temperatura de um
canto ao outro em vez de ser um bloco chapado.

Ela fica **por cima** da superfície de propósito: assim o mesmo véu tinge tanto o creme
da página, antes de rolar, quanto o papel da superfície, depois — e o cabeçalho não
troca de caráter no meio do percurso.

*Medido no pixel:* ΔE **4,57** da esquerda para a direita, com ~2,5 entre pontos
vizinhos. É a faixa certa: 2,3 é a "diferença apenas notável", então a deriva se
percebe atravessando a largura sem que nenhum trecho isolado leia como cor. As
porcentagens são de um dígito porque o cabeçalho precisa continuar sendo o lugar mais
quieto da tela.

**2. O botão primário deixou de ser um retângulo chapado.** Ele pediu pelo "Falar com
a Raquel", mas aquele botão *é* um primário — tratá-lo sozinho criaria dois desenhos
para o mesmo papel. A mudança entrou em `.botao-primario` e vale para os três do site.

Ganhou um brilho fixo no topo, que é o que faz uma superfície parecer superfície e não
recorte. Ele é **estático de propósito**: `background-image` não interpola, então quem
anima é a cor por baixo — animar o degradê daria um salto no meio da transição. E o
hover deixou de ser só troca de cor: o botão sobe um pixel e ganha a sombra verde da
marca.

*Detalhe que caiu bem:* o `active:translate-y-px` do Tailwind v4 escreve em
`translate`, propriedade **separada** de `transform`. Como o hover usa `transform`, o
clique soma +1px sobre o −1px e o botão volta ao lugar ao ser pressionado, sem
nenhuma conta a fazer.

*Armadilha de camada, registrada:* utilitário vence camada de componente. Manter
`bg-primaria` na variante apagaria a cor e o brilho de `.botao-primario`, então a
variante passou a só nomear a classe. Pelo mesmo motivo, a transição mora no `base` do
`classesDeBotao` (agora com `box-shadow` na lista e 240ms), não na classe de
componente — senão o utilitário a sobrescreveria.

Verificado: `build`, `lint`, `check:classes` (385), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`, e os três botões primários do site com o brilho aplicado.

### ✅ Etapa 32 — A cor do site: medir antes de opinar *(pergunta do Bruno)*

Ele perguntou se o site ser tão monocromático é erro de UI inexperiente ou estratégia,
e se valia adicionar uma cor de contraste. Antes de responder, medi a home inteira
(9.944px) classificando cada pixel por família de matiz.

**O argumento a favor da casca neutra é dele, e é o mais forte:** o site vai ter muita
foto, e a casca não pode brigar com elas. As peças da Raquel são caramelo, bordô,
terracota, marrom — **todas quentes**. Hoje o quente da página *são as fotos*, e não
disputam com nada porque não existe segundo quente na tela. Uma cor de contraste na
interface brigaria com cada foto do catálogo, e brigaria pior justamente nas peças mais
saturadas, que são as melhores. Não é monocromia por omissão: é a decisão certa.

**Mas a medição achou um defeito real, e não é "falta cor".** O acento da marca tinha
**um papel só** — "link" —, que é o papel de MENOR área possível numa tela: letra fina
sublinhada. Uma paleta que declara um acento e o deixa só ali não está contida, está
sub-utilizada. E os três degraus de creme já existiam como token: `papel`, `cru`,
`cru-fundo`. O sistema estava desenhado e não aplicado.

**O que entrou.** O acento ganhou um segundo papel, disciplinado: a `<Etiqueta>` — o
eyebrow que abre cada seção. Aparece uma vez por seção, sempre dizendo a mesma coisa
("aqui começa um assunto"), nunca em área grande. Com um tracinho de `ponto-corrido`
antes do texto, o mesmo desenho de costura que marca "onde você está" no menu. E duas
das três seções claras seguidas passaram para o creme de baixo — degrau de tom, não de
matiz.

*Contraste conferido no ar, nas oito etiquetas:* 5,17 a 6,65:1, todas passando. O tom
de texto é o `goiaba-tinta` e não a goiaba pura — medido, a goiaba dá 4,25:1 sobre o
creme e reprovaria; no lado invertido quem passa é o rosa-fio, com 6,65:1.

**Onde eu errei a métrica, e fica registrado.** Ao propor o caminho eu prometi levar a
goiaba "de 0,04% para 0,3–0,8% da tela". Medido depois: **0,02% antes e 0,02% depois**
— não se moveu. O motivo é que texto fino é quase todo pixel anti-serrilhado, que perde
croma e não conta como cor em nenhuma medição de área. *Área nunca foi a métrica certa
para isto.* A que serve é a variação ENTRE seções, e essa foi de **9 para 11** trocas de
fundo ao longo da página. A pontuação por seção se vê na tela; no histograma, não.

Verificado: `build`, `lint`, `check:classes` (386), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`.

*De carona:* o botão de `perguntas.tsx` era um primário escrito à mão que a etapa 31
não alcançou — ainda estava em `duration-150` com a cor antiga. Passou a usar
`.botao-primario`.

### ✅ Etapa 33 — As bolas do cabeçalho *(pedido do Bruno)*

O véu da etapa 31 ficou sutil demais para o gosto dele. Ele pediu para **manter** o
véu e somar uma **forma** — "uma bola".

**Por que `circle <raio>` e não porcentagem.** Raio em porcentagem faz o degradê
esticar junto com a caixa, e numa caixa de 1280 × 104 isso vira faixa, não bola. Com
raio fixo a forma continua redonda; o raio fica abaixo da altura do cabeçalho (104px
no topo, 80 rolado) para a bola caber inteira.

**Elas moram nas margens porque o meio é do texto.** Mapeei onde cada coisa fica:
logo 8–27%, menu 33–66%, Instagram 73–76%, botão verde 76–93%. A bola da esquerda, em
9%, cai atrás do logotipo — que é linha, então ela aparece ATRAVÉS do desenho, e é o
melhor lugar da faixa para ela.

*A da direita eu pus errado primeiro.* Em 91% ela ficava quase toda debaixo do botão
verde, que é opaco: ΔE **4,7**, invisível. Só medindo a posição dos elementos ficou
claro o porquê. Em 97% ela sobra para fora do botão e lê como luz entrando pela quina.

**As duas são verdes, por escolha dele** — a primeira era goiaba. A da direita ficou
mais fraca de propósito: o verde é bem mais escuro que a goiaba, e as duas no mesmo
percentual dariam dois pesos iguais em lados opostos, o que lê como simetria e não como
luz. Uma manda, a outra responde.

*Medido:* ΔE **10,3** na esquerda e **8,5** na direita contra o fundo neutro — bem
acima do véu de antes (4,6 de ponta a ponta), que era exatamente a queixa. Nenhuma
encosta no menu.

Verificado: `build`, `lint`, `check:classes` (386), `check:espaco`, `check:whatsapp`,
`check:seo`.

### ✅ Etapa 35 — O menu passa a listar lugares que existem *(achado do Bruno)*

Ele notou que ao descer a página o indicador não acendia em todos os itens, e
diagnosticou a causa: *"o mesa posta acho que nao existe e bolsas tambem nao existe
essas secoes"*. Exato.

**O menu era montado a partir do banco.** `Início + cada categoria + Catálogo + Sob
medida`. Só que categoria não é lugar da página: "Bolsas" leva a `/bolsas`, outra
página, e "Mesa Posta" é um filtro (`/?categoria=…#catalogo`). Não havia para onde
rolar, então os dois nunca acendiam — e, pior, **cada categoria nova que a Raquel
cadastrasse viraria mais um item morto no menu**.

Medindo, achei mais três defeitos que nada tinham a ver com composição:

1. **`#topo` é o `<main>`** — a página inteira. Estava na lista de observados, sempre
   intersectando, poluindo a conta o tempo todo.
2. **O observador decidia pelo lote errado.** O `IntersectionObserver` entrega em cada
   chamada só as entradas que MUDARAM, e o código escolhia "a mais alta visível" dentro
   desse lote parcial. Medido: descendo a home, em `#perguntas` o menu acendia
   "Início" — saltava para trás. Agora um `Map` guarda o estado de todas as seções e a
   decisão é tomada sobre o conjunto: é a diferença entre "o que acabou de mudar" e
   "onde eu estou".
3. **Nada apagava.** Quem-faz, Cuidados, Perguntas e Contato eram seções sem item de
   menu; atravessá-las deixava o item anterior aceso, afirmando um lugar onde a pessoa
   não estava.

**O menu agora tem sete itens, todos seções reais:** Início, Catálogo, Quem faz,
Cuidados, Dúvidas, Sob medida, Contato. As bolsas continuam a um clique pelo botão do
hero, pelo "Ver todas as bolsas" dos destaques e pelo rodapé.

**E sete itens não cabiam.** Transbordo horizontal de 89px a 1024px de largura — a
página rolava para o lado. *A minha primeira medição não pegou isso:* ela via folga
positiva justamente PORQUE os itens quebravam em duas linhas em vez de transbordar
("Iní-cio", "Dú-vi-das"). Número sem imagem mente. Com `whitespace-nowrap` o
transbordo apareceu, e medindo largura a largura o limiar é **1120px** — que não é
breakpoint de ninguém. Dava para espremer e caber em 1024; espremer contradiz o que
este cabeçalho tem de melhor, que é ser o lugar quieto da tela. O menu subiu para
`xl`, e entre 1024 e 1279 quem atende é o hambúrguer, que lista os mesmos sete.

*De carona:* o CTA passou a quebrar em três linhas quando o menu cresceu — resolvido
com `nowrap`. E `ItemComFilhos` virou código morto junto com "Bolsas", que era o único
item com filhos: saiu, com o submenu do celular e os imports órfãos.

Verificado: `build`, `lint`, `check:classes` (381), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; zero transbordo de 390 a 1920px; e a rolagem de ponta a
ponta acendendo **Início → Catálogo → Quem faz → Cuidados → Dúvidas → Sob medida →
Contato**, sem buraco e sem salto para trás.

### ✅ Etapa 34 — Os corações saem de trás do novelo *(pedido do Bruno)*

Ele pediu uma etapa a mais na animação do logotipo: a cada **três batidas**, os três
coraçõezinhos somem suavemente, saem de trás do novelo e voltam a parar na posição
certa. E pediu com a razão certa — *"não devem surgir em todas as batidas porque o
visitante não irá fixar o logo e pode ficar cansativo"*.

**O nó era que os corações não existiam como elementos.** `SIMBOLO_PATH` é UM `<path>`
com `fillRule="evenodd"`, 10.385 caracteres, 24 sub-caminhos. Renderizando cada um
destacado, os corações são os índices **0, 1 e 5** (3, 6 e 9 são partes das agulhas e
do novelo, que era o meu palpite errado). Agora `simbolo.tsx` deriva
`SIMBOLO_SEM_CORACOES` e `SIMBOLO_CORACOES` do próprio `SIMBOLO_PATH` em tempo de
execução — nada de coordenadas escritas à mão que ficariam para trás numa
revetorização.

**Três batidas = 9s, múltiplo exato da batida de 3s**, então a animação é CSS puro e se
sincroniza sozinha, sem JS. Isso também mata o risco de embarcar `opacity: 0` no HTML
do servidor.

**Quem esconde é um recorte, não a opacidade.** Passar por trás não bastava: o símbolo
é desenho de traço, e os corações apareceriam pelos vãos da trama, como numa gaiola. O
`clipPath` é o envelope superior real da silhueta, então o coração de baixo sai pela
fenda entre as duas bossas do novelo.

**A naturalidade é profundidade, não ruído:** escalas iniciais 0,50 / 0,34 / 0,16 e
atrasos 0 / 0,12s / 0,26s. O da esquerda é o que "estava mais afastado" — nasce com 16%
do tamanho, sai por último e passa de 1,08 antes de assentar em 1.

**O que eu conferi por conta própria** (relatório de agente não é prova):

- *O `evenodd` sobreviveu.* Reconstruí a composição em Python a partir do mesmo
  `SIMBOLO_PATH` e comparei com o traçado antigo no mesmo quadro: **zero pixels cheios
  mudaram**, zero de borda acima do limiar, diferença máxima 8/255. E `SIMBOLO_PATH`
  continua idêntico.
- *A animação roda.* Tira de filme em tempo real no cabeçalho: repouso até ~4s,
  desvanecem, somem, e em 6,2s voltam pequenos de trás do novelo, assentando em 6,8s.
- *Movimento reduzido:* os três com `transform: none`, opacidade 1, visíveis.
- *HTML do servidor:* zero `opacity:0`.

*Dois enganos meus na verificação, registrados porque a lição é de método:* filtrei as
animações por `/coracao/` e o nome é `coracoes-de-tras-do-novelo` — "coracoes" não
contém "coracao", e conclui que nada rodava. Depois amostrei o primeiro `<svg>` da
`/estilo`, que é um logotipo **parado**, e li 48 amostras idênticas como prova de que a
animação estava morta. Nos dois casos o instrumento estava quebrado, não o alvo.

**Achado pré-existente, conferido e NÃO corrigido:** o símbolo encosta nas bordas do
`viewBox` do logotipo e a batida escala 1,045 — então **a ponta do coraçãozinho de cima
é cortada a cada batida**. Medido no cabeçalho: 4 pixels de tinta encostados na linha 0
no repouso, **35 no pico**. Vem da etapa 17. Consertar mexe em `LOGO_PROPORCAO` e no
layout do lockup; fica para o Bruno decidir.

Verificado: `build`, `lint`, `check:classes` (381), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`.

### ✅ Etapa 36 — O hero fala a mesma língua do cabeçalho *(pedido do Bruno)*

Ele gosta do hero e pediu só os botões — *"aplicar os hover que fizemos no header"* —
mais uma análise de UI/UX.

**Os botões.** Estavam em `0.15s`, só `background-color` e `transform`: nenhuma
elevação, nenhuma sombra. Entrou a família clara em `globals.css` (`.botao-claro`,
`.botao-contorno-claro`, `.botao-de-icone--claro`) — os mesmos gestos do
`.botao-primario`, do outro lado do contraste. Sobre o verde escuro nada do lado claro
serve tal qual: o brilho de topo do primário é branco a 11%, que sobre creme não
aparece (aqui vai a 60%), e a sombra preta translúcida some sobre verde (aqui puxa para
o verde-quase-preto). **O que não muda é a gramática** — brilho fixo em cima, hover sobe
um pixel e ganha sombra, clique devolve. Quem rola do hero para o catálogo não deve
sentir que mudou de casa.

**Duas coisas que a análise achou, e a primeira é um estrago meu.** O olho do hero era
um `<p>` solto com `text-inv-suave` — **o único abre-seção do site fora da
`<Etiqueta>`**, e portanto o único que ficou para trás quando a etiqueta ganhou o
acento e a costura na etapa 32. O hero é a primeira coisa que a pessoa lê; se o
vocabulário começa diferente ali, ele não é vocabulário. Agora usa a `<Etiqueta>`, com
6,65:1 sobre o verde.

**A segunda: o carrossel só tinha "próxima".** Com quatro fotos, rever a anterior
custava TRÊS cliques dando a volta inteira — e a foto é o que vende a peça, então
voltar para olhar de novo é o gesto mais provável de quem está decidindo. Os pontinhos
já permitiam pular direto, mas exigem mirar um alvo de 6px; a seta não exige mira. Os
seis controles seguem em 44×44.

*Duas leituras minhas que estavam erradas e ficam registradas:* li `transition: all 0s`
nos pontinhos e conclui que não tinham transição — eu tinha medido a **área de toque**,
não o ponto, que sempre transicionou. E li um vão vazio no rodapé do hero que era o meu
recorte, não a seção. *Conferi antes de "consertar" o que não estava quebrado:* os
pontinhos inativos a 40% dão **3,18:1** sobre o verde, acima do mínimo de 3:1 da WCAG
1.4.11 para controle — ficaram como estavam.

Verificado: `build`, `lint`, `check:classes` (385), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; hovers medidos (sombra e −1px de elevação nos três
controles) e o "voltar" indo de 1 para 4.

### ✅ Etapa 37 — Os cards e a seção das bolsas *(pedidos do Bruno)*

**1. "Esse bg branco dos cards dá a sensação que nenhum UI trabalhou ali."** Medido
antes de mexer: o card dava **ΔE 4,16** contra a página — nem lê como superfície
pousada nela, nem some dentro dela, e esse meio-termo é o que o olho registra como
padrão de fábrica. Não havia sombra nenhuma em repouso.

*Mas o defeito de verdade era de figura e fundo:* **a foto não pousava em nada**. As
fotos da Raquel têm fundo branco, o card era quase branco, então a bolsa flutuava num
campo indiferenciado — só o arco a separava. Entrou a `.placa-da-peca`: o creme de
baixo com a trama da marca, sobrando 5px em volta da foto. O arco passa a ser recortado
de um tecido. A sobra existe também para as peças que **não** são bolsa: sem arco a
foto preencheria a placa inteira e o tratamento valeria só para as bolsas — meia solução
num elemento que se repete é pior que nenhuma. Ficou ΔE 8,22 entre placa e card.

**2. "Ver todas as bolsas está um texto sem UI."** Era um link sublinhado ao lado de um
título de seção. A correção entrou na variante `secundaria` inteira e não só ali — se eu
embelezasse um caso, criaria dois desenhos para o mesmo papel.

*E aqui achei um bug sutil que valia a caçada:* o botão **não subia no hover**, embora
sombra e borda respondessem. Causa: ele era filho DIRETO do `<Revelar>`, cuja animação
de entrada usa `animation-fill-mode: both` — e **animação preenchida sobrescreve
declaração de CSS**. O `transform` ficava cravado no valor final do keyframe. O primário
do cabeçalho e o claro do hero subiam porque neles a animação está num invólucro, não no
próprio botão. Resolvido com um `<div>` em volta.

**3. A seção "Peças em destaque" virou a seção das bolsas.** Ele notou que ela *é* de
bolsas e merece lugar próprio por ser o carro-chefe. Ela mostrava `destaques` cru — o que
o banco marcou como destaque, misturando bolsa com sousplat —, e por isso o título
precisava ser genérico. Agora filtra bolsas.

*O achado de SEO foi maior que o título:* **"bolsa de crochê" não aparecia em nenhum
título da home** — nem no `<title>`, nem no H1, nem em H2 nenhum. O produto que mais
importa não estava declarado em lugar que o buscador leia com peso. E a `/bolsas` já é
dona de "Bolsas de crochê feitas à mão" (title e H1), então repetir faria as duas
competirem pelo mesmo termo.

**4. Duas correções de linguagem, ambas dele.** "O carro-chefe" era como ele me explicou
o negócio, não como a Raquel fala com quem compra — jargão de briefing não vai para a
vitrine. E o título quebrava mal. Medi seis larguras: *nenhuma* quebrava "Bolsas de
crochê na cor que você escolher" em duas linhas decentes — ou sobrava "que" pendurado,
ou virava três linhas. **Título que precisa de largura calibrada para não tropeçar é
título comprido demais.** Encurtei para "Bolsas de crochê na sua cor", que cabe numa
linha de 390 a 1440px, e o que saiu foi para a linha de apoio: o título diz o que é, o
apoio diz como funciona. O botão subiu para o nível do título — antes alinhava com o
parágrafo e flutuava sem pertencer a nível nenhum.

**Um erro meu, e feio.** Na prévia da opção que ele escolheu, eu escrevi "Leva de 7 a 15
dias" sem ter conferido — texto de preenchimento para a prévia parecer completa. Ele
perguntou de onde eu tinha tirado e eu respondi que havia inventado. **As duas coisas
estavam erradas:** o número está publicado no FAQ do site desde a etapa 8 ("de 7 a 15
dias para bolsas"), então não era invenção; e eu afirmei que era, de novo sem verificar.
Acertei por acaso na primeira e errei a correção na segunda. *O prazo NÃO entrou na
seção:* o `conteudo.ts` foi commitado por nós dois e o git não distingue o que veio da
Raquel do que foi redigido numa sessão minha e aprovado junto. No FAQ um prazo é resposta
a quem foi procurar; na vitrine vira promessa, e promessa de prazo queima confiança se
estiver errada. Entra quando ela confirmar.

Verificado: `build`, `lint`, `check:classes` (386), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; quebra do título medida em 4 larguras e o botão subindo
1px no hover.

### ✅ Etapa 38 — "Além das bolsas" vira uma vitrine de verdade *(pedido do Bruno)*

A seção tinha UM card: título, descrição e um link — sozinho, ocupando um terço da
largura, com dois terços de creme vazio ao lado. Ele disse que faltava mão de UI sênior.
Não faltava: a seção **estava inacabada**, e a causa era de dados.

**Quatro das seis categorias estavam vazias** (Casa & Decoração, Macramê, Cozinha, Bebê
& Enxoval), e categoria sem peça publicada não aparece. Sobrava Mesa. Nenhum trabalho de
layout resolveria um card só.

**Reportei um bloqueio antes de mexer:** o acervo tem 8 fotos e todas já estavam em uso
nas 7 peças reais. Popular aquelas categorias significaria inventar produtos que a Raquel
não faz. O Bruno autorizou peças de exemplo — para ela VER a estrutura e entender que
pode editar, apagar e criar pelo painel.

**As peças de exemplo se anunciam em três lugares**, porque placeholder que imita produto
de verdade é pior que nenhum: o slug começa com `exemplo-`, a descrição diz o que é, e a
foto tem "FOTO DE EXEMPLO" escrito nela. A foto é gerada por
`scripts/gerar-foto-exemplo.mjs` — verde da marca, trama e o símbolo, tirado do próprio
`simbolo.tsx` para acompanhar uma revetorização. É script e não JPEG solto para a próxima
pessoa saber de onde o arquivo veio. **Os nomes saíram das descrições das próprias
categorias, que já estavam escritas no seed** — não inventei linha de produto.
*Registrado no board como pendência de publicação:* o prefixo no slug existe para apagar
as oito num comando só.

**A categoria "Mesa Posta" virou "Mesa"**, escolha dele: mesa posta é termo de quem já
vive no meio da decoração, e quem chega do Instagram atrás de um sousplat não usa essa
palavra. Entrou `scripts/renomear-categoria.ts`, que existe por um motivo específico: o
seed faz `upsert` **por slug**, então mudar o slug no catálogo criaria uma categoria nova
e deixaria a antiga órfã com as 3 peças dentro. Renomear a linha antes de semear leva as
peças junto.

**A seção agora é uma prateleira de cinco categorias com foto.** A capa de cada uma sai
da primeira peça publicada dela, e isso é decisão de arquitetura e não de layout: **não
existe campo "foto da categoria" no banco**, então a vitrine nunca envelhece em relação
ao acervo — a Raquel troca a foto da peça e a seção acompanha sozinha. Cinco colunas no
desktop de propósito: a seção das bolsas, logo acima, é uma grade de quatro peças
grandes; uma prateleira mais estreita e mais baixa lê como outra coisa, que é o que ela
é. Repetir a mesma grade diria que o conteúdo é o mesmo.

O título "Além das bolsas" virou **"Não é só bolsa"** com a etiqueta "Também faço" — a
anterior definia a seção pela negativa do que ela não é.

Verificado: `build`, `lint`, `check:classes` (390), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; as 6 categorias com peça, as 5 cartas com foto, os filtros
do catálogo apontando para `categoria=mesa`, e a página de uma peça de exemplo
respondendo 200.

### ✅ Etapa 39 — O acabamento que faltava na vitrine de categorias *(cobrança do Bruno)*

*"Esqueceu de fazer um design sênior na seção e nos cards."* Justo: na etapa 38 eu
resolvi o problema de DADOS e a estrutura, e parei ali. Os cartões de categoria eram o
card de peça com outro texto dentro, e cinco iguais em fila é uma lista, não uma
composição.

**A categoria deixou de usar o card da peça.** Eram idênticos — retângulo branco, foto em
cima, nome embaixo. Mas um card de peça convida a COMPRAR aquilo e um azulejo de
categoria convida a ENTRAR: dois gestos diferentes, e com a mesma forma a página vira uma
lista só, mais longa. Agora a foto é o cartão inteiro e o nome mora dentro dela.

**O véu escuro não é estética, é legibilidade.** As capas saem do acervo e não dá para
saber se a próxima será clara ou escura — a de Mesa tem xícara branca, as de exemplo são
verde-escuro. Texto creme sobre foto qualquer é aposta; sobre o véu é garantia. Medido no
azulejo mais claro: **11,86:1**. Ele é degradê e não cor chapada porque só precisa existir
onde há texto — no topo da foto a peça aparece limpa.

**O desencontro vertical é o trabalho de composição.** Cinco retângulos alinhados pelo
topo leem como saída de um `for`; alternando a altura, a fila parece arrumada por alguém.
Um degrau só, e só a partir de `lg` — abaixo disso a grade tem duas ou três colunas e o
desencontro viraria buraco. Conferido em 390, 768, 1024 e 1440: nenhum transbordo.

**O movimento é resposta, não enfeite.** Sem zoom na foto (identidade §7.1: são recortes
de capa de reel, e ampliar mostra o artefato de compressão, não a peça). Quem responde é
o véu, que adensa; o cartão, que sobe 3px; o nome, que sobe **2** — a diferença entre os
dois é o que faz o nome parecer apoiado na foto em vez de impresso nela. E a seta não
fica esperando: ela entra quando o ponteiro chega, porque seta parada em cinco cartões é
cinco vezes o mesmo enfeite.

Verificado: `build`, `lint`, `check:classes` (399), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; elevação medida (0 → −3px) e contraste do nome em 11,86:1.

### ✅ Etapa 40 — O chão da vitrine de categorias *(pedido do Bruno)*

*"Falta o bg lindo aqui, está simples."* Estava: creme chapado.

**Entrou a trama para fundo claro.** A `.trama` das seções verdes desenha o tecido em
linhas de creme a 5% — ela CLAREIA um fundo escuro, e sobre creme some. A `.trama-clara`
faz o inverso: linhas de tinta, na mesma diagonal cruzada e no mesmo passo. É o mesmo
tecido visto sob outra luz, não uma textura nova — o site já tinha o motivo, faltava a
versão para este lado do contraste.

**A luz de canto vem junto porque textura sozinha não resolve:** um fundo
uniformemente texturizado continua sendo uniforme. Duas manchas muito fracas — verde no
alto à direita, goiaba embaixo à esquerda — dão ao creme um lado mais quente e outro mais
fresco, e é a diferença entre os dois cantos que o olho lê como profundidade. *Medido:*
**ΔE 5,49** de canto a canto, acima dos 4,6 que ele achou sutis demais no cabeçalho.

**E a corrente costura a emenda.** Ela já separa a faixa de aviso do cabeçalho e fecha o
pé do hero; aqui marca onde a seção das bolsas termina e esta começa. Uma linha reta seria
uma linha reta em qualquer site — a corrente é desta casa.

Percentuais de um dígito em tudo: isto é chão, e chão que compete com o que está em cima
dele está errado. Em cima estão as fotos das peças.

Verificado: `build`, `lint`, `check:classes` (401), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`.

### ✅ Etapa 41 — O catálogo ganha cara de índice, e paginação *(pedidos do Bruno)*

*"Retrabalhe a seção catálogo; não pode ser igual acima, mas o padrão da página, com
personalidade própria."* E, no meio do caminho: *"essa seção merece paginação, se a
Raquel cadastrar muitos produtos pode ficar gigante."*

**O problema era repetição estrutural.** O cabeçalho do catálogo era idêntico ao da
vitrine de bolsas — etiqueta, título e linha de apoio à esquerda, grade de quatro embaixo
— e as duas seções ficavam com a mesma cara mudando só o texto. Mas elas não fazem a
mesma coisa: lá é curadoria, aqui é o **índice**, o único lugar da página que mostra tudo
e o único que filtra.

**A contagem virou número grande à direita.** É a assinatura de índice, e é informação de
verdade porque muda com o filtro: quem clica em "Mesa" vê o 15 virar 3 e entende o que
aconteceu sem ler nada. Um fio embaixo separa o que a seção É do que ela FAZ — título e
contagem em cima, controles embaixo. Reto e fino de propósito: a `corrente` é a costura
ENTRE seções, e usá-la dentro de uma diria que ali começa outra.

**O filtro ganhou desenho porque é o que só esta seção tem.** Eram retângulos de
contorno, todos iguais e sem repouso próprio. Agora cada um é superfície que pousa na
página, com a gramática dos outros controles do site. *O ativo não sobe no hover:* ele já
é o lugar onde se está, e levantá-lo diria "clique aqui" sobre a coisa que já está
clicada.

**O fundo usa outra técnica, não outra textura.** A seção de cima acaba no creme quente e
texturizado; repetir a trama faria as duas lerem como a mesma seção. Aqui é um degradê que
nasce naquele creme e desmaia no creme base — a emenda deixa de ser aresta e vira
passagem. E o resto fica liso de propósito: *é o argumento inverso do da vitrine de
categorias, e os dois estão certos.* Lá o fundo precisava de presença porque havia cinco
cartões e muito ar; aqui precisa de silêncio porque há quinze peças e nenhum.

**A paginação.** Doze por página, três fileiras de quatro. Números e não "carregar mais":
o "carregar mais" precisa de estado no cliente, some ao atualizar e não dá endereço para
mandar a ninguém — com número na URL o botão de voltar acerta e a Raquel manda o link
pronto. O controle é mais quieto que o filtro de propósito: o filtro é escolha, a
paginação é só deslocamento dentro da escolha já feita.

*Dois defeitos meus, achados testando os extremos:*

1. **`?pagina=99` mostrava zero peças** dizendo "página 2 de 2" — a pessoa lia "nenhuma
   peça" num catálogo cheio. Eu disparava contagem e busca em paralelo e prendia ao
   intervalo só o número DEVOLVIDO, enquanto o `skip` usava o 99 e pulava 1.176 linhas.
   Prender o `skip` exige saber o total, e saber o total exige contar primeiro: a
   contagem passou a vir antes, e custa um ida-e-volta. *O paralelo era mais rápido e
   mentia.*
2. **Trocar de categoria mantinha a página.** Quem estava na página 3 de "Todas" e
   clicava em "Mesa" — que tem uma página só — caía numa lista vazia. O parâmetro de
   página pertence ao filtro atual, não à sessão: o link de filtro zera a página.

Conferido em `/`, `?pagina=2`, `?pagina=99`, `?pagina=-2`, `?pagina=abc` e
`?categoria=mesa`; clicar na página 2 leva de volta ao catálogo (topo a 104px, sob o
cabeçalho) e não ao topo da página.

Verificado: `build`, `lint`, `check:classes` (406), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`.

### ✅ Etapa 42 — Auditoria dos cuidados com as peças *(pedido do Bruno)*

Ele disse que a seção está boa e pediu para eu conferir se os conselhos são realmente
bons. Li os textos contra o que é correto para algodão, fio de malha e corda de macramê.

**A base está certa, e uma coisa está notavelmente certa:** a linha de abertura diz que o
que encurta a vida da peça é a **secagem**, não a lavagem. É verdade, e quase nenhum site
de artesanato acerta — a maioria enche de regra de lavagem e esquece que pendurar peça
molhada é o que de fato destrói. Água fria, sabão neutro, sem alvejante, "não torça,
pressione entre toalhas": tudo correto. Os `careText` de cada peça, o FAQ e esta página
dizem a mesma coisa, sem contradição.

**Seis achados, de gravidade bem diferente. O Bruno escolheu implementar os três
objetivos** — aqueles que são propriedade do algodão e não dependem de confirmação da
Raquel:

1. **"Guarde com papel amassado" era objetivamente arriscado.** Se for jornal, a tinta
   transfere para algodão claro e o papel ácido amarela a fibra com o tempo — a peça sai
   manchada depois de uma estação guardada. Agora diz papel **sem tinta**, e nomeia o
   jornal como o que não fazer.
2. **Faltava "seque por completo antes de guardar".** Bolsa de fio de malha é grossa e
   segura água no meio do ponto; guardada úmida cria mofo e um cheiro que não sai.
3. **Faltava a bloqueagem — justamente o que o crochê tem de melhor.** Umedecer e modelar
   deitada recupera o formato. *De carona, corrigi uma frase que passaria a se
   contradizer:* o texto dizia que pendurada a peça perde o formato "para sempre", o que
   é forte demais. Virou "o que estica demais não volta" — mantém o peso da regra sem
   negar que caso leve se recupera.

**Não implementados, por decisão dele:** o aviso de primeira lavagem para cores saturadas
(bordô, terracota, caramelo), que *depende dos fios que ela usa de fato* — se ela já
pré-lava ou usa fio com boa fixação, o aviso sobra; o alerta sobre enroscar em anel,
relógio e velcro; e a troca do secador por escova macia na limpeza do macramê.

Verificado: `build`, `lint`, `check:classes` (406), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`, e as quatro frases novas conferidas no ar.

### ✅ Etapa 43 — O FAQ: revisão do texto e o cartão que era uma caixa branca *(pedido do Bruno)*

**1. O FAQ prometia algo que nenhuma página entrega.** A resposta de prazo começava com
*"O prazo de cada peça está escrito na página dela"*. Fui conferir: o campo existe no
schema (`productionDaysMin/Max`), o código que o exibe existe em `page.tsx` e até na
imagem do Open Graph — e **zero peças têm o prazo preenchido**. A ficha técnica das peças
mostra só "Material". O FAQ mandava a pessoa procurar numa página onde não há nada.

Duas saídas: preencher os prazos ou tirar a frase. Tirei a frase — preencher exige o
número real de cada peça, que é da Raquel. E aproveitei para dar à pessoa o que ela
realmente quer quando pergunta prazo: *"se você precisa para uma data, me diga antes e eu
confirmo se dá"*.

**2. Duas perguntas falavam com uma empresa que não existe.** *"**Vocês** têm peça pronta"*
e *"**Vocês** enviam para todo o Brasil"* — enquanto TODA resposta é primeira pessoa
("Aceito Pix", "Me chame", "eu digo", "costumo pedir") e a página ao lado diz "Sou a
Raquel. Faço tudo à mão". Eram as duas perguntas mais escaneáveis da lista, e as duas
contradiziam a premissa do site. Viraram "Você tem" e "Você envia".

**3. Alinhei com a etapa 42.** A resposta de lavagem repetia "não volta ao formato" — a
mesma frase que eu tinha acabado de corrigir na página de Cuidados por causa da
bloqueagem. Os dois textos ficariam se contradizendo.

**4. O cartão era uma caixa branca no meio de caixas brancas.** Ele não é "mais um
conteúdo": é a única saída da seção, a porta para falar com ela. Numa coluna ao lado de
nove perguntas, a caixa branca desaparecia.

Virou superfície verde com a `trama` e a `corrente` fechando o pé. O verde é o que a
marca usa nos momentos de VOZ — hero, quem faz, cuidados, encomenda —, e aqui a Raquel
está dizendo "me chame": o cartão pertence àquela família, não à das superfícies neutras
que só seguram informação. O botão passou para a família clara, porque verde sobre verde
não existe. *Contraste do texto de apoio medido em 9,01:1.*

**Ficam anotados, não implementados:** falta pergunta sobre troca/devolução (compra a
distância tem sete dias de arrependimento no CDC, e peça sob encomenda tem nuance que só
ela pode responder); "Aceito Pix e cartão" não diz COMO é o cartão, que é exatamente a
próxima pergunta no WhatsApp; e a ficha técnica das peças está pobre — **uma peça de
quinze tem medidas cadastradas, uma tem capacidade**, o que enfraquece a página que
deveria fechar a venda.

Verificado: `build`, `lint`, `check:classes` (406), `check:espaco`, `check:whatsapp`,
`check:seo`, `check:produto`; as nove perguntas conferidas no ar e a frase falsa
confirmada como removida.

### ✅ Etapa 44 — "Sob medida" e "Contato" viram uma seção só *(pedido do Bruno)*

**Eram a mesma conversa em dois lugares.** "Sob medida" dizia *"me conte o que você tem em
mente"* e oferecia um campo; "Contato" dizia *"toda peça começa numa conversa"* e oferecia
um botão. Quem chegava ao fim da página encontrava dois convites seguidos para falar com a
mesma pessoa, pelo mesmo WhatsApp, e tinha de escolher entre duas portas sem saber a
diferença — que não existia.

Unificadas, a seção oferece os **dois jeitos de começar**, lado a lado e rotulados:
"Conte pelo site" (o formulário) e "Ou chame no WhatsApp". Quem sabe o que quer escreve;
quem tem uma dúvida solta manda mensagem.

**`#encomendas` continua viva como âncora-irmã**, vazia e sem altura. A faixa de aviso
aponta para ela, o `check:seo` a exige, e um endereço que a Raquel já pode ter mandado
para alguém não morre por causa de reorganização interna. As duas âncoras levam ao mesmo
lugar — o que agora é verdade.

**A seção ficou no creme, e isso não foi escolha de gosto:** o rodapé é `verde-musgo`, e
uma faixa verde imediatamente acima dele viraria uma mancha só. Por isso o briefing teve
de trocar de lado do contraste — ele carregava `text-inv-suave` porque MORAVA na faixa
verde. *Cor de texto é do lugar, não do componente, e este componente mudou de lugar.*

**A copy de revenda entrou como bloco separado.** Lojista não quer uma peça, quer um lote,
e é o único público que chega atrás de preço por quantidade. Misturar a oferta com o
convite à cliente final confundiria os dois — quem quer uma bolsa leria "quantidade" e
acharia que precisa comprar várias. O bloco é contido e mais quieto que o resto da seção:
quem é lojista está varrendo a página atrás exatamente disso e acha; quem não é passa por
cima sem tropeçar.

*Três defeitos corrigidos no caminho, todos de repetição:*

1. **O menu tinha dois itens para o mesmo destino** — "Sob medida" e "Contato". Saiu um.
   *De carona, o menu caiu de sete para seis itens*, o que alivia o aperto que me obrigou
   a subir o breakpoint para `xl` na etapa 35.
2. **O rodapé tinha a mesma duplicação** ("Encomenda sob medida" + "Contato"). Saiu um.
3. **O título repetia o rótulo do campo:** "Me conte o que você tem em mente" em cima de
   "O que você tem em mente?". Ler a mesma frase duas vezes em dois tamanhos faz a pessoa
   achar que perdeu alguma coisa. O título passou a dizer o CAMINHO, o rótulo diz o que
   escrever.

E dois de layout: a coluna da direita boiava num vazio de meia tela ao lado de um
formulário alto — virou cartão, com `self-start` para não esticar; e o botão dela quebrava
em "Falar no / WhatsApp" porque estava em tamanho `lg` dentro de uma coluna de 20rem.
*Tamanho de botão é do lugar, não do papel.*

Verificado: `build`, `lint`, `check:classes` (402), `check:espaco`, `check:whatsapp`,
`check:seo` (as 6 âncoras, incluindo `#encomendas`), `check:produto`; e nenhum botão da
seção quebrando linha.

### ✅ Etapa 45 — Rodapé, assinatura WB e auditoria da política de trocas *(pedidos do Bruno)*

**1. Os links do rodapé.** Conferi os quinze um a um: todos respondem 200 e **todas as
âncoras existem** na página. Nada quebrado.

**2. A assinatura da WB.** Veio da `wb-signature.tsx` do `padariarainhadamassa-website`,
com o mesmo conteúdo e o mesmo destino. Três adaptações, e uma importa:

*O coração pulsante saiu.* Lá é um detalhe simpático; aqui seria o **segundo laço
periódico na tela** — o novelo do logotipo já bate e o cabeçalho é fixo, então os dois
apareceriam juntos, e a identidade §7.2 permite um ciclo periódico por tela. Conferido
com `document.getAnimations()`: as animações infinitas visíveis são todas do mesmo
logotipo. As outras duas: raio, curva e transições passaram a ser os daqui, e o brilho
desfocado saiu — `blur` num site cuja assinatura visual é fio e trama não pertence.

Copyright e assinatura dividem a mesma linha: são as duas notas de rodapé do rodapé, e
empilhá-las daria a uma delas um peso que nenhuma tem.

**3. A auditoria da política de trocas achou dois problemas sérios.** *Ressalva registrada:
não sou advogado — mas os dois são sobre pisos legais explícitos do CDC.*

**O prazo de defeito estava abaixo do mínimo legal.** A página pedia a foto "em até **sete
dias** depois de receber". O art. 26 dá **noventa dias** para produto durável, e uma bolsa
de crochê é durável. Pior: defeito que só aparece com o uso conta a partir do dia em que
aparece, não da entrega. Cláusula que reduz prazo legal é nula pelo art. 51 e, publicada,
**expõe a Raquel em vez de proteger**.

**"Peça personalizada não tem troca por arrependimento" é juridicamente frágil.** O art.
49 **não tem exceção** para produto personalizado — essa exceção existe na lei europeia,
não na brasileira, e a jurisprudência é dividida. Como estava, era negativa absoluta de um
direito, que é exatamente o que o art. 51 anula. Virou: confirmo tudo antes de começar, e
se ainda assim você quiser desistir nos sete dias, me chame.

*O Bruno escolheu corrigir os dois.* Ambas as mudanças vão na direção de MAIS direito ao
consumidor, que é sempre o lado seguro — não há risco jurídico em oferecer mais do que a
lei exige.

**Três omissões menores, corrigidas junto:** quem paga o frete da devolução (entendimento
dominante: o vendedor, nos dois casos); o prazo de **trinta dias** que o art. 18 dá ao
fornecedor para consertar, depois do qual a escolha passa a ser do cliente; e o lead, que
dizia "regra diferente da loja comum" — o que ficou impreciso depois de a cláusula de
personalizado deixar de negar o direito.

Verificado: `build`, `lint`, `check:classes` (410), `check:espaco`, `check:seo`,
`check:produto`; as quatro frases novas conferidas no ar e a frase antiga confirmada como
removida.

## Decisões em aberto

- **Fotos:** existem duas com escala humana (a saco terracota sendo usada e a
  saco café na mão) e elas já estão marcadas como tal. Mas todas são recorte de
  capa de reel, em 640 × 800 e com marca-d'água — servem para ela ver o site,
  não para o site no ar. Fotografar o acervo em resolução boa continua sendo a
  mudança de maior impacto na conversão, e independe de código.
- **Domínio definitivo** (para `NEXT_PUBLIC_SITE_URL`). O número do WhatsApp
  está confirmado: o `5524992087591` do seed bate com a etiqueta de couro que
  aparece na foto da bolsa caramelo.
