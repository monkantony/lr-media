#!/bin/zsh
# Flip which hosts render the editorials overlay. Live in seconds, no Webflow.
#   ./set_hosts.sh "webflow.io,localhost"                 # staging only (pre-launch)
#   ./set_hosts.sh "webflow.io,localhost,lerandom.art"    # GO LIVE (covers www. too)
# Comma-separated, no spaces; case does not matter; "*" (quoted) means everywhere.
#
# THE SWITCH MINTS A NEW BUILD ID. The page loader reads two pointers, jsDelivr and
# GitHub raw, and the NEWER BUILD wins; on a tie it keeps jsDelivr's. A pointer-only
# move keeps the old build id, so when jsDelivr's purge is throttled (it was, four
# times on 12 September) the CDN copy with the OLD hosts token wins the tie for up to
# twelve hours and lerandom.art stays dark while raw already says live. A full stamp
# gives the raw pointer a strictly newer build, so the switch takes effect on the raw
# path within a minute whatever the CDN does, and on the CDN path once it purges.
set -e
REPO="${LR_MEDIA_REPO:-$(cd "$(dirname "$0")" && pwd)}"
export LR_MEDIA_REPO="$REPO"
cd "$REPO"
[[ -n "$1" ]] || { echo "usage: set_hosts.sh \"host1,host2\""; exit 1; }
H="${1//[[:space:]]/}"; H="${H:l}"
for _h in ${(s:,:)H}; do [[ -e "$_h" ]] && { echo "REFUSING: host '$_h' is a file in this directory (an unquoted * ?)"; exit 1; }; done
[[ "$H" =~ '^(\*|[a-z0-9.-]+(,[a-z0-9.-]+)*)$' ]] || { echo "bad hosts list '$1': comma-separated hostnames, no spaces, or \"*\""; exit 1; }
echo "hosts -> $H"
LRW_HOSTS="$H" ./stamp_and_push.sh "hosts -> $H" || {
  rc=$?
  # exit 2 is "pushed, CDN purge still pending": with a new build id the raw path is
  # already live, so the switch has happened; only the CDN copy is late.
  if [[ $rc == 2 ]]; then echo "SWITCHED on the raw path; the CDN pointer follows when its purge lands (re-run ./stamp_and_push.sh --pointer-only later to verify)"; exit 0; fi
  exit $rc
}
