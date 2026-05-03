# Database Queries & Transactions

All server-side database access is centralized in `src/lib/db.ts`. To ensure Next.js hot-module replacement (HMR) doesn't exhaust our connection limits, and to safely handle multi-step database writes, we use a **Transaction-Aware Repository Pattern**.

## Core Query Functions

We wrap `pg`'s default query methods to handle type-casting and connection scoping.

|**Function**|**Scope**|**Yields**|**Use Case**|
|---|---|---|---|
|`q`|General Pool|`T[]`|Standalone queries returning multiple rows.|
|`one`|General Pool|`T \| null`|Standalone queries returning a single row.|
|`qOn`|Specific Client|`T[]`|Inside transactions returning multiple rows.|
|`oneOn`|Specific Client|`T \| null`|Inside transactions returning a single row.|

Using the general pool (`q`, `one`) checks out a random connection, runs the query, and immediately releases it. Using a specific client (`qOn`, `oneOn`) locks the query to a dedicated connection — which is mandatory for transactions.

## `withTransaction`

The single function that orchestrates database transactions. It checks out a dedicated `PoolClient`, initiates a `BEGIN` statement, executes your callback, and handles `COMMIT` or `ROLLBACK` automatically.

TypeScript

```
import { withTransaction } from "@/lib/db";

const result = await withTransaction(async (client) => {
  // All queries inside this block MUST use the injected `client`
});
```

If any error is thrown inside the callback, `withTransaction` will issue a `ROLLBACK`. If the operation fails entirely, it is treated as a `DatabaseError` (HTTP 500) and caught by our centralized error handling.

## Usage Patterns

### Standalone Queries — Auto-pooling

Use this pattern for simple API routes or data-fetching functions where only a single database operation is required. The function manages its own connection to the pool.

TypeScript

```
export async function getQuestionById(id: QuestionID): Promise<Questions | null> {
  // `one` automatically grabs a connection and releases it
  const row = await one<QuestionRow>(
    "SELECT * FROM questions WHERE question_id = $1",
    [id]
  );
  return row ? mapQuestion(row) : null;
}
```

### Multi-step Transactions — Client Injection

Use this pattern when multiple database operations must succeed or fail together (e.g., deducting credits and inserting a row). You must inject the `client` provided by `withTransaction` into every subsequent repository call.

TypeScript

```
export async function createQuestionAndDeductCredits(userId: UserID, content: string) {
  return await withTransaction(async (client) => {
    // 1. Deduct credits using the shared transaction client
    await deductUserCredits(userId, 10, client);

    // 2. Insert the question using the EXACT SAME client
    const newQuestion = await insertQuestion(userId, content, "general", client);

    return newQuestion;
  });
}
```

**Rule of thumb:** If a repository function requires multiple steps, wrap it in `withTransaction`. If a higher-level business logic function calls multiple repository functions, wrap the _business logic_ in `withTransaction` and pass the client down.

## Writing Repository Functions — The Optional Client

To keep our codebase DRY, we do not write separate functions for "transaction" and "non-transaction" queries.

When adding a new database function to the repository, **always add `client?: PoolClient` as the final parameter** and use a ternary operator to switch between `qOn` and `q`.

TypeScript

```
export async function updateRecord(
  id: string, 
  client?: PoolClient // <-- Always optional, always last
): Promise<Record | null> {
  const sql = "UPDATE records SET updated_at = now() WHERE id = $1 RETURNING *";
  
  const row = client 
    ? await oneOn<RecordRow>(client, sql, [id]) 
    : await one<RecordRow>(sql, [id]);
    
  return row ? mapRecord(row) : null;
}
```

By doing this, the function can gracefully handle standalone execution in a standard route handler, or participate safely in a broader transaction when a client is provided.