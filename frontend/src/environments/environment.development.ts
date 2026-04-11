export const environment = {
  production: false,
  /**
   * Call Laravel directly so workshops load even when the dev-server proxy to :8000 fails
   * (common `vite http proxy error` if Laravel was down or bound differently). CORS allows
   * localhost:4200 and 127.0.0.1:4200 in `backend/config/cors.php`.
   */
  apiUrl: 'http://127.0.0.1:8000/api',
  /**
   * Tap redirects from the public web to FRONTEND_URL. Browsers block that when FRONTEND_URL is
   * localhost (local network access). We avoid the iframe in dev and send the whole tab to Tap;
   * if redirects are still blocked, use an HTTPS tunnel and set FRONTEND_URL + CORS on the API.
   */
  tapPreferFullPageRedirectOnLocalhost: true,
};
