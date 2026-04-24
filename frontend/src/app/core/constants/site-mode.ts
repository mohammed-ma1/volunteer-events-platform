/**
 * Hard kill-switch for the public site. When `true`, every route in
 * `app.routes.ts` short-circuits to the Coming Soon page — no shell, no
 * data fetches, no auth flows. Flip back to `false` and redeploy to bring
 * the real site back. There is intentionally no admin bypass: the
 * platform team manages content via the separate admin portal repo.
 */
export const SITE_DISABLED = true;
