---
description: Ship workflow - Husky enabled, zero friction
---

**Active enforcement:**
- Husky + lint-staged (lint/format on commit)
- Commitlint (conventional commits enforced)
- PR template with checklist and risk level

## 1. Sync main and create branch

```bash
git checkout main
git pull origin main
git checkout -b <username>/<short-description>
```

**Discipline:** Keep PRs < 300 lines when possible. One logical concern per branch.

---

## 2. Stage, commit, verify

```bash
# Consistent staging: use patch mode for precision
git add -p

# Commit (Husky auto-runs lint-staged + commitlint)
git commit -m "feat: add user authentication"

# Quick verification (typecheck + lint)
pnpm ship:quick

# Full verification (add tests when configured)
pnpm ship:full

# Build
pnpm build
```

If checks fail: fix → stage → amend:

```bash
git add <files>
git commit --amend --no-edit
```

**Commit types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`, `ci`, `revert`

---

## 3. Push and open PR

```bash
# Rebase on latest main (team workflows)
git fetch origin && git rebase origin/main

# Push
git push -u origin <branch-name>

# Create PR (auto-fills from commits, uses template)
gh pr create --fill
```

**PR size check:** If diff > 300 lines, consider splitting into smaller PRs.

CI runs automatically: typecheck, lint, build, tests.

---

## 4. Merge when ready

```bash
# Monitor checks
gh pr checks --watch

# Merge with auto (queue when checks pass)
gh pr merge --squash --auto
```

Preview deploys on PR; production deploys on merge to main.

---

## 5. Clean up

```bash
git checkout main
git pull origin main
git branch -d <branch-name>
git remote prune origin
```

---

## Overrides

Skip hooks (emergency): `git commit --no-verify`
Force push (safe): `git push --force-with-lease`
