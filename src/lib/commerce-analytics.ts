type CommerceEvent = "view_item" | "add_to_cart" | "begin_checkout" | "purchase";

type CommercePayload = {
  itemId?: string;
  itemName?: string;
  value?: number;
  currency?: string;
  quantity?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackCommerceEvent(event: CommerceEvent, payload: CommercePayload = {}) {
  if (typeof window === "undefined") return;

  const item = {
    item_id: payload.itemId,
    item_name: payload.itemName,
    price: payload.value,
    quantity: payload.quantity,
  };

  window.gtag?.("event", event, {
    currency: payload.currency,
    value: payload.value,
    items: [item],
  });

  const metaEvent = event === "view_item"
    ? "ViewContent"
    : event === "add_to_cart"
      ? "AddToCart"
      : event === "begin_checkout"
        ? "InitiateCheckout"
        : "Purchase";

  window.fbq?.("track", metaEvent, {
    content_ids: payload.itemId ? [payload.itemId] : undefined,
    content_name: payload.itemName,
    content_type: "product",
    currency: payload.currency,
    value: payload.value,
  });
}