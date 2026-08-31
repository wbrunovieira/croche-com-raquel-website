import { urlDoSite } from "@/lib/site";

/**
 * JSON-LD.
 *
 * Um componente só, porque a regra é sempre a mesma: o que vale é o dado, não
 * a marcação. Nada aqui pode descrever algo que a página não mostra —
 * marcação que promete o que a página não tem é o caminho mais rápido para
 * perder a confiança do buscador.
 */
export function DadosEstruturados({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      // O conteúdo vem do nosso banco e passa por JSON.stringify; `<` é
      // escapado para um texto contendo "</script" não fechar a tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function negocioLocal(config: {
  cidade: string;
  whatsappNumero: string;
  instagramUrl: string | null;
  email: string | null;
}) {
  const base = urlDoSite();
  const [municipio, uf] = config.cidade.split(",").map((s) => s.trim());

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${base}/#negocio`,
    name: "Crochê com Raquel",
    description:
      "Peças de crochê e macramê feitas à mão, sob encomenda: bolsas, mesa posta, decoração e enxoval.",
    url: base,
    telephone: `+${config.whatsappNumero}`,
    email: config.email ?? undefined,
    image: `${base}/icon.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: municipio,
      addressRegion: uf,
      addressCountry: "BR",
    },
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: config.instagramUrl ? [config.instagramUrl] : undefined,
    knowsLanguage: "pt-BR",
  };
}

export function trilha(itens: { nome: string; caminho: string }[]) {
  const base = urlDoSite();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: `${base}${item.caminho}`,
    })),
  };
}

export function produtoEstruturado(p: {
  nome: string;
  slug: string;
  descricao: string;
  preco: number | null;
  material: string | null;
  imagens: string[];
  categoria: string;
  cores: string[];
}) {
  const base = urlDoSite();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    description: p.descricao,
    url: `${base}/produtos/${p.slug}`,
    image: p.imagens.length > 0 ? p.imagens : undefined,
    material: p.material ?? undefined,
    category: p.categoria,
    color: p.cores.length > 0 ? p.cores : undefined,
    brand: { "@type": "Brand", name: "Crochê com Raquel" },
    // Sem preço fechado não existe oferta a declarar. Inventar um valor aqui
    // para "aparecer melhor" seria mentir para a cliente e para o buscador.
    offers:
      p.preco === null
        ? undefined
        : {
            "@type": "Offer",
            price: p.preco.toFixed(2),
            priceCurrency: "BRL",
            // Feito sob encomenda — é o que a página diz, e o schema.org tem
            // exatamente este valor.
            availability: "https://schema.org/MadeToOrder",
            url: `${base}/produtos/${p.slug}`,
            seller: { "@type": "Organization", name: "Crochê com Raquel" },
          },
  };
}

export function perguntasEstruturadas(
  perguntas: { pergunta: string; resposta: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  };
}
