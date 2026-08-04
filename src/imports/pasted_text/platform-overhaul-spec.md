COMPLETE PLATFORM OVERHAUL: SPEC-COMPLIANT OAUTH (GOOGLE & LINKEDIN), AUTHORIZED PAYMENTS, ADMIN PORTAL, DATA BINDING, VERCEL ROUTING, AND MOBILE UI POLISH

Base API URL: https://acecerty-backend.onrender.com/api

======================================================================
1. BACKEND-SPECIFIC SOCIAL AUTHENTICATION (GOOGLE & LINKEDIN)
======================================================================
- Dynamic Token Storage (Identical to /api/auth/login response):
  * Both POST endpoints return: { "user": { ... }, "accessToken": "ey...", "refreshToken": "a1...", "tokenType": "Bearer" }.
  * Treat responses identically to standard login: store accessToken and refreshToken in localStorage.

- Google Identity Services (GIS Client Implementation):
  * Dynamic Script Loading: Load https://accounts.google.com/gsi/client in index.html or dynamic script injection.
  * Button & Credential Handler:
    javascript
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '<GOOGLE_CLIENT_ID>',
      callback: handleGoogleCredential,
    });
    google.accounts.id.renderButton(document.getElementById('google-btn'), { theme: 'outline', size: 'large' });
    
  * Payload Dispatch: Upon callback reception (response.credential), immediately execute:
    - POST /api/auth/google with body { "idToken": response.credential } (No auth header required).
    - Save returned accessToken / refreshToken, update global AuthContext, and redirect user to /dashboard.

- LinkedIn OAuth Flow & Callback Handler:
  * Authorization Redirect Trigger:
    - Generate and store CSRF state string: const state = crypto.randomUUID(); sessionStorage.setItem('linkedin_oauth_state', state);
    - Construct precise redirect URL:
      https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=<LINKEDIN_CLIENT_ID>&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/linkedin/callback')}&scope=openid%20profile%20email&state=${state}
  * Callback Component (/auth/linkedin/callback):
    - On mount, extract code and state from URL query parameters.
    - Validate state === sessionStorage.getItem('linkedin_oauth_state').
    - IMMEDIATELY execute payload exchange (within 30-60s window):
      POST /api/auth/linkedin
      Payload:
      {
        "code": codeFromQueryString,
        "redirectUri": window.location.origin + "/auth/linkedin/callback"
      }
    - Store returned accessToken / refreshToken, clear sessionStorage state, and route to /dashboard.
  * HTTP Toast Error Handling:
    - Handle 400 Bad Request: Display toast "Social sign-in not configured server-side."
    - Handle 401 Unauthorized: Display toast "Invalid/expired token or unverified email."

======================================================================
2. VERCEL 404 ROUTING FIX & DEDICATED ADMIN PORTAL (/admin/login & /admin)
======================================================================
- Vercel Rewrites Config (vercel.json):
  * Ensure vercel.json exists in project root with SPA catch-all rewrites:
    { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

- Dedicated Admin Login Gateway (/admin/login):
  * Isolated login page for admin access. Form action calls POST /api/auth/login.
  * Store token in localStorage.setItem('admin_access_token', token) and navigate to /admin.
  * Protect all /admin/* routes—redirect unauthenticated users to /admin/login.

- Admin CMS Dashboard (/admin):
  * Connect full CMS capabilities:
    - Create Course: POST /api/admin/courses
    - Edit Course: PUT /api/admin/courses/{id}
    - Delete Course: DELETE /api/admin/courses/{id}
    - View Analytics/Orders: GET /api/admin/users & GET /api/admin/orders
  * Changes made here update the public catalog instantly.

======================================================================
3. AUTHORIZED CHECKOUT & PAYMENT GATEWAY INTEGRATION
======================================================================
- Fix "Unauthorized" Checkout Error:
  * Before triggering any payment, check for valid token in localStorage.
  * If missing, block submission and open Sign In modal.
  * If present, attach Authorization: Bearer ${accessToken} to order creation (POST /api/orders/checkout) and verification calls.

- Payment Provider Redirection:
  * Route requests dynamically to Paystack, Flutterwave, Apple Pay, Google Pay, or Card gateways based on selection.
  * Handle post-checkout verification via GET /api/orders/verify?reference={reference} with Bearer Token.

======================================================================
4. DYNAMIC USER DATA & ACCURATE PAYLOAD DTOs
======================================================================
- Student Dashboard (/dashboard):
  * Fetch profile via GET /api/me. Replace mock name "Ada" dynamically with user name, initials avatar, and join date.
  * Fetch live enrollments from GET /api/me/courses to display real active course metrics and progress.
- Registration Payload Alignment:
  * Ensure POST /api/auth/register sends fullName (NestJS DTO requirement).

======================================================================
5. GLOBAL RESPONSIVE UI POLISH & VIEWPORT RESIZING
======================================================================
- Responsive Layout & Mobile Usability:
  * Use responsive containers (px-4 sm:px-6 lg:px-8, max-w-7xl mx-auto).
  * Constrain login cards (max-w-md w-full) and center vertically and horizontally.
  * Ensure text contrast, font scales (text-sm sm:text-base), and card structures fit cleanly across mobile screens without horizontal scrolling.

Generate updated components, router configuration, vercel.json, GIS handler, LinkedIn callback route, and payment logic.