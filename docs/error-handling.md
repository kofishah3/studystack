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

## Adding a New Error Class

Add it to `src/lib/errors.ts` following the existing pattern. Only add a new class if no existing one fits the semantics — check the table above first.

```ts
export class PaymentError extends AppError {
  constructor(message = "Payment failed") {
    super(message, 402, "PAYMENT_ERROR");
  }
}
```
