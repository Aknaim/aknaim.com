#!/usr/bin/env bash
set -e
echo "=== resolv ==="
grep nameserver /etc/resolv.conf || true
echo "=== listeners 5432 ==="
(ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null || true) | grep 5432 || echo none
echo "=== docker ==="
docker ps --format '{{.Names}} {{.Ports}}' 2>&1 | head -10 || true
echo "=== which psql ==="
which psql || echo "no psql"
WINIP=$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')
echo "Windows IP: $WINIP"

try_host() {
  local host="$1"
  echo "=== try $host ==="
  if command -v psql >/dev/null 2>&1; then
    PGPASSWORD=aknaim psql -h "$host" -U aknaim -d aknaim -c 'select count(*) from recipes;' 2>&1 | head -8
  else
    node -e "
      const postgres=require('postgres');
      const sql=postgres('postgresql://aknaim:aknaim@${host}:5432/aknaim',{connect_timeout:5});
      sql\`select count(*)::int as c from recipes\`
        .then(r=>{console.log('OK',r);return sql.end();})
        .catch(e=>{console.error('FAIL',e.message);process.exit(1);});
    " 2>&1 | head -10
  fi
}

try_host localhost || true
try_host 127.0.0.1 || true
try_host host.docker.internal || true
try_host "$WINIP" || true
