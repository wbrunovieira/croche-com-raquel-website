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
`pnpm check:whatsapp`. Os que precisam do `pnpm dev` de pé:
`pnpm check:produto` (caminho de conversão), `pnpm check:login` (acesso ao painel),
`pnpm check:painel` (cadastro de peça de ponta a ponta; aceita `FOTO_DE_TESTE=<caminho>`
para exercitar também o envio ao Blob), `pnpm check:seo` (o que o buscador encontra
em cada página) e `pnpm check:hospedagem` (quem vê a obra e quem vê o site).

Depois de `pnpm db:migrate`, **reinicie o `pnpm dev`** — ele guarda o cliente Prisma
antigo em memória e a rota quebra com "Unknown field".

## Idioma

Todo conteúdo visível, documentação e mensagem de commit em **português do Brasil**.
Código (nomes de variáveis, funções, arquivos) em inglês.
