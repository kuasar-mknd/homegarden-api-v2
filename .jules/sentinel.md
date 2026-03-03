# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - WebSocket Insecure Direct Object Reference (IDOR)
**Vulnerability:** The `ws-server.ts` WebSocket server lacked authentication. Consecutively, `care-reminder.handler.ts` explicitly trusted the `userId` provided by the client inside the socket message payload `message.payload?.userId`. This allowed any connected user to send arbitrary commands or subscribe to reminders using any other user's ID.
**Learning:** WebSockets are not immune to typical HTTP security vulnerabilities like IDOR and broken access control.
**Prevention:** Always authenticate WebSocket connections during the upgrade phase using securely verified tokens (e.g., via query string parameters or custom headers where applicable), and store the authenticated identity on the socket connection context. Message handlers must solely rely on this verified context (e.g. `ws.userId`) rather than client-provided identifiers when dealing with sensitive operations or subscriptions.
