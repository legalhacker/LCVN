# Bug Fix: JSON Ingest "Database operation failed"

**Date:** 2026-03-01
**Project:** LCVN (VietLaw Platform)
**Stack:** Express + Prisma 6 + Neon (serverless PostgreSQL) + Vercel serverless functions

---

## Symptom

Uploading a large legal document JSON file (218 articles, 907 clauses) to the admin panel's "Thêm văn bản mới" page always failed with:

> **Database operation failed**

The error was consistent — every attempt failed, regardless of whether orphaned records from previous attempts had been cleaned up.

---

## Root Cause

The ingest route used Prisma's **interactive transaction (callback form)**:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.article.deleteMany(...);         // DB round-trip 1
  await tx.article.createMany(...);         // DB round-trip 2  (218 articles)
  const rows = await tx.article.findMany(...); // DB round-trip 3  ← fetch generated IDs
  // JavaScript: build 907 clause objects from the returned IDs
  await tx.clause.createMany(...);          // DB round-trip 4  (907 clauses)
}, { timeout: 30000 });
```

This form holds a **live DB connection open** across 4 separate network round-trips AND JavaScript processing in between. On a serverless stack this is unreliable because:

| Factor | Impact |
|---|---|
| Neon serverless cold start | Adds ~3–5s to the first DB connection |
| Vercel default function timeout | 10s (no `maxDuration` was set in `vercel.json`) |
| JS processing between DB calls | Holds the transaction open while building 907 clause objects |
| Total transaction time | ~10–15s — exceeds Vercel's function window |

**Prisma error code: P2028** (Transaction API error) — the connection dropped mid-transaction. The backend error handler mapped all non-P2002 `PrismaClientKnownRequestError` codes to the generic "Database operation failed" string, hiding the code.

### Secondary issue: orphaned Document records

Step 1 (create Document metadata) succeeded before Step 2 (ingest articles) failed. Because Step 2 was in a separate API call, the transaction rollback only affected Step 2 — the Document record from Step 1 remained in the database as an orphan. Retrying then failed at Step 1 with a unique constraint violation (same `documentNumber`/`titleSlug`/`semanticId`).

---

## Solution

### 1. Replace interactive transaction with array-form transaction

Pre-generate article IDs in JavaScript before any DB call. This eliminates the `findMany` round-trip inside the transaction entirely.

**Before:**
```typescript
// documents.ts — json-articles route

const articlesData = deduped.map((a, idx) => ({
  documentId: req.params.id,
  articleNumber: String(a.article_number),
  articleId: `${slug}:${a.article_number}`,
  // ...
}));

await prisma.$transaction(async (tx) => {
  await tx.article.deleteMany({ where: { documentId: req.params.id } });
  await tx.article.createMany({ data: articlesData });

  // Extra round-trip needed because createMany returns no IDs
  const createdArticles = await tx.article.findMany({
    where: { documentId: req.params.id },
    select: { id: true, articleId: true },
  });
  const dbIdByArticleId = new Map(createdArticles.map(a => [a.articleId, a.id]));

  const allClauses = buildClauses(clausesByIndex, dbIdByArticleId); // JS work here
  await tx.clause.createMany({ data: allClauses });
}, { timeout: 30000 });
```

**After:**
```typescript
// documents.ts — json-articles route
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

const articlesData: Record<string, unknown>[] = [];
const allClauses: Record<string, unknown>[] = [];

for (let idx = 0; idx < deduped.length; idx++) {
  const a = deduped[idx];
  const articleDbId = randomUUID(); // ← pre-generate ID in JS, no DB call needed

  articlesData.push({ id: articleDbId, documentId: req.params.id, ... });

  if (hasClauses) {
    for (const c of a.clauses) {
      allClauses.push({ articleId: articleDbId, ... }); // ← use pre-generated ID
    }
  }
}

// Array-form: all 3 operations sent as one BEGIN → op1 → op2 → op3 → COMMIT
// No JS runs between DB calls — transaction completes in ~2–3s instead of ~10–15s
await prisma.$transaction([
  prisma.article.deleteMany({ where: { documentId: req.params.id } }),
  prisma.article.createMany({ data: articlesData as Prisma.ArticleCreateManyInput[] }),
  ...(allClauses.length > 0
    ? [prisma.clause.createMany({ data: allClauses as Prisma.ClauseCreateManyInput[] })]
    : []),
]);
```

**Why this works:**
- The array form sends all operations as a single batch — no JavaScript executes between DB calls
- Total transaction time drops from ~10–15s → ~2–3s
- No DB connection held open across async JS work
- Compatible with Neon serverless, Supabase PgBouncer (transaction mode), and standard PostgreSQL

### 2. Add compensating delete for Step 1 orphan prevention

In `frontend/src/app/admin/documents/new/page.tsx`, wrap Step 2 in a try/catch that deletes the document if ingest fails:

```typescript
const doc = await api.createDocument(data);

if (jsonArticles.length > 0) {
  try {
    await api.ingestJsonArticles(doc.id, jsonArticles);
  } catch (ingestErr) {
    await api.deleteDocument(doc.id).catch(() => {}); // clean up orphan
    throw ingestErr;
  }
}
```

---

## Diagnostic Technique Used

The backend error handler returned `{ error: 'Database operation failed', code: prismaErr.code }` but the frontend discarded the `code` field. To surface it:

```typescript
// adminApi.ts — fetchAdmin()
const msg = error.code
  ? `${error.error} [${error.code}]`
  : (error.error || `HTTP ${response.status}`);
throw new Error(msg);
```

Also added an inner try/catch directly in the route handler to expose the full Prisma error message:

```typescript
try {
  await prisma.$transaction([...]);
} catch (txErr) {
  const code = (txErr as { code?: string }).code;
  const msg = (txErr as Error).message?.slice(0, 500);
  res.status(400).json({ error: `Ingest failed [${code ?? 'UNKNOWN'}]: ${msg}`, code });
  return;
}
```

---

## Key Takeaways

1. **Never use `$transaction(callback)` for large batch inserts in serverless environments.** Use the array form with pre-generated IDs instead.

2. **Prisma's `createMany` does not return inserted IDs.** If you need IDs after a `createMany`, either:
   - Pre-generate them with `randomUUID()` / `createId()` before insertion, OR
   - Use `create` in a loop (slower), OR
   - Use a follow-up `findMany` — but NOT inside a long-running interactive transaction

3. **Always set `maxDuration` in `vercel.json` for routes that do heavy DB work.**
   For the legacy `builds` config style, this must go in the Vercel project dashboard (Project Settings → Functions) since `maxDuration` inside `builds[].config` is ignored.

4. **Two-step API flows need compensating transactions.** If Step 1 (create parent) succeeds and Step 2 (create children) fails, the parent becomes an orphan that blocks all retries via unique constraints. Always delete the parent on Step 2 failure.

5. **Surface error codes in the frontend.** `error.code` from Prisma error responses should be included in the thrown Error message for faster debugging.

---

## Files Changed

| File | Change |
|---|---|
| `backend/src/api/routes/admin/documents.ts` | Replace interactive `$transaction(callback)` with array-form; pre-generate article IDs with `randomUUID()` |
| `frontend/src/app/admin/documents/new/page.tsx` | Add compensating delete if ingest (Step 2) fails |
| `frontend/src/lib/adminApi.ts` | Expose Prisma error `code` in thrown error message |
| `backend/vercel.json` | Added to git tracking (was untracked); `maxDuration` attempt (needs dashboard config for `builds`-style projects) |
