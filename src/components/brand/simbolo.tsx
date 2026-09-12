/**
 * Novelo-coração — o símbolo da marca.
 *
 * É **o símbolo que a própria Raquel já usava** e aprovou: novelo em forma de
 * coração com as tramas do fio, duas agulhas atravessando por trás, três
 * coraçõezinhos e o fio solto em cacho. Substituiu o laço, que ela não aprovou.
 *
 * O traçado foi **vetorizado da arte dela**, e não redesenhado no olho: a arte
 * original é um raster de 640×640 com o traço creme sobre rosa. O canal verde
 * separa os dois com folga (rosa ~143, creme ~238); daí sai uma máscara,
 * ampliada 5× antes de limiarizar para o degrau do JPEG não virar serrilha, e
 * os contornos saem por marching squares. Vetorizar preserva o desenho que ela
 * reconhece — redesenhar ia produzir "parecido", que numa marca é errado.
 *
 * Simplificado com tolerância 1,3.
 *
 * **O traço é reengrossado, e em dois pesos.** Na arte dela o símbolo e a escrita
 * têm a mesma caneta de 5px — só que ela desenhou o símbolo com 259px de altura
 * e o nome com 143px. No logotipo o símbolo entra menor que o nome, e nessa
 * escala o traço dele cai para **49% do da escrita**: fica apagado ao lado das
 * letras e os dois deixam de conversar (o Bruno viu isso antes de mim).
 *
 * Engrossar tudo por igual resolveu isso e criou outro problema — o novelo virou
 * mancha, também apontado por ele. Numa ilustração de traço quem carrega a forma
 * é o contorno; as voltas do fio por dentro são textura e pedem menos peso.
 * O alvo, porém, não é a espessura — é a **mancha**. Um símbolo é denso: muitos
 * traços numa área pequena. Casar só a espessura com a da letra deixou a mancha
 * do símbolo em **2,61× a da escrita**, e ele voltou a berrar. A referência certa
 * estava na arte dela o tempo todo: ali a razão é **1,80**, porque ela desenhou o
 * símbolo grande (259px contra 143 do nome) e os traços ficam espalhados.
 * Encolhido para caber ao lado das palavras, os mesmos traços se concentram.
 *
 * Daí os **três pesos**, calibrados contra as duas medidas ao mesmo tempo:
 *
 * | | |
 * |---|---|
 * | contorno do coração | dilatado 1,4px |
 * | agulhas e fio solto | dilatado 0,4px |
 * | trama interna       | **erodida** com disco 6 |
 * | coraçõezinhos       | **intocados**, como ela desenhou |
 *
 * Resultado medido: traço de **5,00px**, que é exatamente o da escrita dela, e
 * mancha em **1,88×** — o equilíbrio da própria arte. Os coraçõezinhos ficam de
 * fora da dilatação porque são figuras cheias, não traço: engordá-los só faz
 * bolinha.
 *
 * As três fatias saem da geometria, não do olho. Uma **abertura morfológica** de
 * raio 20 separa o miolo das saliências finas — as agulhas e o fio, que ficam na
 * borda da silhueta e por isso levavam a dilatação do contorno, espetando o
 * novelo. E a distância de cada pixel de tinta até a borda do preenchimento
 * separa contorno de trama.
 *
 * **Uma coisa foi removida: a volta em S da ponta do fio.** O fio dela sai do
 * novelo, corre reto para a direita e então dá uma volta sobre si mesmo. Emendar
 * a continuação depois dessa volta lia como nó, e compensar com um trajeto reto
 * lia como filete — duas tentativas gastas até o Bruno nomear a causa: *"o
 * problema era o S antes"*. A volta sai, o fio fica cortado no fim do trecho
 * reto, ainda em movimento, e a continuação de `logo.tsx` sai dali na tangente.
 * Fora isso, nada foi tirado do que ela desenhou — só o peso foi redistribuído.
 *
 * A separação sai da geometria, não do olho. Preenchendo os buracos de cada
 * componente e medindo a distância de cada pixel de tinta até a borda desse
 * preenchimento, o contorno cai perto da borda e as tramas ficam no meio; o
 * corte fica em 5px. Dá 59% de contorno para 41% de trama — e nenhum dos 24
 * contornos se perde, que é o que acontecia dilatando tudo além de 2,6px.
 *
 * É **caminho preenchido**, não traço: o desenho dela já tem espessura variável
 * e junções que um `stroke` de espessura única não reproduz. Use `fill`, e
 * `fill-rule="evenodd"` — sem ela os vazados internos entopem.
 *
 * A proporção é 0,885:1 (largura:altura). Dimensione pela ALTURA (`h-*`).
 *
 * **Tamanho.** Medido: 52 × 59px CSS no cabeçalho, 36 × 41 no rodapé. A 24 × 28,
 * como ficou na primeira tentativa, não dava para ver o desenho — as tramas
 * caíam abaixo de um pixel em tela 1× e o conjunto virava mancha cinza. Este é
 * um símbolo ilustrado, não um pictograma: precisa de espaço.
 *
 * Abaixo de ~32px ele fecha. É por isso que o favicon **não** usa este traçado,
 * e sim a versão reduzida de `src/app/icon.svg`: coração cheio com três tramas
 * vazadas, que aguenta 16px.
 */

