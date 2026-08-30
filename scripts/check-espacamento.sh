#!/usr/bin/env bash
# Verifica a escala de espaçamento — ver docs/sistema-de-espacamento.md §8.3.
# grep retorna 0 quando ENCONTRA, então achar algo é falha.
set -uo pipefail

DEGRAUS='\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(7|9|11|13|14|15|17|18|19|21|22|23|25|26|28|30|36|40|44|48|52|56|60|64|72|80|96)\b'
ARBITRARIO='\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\['

# src/components/brand fica de fora: o lockup do logotipo usa medidas em `em`
# (0.42em, 1.28em, 0.06em) que são relações tipográficas e precisam escalar com o
# corpo da assinatura. Prendê-las à escala de espaçamento quebraria o logo em
# qualquer tamanho diferente do atual. Ver identidade-visual.md §6.5.
EXCLUI='--exclude-dir=brand'

falhou=0

if grep -rEn --include='*.tsx' --include='*.ts' $EXCLUI "$DEGRAUS" src/; then
  echo "✗ Degrau fora da escala — ver docs/sistema-de-espacamento.md §1.3"
  falhou=1
fi

if grep -rEn --include='*.tsx' --include='*.ts' $EXCLUI "$ARBITRARIO" src/; then
  echo "✗ Valor arbitrário de espaçamento proibido — ver §7.1"
  falhou=1
fi

[ $falhou -eq 0 ] && echo "✓ Espaçamento dentro da escala"
exit $falhou
