"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Home,
  Palette,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";

const ITENS = [
  { href: "/admin", rotulo: "Início", Icone: Home },
  { href: "/admin/produtos", rotulo: "Peças", Icone: ShoppingBag },
  { href: "/admin/opcoes", rotulo: "Cores e opções", Icone: Palette },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: Tags },
  { href: "/admin/configuracoes", rotulo: "Configurações", Icone: Settings },
];

export function NavegacaoDoAdmin() {
  const caminho = usePathname();

  const ativo = (href: string) =>
    href === "/admin" ? caminho === "/admin" : caminho.startsWith(href);

  return (
    <nav aria-label="Painel" className="border-t border-borda">
      <ul className="container-site flex gap-1 overflow-x-auto py-2">
        {ITENS.map(({ href, rotulo, Icone }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={ativo(href) ? "page" : undefined}
              className={`relative flex items-center gap-2 rounded-fio px-3 py-2 text-apoio transition-colors ${
                ativo(href)
                  ? "text-conteudo"
                  : "text-conteudo-suave hover:bg-superficie-baixa hover:text-conteudo"
              }`}
            >
              <Icone className="size-4 shrink-0" aria-hidden="true" />
              {rotulo}
              {ativo(href) ? (
                <motion.span
                  layoutId="indicador-do-admin"
                  className="absolute inset-x-3 -bottom-0.5 block h-px bg-destaque"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
