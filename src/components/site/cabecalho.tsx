import { listarCategorias, listarTiposDeBolsa } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";
import { Navegacao, type ItemDeMenu } from "./navegacao";

/**
 * O cabeçalho busca os dados no servidor e entrega prontos para a navegação,
 * que é cliente por causa da animação. Assim o menu vem no HTML — nada de
 * navegação piscando depois da hidratação.
 */
export async function Cabecalho() {
  const [categorias, tiposDeBolsa, config] = await Promise.all([
    listarCategorias(),
    listarTiposDeBolsa(),
    buscarConfiguracoes(),
  ]);

  const itens: ItemDeMenu[] = categorias.map((c) =>
    c.slug === SLUG_BOLSAS
      ? {
          rotulo: c.nome,
          href: "/bolsas",
          filhos: tiposDeBolsa.map((t) => ({
            rotulo: t.nome,
            href: `/bolsas/${t.slug}`,
            total: t.totalDeProdutos,
          })),
        }
      : { rotulo: c.nome, href: `/?categoria=${c.slug}#catalogo` }
  );
  // O site é de uma página: fora de Bolsas, que tem página própria, o menu
  // navega por âncora.
  itens.push(
    { rotulo: "Catálogo", href: "/#catalogo" },
    { rotulo: "Sob medida", href: "/#encomendas" }
  );

  return (
    <Navegacao
      itens={itens}
      whatsappNumero={config.whatsappNumero}
      instagramUrl={config.instagramUrl}
      aviso={config.avisoAtivo ? config.avisoTexto : null}
    />
  );
}
