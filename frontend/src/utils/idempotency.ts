/**
 * Generates and manages idempotency keys to protect against duplicate requests
 * during network hiccups, rapid double taps, and client retries.
 */
export function generateIdempotencyKey(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class RequestCache {
  private inFlightKeys: Set<string> = new Set();
  private completedRequests: Map<string, any> = new Map();

  startRequest(key: string): boolean {
    if (this.inFlightKeys.has(key)) {
      return false; // Already executing
    }
    this.inFlightKeys.add(key);
    return true;
  }

  finishRequest(key: string, result?: any): void {
    this.inFlightKeys.delete(key);
    if (result !== undefined) {
      this.completedRequests.set(key, result);
    }
  }

  isDuplicate(key: string): boolean {
    return this.completedRequests.has(key);
  }

  getCachedResult(key: string): any {
    return this.completedRequests.get(key);
  }
}

export const requestGuard = new RequestCache();

