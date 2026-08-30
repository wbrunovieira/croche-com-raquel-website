# Plano de ação — Crochê com Raquel

Documento vivo. É atualizado a cada commit de etapa concluída.

**Legenda:** ✅ concluída · 🔵 em andamento · ⬜ pendente · ⏸️ bloqueada

Última atualização: 2026-08-30 — Etapa 5 concluída

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

*Fora do layout por enquanto:* cabeçalho e rodapé estão prontos mas não ligados —
os links apontam para `/bolsas` e `/categorias`, que só existem na etapa 6.

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

### ⬜ Etapa 6 — Catálogo e hub de bolsas
Grid do catálogo com filtro por categoria, subcategoria, cor e coleção.
Página `/bolsas` como landing de verdade — conteúdo próprio, subtipos em destaque,
texto indexável (alvo: "bolsa de crochê", "bolsa de fio de malha").
**Você vai ver:** navegação completa do catálogo e a hub de bolsas.

### ⬜ Etapa 7 — Home
Hero com bolsa em uso · bolsas em destaque · navegar por tipo de bolsa · demais
categorias · sobre resumido · depoimentos · Instagram · CTA de WhatsApp.
**Você vai ver:** a home completa, que é o que você mostra pra Raquel.

### ⬜ Etapa 8 — Páginas institucionais
Sobre a Raquel · Encomendas sob medida (briefing que também cai no WhatsApp) ·
FAQ · Cuidados com as peças · Contato · políticas.
**Você vai ver:** o site institucional inteiro navegável.

### ⬜ Etapa 9 — Autenticação do admin
Auth.js com credenciais, senha com hash, sessão em cookie, rota protegida,
script para criar a usuária inicial.
**Você vai ver:** a tela de login funcionando.

### ⬜ Etapa 10 — Painel administrativo
CRUD de produtos (rascunho/publicado, ordenação), categorias e subcategorias,
grupos de opções e valores (com hex da cor), upload e reordenação de imagens no
Vercel Blob, depoimentos, e configurações globais (número do WhatsApp, template da
mensagem, textos da home, banner de aviso).
Prioridade: **usabilidade para uma pessoa não técnica** — formulário único,
upload por arrastar, preview do resultado.
**Você vai ver:** o painel completo — cadastre um produto de ponta a ponta e ele
aparece no site.

### ⬜ Etapa 11 — SEO e metadados
Metadata por rota, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD
(LocalBusiness, Product, BreadcrumbList, FAQPage), imagens OG geradas,
performance e Core Web Vitals.
**Você vai ver:** o relatório de auditoria antes do deploy.

### ⬜ Etapa 12 — Deploy
Deploy na Vercel, variáveis de ambiente, domínio, preview e produção.
**Você vai ver:** o site no ar.

### ⬜ Etapa 13 — Conteúdo real e handoff
Cadastro do catálogo real com as fotos da Raquel e um guia curto de uso do painel
escrito para ela.
**Você vai ver:** o site pronto para ela usar sozinha.

---

## Decisões em aberto

- **Fotos:** existe acervo de bolsa sendo usada por pessoa? Se não, a Raquel precisa
  produzir — é a mudança de maior impacto na conversão e independe de código.
- **Número do WhatsApp** e domínio definitivo.
