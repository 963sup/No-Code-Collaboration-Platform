# Next.js AGENTS.md

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## 核心定位

1. Next.js 只負責 Web Delivery、Routing、Rendering、Composition 與 UI 邊界，不屬於 Domain 或 Application。

2. 不得把 Next.js 的 `page.tsx`、`layout.tsx`、Route Handler、Server Action 或 React Component 當成業務模型。

3. 系統架構必須先存在 Domain、Application、Port，再由 Next.js 負責組裝與呈現。

4. 固定依賴方向：

   `Next.js UI → Application → Domain`

   Infrastructure 透過 Port / Adapter 接入，不得反向讓 Domain 依賴 Next.js。

5. Domain 與 Application 不得 import：

   * `next/*`
   * React routing API
   * `cookies()`
   * `headers()`
   * `redirect()`
   * `revalidatePath()`
   * `NextRequest`
   * `NextResponse`

6. Next.js 是目前的 Delivery Framework，不是系統本身；未來更換 Web Framework 不應要求修改核心 Domain Model。

---

## App Router 規則

7. 統一採用 Next.js App Router，不建立新的 Pages Router 架構。

8. `app/` 代表 URL、Layout、Rendering 與 Composition，不代表 Domain 邊界。

9. 不得因為 URL 路徑相鄰，就推導兩個功能屬於同一個 Bounded Context。

10. 不得因為同一 Bounded Context 存在，就強迫所有功能放入同一個 Next.js route segment。

11. URL 結構服務於使用者導航；Domain 結構服務於業務語意，兩者不得混為一談。

---

## Server Component 規則

12. 預設使用 Server Component。

13. 能在 Server Component 完成的工作，不得無理由改成 Client Component。

14. Server Component 主要負責：

* 取得頁面所需資料
* 呼叫 Application Query / Use Case
* Server-side composition
* 權限結果呈現
* 將最小必要資料傳入 Client Component

15. Server Component 不得直接實作核心業務規則。

16. `page.tsx` 與 `layout.tsx` 應保持薄層，主要負責 orchestration 與 composition。

17. 不得在 `page.tsx` 中建立大型 Repository query、資料轉換或 Domain decision tree。

---

## Client Component 規則

18. `'use client'` 只在真正需要 Client Runtime 時使用。

19. 合理的 Client Component 使用情境包括：

* event handler
* local UI state
* browser API
* effect
* interactive widget

20. 不得因為子元件需要互動，就把整個頁面或大型 Layout 標記為 `'use client'`。

21. Client Boundary 必須盡可能靠近真正需要互動的葉節點。

22. `'use client'` 不得成為逃避 Server / Client 邊界設計的快捷方式。

23. Client Component 不得直接持有 server secret、admin credential 或 server-only infrastructure。

---

# Parallel Routes

24. 複合型企業工作台優先採用 Parallel Routes 表達「同一頁面中的平行工作區」。

25. Parallel Route 使用 `@slot` 表達 UI Composition Slot，而不是 Domain Entity。

例如：

```text
app/
└── repositories/
    └── [repositoryId]/
        ├── layout.tsx
        ├── page.tsx
        │
        ├── @navigation/
        ├── @workspace/
        ├── @context/
        └── @activity/
```

26. `@slot` 的命名必須描述 UI / Product Responsibility，不得使用模糊名稱：

禁止：

```text
@left
@right
@one
@two
@content1
```

優先：

```text
@navigation
@workspace
@context
@activity
@inspector
@notifications
```

27. Parallel Route 是 Presentation Composition，不得因此建立對應 Domain Aggregate。

錯誤：

```text
@activity
↓
因此建立 ActivityPageDomain
```

正確：

```text
Activity bounded context
↓
Application query
↓
@activity slot
```

28. 每個 slot 可以獨立取得自己的 Application Read Model。

29. Slot 之間不得透過彼此的 React implementation 建立隱性業務依賴。

30. 如果兩個 slot 必須共享業務狀態，先檢查該狀態應屬於：

* Domain
* Application
* URL state
* shared presentation state

不得直接用跨 slot React state 掩蓋架構問題。

---

# Repository 工作台模型

31. Repository 是本平台的「無代碼協作容器」，不是 Git source-code repository 的直接複製。

32. Next.js 必須呈現 Repository 的產品語意，而不是決定 Repository Domain Model。

33. Repository Workspace 可以由多個平行 Surface 組成，例如：

```text
Repository
│
├── Navigation
├── Main Workspace
├── Context / Inspector
├── Activity
├── Notifications
└── Collaboration Surface
```

34. 這些 Surface 可以使用 Parallel Routes 組裝，但 Domain ownership 必須由 Bounded Context 決定。

35. GitHub 的 URL、頁面名稱與 UI 可以作為 Reverse Engineering Benchmark，但不得直接複製其內部 Domain 假設。

36. 先逆向 GitHub 的產品語意，再從企業協作需求重新建立 Domain Model。

---

# Route Groups

37. `(group)` 僅用於 URL 不變的 route organization 與 layout partition。

例如：

```text
app/
├── (public)/
├── (authenticated)/
├── (workspace)/
└── (admin)/
```

38. Route Group 不等於 Bounded Context。

39. 不得建立：

```text
(domain)
(application)
(infrastructure)
```

這類把架構層錯誤映射到 Next.js Route Group 的設計。

40. Route Group 應描述 Web Experience / Navigation Concern，例如：

```text
(marketing)
(authenticated)
(workspace)
(settings)
```

---

# Dynamic Routes

41. Dynamic Route 代表 URL identity，不自動代表 Domain Entity。

例如：

```text
repositories/[repositoryId]
organizations/[organizationId]
projects/[projectId]
```

