import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { Navegacao, type ItemDeMenu } from "./navegacao";

/**
 * O cabeçalho busca os dados no servidor e entrega prontos para a navegação,
 * que é cliente por causa da animação. Assim o menu vem no HTML — nada de
 * navegação piscando depois da hidratação.
 */
export async function Cabecalho() {
  const config = await buscarConfiguracoes();

  /**
   * **O menu lista lugares da página — só isso.**
   *
   * Antes ele era `Início + cada categoria do banco + Catálogo + Sob medida`, e
   * as categorias não são lugares: "Bolsas" leva a outra página e "Mesa Posta" é
   * um filtro do catálogo. Por não haver para onde rolar, esses dois itens NUNCA
   * acendiam — a pessoa descia a página e via o indicador pular por cima deles.
   * E como vinham do banco, cada categoria nova que a Raquel cadastrasse viraria
   * mais um item morto no menu.
   *
   * Quem procura por tipo de peça é atendido onde faz sentido: os filtros dentro
   * do Catálogo. E as bolsas, que são o carro-chefe, têm o botão do hero e a
   * página `/bolsas` — não precisam disputar espaço aqui.
   *
   * Âncora `#topo`, e não `/`: o `Link` do Next para a rota em que já se está não
   * rola a página — clicar em Início lá embaixo não fazia nada. A âncora sobe, e
   * de `/bolsas` navega e sobe.
   */
  const itens: ItemDeMenu[] = [
    { rotulo: "Início", href: "/#topo" },
    { rotulo: "Catálogo", href: "/#catalogo" },
    { rotulo: "Quem faz", href: "/#quem-faz" },
    { rotulo: "Cuidados", href: "/#cuidados" },
    { rotulo: "Dúvidas", href: "/#perguntas" },
    { rotulo: "Sob medida", href: "/#encomendas" },
    { rotulo: "Contato", href: "/#contato" },
  ];

  return (
    <Navegacao
      itens={itens}
      whatsappNumero={config.whatsappNumero}
      instagramUrl={config.instagramUrl}
      aviso={config.avisoAtivo ? config.avisoTexto : null}
    />
  );
}
