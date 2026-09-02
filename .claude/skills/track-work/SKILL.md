---
name: track-work
description: Rastreia todo trabalho do Croche-com-raquel-website (melhorias, correções, features, débito técnico) como issues no WB Project Manager via a API, e mantém o status atualizado. Use SEMPRE ao planejar/iniciar trabalho não-trivial, ao descobrir um bug/melhoria, ao começar (→ In Progress) e ao concluir (→ Done). Também ao pedir "cria as issues", "atualiza o board".
---

# track-work — rastrear trabalho do Croche-com-raquel-website como issues

Toda melhoria/correção vira issue no projeto **Croche-com-raquel-website** do WB
Project Manager, com status em dia. Não rastreie trivialidades (typo, 1 linha).

## Use o CLI `pm.sh` (não remonte curl na mão)

Este diretório traz `pm.sh` — CLI fino pro board. Prefira-o a montar `curl`+`python` toda vez:

```bash
PM=.claude/skills/track-work/pm.sh
$PM find galeria                # listar por palavra no título
$PM list inprogress             # listar por status (backlog|todo|inprogress|done|canceled)
$PM get <issueId>               # mostrar 1 issue (id | status | título + descrição)
$PM done <issueId>              # atalho: status -> done  (start = -> inprogress)
$PM status <issueId> todo       # setar status por nome
$PM create "Título" --status todo --priority HIGH --desc-file /tmp/d.txt
$PM desc <issueId> --append --desc-file /tmp/nota.txt   # anexa sem apagar o escopo original
```

Descrições longas: escreva num arquivo e passe `--desc-file` (evita aspas/escape no shell).
As constantes/statusIds já estão embutidas no script. Use os comandos crus só p/ casos
que o `pm.sh` não cobre (milestones, bulk).

## Constantes

- Base URL: `https://projects.wbdigitalsolutions.com`
- projectId: `cmtk2xwui005hlr0137lv3ei9` | workspaceId: `cmge96f200001wa7ouziczg0w`
- API key: `~/.wb-project-manager-api-key` — **NUNCA ecoar**; ler via `$(cat ...)`.

| Status      | statusId (POST/PATCH)       | type (filtro GET) |
| ----------- | --------------------------- | ----------------- |
| Backlog     | `cmge9i3pt0005walququqw1rx` | `BACKLOG`         |
| Todo        | `cmge9i3pv0007walqv7is970v` | `TODO`            |
| In Progress | `cmge9i3pv0009walqbwhmule6` | `IN_PROGRESS`     |
| Done        | `cmge9i3pw000bwalqn1glwrn4` | `DONE`            |
| Canceled    | `cmge9i3pw000dwalqi5qgpguo` | `CANCELED`        |

Enums: `priority` = URGENT|HIGH|MEDIUM|LOW|NO_PRIORITY · `type` = FEATURE|MAINTENANCE|BUG|IMPROVEMENT

## Comandos crus

```bash
KEY=$(cat ~/.wb-project-manager-api-key)
BASE=https://projects.wbdigitalsolutions.com

# Listar (evite duplicar) — no GET o filtro é status=<TYPE>
curl -s -H "Authorization: Bearer $KEY" "$BASE/api/issues?projectId=cmtk2xwui005hlr0137lv3ei9"

# Criar issue — no POST/PATCH use statusId=<cuid>
curl -s -X POST "$BASE/api/issues" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"title":"...","description":"...","workspaceId":"cmge96f200001wa7ouziczg0w","projectId":"cmtk2xwui005hlr0137lv3ei9","statusId":"cmge9i3pv0007walqv7is970v","type":"IMPROVEMENT","priority":"MEDIUM"}'

# Mudar status (In Progress / Done) — dispara SLA automático
curl -s -X PATCH "$BASE/api/issues/ISSUE_ID" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"statusId":"cmge9i3pv0009walqbwhmule6"}'
```

### Milestones (o `pm.sh` não cobre)

```bash
# Criar
curl -s -X POST "$BASE/api/milestones" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"name":"Fase 1 — Site institucional","projectId":"cmtk2xwui005hlr0137lv3ei9","targetDate":"2026-10-31T00:00:00.000Z"}'

# Listar
curl -s -H "Authorization: Bearer $KEY" "$BASE/api/milestones?projectId=cmtk2xwui005hlr0137lv3ei9"

# Vincular uma issue a um milestone (aceita null para desvincular)
curl -s -X PATCH "$BASE/api/issues/ISSUE_ID" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"milestoneId":"MILESTONE_ID"}'
```

Lote: `POST /api/issues/bulk {workspaceId, issues:[...]}` (até 100). Doc: `/api/docs`.

## Gotchas

- No GET o filtro é `status=<TYPE>` (ex.: `status=IN_PROGRESS`); no POST/PATCH é
  `statusId=<cuid>`. São diferentes.
- Datas em ISO 8601; `milestoneId`/`assigneeId` aceitam `null`. Bulk máx 100.
- Obrigatórios ao criar: `title`, `workspaceId`, `statusId`. No POST single
  (`/api/issues`) o `workspaceId` vai no **corpo** (não só no bulk) — sem ele =
  400 Invalid input em `workspaceId`.
- Key errada → 401; não parseie o corpo do 401, confie no status.
- Use `curl`, não `urllib`/`requests` com UA padrão. Um WAF barra o user-agent do
  Python urllib com 403 Forbidden mesmo com a key correta (a key funciona —
  testado com curl → 200). 403 nesses casos é bloqueio de UA, não permissão. Se
  precisar de Python, gere o corpo JSON com Python e faça a chamada via `curl`.
- Se um comando "não fez nada": quase sempre é o prompt de permissão do Bash
  negado na sessão (o curl nem rodou), não erro da API. Use
  `-w "\nHTTP %{http_code}\n"` para confirmar.
- O `/api/generate-token` foi **removido** — não existe token de sessão, só API key.
- **A lista (`GET /api/issues`) não expande o objeto `milestone`** — só traz
  `milestoneId`. Conferir vínculo por `it.get('milestone')` dá falso negativo em
  todas as issues; use `milestoneId`. (O `GET /api/issues/<id>` também traz só o
  `milestoneId`.) O bulk **aceita** `milestoneId` no corpo de cada issue.
