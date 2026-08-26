# Contributing to Library Management System

## Branching Strategy

| Branch | Purpose | Direct push allowed |
|--------|---------|-------------------|
| `main` | Production-ready code | **No** — PR only |
| `feat/library-management` | Active development | **No** — PR only |
| `feat/<slug>` | Feature branches | Yes (your own branch) |
| `fix/<slug>` | Bug-fix branches | Yes (your own branch) |

Always branch off `feat/library-management` for new work:

```bash
git checkout feat/library-management
git pull origin feat/library-management
git checkout -b feat/my-feature
```

---

## CI Pipeline

Every pull request triggers the full CI pipeline before merge is allowed.

### Jobs (all run in parallel)

| Job | What it checks |
|-----|---------------|
| `backend-lint` | ESLint rules across all backend `.js` files |
| `backend-test` | Jest unit tests + coverage summary |
| `backend-audit` | `npm audit --audit-level=high` on production deps |
| `frontend-lint` | ESLint (react-app rules) across `src/` |
| `frontend-test` | React Testing Library unit tests (`CI=true`) |
| `frontend-build` | Production build via `react-scripts build` |
| `frontend-audit` | `npm audit --audit-level=high` on production deps |
| `ci-success` | Fan-in gate — passes only when all jobs above pass |

The **`CI — All Checks Passed`** status check is what branch protection requires. This means one simple rule protects the branch while seven real jobs run the work.

### Estimated wall-clock time

- Clean run (no cache): ~3–4 minutes  
- Warm cache run: ~1.5–2.5 minutes  
- Stays well under the 5-minute target because all jobs run in parallel.

---

## Branch Protection Rules

Configure branch protection in **GitHub → Settings → Branches** for both `main` and `feat/library-management`:

### Required settings

1. **Require a pull request before merging**
   - Required number of approvals: `1`
   - Dismiss stale PR approvals when new commits are pushed: ✅
   - Require review from Code Owners: optional

2. **Require status checks to pass before merging**
   - Add required check: `CI — All Checks Passed`
   - Require branches to be up to date before merging: ✅

3. **Require conversation resolution before merging**: ✅

4. **Restrict force pushes**: ✅ (block everyone)

5. **Restrict deletions**: ✅

### Setting up via GitHub CLI

```bash
# Protect main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI — All Checks Passed"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Protect feat/library-management (same settings)
gh api repos/{owner}/{repo}/branches/feat%2Flibrary-management/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI — All Checks Passed"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

---

## Running CI Checks Locally

Before pushing, run the same checks the CI runs:

```bash
# Backend
cd backend
npm ci
npm run lint
npm test
npm audit --audit-level=high --omit=dev

# Frontend
cd frontend
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=high --omit=dev
```

---

## Fixing CI Failures

| Failure | Fix |
|---------|-----|
| Lint error | Run `npm run lint:fix` in the relevant package directory |
| Test failure | Run `npm test` locally, read the error, fix the code |
| Build failure | Run `npm run build` locally and check for errors |
| Security audit | Run `npm audit --fix` or pin a safe version; never ignore HIGH/CRITICAL |

---

## Dependency Updates

[Dependabot](/.github/dependabot.yml) opens weekly PRs for both backend and frontend.
These PRs go through the same CI pipeline. Review, verify CI passes, then merge.
