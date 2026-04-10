export const environment = {
  production: false,
  /** Same-origin `/api` — proxied to Laravel by `proxy.conf.json` during `ng serve`. */
  apiUrl: '/api',
  /**
   * Tap redirects from the public web to FRONTEND_URL. Browsers block that when FRONTEND_URL is
   * localhost (local network access). We avoid the iframe in dev and send the whole tab to Tap;
   * if redirects are still blocked, use an HTTPS tunnel and set FRONTEND_URL + CORS on the API.
   */
  tapPreferFullPageRedirectOnLocalhost: true,
};
