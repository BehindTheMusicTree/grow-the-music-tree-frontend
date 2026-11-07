#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^https?:// ]]; then
  echo "Usage: $0 <API base URL, including the /v1 prefix>" >&2
  exit 2
fi

base_url="${1%/}"
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

printf 'Captured: %s\nAPI: %s\n' "$(date -u +%FT%TZ)" "$base_url"
curl --version | sed -n '1,2p'
printf '\nendpoint\tencoding\trun\tstatus\tbody_bytes\tttfb_seconds\ttotal_seconds\n'
for endpoint in 'genre-playlists/tree/?tree_name=canonical' 'regions/map/genres/' 'regions/map/'; do
  for encoding in identity br; do
    for run in 1 2 3; do
      printf '%s\t%s\t%s\t' "$endpoint" "$encoding" "$run"
      curl --silent --show-error --fail-with-body --connect-timeout 15 --max-time 120 \
        -H "Accept-Encoding: $encoding" \
        -D "$tmp_dir/headers" -o "$tmp_dir/body" \
        -w '%{http_code}\t%{size_download}\t%{time_starttransfer}\t%{time_total}\n' \
        "$base_url/$endpoint"
      # Keep validators and cache metadata beside each observation.
      sed -n -E '/^(HTTP\/|content-encoding:|content-length:|etag:|cache-control:|vary:|age:|cf-cache-status:)/Ip' "$tmp_dir/headers" | tr -d '\r'
    done
  done
done
