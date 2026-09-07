import { listarCategorias } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";
import { Navegacao, type ItemDeMenu } from "./navegacao";

/**
 * O cabeçalho busca os dados no servidor e entrega prontos para a navegação,
 * que é cliente por causa da animação. Assim o menu vem no HTML — nada de
 * navegação piscando depois da hidratação.
 */
export async function Cabecalho() {
  const [categorias, config] = await Promise.all([
    listarCategorias(),
    buscarConfiguracoes(),
  ]);

  // "Início" abre o menu porque o site é de uma página: das seções e do hub de
  // bolsas, é o caminho de volta ao topo.
  //
  // Âncora `#topo`, e não `/`: o `Link` do Next para a rota em que já se está
  // não rola a página — clicar em Início lá embaixo não fazia nada. A âncora
  // sobe, e de `/bolsas` navega e sobe.
  const itens: ItemDeMenu[] = [{ rotulo: "Início", href: "/#topo" }];
  itens.push(
    ...categorias.map((c) =>
      // Bolsas tem página própria; as demais categorias são filtro do catálogo.
      // O submenu por tipo saiu junto com o campo "Tipo" do cadastro: menu que
      // aponta para lista que ninguém alimenta é promessa que envelhece.
      c.slug === SLUG_BOLSAS
        ? { rotulo: c.nome, href: "/bolsas" }
        : { rotulo: c.nome, href: `/?categoria=${c.slug}#catalogo` }
    )
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
