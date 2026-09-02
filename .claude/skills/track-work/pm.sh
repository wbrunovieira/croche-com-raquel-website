#!/usr/bin/env bash
# pm.sh — thin CLI for the WB Project Manager board (Croche-com-raquel-website project).
# Session tooling, so we stop hand-writing curl+python each time.
#
# Reads the API key from ~/.wb-project-manager-api-key (never echoed). Needs curl + python3.
#
# Usage:
#   pm.sh list [STATUS]              # list issues; STATUS in backlog|todo|inprogress|done|canceled
#   pm.sh find <keyword>             # list issues whose title matches keyword (case-insensitive)
#   pm.sh get <issueId>              # show one issue (id | status | title + description)
#   pm.sh status <issueId> <name>    # set status: backlog|todo|inprogress|done|canceled
#   pm.sh done <issueId>             # shortcut: status -> done
#   pm.sh start <issueId>            # shortcut: status -> inprogress
#   pm.sh create <title> [opts]      # opts: --desc "..." | --desc-file F | --status NAME
#                                    #       --type T (default IMPROVEMENT) | --priority P (default MEDIUM)
#   pm.sh desc <issueId> [opts]      # patch description; opts: --desc "..." | --desc-file F | --append
#
# Examples:
#   pm.sh find galeria
#   pm.sh done cmtk2xxxxxxxxxxxxxxxxxxxx
#   pm.sh create "Home — galeria de peças" --status todo --priority HIGH --desc-file /tmp/d.txt
#   pm.sh desc cmtk2xxxxxxxxxxxxxxxxxxxx --append --desc-file /tmp/refinamento.txt
set -euo pipefail

BASE="https://projects.wbdigitalsolutions.com"
PROJECT_ID="cmtk2xwui005hlr0137lv3ei9"
WORKSPACE_ID="cmge96f200001wa7ouziczg0w"
KEY_FILE="$HOME/.wb-project-manager-api-key"

[ -f "$KEY_FILE" ] || { echo "missing $KEY_FILE" >&2; exit 1; }
KEY="$(cat "$KEY_FILE")"

# human status name -> statusId (POST/PATCH) ; and -> TYPE (GET filter)
status_id() {
  case "$1" in
    backlog)    echo "cmge9i3pt0005walququqw1rx" ;;
    todo)       echo "cmge9i3pv0007walqv7is970v" ;;
    inprogress|in-progress|start) echo "cmge9i3pv0009walqbwhmule6" ;;
    done)       echo "cmge9i3pw000bwalqn1glwrn4" ;;
    canceled|cancelled) echo "cmge9i3pw000dwalqi5qgpguo" ;;
    *) echo "" ;;
  esac
}
status_type() {
  case "$1" in
    backlog) echo "BACKLOG" ;; todo) echo "TODO" ;;
    inprogress|in-progress) echo "IN_PROGRESS" ;; done) echo "DONE" ;;
    canceled|cancelled) echo "CANCELED" ;; *) echo "" ;;
  esac
}

api() { # method path [curl-args...]
  local method="$1" path="$2"; shift 2
  curl -s -X "$method" "$BASE$path" \
    -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" "$@"
}

# print "id | status | title" rows from an issues-list JSON on stdin; optional grep keyword $1
_print_rows() {
  python3 -c "
import sys,json
kw=(sys.argv[1] if len(sys.argv)>1 else '').lower()
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('issues',d.get('data',[]))
for it in items:
    t=it.get('title','') or ''
    if kw and kw not in t.lower(): continue
    st=it.get('status',{}); stn=st.get('name') if isinstance(st,dict) else st
    print(f\"{it.get('id')} | {stn} | {t}\")
" "${1:-}"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  list)
    q="projectId=$PROJECT_ID"
    if [ "${1:-}" != "" ]; then t="$(status_type "$1")"; [ -n "$t" ] && q="$q&status=$t"; fi
    api GET "/api/issues?$q" | _print_rows
    ;;
  find)
    [ "${1:-}" != "" ] || { echo "usage: pm.sh find <keyword>" >&2; exit 1; }
    api GET "/api/issues?projectId=$PROJECT_ID" | _print_rows "$1"
    ;;
  get)
    [ "${1:-}" != "" ] || { echo "usage: pm.sh get <issueId>" >&2; exit 1; }
    api GET "/api/issues/$1" | python3 -c "
