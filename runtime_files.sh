#!/bin/zsh
# 14 Nov 2026 (CEO, lr-media past jsDelivr's 50 MB): the files a live page asks for AT THE PINNED COMMIT, so a pointer
# move can prove every one of them is served first. A new commit is a new URL for every file, changed or not, so checking
# only the changed files (lrm_publish.sh before today) leaves the rest untested. Media (Window mp4s, pod-thumbs,
# idents) load from GitHub raw main and calmap/ from its own fixed commit, so they're not here.
# Sources: the live loader (lrft.js), lrft.js, cmdk.js and native/lrn.js (LRW_RAW / LRWB), the people view and
# /subjects index (raw at the commit). Prints paths that exist at the commit, one per line.
#   ./runtime_files.sh <commit>   (in lr-media; stamp_and_push.sh and ~/lr-people/lrm_publish.sh warm this list)
C=${1:-HEAD}
{
  print -l lrft.js cmdk.js native/lrn.js \
    bridge_map.json calendar.json curmedia.json edition.json footer_data.txt lrw_bundle.txt pod/roll.json pod_subjects.json \
    reading.json search_index.json similar.json smartlinks.json subject_words.json subjects_all.json subjects_pages.json \
    timeline.json timeline_tagged.json walletmap.json wire.json \
    people/subject-chart.js people/config.json people/subject-slugs.json people/embed.html
  print "tl/daily/$(date -u +%Y-%m).json"
  print "tl/daily/$(date -u -v+1m +%Y-%m).json"
  git ls-tree -r --name-only "$C" -- people/assets subjects | grep -E '\.(js|css)$'
} | sort -u | while read -r p; do git cat-file -e "$C:$p" 2>/dev/null && print -r -- "$p"; done