/** Caixa apertada à tinta: o gap escrito é o gap visto. */
export const SIMBOLO_VIEWBOX = "0 0 24 26.95";

/** Proporção largura:altura. Dimensione pela altura. */
export const SIMBOLO_PROPORCAO = 24 / 26.95;

/**
 * Ponta do fio solto e borda esquerda do novelo, nas coordenadas próprias do
 * `viewBox`. Saem da mesma vetorização, então acompanham qualquer mudança de
 * peso — o lockup ancora os fios nestes pontos em vez de números soltos.
 */
export const SIMBOLO_PONTA_FIO = { x: 19.64, y: 20.5 };
export const SIMBOLO_BORDA_ESQ = 2.43;

export const SIMBOLO_PATH =
  "M 10.61 2.46 L 10.51 2.46 L 10.33 2.26 L 9.71 1.08 L 9.52 0.48 L 9.52 0.25 L 9.58 0.10 L 9.72 0.01 L 9.90 0.01 L 10.09 0.11 L 10.45 0.54 L 10.60 0.83 L 10.71 0.94 L 10.83 0.89 L 10.93 0.73 L 11.19 0.47 L 11.44 0.34 L 11.79 0.32 L 11.97 0.52 L 11.95 0.75 L 11.68 1.25 L 11.03 2.06 L 10.61 2.46 Z M 6.29 4.60 L 6.19 4.56 L 5.92 4.33 L 5.55 3.92 L 5.35 3.76 L 5.03 3.32 L 4.89 3.07 L 4.81 2.80 L 4.81 2.66 L 4.89 2.45 L 5.00 2.31 L 5.13 2.25 L 5.46 2.31 L 5.71 2.48 L 6.12 2.96 L 6.23 2.98 L 6.61 2.55 L 6.89 2.31 L 7.14 2.19 L 7.39 2.19 L 7.53 2.30 L 7.57 2.41 L 7.53 2.80 L 7.28 3.32 L 6.88 3.92 L 6.53 4.40 L 6.29 4.60 Z M 4.67 26.96 L 4.42 26.96 L 4.34 26.92 L 4.25 26.80 L 4.12 26.51 L 4.10 26.35 L 4.14 26.03 L 4.37 25.47 L 4.93 24.58 L 7.05 21.55 L 7.05 21.47 L 6.89 21.33 L 6.23 20.85 L 6.10 20.85 L 5.58 21.23 L 5.34 21.35 L 5.21 21.48 L 4.01 22.31 L 3.63 22.52 L 3.28 22.81 L 2.82 23.06 L 2.70 23.18 L 2.37 23.37 L 1.70 23.84 L 1.37 24.01 L 1.10 24.11 L 0.56 24.20 L 0.10 24.05 L -0.01 23.90 L 0.01 23.50 L 0.11 23.27 L 0.40 22.88 L 0.83 22.47 L 2.49 21.39 L 2.89 21.08 L 3.38 20.79 L 3.97 20.36 L 4.71 19.90 L 4.89 19.72 L 4.64 19.41 L 3.83 18.60 L 3.25 17.90 L 3.19 17.75 L 2.69 17.13 L 2.09 16.13 L 1.73 15.40 L 1.51 14.74 L 1.38 14.20 L 1.30 13.52 L 1.32 12.37 L 1.51 11.07 L 1.86 9.92 L 2.17 9.28 L 2.50 8.78 L 3.07 8.21 L 3.30 8.04 L 3.55 7.88 L 4.19 7.59 L 4.63 7.44 L 5.25 7.34 L 6.33 7.34 L 7.14 7.48 L 7.54 7.61 L 8.39 8.04 L 8.84 8.40 L 9.39 8.95 L 9.46 9.07 L 9.71 9.34 L 10.05 9.98 L 10.43 9.34 L 11.00 8.65 L 11.42 8.27 L 11.79 8.00 L 12.50 7.65 L 13.06 7.46 L 13.47 7.42 L 13.76 7.34 L 14.78 7.34 L 15.51 7.46 L 16.09 7.65 L 16.42 7.82 L 17.03 7.02 L 17.14 6.81 L 17.57 6.23 L 18.05 5.48 L 18.18 5.36 L 18.57 4.73 L 18.59 4.59 L 18.45 4.28 L 18.43 4.07 L 18.49 3.84 L 18.76 3.40 L 19.00 3.17 L 19.25 3.06 L 19.45 3.04 L 19.83 3.17 L 20.45 3.56 L 20.84 3.85 L 21.00 4.01 L 21.17 4.28 L 21.21 4.46 L 21.19 4.71 L 21.02 5.07 L 20.83 5.31 L 20.66 5.49 L 20.53 5.55 L 20.24 5.62 L 20.01 5.55 L 19.92 5.58 L 17.70 8.84 L 17.72 8.99 L 17.91 9.22 L 18.11 9.59 L 18.36 10.17 L 18.47 10.55 L 18.60 10.54 L 19.25 10.06 L 19.47 9.96 L 19.83 9.66 L 21.49 8.56 L 21.44 8.24 L 21.58 7.85 L 21.80 7.63 L 22.34 7.32 L 22.55 7.30 L 22.80 7.36 L 23.02 7.48 L 23.26 7.72 L 23.97 8.82 L 24.01 9.01 L 23.99 9.32 L 23.91 9.51 L 23.63 9.79 L 23.19 10.08 L 23.00 10.12 L 22.80 10.10 L 22.48 9.91 L 22.38 9.89 L 18.84 12.27 L 18.80 12.35 L 18.82 13.47 L 18.74 14.24 L 18.59 14.78 L 18.26 15.70 L 17.87 16.44 L 17.24 17.40 L 16.62 18.21 L 15.27 19.66 L 15.30 19.71 L 18.33 19.71 L 18.81 19.78 L 19.31 20.09 L 19.59 20.39 L 19.65 20.51 L 19.60 20.56 L 19.12 20.56 L 18.81 20.31 L 18.54 20.23 L 15.01 20.23 L 14.84 20.31 L 14.60 20.31 L 14.47 20.36 L 13.62 21.08 L 12.48 21.89 L 11.27 22.58 L 10.36 23.01 L 10.09 23.08 L 9.88 23.06 L 8.72 22.52 L 8.53 22.37 L 8.41 22.37 L 7.78 23.34 L 7.15 24.17 L 6.97 24.52 L 6.84 24.64 L 6.38 25.35 L 6.18 25.58 L 5.89 26.08 L 5.23 26.73 L 4.86 26.92 L 4.67 26.96 Z M 20.31 4.88 L 20.40 4.80 L 20.48 4.61 L 20.44 4.40 L 19.81 3.96 L 19.45 3.77 L 19.37 3.77 L 19.21 3.94 L 19.15 4.15 L 19.25 4.20 L 19.36 4.36 L 19.40 4.67 L 19.64 4.83 L 19.97 4.74 L 20.22 4.89 L 20.31 4.88 Z M 14.83 12.17 L 14.98 12.06 L 15.19 11.79 L 15.69 11.00 L 16.20 10.30 L 16.41 9.92 L 16.91 9.26 L 16.95 9.18 L 16.89 8.95 L 16.91 8.78 L 19.36 5.23 L 19.34 5.11 L 19.46 4.94 L 19.43 4.89 L 19.39 4.87 L 19.35 4.95 L 19.09 5.17 L 18.24 6.48 L 17.91 6.89 L 17.43 7.64 L 17.14 7.99 L 16.93 8.37 L 16.78 8.52 L 16.41 8.64 L 15.71 9.67 L 15.58 9.80 L 15.02 10.71 L 14.73 11.07 L 14.63 11.44 L 14.61 12.00 L 14.70 12.16 L 14.83 12.17 Z M 10.51 7.92 L 10.40 7.90 L 10.13 7.65 L 9.60 7.06 L 9.12 6.35 L 9.02 6.10 L 9.02 5.98 L 9.08 5.83 L 9.24 5.70 L 9.57 5.74 L 9.86 5.93 L 10.19 6.28 L 10.34 6.30 L 10.62 5.88 L 10.94 5.49 L 11.11 5.43 L 11.34 5.43 L 11.45 5.52 L 11.49 5.67 L 11.49 5.94 L 11.39 6.29 L 10.79 7.54 L 10.51 7.92 Z M 23.03 9.36 L 23.15 9.31 L 23.28 9.16 L 23.28 8.99 L 22.66 8.08 L 22.57 8.00 L 22.48 8.00 L 22.20 8.20 L 22.20 8.30 L 22.31 8.53 L 22.29 8.74 L 22.22 8.89 L 22.38 9.08 L 22.67 9.12 L 22.88 9.35 L 23.03 9.36 Z M 4.60 18.23 L 4.54 18.00 L 4.37 16.63 L 4.39 15.13 L 4.58 13.85 L 4.79 13.02 L 5.08 12.19 L 5.70 10.90 L 5.99 10.42 L 6.59 9.59 L 7.07 9.03 L 7.57 8.53 L 7.39 8.31 L 6.79 8.11 L 6.15 8.04 L 5.79 8.15 L 5.56 8.15 L 5.03 8.74 L 4.54 9.43 L 3.91 10.55 L 3.60 11.25 L 3.29 12.17 L 3.17 12.71 L 3.00 13.56 L 2.92 14.41 L 2.96 16.05 L 3.33 16.63 L 3.44 16.98 L 3.83 17.52 L 4.40 18.22 L 4.48 18.18 L 4.60 18.23 Z M 12.22 16.78 L 12.43 16.61 L 12.72 16.21 L 13.30 15.30 L 13.78 14.33 L 13.82 14.14 L 13.98 13.79 L 14.31 12.58 L 14.52 11.23 L 14.52 9.57 L 14.31 8.20 L 14.28 8.15 L 14.06 8.13 L 13.97 8.04 L 13.18 8.15 L 13.08 8.19 L 12.96 8.36 L 12.76 8.43 L 12.72 9.20 L 12.55 10.42 L 12.36 11.19 L 12.11 11.96 L 11.72 12.89 L 11.30 13.66 L 10.54 14.70 L 10.31 15.07 L 10.33 15.28 L 10.63 15.62 L 11.29 16.20 L 12.04 16.76 L 12.22 16.78 Z M 15.12 10.07 L 15.18 10.06 L 15.42 9.80 L 15.96 8.97 L 16.25 8.60 L 16.11 8.54 L 16.01 8.38 L 15.55 8.19 L 15.11 8.09 L 14.68 8.07 L 14.62 8.13 L 14.46 8.16 L 14.61 8.84 L 14.67 9.65 L 14.75 9.86 L 14.95 10.06 L 15.12 10.07 Z M 2.75 15.65 L 2.75 14.64 L 2.81 13.79 L 2.96 12.85 L 3.19 11.90 L 3.54 10.96 L 4.10 9.84 L 4.70 8.91 L 5.28 8.22 L 5.29 8.15 L 5.23 8.17 L 5.11 8.09 L 4.92 8.09 L 4.09 8.38 L 3.65 8.63 L 3.24 8.96 L 2.73 9.70 L 2.44 10.34 L 2.27 10.84 L 2.02 12.17 L 2.00 13.64 L 2.09 14.22 L 2.25 14.80 L 2.54 15.49 L 2.64 15.60 L 2.75 15.65 Z M 10.12 14.84 L 10.21 14.81 L 10.39 14.64 L 10.66 14.28 L 10.76 14.08 L 11.12 13.64 L 11.64 12.64 L 11.95 11.92 L 12.24 11.04 L 12.38 10.42 L 12.53 9.49 L 12.56 8.50 L 12.42 8.56 L 12.29 8.52 L 11.94 8.73 L 11.47 9.13 L 11.01 9.70 L 10.76 10.13 L 10.66 10.51 L 10.46 10.70 L 10.31 10.78 L 10.14 11.31 L 9.87 11.96 L 9.50 12.69 L 9.06 13.39 L 9.06 13.66 L 9.37 14.14 L 9.90 14.81 L 10.12 14.84 Z M 6.36 20.06 L 6.38 19.93 L 6.26 19.54 L 6.03 18.33 L 5.99 17.52 L 6.03 15.86 L 6.13 15.11 L 6.28 14.49 L 6.74 13.12 L 7.40 11.81 L 8.04 10.86 L 8.52 10.28 L 9.02 9.76 L 8.90 9.61 L 8.88 9.40 L 8.51 9.00 L 8.14 8.73 L 7.97 8.71 L 7.76 8.61 L 7.11 9.22 L 6.32 10.24 L 6.16 10.55 L 5.93 10.82 L 5.87 11.00 L 5.49 11.69 L 5.08 12.71 L 4.74 13.83 L 4.62 14.64 L 4.54 15.43 L 4.52 16.26 L 4.58 17.07 L 4.74 18.12 L 4.85 18.52 L 5.24 18.91 L 5.28 19.10 L 5.64 19.43 L 5.70 19.70 L 5.68 19.83 L 5.94 20.07 L 6.17 20.02 L 6.36 20.06 Z M 17.18 12.83 L 17.63 12.61 L 18.00 12.32 L 18.05 12.08 L 18.21 11.87 L 18.52 11.70 L 19.04 11.30 L 19.43 11.08 L 19.93 10.70 L 20.28 10.52 L 20.74 10.16 L 21.97 9.35 L 22.02 9.24 L 22.20 9.11 L 22.16 9.03 L 21.97 9.15 L 21.86 9.12 L 21.40 9.48 L 21.03 9.69 L 20.35 10.18 L 19.99 10.37 L 19.54 10.74 L 19.18 10.93 L 18.69 11.30 L 18.54 11.37 L 18.17 11.30 L 17.50 11.78 L 17.04 12.05 L 16.85 12.25 L 16.81 12.44 L 16.95 12.71 L 17.07 12.82 L 17.18 12.83 Z M 16.79 12.04 L 16.92 11.99 L 17.25 11.70 L 17.44 11.62 L 18.01 11.21 L 17.89 11.09 L 17.84 10.82 L 17.70 10.51 L 17.66 10.26 L 17.35 9.61 L 17.25 9.50 L 17.13 9.50 L 17.04 9.39 L 16.72 9.76 L 16.49 10.17 L 16.02 10.82 L 15.96 10.98 L 16.00 11.25 L 16.14 11.40 L 16.43 11.88 L 16.61 12.03 L 16.79 12.04 Z M 8.92 13.12 L 9.10 12.98 L 9.37 12.56 L 9.62 12.10 L 10.00 11.17 L 9.96 10.84 L 9.70 10.72 L 9.58 10.61 L 9.48 10.30 L 9.32 10.10 L 9.24 10.08 L 9.15 9.99 L 9.11 9.91 L 8.94 10.05 L 8.85 10.19 L 8.27 10.84 L 8.11 11.07 L 8.02 11.29 L 8.17 11.90 L 8.67 12.98 L 8.80 13.11 L 8.92 13.12 Z M 16.29 17.34 L 16.36 17.26 L 16.46 17.26 L 16.64 17.07 L 17.03 16.48 L 17.20 16.13 L 17.33 15.99 L 17.47 15.72 L 17.49 15.45 L 17.64 15.11 L 17.64 14.97 L 17.28 13.81 L 16.66 12.52 L 16.02 11.54 L 15.90 11.43 L 15.72 11.39 L 15.50 11.56 L 14.98 12.39 L 14.69 12.75 L 14.48 13.06 L 14.31 13.47 L 14.40 13.70 L 15.06 14.62 L 15.58 15.55 L 16.04 16.59 L 16.18 17.17 L 16.25 17.34 L 16.29 17.34 Z M 13.92 19.81 L 14.03 19.69 L 14.47 19.53 L 14.50 19.43 L 15.33 18.62 L 15.31 18.52 L 15.37 18.39 L 13.76 17.89 L 13.31 17.64 L 12.89 17.47 L 12.71 17.33 L 12.02 16.95 L 11.88 16.81 L 11.52 16.60 L 11.07 16.20 L 10.84 16.06 L 9.87 15.07 L 9.52 14.64 L 9.23 14.18 L 9.02 13.95 L 8.38 12.79 L 7.98 11.83 L 7.83 11.74 L 7.66 11.78 L 7.42 12.10 L 6.94 13.08 L 6.76 13.60 L 6.72 13.91 L 6.86 14.30 L 7.21 14.97 L 7.67 15.70 L 8.00 16.13 L 8.34 16.48 L 8.52 16.75 L 9.05 17.28 L 9.72 17.87 L 10.55 18.47 L 11.13 18.80 L 12.21 19.32 L 13.43 19.71 L 13.92 19.81 Z M 17.76 14.74 L 17.95 14.55 L 18.11 13.70 L 18.11 12.75 L 18.01 12.66 L 17.98 12.57 L 17.42 12.92 L 17.24 13.14 L 17.26 13.39 L 17.49 13.89 L 17.76 14.74 Z M 15.54 18.23 L 15.70 18.05 L 15.93 17.94 L 15.96 17.75 L 16.14 17.48 L 15.75 16.34 L 15.23 15.22 L 14.54 14.14 L 14.37 13.96 L 14.24 13.92 L 14.07 14.06 L 13.46 15.36 L 12.84 16.34 L 12.55 16.69 L 12.49 16.90 L 12.53 17.02 L 12.66 17.16 L 13.95 17.78 L 14.41 17.91 L 14.80 18.07 L 15.54 18.23 Z M 12.01 21.24 L 12.23 21.08 L 12.48 21.04 L 13.33 20.44 L 13.61 20.20 L 13.59 20.12 L 13.69 19.95 L 13.22 19.84 L 11.83 19.34 L 11.15 19.01 L 9.84 18.18 L 9.18 17.66 L 8.34 16.80 L 7.38 15.57 L 6.82 14.60 L 6.66 14.50 L 6.56 14.52 L 6.43 14.70 L 6.28 15.30 L 6.20 15.86 L 6.16 16.90 L 6.20 17.04 L 6.36 17.31 L 6.78 17.79 L 6.92 18.02 L 7.81 18.94 L 8.78 19.75 L 10.03 20.50 L 10.38 20.63 L 11.15 21.00 L 12.01 21.24 Z M 10.14 22.34 L 10.46 22.22 L 11.34 21.77 L 11.63 21.56 L 11.78 21.38 L 10.38 20.85 L 9.80 20.56 L 8.89 20.02 L 8.51 19.71 L 8.26 19.57 L 7.58 18.97 L 7.09 18.48 L 6.54 17.82 L 6.37 17.74 L 6.29 17.76 L 6.18 17.96 L 6.18 18.21 L 6.49 19.72 L 6.63 20.18 L 6.91 20.38 L 7.27 20.79 L 7.64 21.02 L 7.78 21.16 L 7.87 21.54 L 8.08 21.64 L 8.39 21.56 L 8.51 21.58 L 8.87 21.83 L 9.65 22.22 L 10.01 22.35 L 10.14 22.34 Z M 0.86 23.46 L 1.45 23.18 L 1.99 22.79 L 2.53 22.47 L 2.91 22.18 L 3.18 22.06 L 3.61 21.71 L 3.99 21.50 L 4.38 21.19 L 5.38 20.54 L 5.60 20.35 L 5.60 20.26 L 5.76 20.14 L 5.72 20.08 L 5.65 20.00 L 5.50 20.19 L 5.29 20.29 L 5.15 20.44 L 4.51 20.81 L 4.24 21.04 L 3.55 21.48 L 3.40 21.62 L 2.89 21.91 L 2.53 22.20 L 1.20 23.03 L 0.80 23.46 L 0.86 23.46 Z M 4.89 26.10 L 5.24 25.79 L 6.16 24.48 L 6.28 24.23 L 6.84 23.50 L 7.19 22.92 L 7.34 22.78 L 7.44 22.57 L 7.82 22.05 L 7.80 21.92 L 7.92 21.76 L 7.89 21.71 L 7.85 21.69 L 7.82 21.78 L 7.57 21.97 L 7.38 22.32 L 7.11 22.63 L 6.94 22.94 L 6.07 24.12 L 5.80 24.58 L 5.10 25.58 L 4.89 25.99 L 4.89 26.10 Z";

