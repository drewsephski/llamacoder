---
description: Ship workflow - Husky enabled, zero friction with robust error handling
---

**Active enforcement:**

- Husky + lint-staged (lint/format on commit)
- Commitlint (conventional commits enforced)
- PR template with checklist and risk level

## 0. Pre-flight checks

```bash
# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  You have uncommitted changes. Stash or commit them first."
  git status --short
  exit 1
fi

# Validate .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file missing. Copy from .env.example and configure."
  exit 1
fi

# Check migration status
npx prisma migrate status
```

---

## 1. Sync main and create branch

```bash
git checkout main
git pull origin main

# Prompt for branch name
read -p "Branch name (format: username/description): " branch_name
git checkout -b "$branch_name"
```

**Discipline:** Keep PRs < 300 lines when possible. One logical concern per branch.

---

## 2. Stage, commit, verify

```bash
# Consistent staging: use patch mode for precision
git add -p

# Commit (Husky auto-runs lint-staged + commitlint)
# If hooks fail, use --no-verify as emergency override
git commit -m "feat: description"

# Quick verification (typecheck + lint)
pnpm ship:quick

# Build BEFORE push to catch issues early
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

# Set up GitHub repo default (prevents gh pr create errors)
gh repo set-default $(git config --get remote.origin.url | sed 's/.*:\(.*\)\.git/\1/')

# Check diff size
diff_lines=$(git diff --stat origin/main | tail -n 1 | awk '{print $4}')
if [ "$diff_lines" -gt 300 ]; then
  echo "⚠️  Diff is $diff_lines lines. Consider splitting into smaller PRs."
  read -p "Continue anyway? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    exit 1
  fi
fi

# Push
git push -u origin "$branch_name"

# Create PR (auto-fills from commits, uses template)
gh pr create --fill
```

CI runs automatically: typecheck, lint, build, tests.

---

## 4. Merge when ready

```bash
# Quick status check (doesn't wait indefinitely)
gh pr checks

# Ask if user wants to wait for CI or merge manually
read -p "Wait for CI checks to pass? (y/n): " wait_ci

if [ "$wait_ci" = "y" ]; then
  # Monitor checks with timeout awareness
  gh pr checks --watch
fi

# Merge with auto (queues when checks pass)
gh pr merge --squash --auto
```

Preview deploys on PR; production deploys on merge to main.

---

## 5. Clean up

```bash
git checkout main
git pull origin main
git branch -d "$branch_name"
git remote prune origin
```

---

## Overrides

Skip hooks (emergency): `git commit --no-verify`
Force push (safe): `git push --force-with-lease`
Stash emergency: `git stash push -u` (includes untracked files)

---

## Common Issues & Solutions

**ESLint v9 circular structure error:**

- Temporarily remove eslint from lint-staged in package.json
- Commit with `--no-verify`
- Fix ESLint config separately

**Prisma migration conflict:**

```bash
npx prisma migrate resolve --applied <migration_name>
```

**gh pr create fails:**

```bash
gh repo set-default owner/repo
```

**Build fails on migration:**

- Check migration status: `npx prisma migrate status`
- Resolve conflicts: `npx prisma migrate resolve`
