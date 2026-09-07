import Link from "next/link";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { FormularioDeNovaPeca } from "./formulario";

export default async function NovaPeca() {
  await exigirSessao();
  const categorias = await db.category.findMany({ orderBy: { position: "asc" } });

  return (
    <main className="container-site secao">
      <Link href="/admin/produtos" className="text-apoio text-conteudo-suave hover:text-conteudo">
        ← Peças
      </Link>
      {/* O título repete as palavras do botão que trouxe até aqui — "Nova
          peça", na lista. Chegar num título diferente do que se clicou faz
          quem não está à vontade com o painel duvidar se está no lugar certo.
          A etiqueta "Nova" saiu por ser a mesma palavra do título. */}
      <div className="mt-4 max-w-texto">
        <h1 className="font-display text-t1">Nova peça</h1>
        {/* O texto prometia duas etapas ("o resto você completa na tela
            seguinte") porque o cadastro era grande. Com sete campos, dividir só
            fazia a criação parecer inacabada — agora acaba aqui. */}
        <p className="mt-3 text-leitura text-conteudo-suave">
          Tudo numa tela só. Se quiser, salve fora do ar e coloque no site
          quando a peça estiver pronta.
        </p>

        <div className="mt-respiro">
          <FormularioDeNovaPeca
            categorias={categorias.map((c) => ({ id: c.id, nome: c.name }))}
          />
        </div>
      </div>
    </main>
  );
}
