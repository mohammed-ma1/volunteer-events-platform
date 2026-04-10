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
