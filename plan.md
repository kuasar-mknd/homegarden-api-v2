1. **Optimize `authMiddleware` for Performance**
   - Add a singleton `supabaseClient` to avoid calling `createClient()` on every request.
   - Add `AUTH_USER_SELECT` to exclude large JSON blobs (`preferences`) and unused fields (`password`) from Prisma `findUnique` and `create` calls.

2. **Update Tests**
   - Refactor `tests/middleware/auth.middleware.test.ts` to use `vi.resetModules()` and `vi.doMock()` to support testing the singleton behavior and ensure test isolation.

3. **Verify Changes**
   - Run `pnpm lint` to ensure code style is correct.
   - Run `pnpm test` to ensure tests pass.

4. **Pre-commit Steps**
   - Run pre-commit instructions to ensure proper testing, verification, review, and reflection are done.

5. **Submit PR**
   - Create PR with the title `⚡ Bolt: [performance improvement] Optimize auth middleware`