import sys,json
it=json.load(sys.stdin)
st=it.get('status',{}); stn=st.get('name') if isinstance(st,dict) else st
print(it.get('id'),'|',stn,'|',it.get('title'))
print('---')
print(it.get('description') or '(no description)')
"
    ;;
  status|done|start)
    if [ "$cmd" = "done" ]; then id="${1:-}"; name="done"
    elif [ "$cmd" = "start" ]; then id="${1:-}"; name="inprogress"
    else id="${1:-}"; name="${2:-}"; fi
    [ -n "$id" ] && [ -n "$name" ] || { echo "usage: pm.sh status <issueId> <name> | done <id> | start <id>" >&2; exit 1; }
    sid="$(status_id "$name")"; [ -n "$sid" ] || { echo "unknown status: $name" >&2; exit 1; }
    code="$(api PATCH "/api/issues/$id" -d "{\"statusId\":\"$sid\"}" -o /dev/null -w '%{http_code}')"
    echo "$id -> $name: HTTP $code"
    ;;
  create)
    title="${1:-}"; shift || true
    [ -n "$title" ] || { echo "usage: pm.sh create <title> [--desc .. | --desc-file F] [--status N] [--type T] [--priority P]" >&2; exit 1; }
    desc=""; statusname="todo"; type="IMPROVEMENT"; priority="MEDIUM"
    while [ "${1:-}" != "" ]; do
      case "$1" in
        --desc) desc="$2"; shift 2 ;;
        --desc-file) desc="$(cat "$2")"; shift 2 ;;
        --status) statusname="$2"; shift 2 ;;
        --type) type="$2"; shift 2 ;;
        --priority) priority="$2"; shift 2 ;;
        *) echo "unknown option: $1" >&2; exit 1 ;;
      esac
    done
    sid="$(status_id "$statusname")"; [ -n "$sid" ] || { echo "unknown status: $statusname" >&2; exit 1; }
    body="$(python3 -c "
import json,sys
print(json.dumps({
  'title': sys.argv[1], 'description': sys.argv[2],
  'workspaceId': sys.argv[3], 'projectId': sys.argv[4],
  'statusId': sys.argv[5], 'type': sys.argv[6], 'priority': sys.argv[7],
}))" "$title" "$desc" "$WORKSPACE_ID" "$PROJECT_ID" "$sid" "$type" "$priority")"
    api POST "/api/issues" -d "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
st=d.get('status',{}); stn=st.get('name') if isinstance(st,dict) else st
print('created:', d.get('id'),'|',stn,'|',d.get('title'))
"
    ;;
  desc)
    id="${1:-}"; shift || true
    [ -n "$id" ] || { echo "usage: pm.sh desc <issueId> [--desc .. | --desc-file F] [--append]" >&2; exit 1; }
    desc=""; append=0
    while [ "${1:-}" != "" ]; do
      case "$1" in
        --desc) desc="$2"; shift 2 ;;
        --desc-file) desc="$(cat "$2")"; shift 2 ;;
        --append) append=1; shift ;;
        *) echo "unknown option: $1" >&2; exit 1 ;;
      esac
    done
    # --append keeps the existing description and adds the new text below it (a blank line
    # between), which is how a refinement note is added without clobbering the original scope.
    if [ "$append" = "1" ]; then
      cur="$(api GET "/api/issues/$id" | python3 -c "import sys,json; print(json.load(sys.stdin).get('description') or '')")"
      [ -n "$cur" ] && desc="$cur

$desc"
    fi
    body="$(python3 -c "import json,sys; print(json.dumps({'description': sys.argv[1]}))" "$desc")"
    code="$(api PATCH "/api/issues/$id" -d "$body" -o /dev/null -w '%{http_code}')"
    echo "$id -> desc updated: HTTP $code"
    ;;
  ""|-h|--help|help)
    sed -n '2,30p' "$0"
    ;;
  *) echo "unknown command: $cmd (try: pm.sh help)" >&2; exit 1 ;;
esac
