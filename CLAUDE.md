@AGENTS.md

# Crochê com Raquel — regras de trabalho

Site institucional com catálogo para a artesã Raquel Boaventura (@croche.comraquel,
Petrópolis/RJ). Peças de crochê e macramê feitas à mão, sob encomenda.
**Não é loja** — a conversão acontece por WhatsApp com mensagem pré-preenchida.
**Carro-chefe: bolsas** — têm protagonismo no site.

## Fluxo de trabalho (definido pelo Bruno)

O trabalho é organizado em **etapas** descritas em `docs/plano-de-acao.md`. Para cada etapa:

1. **Implemente a etapa inteira** antes de parar.
2. **Faça commit** ao concluir. Um commit por etapa (ou por unidade coerente dentro
   dela), sempre na branch `main`. Mensagem em português, no imperativo, prefixada
   com a etapa: `etapa 5: monta página de produto com seletor de opções`.
3. **Atualize `docs/plano-de-acao.md`** no mesmo commit: marque a etapa como
   concluída, registre o que mudou em relação ao planejado e ajuste as etapas
   seguintes se a implementação revelou algo novo. O documento é a fonte da verdade
   do andamento — nunca deixe ele desatualizado.
4. **Avise o Bruno e pare.** Diga o que foi feito, o que ele consegue ver rodando
   (URL/rota, comando) e o que vem a seguir. **Não emende a próxima etapa sem o
   aval dele** — ele quer revisar visualmente cada entrega.

Commits e atualização do plano já estão autorizados de forma permanente: não peça
permissão para commitar. Push para o remoto: só quando ele pedir.

## Decisões já tomadas (não reabrir sem consultar)

- Next.js 16 App Router, TypeScript, Tailwind CSS v4 (tokens em `@theme`, sem
  `tailwind.config.js`), Turbopack, pnpm, código em `src/`.
- Banco: Neon Postgres + Prisma. Imagens: Vercel Blob.
- Auth do admin: Auth.js com credenciais (usuária única). Sem Clerk.
- **Preço é opcional por produto**: se nulo, a UI mostra "sob consulta". Todo
  componente que exibe preço precisa tratar esse caso.
- Cor e tamanho **não são campos fixos**. São grupos de opções genéricos por
  produto, porque tamanho só se aplica a algumas peças.

## ⚠️ Sempre rastreie o trabalho como issues (skill `track-work`)

Toda melhoria, correção, feature ou débito técnico DEVE virar uma issue no
projeto "Croche-com-raquel-website" (`cmtk2xwui005hlr0137lv3ei9`) no WB Project
Manager, com o status em dia (Backlog/Todo → In Progress → Done). Antes de
planejar ou iniciar trabalho não-trivial, e sempre que descobrir um bug/melhoria,
invoque a skill **`track-work`** (`.claude/skills/track-work/SKILL.md`) — ela tem
o projectId, os status IDs, a localização da API key e o CLI `pm.sh`.

## Verificações

Antes de fechar uma etapa: `pnpm build`, `pnpm lint`, `pnpm check:espaco`,
`pnpm check:whatsapp` e `pnpm check:acervo` (as fotos dela estão todas lá e
inteiras — compara o armazenamento com o backup, foto a foto). Os que precisam do `pnpm dev` de pé:
`pnpm check:produto` (caminho de conversão), `pnpm check:login` (acesso ao painel),
`pnpm check:painel` (cadastro de peça de ponta a ponta; aceita `FOTO_DE_TESTE=<caminho>`
para exercitar também o envio ao armazenamento), `pnpm check:telas` (abre todas as telas do
painel — duas ficaram quebradas em silêncio antes dele existir), `pnpm check:classes`
(classe de projeto que não existe — `.secao--ampla` tem dois traços, e escrevê-la
com um faz o padding sumir em silêncio: já aconteceu três vezes), `pnpm check:seo`
(o que o buscador encontra em cada página), `pnpm check:compartilhar` (o que a peça
leva quando alguém manda o link: nome, descrição e foto no SEO e na prévia do
WhatsApp — vale para toda peça do sitemap, não uma amostra), `pnpm check:performance` (estabilidade
visual e carregamento — o CLS da home já esteve em 0,92, nove vezes o limite do
Google, sem nada acusar) e `pnpm check:hospedagem` (quem vê a obra e quem vê o
site). Os dois últimos aceitam `URL_BASE=https://…` e valem
mais rodados **contra o que está no ar** — é lá que o roteamento por host pode
quebrar em silêncio.

Depois de publicar, as imagens são **aquecidas sozinhas** (workflow `aquecer.yml`,
disparado pelo aviso de deploy da Vercel): o cache do otimizador é por deploy, e
sem isso o primeiro visitante paga a geração de cada foto. Para aquecer à mão:
`URL_BASE=https://… pnpm aquecer`. Isso **não** conserta o LCP da home — o
elemento de LCP ali é texto, não foto; ver a issue aberta.

**O seed é dividido, e a divisão custou uma restauração.** Rodar `prisma/seed.ts`
sem argumento não faz nada, de propósito: o catálogo é DELA (ela cria, edita e
apaga peça pelo painel) e páginas/FAQ são nossos (`prisma/conteudo.ts` é a fonte
da verdade). Use `--conteudo` para corrigir texto — ele não toca em produto
nenhum. `--catalogo` sobrescreve o catálogo e só serve para ambiente do zero.

Depois de `pnpm db:migrate`, **reinicie o `pnpm dev`** — ele guarda o cliente Prisma
antigo em memória e a rota quebra com "Unknown field".

## Idioma

Todo conteúdo visível, documentação e mensagem de commit em **português do Brasil**.

**O código também é em português** — nomes de variáveis, funções, arquivos e props
(`montarLinkWhatsApp`, `semearCatalogo`, `Revelar`, `pecas`). Este parágrafo já
disse "em inglês", e a base nunca foi assim: a revisão de 18/09/2026 apontou a
divergência em toda parte. Misturar agora seria pior que a inconsistência com o
documento, então quem mudou foi o documento.

O que vem de fora fica como vem: modelos do Prisma (`ProductImage`, `SiteSettings`),
convenções do Next (`page.tsx`, `layout.tsx`, `generateMetadata`) e nomes de
biblioteca.
