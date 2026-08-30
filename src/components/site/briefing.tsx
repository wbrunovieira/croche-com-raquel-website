"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { classesDeBotao } from "@/components/ui/botao";
import { Etiqueta } from "@/components/ui/etiqueta";
import { IconeZap } from "@/components/ui/icone-zap";
import {
  montarLinkWhatsApp,
  montarMensagemDeEncomenda,
  type BriefingDeEncomenda,
} from "@/lib/whatsapp";

const VAZIO: BriefingDeEncomenda = {
  tipoDePeca: "",
  cores: "",
  medidas: "",
  prazo: "",
  detalhes: "",
};

const CAMPOS: {
  chave: keyof BriefingDeEncomenda;
  rotulo: string;
  dica: string;
  linhas?: number;
}[] = [
  { chave: "tipoDePeca", rotulo: "Que peça você quer?", dica: "Bolsa transversal, manta de sofá, jogo americano…" },
  { chave: "cores", rotulo: "Que cores?", dica: "Pode dizer o tom, ou o ambiente onde a peça vai ficar." },
  { chave: "medidas", rotulo: "Alguma medida?", dica: "Se souber. Se não souber, deixe em branco que eu ajudo." },
  { chave: "prazo", rotulo: "Para quando?", dica: "Se é presente e tem data, me conte." },
  { chave: "detalhes", rotulo: "Mais alguma coisa?", dica: "Referência, foto que você viu, um detalhe que importa.", linhas: 4 },
];

/**
 * Briefing da encomenda sob medida.
 *
 * Não grava nada: os campos existem só para organizar o que a pessoa já ia
 * escrever no WhatsApp. Um formulário que precisasse de servidor, e-mail e
 * banco entregaria menos e daria à Raquel outra caixa de entrada para
 * acompanhar — ela já vive no WhatsApp.
 *
 * Nenhum campo é obrigatório, de propósito: exigir preenchimento aqui só
 * afastaria quem só quer perguntar.
 */
export function Briefing({ numeroDoWhatsapp }: { numeroDoWhatsapp: string }) {
  const [dados, setDados] = useState<BriefingDeEncomenda>(VAZIO);
  const semMovimento = useReducedMotion();

  const mensagem = montarMensagemDeEncomenda(dados);
  const link = montarLinkWhatsApp(numeroDoWhatsapp, mensagem);
  const algoPreenchido = Object.values(dados).some((v) => v.trim() !== "");

  const campo =
    "w-full rounded-fio border border-borda-forte bg-superficie px-campo-x py-campo-y text-base placeholder:text-conteudo-suave/60";

  return (
    <div className="grid gap-x-coluna gap-y-grade-linha lg:grid-cols-2">
      <div>
        {CAMPOS.map(({ chave, rotulo, dica, linhas }) => (
          <div key={chave} className="mt-bloco first:mt-0">
            <label htmlFor={chave} className="block text-apoio font-medium">
              {rotulo}
            </label>
            <p className="mt-1 text-legenda text-conteudo-suave">{dica}</p>
            <div className="mt-3">
              {linhas ? (
                <textarea
                  id={chave}
                  rows={linhas}
                  value={dados[chave]}
                  onChange={(e) => setDados((d) => ({ ...d, [chave]: e.target.value }))}
                  className={campo}
                />
              ) : (
                <input
                  id={chave}
                  type="text"
                  value={dados[chave]}
                  onChange={(e) => setDados((d) => ({ ...d, [chave]: e.target.value }))}
                  className={`${campo} h-controle py-0`}
                />
              )}
            </div>
          </div>
        ))}

        <div className="mt-bloco">
          <a
            className={classesDeBotao("primaria")}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconeZap className="size-5" />
            Enviar pelo WhatsApp
          </a>
          <p className="mt-3 text-apoio text-conteudo-suave">
            Nada é enviado daqui: o botão abre o seu WhatsApp com a mensagem
            pronta. Você lê antes de mandar.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-cabecalho-lg lg:self-start">
        <div className="trama rounded-card bg-inv-fundo p-painel">
          <Etiqueta tom="invertido">A mensagem que vai</Etiqueta>
          <motion.pre
            key={mensagem}
            initial={semMovimento ? false : { opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-bloco overflow-x-auto rounded-fio bg-verde-musgo p-4 font-texto text-apoio leading-relaxed whitespace-pre-wrap text-inv-conteudo"
          >
            {mensagem}
          </motion.pre>
          {!algoPreenchido ? (
            <p className="mt-4 text-legenda text-inv-suave">
              Preencha o que souber. Campo em branco não vira linha vazia na
              mensagem — ele simplesmente não aparece.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
