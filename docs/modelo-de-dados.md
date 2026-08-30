# Modelo de dados

Postgres no Neon, acessado com Prisma 7. O schema comentado é a fonte da verdade:
`prisma/schema.prisma`. Este documento explica só o que o schema não consegue dizer
sozinho — as decisões e o porquê delas.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm db:migrate` | cria e aplica migration a partir do schema |
| `pnpm db:seed` | popula o catálogo de exemplo (idempotente) |
| `pnpm db:studio` | abre o Prisma Studio para navegar nos dados |
| `pnpm db:resumo` | imprime o catálogo no terminal; com um slug, detalha o produto |

## As três decisões que sustentam o modelo

### 1. Cor e tamanho não são campos do produto

Tamanho só se aplica a algumas peças, e bolsa ainda tem alça, forro e fecho. Um campo
fixo por atributo viraria uma coluna nula em quase todo produto e uma migration a cada
atributo novo.

O modelo tem **vocabulário global** e **seleção por produto**, em quatro tabelas:

```
OptionGroup          "Cor", "Tamanho", "Alça"     — a Raquel cadastra uma vez
  └─ OptionValue     "Terracota" (#B05A3C), "P"   — os valores possíveis

ProductOptionGroup   este produto usa "Cor", e responder é obrigatório
  └─ ProductOptionValue   e nele a cor sai em Cru, Caramelo e Preto
```

O segundo par é o que importa: **nem toda bolsa sai em todas as cores**. Sem
`ProductOptionValue` o site ofereceria cores que a peça não tem, e a mensagem do
WhatsApp chegaria errada.

O grupo tem `type`: `SINGLE` (uma opção), `MULTIPLE` (várias) ou `TEXT` (o cliente
digita — monograma, nome bordado). Grupo de tipo `TEXT` não tem valores, e é assim
mesmo.

#### A cor guarda três coisas, com papéis diferentes

| Campo | Para quê | Quem usa |
|---|---|---|
| `hex` | desenhar a bolinha do seletor | o site |
| `yarnLine` | "Barroco Maxcolor 400g" | a Raquel, para comprar |
| `yarnColorCode` | "7684" | a Raquel, para comprar **igual** |

Fio de crochê é vendido por código de cor, e é assim que ela recompra e garante que a
peça nova sai igual à da foto. **O hex não serve para isso** — a mesma "terracota" muda
de tom entre linhas. No admin ela escolhe o tom na roda de cores ou cola o código; os
dois caminhos gravam em `hex`. Linha e código são opcionais, porque nem todo fio que
ela usa tem etiqueta.

#### Desligar, não apagar

`OptionGroup.active` e `OptionValue.active` tiram do site sem apagar. É o que ela usa
quando acaba um fio: **a cor some das páginas mas continua ligada aos produtos que já a
usavam**, e volta inteira quando ela religar. Apagar seria destrutivo — removeria a cor
de todos os produtos de uma vez, e ela teria que recadastrar peça por peça ao comprar
de novo.

As consultas do site filtram `active: true`. O admin mostra tudo.

### 2. Preço é nulo de propósito

`Product.price` é `Decimal?`. **Nulo significa "sob consulta"**, não "preço faltando" —
boa parte das peças é orçada caso a caso, porque muda com tamanho, forro e
personalização.

Consequência prática: **toda UI que exibe preço precisa tratar o nulo.** Não coloque
`price!` nem `?? 0` em lugar nenhum; `?? 0` faria uma peça sob encomenda aparecer como
"R$ 0,00".

### 3. Duas conexões, com papéis diferentes

O Neon entrega duas URLs, e elas não são intercambiáveis:

| Variável | Uso | Onde |
|---|---|---|
| `DATABASE_URL` | conexão **com pool**, para o runtime | `src/lib/db.ts` |
| `DATABASE_URL_UNPOOLED` | conexão **direta**, para DDL | `prisma.config.ts` |

Migration é DDL e quer sessão direta; a aplicação quer pool. `prisma.config.ts` só é
lido pela CLI, então é o lugar certo para a conexão direta.

Ambas passam por `urlComSslVerificado()` (`src/lib/db-url.ts`), que força
`sslmode=verify-full`. O Neon entrega `sslmode=require`, que **hoje** o driver `pg`
trata como verificação completa — mas na próxima major passa a valer a semântica fraca
do libpq, que não verifica o certificado. Fixar agora evita a regressão silenciosa.

## Notas de campo

- **`Product.capacity`** é texto em linguagem de gente ("cabe carteira, celular e
  chaves"), não um número. É o que mais reduz pergunta no WhatsApp, sobretudo em bolsa.
- **`ProductImage.hasHumanScale`** marca a foto da peça sendo usada por uma pessoa. A
  direção de arte exige pelo menos uma em toda bolsa; o admin usa esta marca para
  avisar quando falta.
- **`Product.featured` + `featuredPosition`** são a curadoria da home, não um cálculo.
  Quem escolhe a vitrine é a Raquel.
- **`Category.longDescription`** é o texto longo indexável da página da categoria —
  o que faz o hub de bolsas ranquear para "bolsa de crochê". Fica no banco e não no
  código justamente para a Raquel poder editar. Markdown mínimo: parágrafo separado
  por linha em branco, `## ` para subtítulo e `**negrito**`. Não é interpretado por
  biblioteca de markdown, de propósito — isso abriria uma porta para HTML arbitrário
  vindo do banco.
- **`Subcategory`** só é usada por bolsas. As outras categorias ficam planas, e
  `subcategoryId` fica nulo.
- **`Page`** guarda as páginas de texto (Sobre, Cuidados, políticas). É modelo
  próprio, e não campos soltos em `SiteSettings`, para a Raquel poder criar uma
  página nova sem depender de migration.
- **`FaqItem`** é par pergunta/resposta, e não texto corrido, porque é esse formato
  que alimenta o `schema.org/FAQPage` — e é o que o buscador sabe ler.
- **`SiteSettings`** é uma linha só, de id fixo `singleton`. Guarda o número do
  WhatsApp, o template da mensagem e os textos da home — tudo editável no admin, nada
  hard-coded no código.

## Pendências

- Os produtos do seed são exemplos plausíveis para ver as telas de pé. O catálogo real
  entra na etapa 13, junto com as fotos.
- Ainda não há imagens: `ProductImage` está vazia, e as telas usam o placeholder.
