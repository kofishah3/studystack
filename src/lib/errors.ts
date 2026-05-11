import type { NextResponse as NextResponseType } from "next/server";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export function errorToResponse(error: unknown): NextResponseType {
  const { NextResponse } = require("next/server");
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  console.error("[Unhandled Error]", error);
  return NextResponse.json(
    { error: "Internal Server Error", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