/* -- Os coraçõezinhos, soltos do resto -------------------------------------- */

/**
 * Os três coraçõezinhos saem do traçado para poderem andar sozinhos: no
 * cabeçalho eles somem e voltam de trás do novelo a cada três batidas (o
 * arranjo está em `logo.tsx`, o ritmo e o porquê em `globals.css`).
 *
 * **Não foram redesenhados nem recortados no olho.** São três dos 24
 * sub-caminhos da mesma vetorização: quebrando `SIMBOLO_PATH` a cada `M`, os
 * índices 0, 1 e 5. Os outros 21 seguem num `path` só, com o mesmo `evenodd`.
 *
 * Tirar figura de um `evenodd` é o tipo de coisa que quebra em silêncio: a
 * regra conta cruzamentos, então remover uma forma que estivesse *dentro* de
 * outra viraria buraco em tinta. Aqui não acontece — e isso foi verificado, não
 * deduzido. Os três estão fora do contorno externo do resto (ponto-em-polígono
 * no centro e nos quatro cantos de cada um), e o repouso foi comparado pixel a
 * pixel com o traçado inteiro, de 36px a 576px de largura: **nenhum pixel cheio
 * mudou** — 0 de 59.082 pixels de tinta a 24× o tamanho do cabeçalho. Os 88 que
 * diferem lá são todos de borda anti-serrilhada, no máximo 8 de 255, e são
 * resíduo de pintar em dois elementos em vez de um; nenhum buraco virou tinta.
 */
