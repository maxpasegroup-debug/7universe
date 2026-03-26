import { NextResponse } from "next/server";

export function getRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function badRequest(message: string, requestId = getRequestId()) {
  return NextResponse.json({ success: false, error: message, requestId }, { status: 400 });
}

export function unauthorized(message = "Unauthorized", requestId = getRequestId()) {
  return NextResponse.json({ success: false, error: message, requestId }, { status: 401 });
}

export function notFound(message: string, requestId = getRequestId()) {
  return NextResponse.json({ success: false, error: message, requestId }, { status: 404 });
}

export function serverError(message: string, requestId = getRequestId()) {
  return NextResponse.json({ success: false, error: message, requestId }, { status: 500 });
}

export function logApiError(scope: string, error: unknown, requestId: string) {
  console.error(`[${scope}] requestId=${requestId}`, error);
}
