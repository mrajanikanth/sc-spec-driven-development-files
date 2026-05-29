---
name: changelog
description: Update CHANGELOG.md in the project root before merging a branch — group entries under date headings, one bullet per commit. Use this skill whenever the user says "update the changelog," "bump the changelog," "log this work," or runs /changelog before merging, opening a PR, or shipping. If CHANGELOG.md does not exist yet, bootstrap it from the git history scoped to the project directory.
---

# Changelog skill

Keep a single `CHANGELOG.md` in the **project root** (the working directory containing `package.json`, `specs/`, `src/`, etc. — not necessarily the git repo root, which may be higher up in a monorepo). The changelog records what landed in this project, grouped by date. The user runs this skill manually before merging a branch so the merge itself carries the entry describing what is about to land.

## Defaults (override at the top of CHANGELOG.md if you want to change them)

- **Title:** `# Changelog`
- **Date heading:** `## YYYY-MM-DD` (commit author date, local timezone)
- **Order:** newest date at the top, just below the title.
- **Bullet format:** `- <commit subject> (<short-sha>)`
- **Skip merge commits** (`--no-merges`) — they're noise, not new information.
- **Strip `Co-Authored-By:` trailers** from anything that ends up in the bullet. We only use the subject line, so this is automatic, but keep it in mind if a multi-line subject sneaks in.
- **Idempotent within a day:** rerunning the skill on the same day must not duplicate bullets. The short SHA in each bullet is the dedupe key.

If the project later wants a different format (Keep-a-Changelog sections, conventional-commit grouping, etc.), edit this section and the skill's procedure will follow it.

## When to run

The user invokes this skill manually, typically right before merging a branch. Common phrasings: "update the changelog", "log this branch", "run /changelog before I merge". Don't run it speculatively after every commit — wait for the explicit ask.

## Procedure

### 1. Sanity-check the environment

Run these from the **project root** (your current working directory — the folder with `package.json` / `specs/`):

```bash
git rev-parse --is-inside-work-tree   # must print "true"
pwd                                   # this is the project root; CHANGELOG.md goes here
```

If we're not inside a git repo, stop and tell the user — there's nothing to log. The git repo root (`git rev-parse --show-toplevel`) may be higher up; that's fine, but the changelog lives at the project root, and all `git log` queries are scoped to this directory with a `-- .` pathspec.

### 2. Decide: bootstrap or incremental?

```bash
test -f CHANGELOG.md && echo exists || echo missing
```

- `missing` → **bootstrap path** (section 3).
- `exists` → **incremental path** (section 4).

### 3. Bootstrap from full git history

Build the entire file once from `git log`.

```bash
git log --no-merges --date=format-local:%Y-%m-%d \
  --pretty=format:'%ad%x09%h%x09%s' \
  --reverse \
  -- .
```

The trailing `-- .` scopes the log to commits that touched the project root (your current directory). This emits `YYYY-MM-DD<TAB>shortsha<TAB>subject` for every non-merge commit, oldest first. Group rows by the date column, then write `CHANGELOG.md` with:

1. `# Changelog` as the first line.
2. A blank line.
3. Each date as `## YYYY-MM-DD`, **newest date first** (reverse the grouping for output even though we read oldest-first).
4. Under each date heading, one `- <subject> (<shortsha>)` bullet per commit. Within a date, keep commits in chronological order (oldest first) so the story reads forward inside the day.

Write the file with the Write tool. Don't pipe `git log` straight to disk — you want to control formatting.

### 4. Incremental update

Find the latest date heading already in `CHANGELOG.md`, then add anything newer plus anything from that same date that isn't already linked by short SHA.

```bash
# Latest date heading present in the file:
grep -E '^## [0-9]{4}-[0-9]{2}-[0-9]{2}$' CHANGELOG.md | head -n1
```

Take that date as `LAST_LOGGED_DATE`. Then:

```bash
git log --no-merges --date=format-local:%Y-%m-%d \
  --since="$LAST_LOGGED_DATE 00:00" \
  --pretty=format:'%ad%x09%h%x09%s' \
  --reverse \
  -- .
```

For each row:

- If `CHANGELOG.md` already contains `(<shortsha>)`, skip it — already logged.
- Otherwise, append it as a bullet under its date heading. Create the date heading if it doesn't exist yet, inserting it in the correct position (newest at top, just below the title).

Use the Edit tool to splice in the new bullets and any new headings. Don't rewrite the whole file — preserve existing bullets verbatim, including any hand-edited prose.

### 5. Show the diff and stop

After writing, show the user what changed:

```bash
git --no-pager diff -- CHANGELOG.md
```

Do **not** stage, commit, or push. The user runs this skill before merging — they'll commit the changelog update themselves (often as part of the merge commit or as a final commit on the branch).

## Edge cases

- **Empty repo (no commits yet).** Tell the user there's nothing to log and exit. Don't create an empty CHANGELOG.md.
- **Merge commit with a meaningful subject** (rare). Default is `--no-merges`. If the user objects ("but the merge commit had real content"), drop the flag for that run and note it in the response.
- **Branch with commits already on `main`.** `git log` over the whole repo will include them on bootstrap, which is correct — the changelog covers the project, not just this branch. On incremental updates, `--since` plus the SHA-dedupe check handles overlap.
- **Squashed history.** If the user squashes before merging, run the skill *before* the squash so the per-commit bullets survive. After a squash, the original messages are gone.
- **Commits on a different day than the merge.** The bullet sits under the commit's author date, not today's date. That keeps the timeline truthful.
- **Multi-line commit subject** (someone used `git commit -m "$(cat <<EOF ...)"`). `%s` is just the subject line — the first line — so this is handled automatically. If a subject is suspiciously long (>120 chars), flag it to the user rather than silently truncating.

## What this skill explicitly does not do

- It does not categorize commits (no "Added / Changed / Fixed" sections). The date+subject is the contract; if the team wants categorization later, that's a separate evolution of this skill.
- It does not edit commit messages, rebase, or touch git history.
- It does not commit or push the changelog. The user owns the merge.
