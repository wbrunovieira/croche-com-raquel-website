-- O texto da faixa "quem faz" saiu do painel e passou a morar no código: ele
-- carrega a hierarquia da seção (frase de abertura em display, corpo em fonte
-- de leitura), e como campo livre isso desandava. A foto e o texto alternativo
-- dela seguem editáveis.
ALTER TABLE "SiteSettings" DROP COLUMN "aboutText";
