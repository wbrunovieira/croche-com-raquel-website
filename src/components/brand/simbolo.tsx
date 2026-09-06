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
 * São **três pesos**, e o contraste entre eles é o ponto:
 *
 * | | |
 * |---|---|
 * | contorno do coração | dilatado 2,6px — é ele que segura a forma |
 * | agulhas e fio solto | dilatado 0,8px |
 * | trama interna       | **erodida** — vira textura, não desenho |
 *
 * As agulhas precisaram de peso próprio: elas ficam na borda da silhueta, então
 * caíam junto com o contorno do coração e levavam a dilatação cheia — retas e
 * longas, pesavam mais que o contorno curvo e espetavam o novelo (o Bruno viu).
 * Quem as separa é uma **abertura morfológica** de raio 20: o coração e os
 * coraçõezinhos sobrevivem, as saliências finas não. Dá 51% de coração, 7% de
 * agulha e fio, 41% de trama.
 *
 * A separação entre contorno e trama é outra medida geométrica: preenchendo os
 * buracos e medindo a distância de cada pixel de tinta até a borda desse
 * preenchimento, o contorno cai na beirada e as tramas ficam no meio.
 *
 * Nada disso tira o que ela desenhou — só redistribui o peso, para o símbolo ler
 * como marca ao lado das letras em vez de mancha.
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
export const SIMBOLO_VIEWBOX = "0 0 24 26.88";

/** Proporção largura:altura. Dimensione pela altura. */
export const SIMBOLO_PROPORCAO = 24 / 26.88;

/**
 * Ponta do fio solto e borda esquerda do novelo, nas coordenadas próprias do
 * `viewBox`. Saem da mesma vetorização, então acompanham qualquer mudança de
 * peso — o lockup ancora os fios nestes pontos em vez de números soltos.
 */
export const SIMBOLO_PONTA_FIO = { x: 20.19, y: 24.9 };
export const SIMBOLO_BORDA_ESQ = 2.4;