42. `[repositoryId]` 只負責從 URL 提供 identifier。

43. Route 不得自行決定 identifier 是否有效、使用者是否有權限或 Repository 是否可操作。

應交由：

```text
Route
↓
Application
↓
Domain / Access Policy
```

處理。

---

# Layout 規則

44. `layout.tsx` 只負責跨 route segment 的穩定 UI Composition。

45. 不得把大量業務邏輯放入 Layout。

46. Layout 可以負責：

* Shell
* Navigation
* Parallel Route Slot Composition
* Provider Composition
* Presentation-level context

47. Domain transaction、permission decision、workflow transition 不屬於 Layout。

---

# Server Action 規則

48. Server Action 是 Delivery Adapter，不是 Application Use Case。

49. Server Action 應保持薄層：

```text
Form / Client
↓
Server Action
↓
Validate transport input
↓
Application Command
↓
Result
↓
UI response
```

50. Server Action 不得直接包含核心業務流程。

錯誤：

```text
Server Action
├── 查資料庫
├── 判斷企業規則
├── 修改多個 Aggregate
└── 寫 audit
```

正確：

```text
Server Action
↓
Application Use Case
↓
Domain
↓
Ports
```

---

# Route Handler 規則

51. `route.ts` 是 HTTP Adapter。

52. Route Handler 不得成為新的 Application Layer。

53. Route Handler 主要負責：

* HTTP input
* authentication context extraction
* transport validation
* application invocation
* HTTP response mapping

54. 不得直接把 Infrastructure DTO 暴露成公開 API Contract。

---

# Supabase 與 Next.js 邊界

55. Next.js 不等於 Supabase。

56. Next.js 負責 Web Runtime；Supabase 是 Infrastructure Provider。

57. Next.js Server Component / Action / Route Handler 不應到處直接建立 Supabase Query。

優先：

```text
Next.js
↓
Application
↓
Port
↓
Supabase Adapter
```

58. Next.js Cookie Session 與 Supabase 整合統一使用 `@supabase/ssr`。

59. 禁止重新導入 `@supabase/auth-helpers-*`。

60. Supabase client factory 必須集中管理，不得在各 route 自行重複建立不同實作。

61. Supabase `database.types.ts` 不得穿透 Next.js Presentation 進入 Domain。

---

# Authentication / Authorization

62. Authentication 與 Authorization 必須分離。

63. Next.js route 判斷「是否存在 session」不等於完成 Authorization。

64. 是否允許使用者操作 Repository、Organization、Project 或其他資源，必須交由 Application / Access Policy 決定。

65. 不得使用：

```text
if (user) {
  // therefore authorized
}
```

取代真正的 permission decision。

---

# Loading / Error / Not Found

66. `loading.tsx`、`error.tsx`、`not-found.tsx` 屬於 Delivery UX。

67. UI Error Boundary 不得取代 Application / Domain Error Model。

68. Domain Error 必須先轉換為 Application Result，再由 Next.js 決定如何呈現。

---

# Colocation

69. 可以在 route segment colocate route-specific UI，但不得因此把業務核心搬進 `app/`。

允許：

```text
app/repositories/[repositoryId]/
├── page.tsx
├── layout.tsx
├── _components/
└── _presentation/
```

核心業務仍應位於：

```text
packages/domain/
packages/application/
packages/infrastructure/
```

70. `_components`、`_lib` 等 private folder 應優先保存 route-local implementation detail。

71. 如果邏輯開始跨 route 重複，應重新判斷其真正 ownership，而不是立即建立大型 `shared/`。

---

# Composition Root

72. Framework、Application Port 與 Infrastructure Adapter 的最終 wiring 必須存在清楚的 Composition Boundary。

73. 不得讓 Domain 自己尋找 Infrastructure implementation。

74. 不得透過全域 singleton service locator 隱藏依賴。

75. Dependency 必須可以沿程式碼追蹤：

```text
Next.js Entry
↓
Composition
↓
Application
↓
Port
↓
Adapter
```

---

# 命名規則

76. Next.js 路由名稱使用產品語言。

77. Domain 使用業務語言。

78. Infrastructure implementation 明確包含 provider 語意。

例如：

```text
RepositoryStore
SupabaseRepositoryStore

IdentityProvider
SupabaseIdentityProvider
```

79. 不得使用 Next.js routing terminology 去重新命名 Domain Concept。

80. 禁止使用 import specifier `as` 重新命名，以避免掩蓋 ownership 與 bounded-context 命名問題。

---

# AI / Codex 判斷規則

新增 Next.js 程式碼前，依序判斷：

```text
① 這是業務規則嗎？
   → Domain

② 這是應用流程嗎？
   → Application

③ 這是外部系統實作嗎？
   → Infrastructure

④ 這是 Web Routing / Rendering / Interaction 嗎？
   → Next.js
```

若答案不是第④項，不得因為「目前從頁面呼叫」就把程式碼放進 Next.js `app/`。

遇到 Parallel Route 時，再判斷：

```text
這是一個 UI Slot？
→ @slot

這是一個 Domain Capability？
→ Bounded Context / Application

這是一個 Provider Implementation？
→ Infrastructure

這只是 URL organization？
→ Route Group
```

---

# 最終核心規則

**不要用 Next.js 設計 Domain；先建立 Domain 與 Application，再讓 Next.js 負責呈現與組裝。**

**不要把 Parallel Route 當成 Bounded Context；它只是同一 Web Experience 中的平行 Presentation Slot。**

**URL 描述使用者如何到達功能；Domain 描述系統真正是什麼。**

**Next.js 是 Delivery Framework，不是 Architecture。**
