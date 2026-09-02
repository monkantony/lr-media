#!/bin/zsh
# Flip which hosts render the editorials overlay. Live in seconds, no Webflow.
#   ./set_hosts.sh "webflow.io,localhost"                 # staging only (pre-launch)
#   ./set_hosts.sh "webflow.io,localhost,lerandom.art"    # GO LIVE (covers www. too)
# Comma-separated, no spaces; case does not matter; "*" (quoted) means everywhere.
set -e
cd /Users/peterbauman/.lr-cache/lr-media
[[ -n "$1" ]] || { echo "usage: set_hosts.sh \"host1,host2\""; exit 1; }
H="${1//[[:space:]]/}"; H="${H:l}"
for _h in ${(s:,:)H}; do [[ -e "$_h" ]] && { echo "REFUSING: host '$_h' is a file in this directory (an unquoted * ?)"; exit 1; }; done
[[ "$H" =~ '^(\*|[a-z0-9.-]+(,[a-z0-9.-]+)*)$' ]] || { echo "bad hosts list '$1': comma-separated hostnames, no spaces, or \"*\""; exit 1; }
echo "hosts -> $H"
LRW_HOSTS="$H" ./stamp_and_push.sh --pointer-only
