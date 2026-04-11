export const TAP_CHECKOUT_COMPLETE = 'tap-checkout-complete' as const;

export interface TapCheckoutCompletePayload {
  type: typeof TAP_CHECKOUT_COMPLETE;
  orderUuid: string;
}

export function isTapCheckoutCompleteMessage(data: unknown): data is TapCheckoutCompletePayload {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const o = data as Record<string, unknown>;
  return (
    o['type'] === TAP_CHECKOUT_COMPLETE &&
    typeof o['orderUuid'] === 'string' &&
    (o['orderUuid'] as string).length > 0
  );
}

/** Tap return URL may be http://localhost in an iframe while checkout runs on an HTTPS tunnel. */
export function isLocalBrowserOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
      return false;
    }
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
