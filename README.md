# lr-media

The runtime of the Le Random editorials redesign. Every file the live pages
load comes from this repo, and nothing else: the page bundle, the article
embed, every data file, the Window films, the announcement films, the
podcast payloads and the idents. It is PUBLIC on purpose: both delivery paths
are unauthenticated and every commit is mirrored permanently by jsDelivr, so
no secret may ever land here.

How pages read it (the head loader pasted into Webflow, see the pipeline
repo's `webflow/`):

1. `version.txt` is one line: `<build-id> <commit> <hosts>`. The loader reads
   it from two places, jsDelivr `@main` and GitHub raw with a cache-buster,
   and the newer build wins.
2. It loads `lrw_bundle.txt` (JSON `{css, html, data, js}`) and `lrft.js`
   pinned to that commit on jsDelivr, with GitHub raw as the fallback.
3. `<hosts>` is the launch switch: a comma list of host suffixes the overlay
   may render on. `webflow.io,localhost` = staging only. Adding
   `lerandom.art` is the launch. It is never defaulted by any script.

Publishing. `stamp_and_push.sh` is the ONLY way a change reaches a page: it
stamps a build id into the bundle, commits, moves the pointer, pushes, purges
the pointer at jsDelivr and refuses to say "published" until the CDN serves
it. A plain `git push` of a data file reaches nobody until the pointer moves,
because pages load data pinned to the commit in `version.txt`.

    git pull --rebase                       # two writers: the Mac and the cloud jobs
    ./stamp_and_push.sh "what changed"      # bundle or lrft change: new build id
    ./stamp_and_push.sh --pointer-only "…"  # a data file you already committed
    ./set_hosts.sh "webflow.io,localhost,lerandom.art"   # LAUNCH (see the pipeline README)
    ./set_hosts.sh "webflow.io,localhost"                # undo

jsDelivr throttles repeat purges (roughly three or four an hour per file).
When the script reports "GitHub has the new pointer; browsers on the CDN path
keep the OLD pointer", nothing is wrong: the raw pointer already carries the
new build and the loader prefers the newer one. Re-run
`./stamp_and_push.sh --pointer-only` later to purge again.

Requirements: zsh (the script uses zsh parameter flags), git with push rights
on this repo, python3, node (a syntax gate on the bundle's js), curl. The
scripts run from wherever the clone lives; `LR_MEDIA_REPO` overrides.

Exceptions: `window/<slug>.mp4`, `window/<slug>.jpg` and `window/index.json`
are read from GitHub raw on every page load, so a plain push of a film is
live within a minute.

Who builds what lives in the private pipeline repo,
monkantony/lr-editorials-pipeline: its README maps every file here to its
builder, and its two GitHub Actions (the Monday article and the Wire) push
here with a deploy key.
