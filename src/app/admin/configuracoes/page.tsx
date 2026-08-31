import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/admin/sessao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { AreaDeTexto, Campo, Marcador, Secao } from "@/components/admin/campos";
import { FormularioSimples } from "@/components/admin/formulario-simples";
import { FotoDoQuemFaz } from "@/components/admin/foto-do-quem-faz";
import { salvarConfiguracoes } from "../acoes-de-conteudo";

export default async function PaginaDeConfiguracoes() {
  await exigirSessao();
  const c = await db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });

  return (
    <main className="container-site secao">
      <Etiqueta>Site</Etiqueta>
      <h1 className="mt-2 font-display text-t1">Configurações</h1>

      <div className="mt-respiro max-w-texto">
        <FormularioSimples acao={salvarConfiguracoes}>
          <Secao
            titulo="WhatsApp"
            descricao="É por aqui que todo pedido chega. Se o número estiver errado, o site inteiro para de funcionar."
          >
            <Campo
              id="whatsappNumber"
              rotulo="Número"
              dica="Com país e DDD, só números: 5524992087591."
              defaultValue={c.whatsappNumber}
              required
            />
            <AreaDeTexto
              id="whatsappTemplate"
              rotulo="Modelo da mensagem"
              dica="Use {produto}, {codigo}, {opcoes}, {quantidade} e {link}. O que a cliente escolher entra no lugar deles."
              rows={7}
              defaultValue={c.whatsappTemplate}
              required
            />
          </Secao>

          <Secao titulo="Aviso no topo do site">
            <Marcador
              id="announcementActive"
              rotulo="Mostrar o aviso"
              defaultChecked={c.announcementActive}
            />
            <Campo
              id="announcementText"
              rotulo="Texto do aviso"
              placeholder="Encomendas de Natal até 30/11"
              defaultValue={c.announcementText ?? ""}
            />
          </Secao>

          <Secao titulo="Primeira dobra da home">
            <Campo id="heroTitle" rotulo="Título" defaultValue={c.heroTitle ?? ""} />
            <AreaDeTexto
              id="heroSubtitle"
              rotulo="Frase abaixo do título"
              rows={2}
              defaultValue={c.heroSubtitle ?? ""}
            />
          </Secao>

          <Secao
            titulo="Quem faz"
            descricao="A faixa verde da home, onde você se apresenta. O primeiro parágrafo aparece grande; os seguintes, em corpo de leitura."
          >
            <AreaDeTexto
              id="aboutText"
              rotulo="Seu texto"
              dica="Separe os parágrafos com uma linha em branco. Dois ou três dão o melhor resultado."
              rows={8}
              defaultValue={c.aboutText ?? ""}
            />
            <Campo
              id="aboutImageAlt"
              rotulo="Descrição da foto"
              dica="Para quem não enxerga a tela. Ex.: “Raquel sorrindo, segurando uma bolsa de crochê”."
              defaultValue={c.aboutImageAlt ?? ""}
            />
            {/* A foto sobe sozinha, na hora de escolher, então o bloco dela
                fica fora deste formulário — formulário dentro de formulário
                não é HTML válido. O ponteiro evita a procura. */}
            <p className="text-apoio text-conteudo-suave">
              A foto em si você envia no bloco <strong className="font-medium">Sua foto</strong>,
              no fim desta página.
            </p>
          </Secao>

          <Secao titulo="Contato">
            <Campo id="city" rotulo="Cidade" defaultValue={c.city} required />
            <Campo id="instagramUrl" rotulo="Instagram" type="url" defaultValue={c.instagramUrl ?? ""} />
            <Campo id="email" rotulo="E-mail" type="email" defaultValue={c.email ?? ""} />
          </Secao>
        </FormularioSimples>

        <div className="mt-respiro rounded-card border border-borda bg-superficie p-painel">
          <h2 className="font-display text-t3">Sua foto</h2>
          <p className="mt-2 text-apoio text-conteudo-suave">
            Aparece ao lado do texto do “quem faz”. Um retrato seu, ou as suas
            mãos trabalhando — quem compra à mão quer ver quem fez.
          </p>
          <div className="mt-4">
            <FotoDoQuemFaz url={c.aboutImageUrl} />
          </div>
        </div>
      </div>
    </main>
  );
}
