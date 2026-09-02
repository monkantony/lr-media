#!/bin/zsh
# Flip which hosts render the editorials overlay. Live in seconds, no Webflow.
#   ./set_hosts.sh "webflow.io,localhost"                 # staging only (pre-launch)
#   ./set_hosts.sh "webflow.io,localhost,lerandom.art"    # GO LIVE (covers www. too)
set -e
cd /Users/peterbauman/.lr-cache/lr-media
[[ -n "$1" ]] || { echo "usage: set_hosts.sh \"host1,host2\""; exit 1; }
LRW_HOSTS="$1" ./stamp_and_push.sh --pointer-only
