import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { listarCategorias } from "@/lib/queries/categorias";
import { buscarConfiguracoes } from "@/lib/queries/configuracoes";

export async function Cabecalho() {
  const [categorias, config] = await Promise.all([
    listarCategorias(),
    buscarConfiguracoes(),
  ]);

  return (
    <header>
      {config.avisoAtivo && config.avisoTexto ? (
        <div className="bg-primaria text-sobre-primaria">
          <p className="container-site py-2 text-center text-apoio">
            {config.avisoTexto}
          </p>
        </div>
      ) : null}

      <div className="border-b border-borda bg-superficie">
        <div className="container-site flex h-cabecalho items-center justify-between gap-8 lg:h-cabecalho-lg">
          <Link href="/" aria-label="Crochê com Raquel — início">
            <Logo className="text-t3 text-primaria" />
          </Link>

          <nav aria-label="Categorias">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-apoio">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.slug === "bolsas" ? "/bolsas" : `/categorias/${c.slug}`}
                    className="hover:text-destaque-texto"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
