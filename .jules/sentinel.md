# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2026-01-24 - AI Prompt Injection Risks
**Vulnerability:** User inputs (plant names, symptoms) were concatenated directly into Gemini system prompts without sanitization, allowing potential prompt injection.
**Learning:** AI prompts are code. User input inside prompts must be treated as untrusted data, just like SQL parameters.
**Prevention:** Always sanitize inputs destined for LLMs by stripping control characters, normalizing whitespace, and enforcing length limits.

## 2026-01-24 - WebSocket IDOR & Missing Auth
**Vulnerability:** The WebSocket server allows any client to subscribe to any user's care reminders solely by providing a `userId`, with no authentication or authorization checks.
**Learning:** Real-time features often bypass standard HTTP middleware chains.
**Prevention:** Authenticate WebSocket connections during the handshake (verify JWT) and authorize actions based on the authenticated session, not client-provided IDs.
