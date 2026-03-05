# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Outdated Dependencies Exposing Server
**Vulnerability:** Several high-severity vulnerabilities were identified in the `hono` and `@hono/node-server` dependencies. These vulnerabilities included Server-Side Request Forgery via `serveStatic`, Cookie Attribute Injection, and Authorization Bypass.
**Learning:** Outdated frameworks and dependencies frequently accumulate critical CVEs that are easily discoverable via dependency audits. In this codebase, the specific `pnpm` configuration required the overrides block to be updated; otherwise, updating standard dependencies wouldn't reflect throughout the tree, leading to unpatched transitive flaws.
**Prevention:** Regularly run `pnpm audit --prod` as part of CI workflows. When applying updates, explicitly update `package.json` overrides blocks as well as `dependencies`, and commit the updated lockfiles to ensure that dependency subtrees properly consume the patched versions.