const SUBCAMINHOS = SIMBOLO_PATH.split(/(?=M)/)
  .map((t) => t.trim())
  .filter(Boolean);
const INDICES_DOS_CORACOES = [0, 1, 5];

/**
 * Centro da caixa de um sub-caminho. Vale porque o traçado é só `M`/`L`/`Z` —
 * veio de marching squares, não tem curva, então todo número do `d` é vértice.
 */
function centroDe(d: string) {
  const numeros = (d.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const xs = numeros.filter((_, i) => i % 2 === 0);
  const ys = numeros.filter((_, i) => i % 2 === 1);
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

/** O traçado sem os três coraçõezinhos. Continua `evenodd`. */
export const SIMBOLO_SEM_CORACOES = SUBCAMINHOS.filter(
  (_, i) => !INDICES_DOS_CORACOES.includes(i),
).join(" ");

/**
 * Os três, de cima para baixo, cada um com o centro da própria caixa — é daí
 * que a animação tira a distância até o núcleo do novelo, em vez de números
 * escritos à mão que ficariam para trás numa revetorização. O `nome` descreve a
 * posição no desenho e vira sufixo de classe em `globals.css`.
 */
export const SIMBOLO_CORACOES = INDICES_DOS_CORACOES.map((indice, i) => ({
  nome: ["alto", "esquerdo", "baixo"][i],
  d: SUBCAMINHOS[indice],
  ...centroDe(SUBCAMINHOS[indice]),
}));

/**
 * Onde eles se escondem: o miolo do novelo. É o centro da mancha das tramas
 * internas — os sub-caminhos que desenham as voltas do fio ocupam x 2–18 e
 * y 8–22,4 no `viewBox`, e o meio disso é este ponto.
 *
 * Não é o centro da caixa do símbolo (12; 13,5): aquela caixa é esticada pelas
 * agulhas e pelo fio solto, que não são o novelo. Como o que tem de esconder os
 * corações é o novelo, o ponto de fuga é o dele.
 */
export const SIMBOLO_NUCLEO = { x: 10, y: 15.2 };

/**
 * **O que esconde os corações enquanto eles estão atrás do novelo.**
 *
 * Passar por trás não bastaria: o símbolo é desenho de traço, e entre as tramas
 * do novelo se vê o fundo — um coração "atrás" apareceria por esses vãos, como
 * se estivesse dentro de uma gaiola. Então eles são recortados: só existem
 * *acima da tinta*.
 *
 * Este caminho é a região acima do envelope superior do contorno externo do
 * símbolo — o `y` mínimo da silhueta a cada `x`, amostrado de 0,05 em 0,05 e
 * simplificado por Douglas-Peucker com tolerância 0,12 (27 pontos, 363
 * caracteres, contra 2.374 do contorno inteiro). Como é a silhueta de verdade,
 * e não um arco no olho, o coração de baixo sai exatamente pela fenda entre as
 * duas bossas do novelo, que é onde ele mora.
 *
 * Está em unidades do `viewBox`, então acompanha o logotipo em qualquer tamanho.
 */
export const SIMBOLO_ACIMA_DA_TINTA =
  "M -1 -1 L 0.00 23.70 L 0.40 22.88 L 1.25 22.20 L 1.30 13.52 L 1.50 11.14 " +
  "L 2.20 9.23 L 3.55 7.88 L 5.25 7.34 L 7.15 7.48 L 8.85 8.41 L 10.05 9.98 " +
  "L 11.00 8.65 L 12.50 7.65 L 13.75 7.34 L 14.75 7.34 L 16.45 7.78 " +
  "L 18.40 5.00 L 18.45 3.99 L 18.75 3.42 L 19.45 3.04 L 20.45 3.56 " +
  "L 21.15 4.25 L 21.25 8.72 L 21.60 7.83 L 22.55 7.30 L 23.25 7.71 " +
  "L 24.00 8.96 L 25 -1 Z";

export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox={SIMBOLO_VIEWBOX} aria-hidden="true" className={className}>
      <path d={SIMBOLO_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
