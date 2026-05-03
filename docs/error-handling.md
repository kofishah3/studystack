# Error Handling

All server-side error handling is centralized in `src/lib/errors.ts`.

## Error Classes

Every error in the API extends `AppError`, which carries an HTTP status code and a machine-readable `code` string alongside the human-readable message.

| Class | Status | Code |
|---|---|---|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `AuthError` | 401 | `AUTH_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `RateLimitError` | 429 | `RATE_LIMIT_EXCEEDED` |
| `DatabaseError` | 500 | `DATABASE_ERROR` |

All responses produced by these classes share the same shape:

```json
{ "error": "<message>", "code": "<CODE>" }
```

Unhandled errors (anything not extending `AppError`) are caught by `errorToResponse`, logged server-side with `[Unhandled Error]`, and returned as a generic 500 with `code: "INTERNAL_ERROR"` — internal details are never leaked to the client.

## `errorToResponse`

The single function that converts any thrown value into a `NextResponse`. Always use this instead of constructing `NextResponse.json(...)` manually for error cases.

```ts
import { errorToResponse } from "@/lib/errors";

return errorToResponse(error); // handles AppError subclasses and unknowns
```

## Usage Patterns

### Route handlers — `throw` as control flow

Use this pattern for API route files (`route.ts`). Wrap the entire happy path in one `try` block; throw typed errors anywhere inside it. A single `catch` at the bottom delegates to `errorToResponse`.

```ts
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) throw new ValidationError("Email and password are required");

    const user = await getUserByEmail(email);
    if (!user) throw new AuthError();

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorToResponse(error);
  }
}
```

### Middleware / guards — early return

Use this pattern for wrapper functions that gate access before reaching a handler (e.g. `withAuth`). Pre-condition failures return early with `errorToResponse(new SomeError(...))` directly; a narrow `try/catch` is used only where a third-party call can throw.

```ts
export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (!authHeader?.startsWith("Bearer ")) {
      return errorToResponse(new AuthError("Unauthorized"));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return handler(req as AuthedRequest);
    } catch {
      return errorToResponse(new AuthError("Invalid token"));
    }
  };
}
```

**Rule of thumb:** use `throw` + single `catch` when you own the whole execution path. Use early returns when the function may not reach the main logic at all.

### Compensating cleanup — `console.error`, not error brands

When an operation fails partway through and you need to undo a prior side-effect (e.g. a storage write before a DB insert), the *cleanup* failure is a different beast from the *primary* failure. The primary failure shapes the HTTP response; the cleanup failure is an internal, operator-only concern — there's no caller to react to it, and you must not let it mask the original error.

Don't brand the cleanup failure as an `AppError`. Brands exist to drive `errorToResponse`, and the cleanup error never reaches that boundary (you're swallowing it on purpose so the original throws through). Log it with `console.error` and a tagged prefix so it's greppable in production logs.

```ts
const material = await insertTutorialMaterial({ ... }).catch(async (insertErr) => {
  await storage
    .delete(key)
    .catch((cleanupErr) => console.error("[Orphan Cleanup]", cleanupErr));
  throw insertErr;
});
```

The original `insertErr` rethrows into the outer `catch` and gets converted to a response by `errorToResponse` exactly as if no cleanup had happened.

## Adding a New Error Class

Add it to `src/lib/errors.ts` following the existing pattern. Only add a new class if no existing one fits the semantics — check the table above first.

```ts
export class PaymentError extends AppError {
  constructor(message = "Payment failed") {
    super(message, 402, "PAYMENT_ERROR");
  }
}
```
