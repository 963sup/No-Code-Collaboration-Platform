# Supabase AGENTS.md

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Supabase 架構規則

1. Supabase 只屬於 Infrastructure，不屬於 Domain 或 Application。
2. 不得讓 Domain、Application、Use Case 直接依賴 Supabase SDK、Supabase Client 或 `database.types.ts`。
3. 系統先定義自身需要的能力（Port / Interface），再由 Supabase Adapter 實作；不得把 Supabase 本身當成系統能力。
4. 依賴方向固定為：
   `Domain → Application → Port ← Infrastructure Adapter → Supabase`
5. Repository、Auth、Storage 等能力必須使用中立的業務名稱，例如 `RepositoryStore`、`IdentityProvider`、`ObjectStorage`；Supabase 實作則使用 `SupabaseRepositoryStore`、`SupabaseIdentityProvider` 等名稱。
6. `generated/database.types.ts` 為 Supabase Infrastructure Type，只允許 Infrastructure 使用，不得向 Domain、Application 或 UI 洩漏。
7. Supabase Row / DTO 必須經 Mapper 轉換成 Domain Model；不得直接把資料庫 Row 當成 Domain Entity 使用。
8. Next.js 使用 Cookie Session，因此 Supabase Auth 採 `@supabase/ssr`；禁止重新導入已淘汰的 `@supabase/auth-helpers-*`。
9. Browser、Server、Admin Client 必須分離，因三者具有不同的執行環境、Session 與權限邊界。
10. Admin Client 必須保持 server-only；任何 secret / service-level credential 不得進入 Browser Bundle。
11. Supabase-specific query、mapper、repository implementation 應集中於 `packages/infrastructure/supabase/`，不得散落於 Domain、Application 或 UI。
12. Application 只能知道「需要什麼能力」，不得知道「目前由哪個供應商提供」。
13. 更換 Supabase 時，理想情況下只修改 Infrastructure Adapter 與 Composition Root，不修改 Domain 與 Application。
14. 文件與程式碼不得使用「Supabase = 系統架構」的語言；應表達為「Supabase 是目前的 Infrastructure Provider / Adapter」。
15. 新增任何 Supabase 依賴前，先回答：
    「這是系統能力，還是 Supabase 實作細節？」
    若屬實作細節，必須留在 Infrastructure。

## 核心規則

**不要抽象 Supabase；抽象系統需要的能力，再讓 Supabase 實作它。**
