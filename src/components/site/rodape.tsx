import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconeInstagram } from "@/components/ui/icone-instagram";
import { IconeZap } from "@/components/ui/icone-zap";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarCategorias } from "@/lib/queries/categorias";
import { SLUG_BOLSAS } from "@/lib/queries/tipos";

export async function Rodape() {
  const [config, categorias] = await Promise.all([
    buscarConfiguracoes(),
    listarCategorias(),
  ]);

  const institucional = [
    { rotulo: "Quem faz", href: "/sobre" },
    { rotulo: "Encomenda sob medida", href: "/encomendas" },
    { rotulo: "Perguntas frequentes", href: "/perguntas-frequentes" },
    { rotulo: "Cuidados com as peças", href: "/cuidados" },
    { rotulo: "Contato", href: "/contato" },
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
            <Logo className="text-t3" />
            <p className="mt-4 text-apoio text-inv-suave">
              Peças de crochê e macramê feitas à mão, sob encomenda.
              <br />
              {config.cidade}
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
                href={c.slug === SLUG_BOLSAS ? "/bolsas" : `/categorias/${c.slug}`}
              >
                {c.nome}
              </LinkDoRodape>
            ))}
            <LinkDoRodape href="/catalogo">Todas as peças</LinkDoRodape>
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
        <p className="mt-bloco text-legenda text-inv-suave">
          © {new Date().getFullYear()} Crochê com Raquel · {config.cidade}
        </p>
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
