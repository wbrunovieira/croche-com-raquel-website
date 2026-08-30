import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";
import { listarCategorias } from "@/lib/queries/categorias";

export async function Rodape() {
  const [config, categorias] = await Promise.all([
    buscarConfiguracoes(),
    listarCategorias(),
  ]);

  return (
    <footer className="trama mt-auto bg-verde-musgo text-inv-conteudo">
      {/* pb extra no mobile: a página de produto tem barra fixa de WhatsApp no
          rodapé da viewport, e sem esta folga ela cobre a linha de copyright. */}
      <div className="container-site secao pb-barra-fixa sm:pb-0">
        <div className="flex flex-wrap justify-between gap-y-10 gap-x-coluna">
          <div className="max-w-texto">
            <Logo className="text-t3" />
            <p className="mt-4 text-apoio text-inv-suave">
              Peças de crochê e macramê feitas à mão, sob encomenda.
              <br />
              {config.cidade}
            </p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="space-y-2 text-apoio">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.slug === "bolsas" ? "/bolsas" : `/categorias/${c.slug}`}
                    className="text-inv-suave hover:text-inv-conteudo"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2 text-apoio">
            {config.instagramUrl ? (
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-inv-suave hover:text-inv-conteudo"
              >
                Instagram
              </a>
            ) : null}
            <a
              href={`https://wa.me/${config.whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-inv-suave hover:text-inv-conteudo"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="corrente corrente--claro mt-respiro" aria-hidden="true" />
        <p className="mt-bloco text-legenda text-inv-suave">
          © {new Date().getFullYear()} Crochê com Raquel · {config.cidade}
        </p>
      </div>
    </footer>
  );
}
