# O logotipo da Crochê com Raquel

Estes arquivos são para **enviar para a Raquel** e para quem for imprimir
material dela — etiqueta, sacola, cartão, banner.

## Qual arquivo mandar

| situação | arquivo |
| --- | --- |
| ela postar no Instagram, mandar no WhatsApp | `png/…-1000px.png` |
| gráfica, etiqueta, cartão, sacola | `…-verde.svg` (o vetor) |
| alguém pediu "em alta" e não disse quanto | `png/…-6000px.png` |

**Prefira sempre o `.svg` quando houver gráfica no meio.** Ele é o desenho em si,
não uma foto do desenho: imprime nítido em qualquer tamanho, de uma etiqueta de
3cm a uma faixa de rua. O PNG serve para quem só vai colar numa arte.

## As três cores

| arquivo | cor | quando |
| --- | --- | --- |
| `…-verde.svg` | `#10402C` | o padrão — sobre fundo claro |
| `…-preto.svg` | `#241D16` | impressão em uma cor só, carimbo, gravação |
| `…-creme.svg` | `#F4EEE2` | sobre fundo escuro, foto ou o verde da marca |

Todos os PNG têm **fundo transparente**. Isso é de propósito: logotipo com
retângulo branco colado por trás é o defeito mais comum de marca mal entregue.

## Como gerar de novo

Os `.svg` são a fonte. Os PNG saem deles:

    node scripts/exportar-marca.mjs

Para outro destino: `node scripts/exportar-marca.mjs /caminho`.

A pasta `png/` não vai para o repositório — ela se refaz com o comando acima, e
guardar imagem gerada ao lado da fonte é o caminho curto para as duas
divergirem.

## De onde eles vêm

O logotipo vive como caminho vetorial em `src/components/brand/logo.tsx`, com
classes de animação e `currentColor` — a cor vem do lugar onde ele está. Os
arquivos daqui são esse mesmo vetor congelado: sem classe, com cor explícita e
com `width`/`height` declarados, que é o que um programa de design espera ao
abrir.

Os coraçõezinhos em cima do novelo fazem parte do desenho e aparecem aqui na
posição de repouso. O que some ao exportar é só a animação, que existe no site.
