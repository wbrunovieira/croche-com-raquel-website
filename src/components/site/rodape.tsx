import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import { AssinaturaWB } from "@/components/ui/assinatura-wb";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarCategorias } from "@/lib/queries/categorias";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

export async function Rodape() {
  const [config, categorias] = await Promise.all([
    buscarConfiguracoes(),
    listarCategorias(),
  ]);

  const institucional = [
    { rotulo: "Quem faz", href: "/#quem-faz" },
    { rotulo: "Perguntas frequentes", href: "/#perguntas" },
    { rotulo: "Cuidados com as peças", href: "/#cuidados" },
    // "Encomenda sob medida" saiu daqui junto com a fusão: ela e "Contato"
    // passaram a levar ao mesmo lugar. A âncora `#encomendas` continua viva na
    // página para os endereços que já circulam por aí — o que não faz sentido é
    // oferecer duas portas iguais no mesmo rodapé.
    { rotulo: "Contato", href: "/#contato" },
  ];

  const politicas = [
    { rotulo: "Trocas e devoluções", href: "/politicas/trocas-e-devolucoes" },
    { rotulo: "Privacidade", href: "/politicas/privacidade" },
  ];

  return (
    <footer className="trama mt-auto bg-verde-musgo text-inv-conteudo">
      {/* pb extra no mobile: a página de produto tem barra fixa de WhatsApp no
          rodapé da viewport, e sem esta folga ela cobre a linha de copyright. */}
      <div className="container-site secao pb-barra-fixa sm:pb-0">
        <div className="grid gap-x-coluna gap-y-grade-linha sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="h-16" />
            {/* "Feito à mão em Petrópolis" já está na assinatura do logotipo:
                repetir as duas coisas aqui embaixo fazia a coluna dizer a mesma
                frase duas vezes seguidas. Sobrou o que o logotipo não diz. */}
            <p className="mt-4 text-apoio text-inv-suave">
              Bolsas, mesa posta e decoração em crochê e macramê, sob encomenda.
            </p>
            <div className="mt-bloco flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${config.whatsappNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-apoio text-inv-suave transition-colors hover:text-inv-conteudo"
              >
                <IconeZap className="size-4" />
                WhatsApp
              </a>
              {config.instagramUrl ? (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-apoio text-inv-suave transition-colors hover:text-inv-conteudo"
                >
                  <IconeInstagram className="size-4" />
                  Instagram
                </a>
              ) : null}
            </div>
          </div>

          <ColunaDoRodape titulo="Catálogo">
            {categorias.map((c) => (
              <LinkDoRodape
                key={c.slug}
                href={c.slug === SLUG_BOLSAS ? "/bolsas" : `/?categoria=${c.slug}#catalogo`}
              >
                {c.nome}
              </LinkDoRodape>
            ))}
            <LinkDoRodape href="/#catalogo">Todas as peças</LinkDoRodape>
          </ColunaDoRodape>

          <ColunaDoRodape titulo="A Raquel">
            {institucional.map((i) => (
              <LinkDoRodape key={i.href} href={i.href}>
                {i.rotulo}
              </LinkDoRodape>
            ))}
          </ColunaDoRodape>

          <ColunaDoRodape titulo="Combinado">
            {politicas.map((i) => (
              <LinkDoRodape key={i.href} href={i.href}>
                {i.rotulo}
              </LinkDoRodape>
            ))}
          </ColunaDoRodape>
        </div>

        <div className="corrente corrente--claro mt-respiro" aria-hidden="true" />
        {/* Copyright e assinatura dividem a MESMA linha — são as duas notas de
            rodapé do rodapé, e empilhá-las daria a uma delas um peso que nenhuma
            tem. No celular quebram e ficam uma sobre a outra, que é o certo
            quando não cabem lado a lado. */}
        <div className="mt-bloco flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-legenda text-inv-suave">
          <p>
            © {new Date().getFullYear()} Crochê com Raquel · {config.cidade}
          </p>
          <AssinaturaWB />
        </div>
      </div>
    </footer>
  );
}

function ColunaDoRodape({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={titulo}>
      <h2 className="font-texto text-etiqueta uppercase text-inv-suave">{titulo}</h2>
      <ul className="mt-4 space-y-2">{children}</ul>
    </nav>
  );
}

function LinkDoRodape({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-apoio text-inv-suave transition-colors hover:text-inv-conteudo"
      >
        {children}
      </Link>
    </li>
  );
}
