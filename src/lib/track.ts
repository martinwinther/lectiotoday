export function track(
  event: 'view_quote' | 'share' | 'copy_link' | 'post_ok' | 'post_blocked',
  quoteId?: string
) {
  // fire-and-forget; ignore errors
  fetch('/api/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event, quoteId }),
  }).catch(() => {});
}