export const SIMBOLO_PATH =
  "M 10.62 2.64 L 10.27 2.54 L 10.06 2.34 L 9.44 1.13 L 9.38 0.80 L 9.46 0.51 L 9.46 0.33 L 9.54 0.14 L 9.80 -0.01 L 10.42 0.22 L 10.67 0.45 L 10.77 0.61 L 11.10 0.30 L 11.47 0.20 L 11.69 0.24 L 11.88 0.34 L 12.01 0.47 L 12.11 0.66 L 12.15 0.88 L 12.11 1.11 L 11.89 1.48 L 11.25 2.28 L 11.03 2.50 L 10.85 2.60 L 10.62 2.64 Z M 6.31 4.78 L 6.08 4.74 L 5.78 4.54 L 5.09 3.80 L 4.70 3.16 L 4.61 2.79 L 4.65 2.55 L 4.76 2.36 L 4.91 2.21 L 5.10 2.11 L 5.32 2.07 L 5.57 2.11 L 5.94 2.33 L 6.27 2.68 L 6.70 2.23 L 6.95 2.09 L 7.17 2.04 L 7.40 2.09 L 7.58 2.19 L 7.72 2.32 L 7.82 2.51 L 7.86 2.73 L 7.82 2.96 L 7.51 3.58 L 6.91 4.44 L 6.66 4.67 L 6.31 4.78 Z M 4.75 26.89 L 4.40 26.78 L 4.16 26.55 L 4.06 26.20 L 4.14 25.68 L 4.47 24.99 L 6.79 21.64 L 6.93 21.39 L 6.84 21.28 L 6.23 20.85 L 1.85 23.80 L 1.32 24.05 L 0.78 24.15 L 0.45 24.11 L 0.27 24.01 L 0.13 23.88 L 0.03 23.69 L -0.01 23.47 L 0.03 23.24 L 0.26 22.85 L 0.84 22.24 L 2.30 21.30 L 2.82 20.91 L 3.37 20.58 L 3.55 20.41 L 4.38 19.90 L 4.80 19.58 L 3.83 18.60 L 3.26 17.90 L 3.17 17.73 L 2.66 17.08 L 2.07 16.09 L 1.72 15.37 L 1.51 14.77 L 1.39 14.24 L 1.28 13.46 L 1.30 12.33 L 1.39 11.57 L 1.51 10.93 L 1.84 9.86 L 2.15 9.23 L 2.52 8.67 L 3.06 8.13 L 3.29 7.96 L 3.60 7.76 L 4.23 7.47 L 4.60 7.35 L 5.32 7.22 L 6.39 7.22 L 7.29 7.39 L 7.62 7.49 L 8.53 7.96 L 8.98 8.31 L 9.50 8.84 L 9.85 9.29 L 10.07 9.69 L 10.76 8.71 L 11.32 8.19 L 11.82 7.84 L 12.35 7.57 L 12.95 7.37 L 13.34 7.33 L 13.75 7.22 L 14.75 7.22 L 15.58 7.37 L 16.36 7.65 L 16.90 6.92 L 17.00 6.72 L 17.43 6.14 L 17.91 5.40 L 18.03 5.28 L 18.40 4.68 L 18.28 4.42 L 18.24 4.11 L 18.28 3.88 L 18.61 3.35 L 18.82 3.13 L 19.01 3.03 L 19.38 2.97 L 19.79 3.09 L 20.47 3.52 L 20.99 3.95 L 21.20 4.27 L 21.24 4.62 L 21.20 4.85 L 21.05 5.14 L 20.89 5.38 L 20.61 5.64 L 20.49 5.70 L 20.16 5.76 L 20.01 5.72 L 19.90 5.75 L 17.76 8.88 L 18.17 9.53 L 18.42 10.11 L 18.46 10.34 L 18.53 10.35 L 21.21 8.54 L 21.26 8.49 L 21.22 8.24 L 21.26 8.01 L 21.40 7.75 L 21.60 7.55 L 21.97 7.30 L 22.23 7.20 L 22.44 7.18 L 22.73 7.24 L 23.01 7.41 L 23.23 7.62 L 23.97 8.77 L 24.01 9.00 L 23.97 9.41 L 23.87 9.60 L 23.61 9.85 L 23.12 10.18 L 22.89 10.22 L 22.68 10.20 L 22.58 10.18 L 22.32 10.02 L 22.27 10.04 L 18.87 12.31 L 18.87 13.42 L 18.83 13.93 L 18.69 14.61 L 18.32 15.66 L 17.93 16.40 L 17.27 17.40 L 16.65 18.21 L 15.40 19.54 L 18.27 19.55 L 18.74 19.61 L 19.09 19.80 L 19.53 20.22 L 19.70 20.51 L 19.82 20.92 L 19.80 21.41 L 19.74 21.62 L 19.53 22.01 L 19.17 22.37 L 18.82 22.57 L 18.53 22.65 L 18.16 22.67 L 16.42 22.67 L 16.03 22.82 L 15.73 23.12 L 15.61 23.47 L 15.61 23.77 L 15.69 24.06 L 15.81 24.29 L 16.01 24.44 L 16.25 24.57 L 16.44 24.61 L 20.10 24.61 L 20.32 24.69 L 20.41 24.78 L 20.46 24.86 L 20.43 24.99 L 20.32 25.10 L 20.08 25.18 L 16.42 25.18 L 15.97 25.06 L 15.64 24.87 L 15.22 24.39 L 15.05 23.96 L 15.03 23.77 L 15.07 23.26 L 15.28 22.81 L 15.44 22.60 L 15.78 22.33 L 16.29 22.12 L 18.49 22.08 L 18.72 22.02 L 19.00 21.80 L 19.14 21.58 L 19.24 21.23 L 19.24 21.00 L 19.18 20.75 L 18.98 20.40 L 18.70 20.21 L 18.47 20.15 L 15.14 20.15 L 14.92 20.29 L 14.53 20.33 L 13.71 21.03 L 12.51 21.87 L 11.32 22.55 L 10.48 22.96 L 10.11 23.04 L 9.80 23.00 L 8.71 22.49 L 8.53 22.35 L 7.41 23.98 L 7.28 24.10 L 7.14 24.39 L 6.98 24.58 L 6.52 25.27 L 6.32 25.50 L 6.03 25.99 L 5.40 26.62 L 4.97 26.85 L 4.75 26.89 Z M 20.19 4.77 L 20.27 4.60 L 20.20 4.47 L 19.38 3.96 L 19.26 4.03 L 19.22 4.13 L 19.33 4.21 L 19.41 4.36 L 19.48 4.72 L 19.56 4.74 L 19.89 4.65 L 19.99 4.67 L 20.14 4.78 L 20.19 4.77 Z M 10.52 8.00 L 10.19 7.96 L 10.01 7.86 L 9.42 7.23 L 8.97 6.51 L 8.93 6.29 L 8.97 6.00 L 9.05 5.82 L 9.18 5.68 L 9.62 5.60 L 9.99 5.70 L 10.29 5.97 L 10.43 5.73 L 10.66 5.52 L 11.12 5.37 L 11.34 5.37 L 11.52 5.51 L 11.66 5.88 L 11.70 6.10 L 11.66 6.35 L 11.00 7.71 L 10.79 7.90 L 10.52 8.00 Z M 22.88 9.23 L 23.00 9.14 L 23.04 9.02 L 22.42 8.13 L 22.22 8.26 L 22.33 8.53 L 22.26 8.92 L 22.38 8.97 L 22.60 8.99 L 22.72 9.06 L 22.85 9.24 L 22.88 9.23 Z M 4.55 17.96 L 4.39 16.89 L 4.37 15.39 L 4.43 14.65 L 4.49 14.45 L 4.57 13.79 L 4.78 12.97 L 5.09 12.08 L 5.70 10.81 L 5.99 10.34 L 6.59 9.51 L 7.45 8.57 L 7.36 8.41 L 6.74 8.21 L 6.21 8.17 L 5.86 8.27 L 5.65 8.27 L 5.17 8.79 L 4.67 9.47 L 4.06 10.58 L 3.75 11.28 L 3.46 12.12 L 3.34 12.66 L 3.17 13.50 L 3.09 14.34 L 3.13 15.86 L 3.54 16.50 L 3.57 16.66 L 3.69 16.91 L 4.28 17.69 L 4.55 17.96 Z M 12.22 16.60 L 12.36 16.46 L 12.89 15.70 L 13.22 15.16 L 13.35 14.86 L 13.59 14.42 L 13.92 13.60 L 13.94 13.42 L 14.13 12.88 L 14.23 12.43 L 14.41 11.20 L 14.41 9.55 L 14.31 9.04 L 14.23 8.28 L 13.99 8.25 L 13.89 8.17 L 13.19 8.27 L 13.05 8.43 L 12.81 8.53 L 12.79 9.18 L 12.63 10.40 L 12.44 11.16 L 12.17 11.98 L 11.78 12.90 L 11.37 13.66 L 10.41 15.00 L 10.41 15.14 L 10.71 15.48 L 11.36 16.06 L 12.10 16.61 L 12.22 16.60 Z M 15.09 9.97 L 15.32 9.72 L 16.02 8.65 L 15.84 8.46 L 15.47 8.31 L 15.08 8.21 L 14.71 8.19 L 14.54 8.28 L 14.66 8.84 L 14.72 9.64 L 14.78 9.78 L 14.98 9.98 L 15.09 9.97 Z M 2.76 15.33 L 2.76 14.57 L 2.83 13.73 L 2.97 12.80 L 3.20 11.86 L 3.50 11.01 L 3.87 10.21 L 4.39 9.31 L 4.55 9.12 L 4.84 8.67 L 5.19 8.26 L 5.12 8.21 L 4.66 8.31 L 4.21 8.50 L 3.82 8.72 L 3.41 9.05 L 2.95 9.72 L 2.50 10.83 L 2.25 12.12 L 2.23 13.58 L 2.37 14.36 L 2.64 15.12 L 2.76 15.33 Z M 14.80 12.04 L 15.09 11.69 L 15.59 10.91 L 16.10 10.21 L 16.30 9.84 L 16.78 9.21 L 16.72 8.84 L 16.83 8.60 L 16.68 8.68 L 16.39 8.75 L 15.73 9.72 L 15.61 9.84 L 15.05 10.75 L 14.76 11.10 L 14.68 11.40 L 14.66 11.96 L 14.73 12.05 L 14.80 12.04 Z M 10.14 14.69 L 10.35 14.51 L 10.65 14.10 L 10.72 13.95 L 11.07 13.52 L 11.58 12.53 L 11.89 11.82 L 12.15 11.01 L 12.30 10.40 L 12.44 9.47 L 12.47 8.66 L 12.29 8.66 L 12.21 8.70 L 11.75 9.03 L 11.13 9.76 L 10.90 10.15 L 10.76 10.58 L 10.58 10.76 L 10.37 10.87 L 10.22 11.34 L 9.96 11.98 L 9.59 12.70 L 9.15 13.40 L 9.20 13.62 L 9.87 14.57 L 10.03 14.70 L 10.14 14.69 Z M 6.07 19.81 L 6.34 19.79 L 6.01 18.23 L 5.97 17.42 L 6.01 15.78 L 6.11 15.04 L 6.26 14.42 L 6.73 13.01 L 7.39 11.71 L 8.02 10.77 L 8.50 10.19 L 8.91 9.80 L 8.80 9.64 L 8.80 9.47 L 8.45 9.07 L 8.14 8.85 L 7.91 8.80 L 7.81 8.74 L 7.22 9.27 L 6.44 10.27 L 6.28 10.58 L 6.05 10.85 L 5.43 12.14 L 5.04 13.21 L 4.98 13.56 L 4.90 13.77 L 4.78 14.57 L 4.67 15.68 L 4.74 16.97 L 4.90 18.02 L 4.98 18.29 L 5.39 18.70 L 5.46 18.90 L 5.83 19.27 L 5.89 19.58 L 5.87 19.71 L 6.00 19.82 L 6.07 19.81 Z M 16.74 11.92 L 17.14 11.60 L 17.32 11.52 L 17.78 11.20 L 17.70 11.10 L 17.68 10.89 L 17.52 10.52 L 17.50 10.32 L 17.17 9.64 L 16.95 9.54 L 16.74 9.80 L 16.67 9.97 L 16.26 10.50 L 16.00 10.95 L 16.02 11.16 L 16.16 11.30 L 16.45 11.77 L 16.62 11.93 L 16.74 11.92 Z M 8.95 12.99 L 9.07 12.86 L 9.57 12.04 L 9.93 11.14 L 9.93 10.93 L 9.68 10.82 L 9.52 10.68 L 9.36 10.29 L 9.08 10.04 L 8.37 10.87 L 8.21 11.10 L 8.15 11.26 L 8.25 11.73 L 8.50 12.31 L 8.76 12.86 L 8.90 13.00 L 8.95 12.99 Z M 17.13 12.70 L 17.51 12.50 L 17.75 12.32 L 17.83 12.25 L 17.85 12.06 L 17.97 11.82 L 18.50 11.45 L 18.35 11.46 L 18.08 11.39 L 17.05 12.07 L 16.86 12.27 L 16.84 12.39 L 16.96 12.60 L 17.08 12.71 L 17.13 12.70 Z M 16.24 17.08 L 16.36 17.04 L 16.49 16.89 L 16.86 16.36 L 16.96 16.11 L 17.25 15.68 L 17.31 15.55 L 17.33 15.27 L 17.46 15.02 L 17.48 14.82 L 17.17 13.81 L 16.55 12.53 L 16.00 11.67 L 15.80 11.46 L 15.68 11.43 L 15.52 11.59 L 15.01 12.41 L 14.52 13.07 L 14.37 13.42 L 14.43 13.58 L 14.70 13.91 L 15.20 14.65 L 15.61 15.41 L 16.06 16.44 L 16.24 17.08 Z M 13.82 19.58 L 13.97 19.45 L 14.34 19.30 L 14.39 19.21 L 15.17 18.45 L 15.17 18.33 L 13.68 17.85 L 13.23 17.60 L 12.82 17.43 L 12.64 17.29 L 11.96 16.92 L 11.82 16.78 L 11.47 16.57 L 11.01 16.18 L 10.79 16.04 L 9.83 15.06 L 9.48 14.63 L 9.20 14.18 L 8.99 13.95 L 8.35 12.80 L 7.96 11.86 L 7.87 11.78 L 7.77 11.80 L 7.53 12.12 L 7.06 13.09 L 6.89 13.54 L 6.85 13.85 L 6.98 14.18 L 7.33 14.84 L 7.78 15.55 L 8.11 15.99 L 8.43 16.34 L 8.62 16.60 L 9.14 17.13 L 9.80 17.70 L 10.62 18.30 L 12.06 19.06 L 13.07 19.41 L 13.82 19.58 Z M 17.72 14.47 L 17.80 14.32 L 17.93 13.64 L 17.95 12.92 L 17.93 12.78 L 17.84 12.67 L 17.42 12.93 L 17.27 13.09 L 17.29 13.34 L 17.52 13.81 L 17.72 14.47 Z M 15.44 18.00 L 15.55 17.87 L 15.77 17.77 L 15.79 17.61 L 16.00 17.32 L 15.65 16.32 L 15.13 15.21 L 14.46 14.14 L 14.22 13.94 L 14.11 14.05 L 13.88 14.51 L 13.80 14.77 L 13.41 15.53 L 12.75 16.52 L 12.61 16.66 L 12.57 16.81 L 12.72 17.00 L 13.99 17.62 L 14.45 17.74 L 14.77 17.89 L 15.44 18.00 Z M 11.93 21.00 L 12.18 20.83 L 12.43 20.78 L 12.78 20.56 L 13.32 20.15 L 13.45 20.01 L 13.49 19.87 L 12.02 19.39 L 11.10 18.96 L 10.38 18.52 L 9.35 17.78 L 9.14 17.62 L 8.15 16.58 L 7.37 15.55 L 6.81 14.59 L 6.68 14.52 L 6.59 14.61 L 6.52 14.75 L 6.38 15.47 L 6.30 16.81 L 6.48 17.16 L 6.89 17.63 L 7.04 17.86 L 7.91 18.77 L 8.88 19.57 L 10.11 20.31 L 10.46 20.43 L 11.22 20.80 L 11.93 21.00 Z M 10.12 22.07 L 10.44 21.96 L 11.30 21.50 L 11.58 21.27 L 10.34 20.78 L 9.76 20.50 L 8.79 19.92 L 8.49 19.65 L 8.24 19.51 L 7.56 18.91 L 7.08 18.43 L 6.65 17.90 L 6.41 17.72 L 6.32 17.86 L 6.32 18.10 L 6.42 18.49 L 6.46 18.88 L 6.73 19.93 L 7.07 20.17 L 7.42 20.58 L 7.79 20.80 L 7.90 20.92 L 7.98 21.06 L 8.03 21.36 L 8.12 21.38 L 8.42 21.30 L 8.59 21.32 L 8.94 21.57 L 9.72 21.96 L 10.05 22.08 L 10.12 22.07 Z";

export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox={SIMBOLO_VIEWBOX} aria-hidden="true" className={className}>
      <path d={SIMBOLO_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
