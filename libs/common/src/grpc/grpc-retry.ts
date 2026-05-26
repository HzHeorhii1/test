import { Observable, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

// gRPC status codes referenced below:
//   4  DEADLINE_EXCEEDED — request timed out; server may or may not have processed it
//   14 UNAVAILABLE       — connection refused / server not yet up; request never reached server

/** Connection refused / server not yet up — request never reached the server. Safe to retry for any call. */
export const GRPC_UNAVAILABLE = 14;
/** Request timed out — server may or may not have processed it. Safe to retry only for idempotent calls. */
export const GRPC_DEADLINE_EXCEEDED = 4;
// RESOURCE_EXHAUSTED (8) is intentionally excluded: it signals a quota/rate-limit
// that backoff alone cannot resolve, and retrying wastes budget.

export const GRPC_RETRY_ATTEMPTS = 3;
export const GRPC_RETRY_BASE_DELAY_MS = 500;
export const GRPC_MAX_RETRY_DELAY_MS = 5_000;

/** Keepalive ping sent to the peer every N ms even without active calls. */
export const GRPC_KEEPALIVE_TIME_MS = 10_000;
/** Drop the connection if the keepalive ping is not acknowledged within N ms. */
export const GRPC_KEEPALIVE_TIMEOUT_MS = 5_000;
/** Allow keepalive pings even when there are no active RPCs. */
export const GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS = 1;
/** Disable the limit on pings without data — required when keepalive_permit_without_calls is set. */
export const GRPC_HTTP2_MAX_PINGS_WITHOUT_DATA = 0;

function buildRetry<T>(
  retriableCodes: ReadonlySet<number>,
  attempts: number,
  baseDelayMs: number,
): (source: Observable<T>) => Observable<T> {
  return retry({
    count: attempts,
    delay: (error: { code?: number }, attempt: number) => {
      if (!retriableCodes.has(error?.code ?? -1)) {
        return throwError(() => error);
      }
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), GRPC_MAX_RETRY_DELAY_MS);
      return timer(delay);
    },
  });
}

const IDEMPOTENT_CODES: ReadonlySet<number> = new Set([GRPC_UNAVAILABLE, GRPC_DEADLINE_EXCEEDED]);
const MUTATING_CODES: ReadonlySet<number> = new Set([GRPC_UNAVAILABLE]);

/**
 * Use for READ / idempotent gRPC calls (e.g. GetUser).
 * Retries on UNAVAILABLE and DEADLINE_EXCEEDED with exponential backoff.
 */
export function grpcRetryIdempotent<T>(
  attempts = GRPC_RETRY_ATTEMPTS,
  baseDelayMs = GRPC_RETRY_BASE_DELAY_MS,
): (source: Observable<T>) => Observable<T> {
  return buildRetry<T>(IDEMPOTENT_CODES, attempts, baseDelayMs);
}

/**
 * Use for WRITE / non-idempotent gRPC calls (e.g. SendNotification).
 * Retries ONLY on UNAVAILABLE — meaning the connection failed before reaching
 * the server, so the operation was never executed.
 */
export function grpcRetryMutating<T>(
  attempts = GRPC_RETRY_ATTEMPTS,
  baseDelayMs = GRPC_RETRY_BASE_DELAY_MS,
): (source: Observable<T>) => Observable<T> {
  return buildRetry<T>(MUTATING_CODES, attempts, baseDelayMs);
}
