export const environment = {
  production: false,
  /**
   * Same-origin `/api` is proxied to Laravel (`proxy.conf.json` → 127.0.0.1:8000). Use this so
   * HTTPS tunnels (e.g. Cloudflare → :4200) call the API on the same host instead of hard-coded
   * http://127.0.0.1:8000 (mixed content + wrong DB if checkout hit another environment).
   */
  apiUrl: '/api',
  /**
   * Tap redirects from the public web to FRONTEND_URL. Browsers block that when FRONTEND_URL is
   * localhost (local network access). We avoid the iframe in dev and send the whole tab to Tap;
   * if redirects are still blocked, use an HTTPS tunnel and set FRONTEND_URL + CORS on the API.
   */
  tapPreferFullPageRedirectOnLocalhost: true,
};
