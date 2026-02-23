# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Auth Context Data Leakage
**Vulnerability:** The `authMiddleware` was attaching the entire raw Prisma user object (including `password`) to the request context `c.set('user', user)`. While the password was a dummy UUID (handled by Supabase), this pattern risks leaking sensitive data if the context is logged or serialized downstream.
**Learning:** Never trust that downstream consumers (loggers, error handlers) will filter sensitive data.
**Prevention:** Explicitly strip sensitive fields (using destructuring) at the boundary where data enters the application context.

## 2025-05-23 - AI Prompt Injection
**Vulnerability:** User input (e.g., `symptomDescription`) was directly concatenated into AI prompts without sanitization. An attacker could potentially manipulate the LLM behavior by injecting quotes or control characters.
**Learning:** LLM prompts are code. Unsanitized user input in prompts is equivalent to SQL injection.
**Prevention:** Use a dedicated `sanitizePromptInput` utility to normalize quotes and strip control characters before injecting user text into prompts.
