---
name: github-semantics-first-principles
description: Use whenever adapting, naming, designing, or reviewing ANY GitHub-derived concept for this no-code platform — Enterprise, Organization, Team, Collaborator, User/social features (Follow/Star), Wiki, Projects, Issues, URL structure, navigation, or UI/UX. Also use when a PR, design doc, or code change touches ownership, permissions, collaboration flows, or resource hierarchy. Trigger this proactively even if the user does not say "first principles" or "audit" — any request to add/rename/redesign a feature that has a GitHub counterpart must run through this skill before being accepted. Do not use for unrelated no-code content/data work that has no GitHub analog.
---

# GitHub Semantics First Principles

反向工程 GitHub 產品語意時，用第一性原理拆解每一個候選概念，確保它「存活」的理由不依賴程式碼、版本控制、或軟體開發假設，並且最終都能收斂回本專案唯一的協作容器。

## 絕對公理（不可重新詮釋、不可模糊化、不可條件化）

> **Repository = No-Code Collaboration Container**

Repository 是本專案唯一且不可動搖的協作容器原型。Enterprise、Organization、Team、Collaborator、User、社交關係（Follow/Star）、Wiki、Projects、Issues 等 GitHub 衍生候選概念，都不得被預設成第二個 Repository-equivalent 協作容器，也不得因 GitHub 提供就自動成為本平台功能。只有通過五步驟的概念才能保留，並依問題本質分類為 Actor / Scope / Principal / Relationship / Artifact / Process / Projection / UI 慣例；分類本身也不自動建立實體、資料表或功能。

**判斷準則：任何概念如果無法回答「這對 Repository 做了什麼」，就不屬於這個產品。**

## 五步驟拆解程序（每個 GitHub 概念都必須逐一跑完，不得跳步）

拿到任何一個 GitHub 概念（Organization、Team、Issue、Wiki、Project、任何 URL/UI 模式……）時：

1. **識別原始問題**：這個概念在 GitHub 裡解決的是使用者遇到的什麼協作/組織困境？（不是「GitHub 怎麼做」，而是「使用者卡在哪裡」）
2. **剝離程式碼前提**：拿掉「Source Code」「任意程式執行」「CI/CD」「軟體開發」這些前提後，這個原始問題還存在嗎？
   - 存在 → 進入第 3 步
   - 不存在（問題只能靠程式碼解析、任意運算、建置、測試或部署成立）→ **整個概念直接淘汰。禁止用比喻、重新命名、或「更通用的包裝」保留它。**
   - 若問題可被重新表述為「結構化資料的狀態、比較、提案、核准或傳遞」→ 繼續，但必須套用下方嚴格無代碼資料邊界。
3. **套用唯一前提重新表述**：把這個問題套進「Repository = 無程式碼協作容器」這個唯一前提，它會長什麼樣子？
4. **分類語意角色**：這個概念在新語意下，是：
   - **Actor**（誰在行動）
   - **Scope**（哪個擁有權/治理邊界適用）
   - **Principal**（誰可以被授權）
   - **Relationship**（身分/擁有者/主體/範圍/容器之間如何連結）
   - **Artifact**（Repository 容器內部的協作產物）
   - **Process**（Artifact/Relationship 的狀態如何合法變化）
   - **Projection**（對已存在資料的呈現方式，不是新實體）
   - 還是純 UI 慣例（不需要建模為任何實體）？
5. **收斂回 Repository**：這個概念存在的唯一理由，是不是因為它服務於 Repository 這個容器？
   - 如果答案是「它自己也想成為一個容器」，或「它需要獨立於 Repository 存在的協作空間」→ **直接拒絕**。

## 強制無代碼資料邊界（在五步驟的任何一步都適用，優先權最高）

以下能力絕對排除：

- Source Code、可執行程式、shell、script、任意 expression/runtime；
- Code Search、code review、程式碼逐行解析，以及以程式語言語法為前提的比較或合併；
- CI/CD、build、test runner、deployment、Package/Release source capability；
- 未經 schema 驗證的任意 payload、credential/secret 內容，以及未經授權的外部端點；
- 任何試圖成為 Repository 之外第二個協作 Container 的實體。

`Commit`、`Branch`、`Diff`、`Pull Request`、`Actions`、`Gist` 不因名稱自動排除，也不因 GitHub 存在而自動接受。只有下列無代碼語意可以進入候選模型：

| GitHub 名稱 | 允許的無代碼語意 | 語意角色 | 絕對禁止 |
| --- | --- | --- | --- |
| Commit | 一次不可變、可歸因的結構化資料變更批次 | Process result + Evidence | Source Code commit、任意檔案樹、程式碼作者/行號語意 |
| Branch | Repository 內隔離的具名資料狀態線 | Context/Process state | 成為第二 Container、獨立授權、git ref/checkout 心智模型 |
| Diff | 兩個已授權結構化資料狀態的欄位/記錄比較 | Projection | 程式碼逐行 diff、語法解析、跨權限洩漏 |
| Pull Request | 請求審核並套用一組資料變更的提案流程 | Process | code review、git merge、用提案繞過目標 Resource 授權 |
| Actions | 白名單端點間的宣告式資料傳遞 | Process | script、shell、任意運算、CI/CD、build/test/deploy |
| Gist | Repository 內可分享的型別化 Data Capsule/Transfer Artifact | Artifact | 可執行 snippet、獨立協作空間、繞過 Repository visibility |

共同不變條件：

1. 只讀寫已接受的 Repository Resource schema；文字即使看起來像程式碼也只被當作不透明資料，不提供程式碼能力。
2. 每次讀取、比較、提案、套用或傳遞都重新評估 Actor、Repository、Capability 與目標 Resource 狀態。
3. Branch、Proposal、Gist、Action 不擁有 Repository、Grant、Membership 或獨立 visibility。
4. Diff 是衍生 Projection；Commit/Evidence 不可被 Projection 回寫。
5. Action 只能在明確型別、白名單 connector/endpoint、固定資料映射與大小/保留限制內傳遞；不得接受使用者程式碼。
6. Secret/credential 只能由受控基礎設施引用，永遠不能成為可檢視或傳遞的 payload。
7. Git 工程流程與本產品資料語意仍是不同層次；相同名詞不得讓 `.git`、GitHub source-control API 或 code-specific invariants 洩漏進 Product/Domain。

## 已知概念的預設拆解結果（作為起點，實作前仍須重跑五步驟驗證，不得直接照抄）

以下每個概念都依「原始問題 → 五步驟結果 → 具體設計方向 → 明確排除項」四段展開，設計時直接比對這四段，不要只看標題。

### Enterprise

- **原始問題**：多個 Organization 之間需要統一治理（帳單、安全政策、跨組織資源盤點）。
- **五步驟結果**：問題不依賴程式碼，成立；但它不是容器，只能是 **Scope**（比 Organization 更上一層的治理邊界）。
- **具體設計方向**：Enterprise 是「一組 Organization 的集合 + 治理政策（Policy）」，它本身不擁有任何 Repository；Repository 永遠只能被 User 或 Organization 直接擁有。Enterprise 對 Repository 的影響一律透過「Enterprise → 底下的 Organization → Organization 擁有的 Repository」這條鏈間接發生，不得開後門讓 Enterprise 直接掛 Repository。
- **明確排除項**：不建立「Enterprise-owned Repository」；不讓 Enterprise 出現在 Repository Owner 的型別聯集裡（`owner_user_id XOR owner_organization_id`，沒有 `owner_enterprise_id`）。

### Organization

- **原始問題**：多人需要共同擁有、共同治理多個 Repository。
- **五步驟結果**：問題成立，角色是 **Scope + 可能的 Owner**，不是強制父層、不是容器。
- **具體設計方向**：Organization 是一個可以「擁有 Repository」的 Owner 型別（與 User 平行），同時也是「成員治理範圍」——它有自己的成員清單與角色（Owner/Admin/Member），這些角色只決定「這個成員對這個 Organization 擁有的 Repository 有沒有預設權限」，不會憑空產生內容協作空間。User 的個人 Repository 不需要透過任何 Organization 才能存在。
- **明確排除項**：不做「Organization 首頁裡可以直接建立協作內容（如貼文、討論串）」這種功能——那等於把 Organization 變成第二容器；Organization 的一般成員身分本身不自動產生任何 Repository Role（普通成員對 Organization 的 Repository 沒有預設存取權，除非有明確 Grant 或 Organization Admin/Owner 身分）。

### Team

- **原始問題**：在 Organization 成員很多時，需要把人分組、對一批人一次授權，而不是逐一對每個人指定 Repository 權限。
- **五步驟結果**：問題成立，且不依賴程式碼；角色是 **Principal**（可以被授權的群組主體），完全依附 Organization。
- **具體設計方向**：Team 是「Organization 底下的成員分組」，可以作為 Grant 的目標（把某個 Repository 的某個權限授予「這個 Team」而不是逐一授予個人）。Team 沒有自己的協作空間，Team 頁面只呈現「這個 Team 是誰、有哪些成員、被授權存取哪些 Repository」。
- **明確排除項**：Team 不能脫離 Organization 單獨存在；不做「Team 專屬的討論區/知識庫」——那些需求如果真實存在，應該收斂成「某個 Repository，Owner 是這個 Organization，並授權給這個 Team」，而不是替 Team 另開一個協作容器。

### Collaborator

- **原始問題**：需要表達「這個人對這個 Repository 有存取權」。
- **五步驟結果**：這不是一個新實體，而是既有關係（Actor 對 Repository 的授權）的呈現結果。
- **具體設計方向**：Collaborator 清單是查詢結果（Projection）：對某個 Repository，把「直接 Grant 的人」＋「透過 Owner 身分／Organization 治理角色衍生出權限的人」合併呈現成一份名單，並標示每個人的權限來源（直接授權 / Owner 身分 / 透過某個 Team）。
- **明確排除項**：不建立獨立的 `collaborators` 資料表把身分再存一份；不要讓「加為 Collaborator」這個操作實質上變成一個獨立於 Grant 之外的新授權機制——它應該就是「建立一筆 Grant」的另一種說法。

### User / 社交關係（Follow / Star）

- **原始問題**：User 是身分主體與潛在 Owner；Follow/Star 候選語意試圖解決「發現有價值的協作空間、建立弱連結」的問題。
- **五步驟結果**：User 成立（Actor/Principal/Owner 型別之一）；Follow/Star 目前只保留為 **待驗證的 Relationship benchmark hypothesis**，尚未因 GitHub 存在而成為 accepted Product capability。只有真實 Repository discovery 問題證明其必要性後才可接受。
- **具體設計方向**：若後續驗證成立，Star 應作用在 Repository 上（表達「我關注這個協作容器」），Follow 可作用在 Owner（User 或 Organization）上並只服務 Repository discovery；兩者都不得產生 Grant 或新的授權來源。
- **明確排除項**：不做通用的「動態消息（feed）」平台，不做私訊、按讚評論等與 Repository 發現/協作無關的社交堆疊；在需求被驗證前不得建立 Follow/Star persistence、route 或 UI。

### Wiki

- **原始問題**：團隊需要沉澱、共同編輯「說明性、非結構化」的知識內容。
- **五步驟結果**：問題成立，不依賴程式碼；但 `Wiki` 本身目前不是 accepted Resource family。先檢查既有 **Page Artifact** 是否已完整承載這個問題，只有 Page 無法表達的獨立行為或生命周期被證明後才重新分類。
- **具體設計方向**：在本專案現有語意下，Wiki 想解決的問題與 Page 這個既有 Resource 高度重疊——先檢查「是不是已經可以用 Page 滿足」，只有當「多頁面互相連結、有目錄結構」這種需求是 Page 目前語意無法承載時，才考慮把它變成 Page 的一種呈現模式（例如 Page 之間的連結關係），而不是新增一個叫 Wiki 的頂層資源。
- **明確排除項**：不因 GitHub 有 Wiki 就建立新的 Resource family；歷史與比較只能使用受控的結構化資料 Commit/Diff 語意，不得變成程式碼逐行 diff、Git-backed 儲存或 Source Code 合併能力。

### Projects

- **原始問題**：團隊需要規劃與追蹤一批工作項目的進度（看板、時程）。
- **五步驟結果**：問題成立，不依賴程式碼；角色是 **Projection**（對既有 Repository-scoped 協作產物的規劃視角），不是新的擁有權/授權 Container。
- **具體設計方向**：Project-style planning view 可以投影一個或多個 Repository 中已接受的工作 Artifact。跨 Repository 本身不會讓 Projection 變成 Container；每個被投影項目必須保留自己的 source Repository identity，讀寫與可見性都回到該 Repository 的 authorization facts。Planning view 本身不擁有內容、不能被單獨授權，也不能產生新的跨 Repository authority。
- **明確排除項**：不建立 Project-owned Artifact、不建立 Project 專屬協作者/Grant、不讓 Project 成為獨立寫入或 ownership boundary。禁止的是第二 Collaboration Container，不是單純跨 Repository 的 read/planning Projection。

### Issues

- **原始問題**：需要追蹤一個個獨立的「待辦/問題/討論項目」，並記錄狀態變化（開啟/處理中/關閉）與討論串。
- **五步驟結果**：問題成立，不依賴程式碼；角色是 **Repository 內部的 Artifact**（與 Page 平行的另一種 Resource 型態）+ 附帶的 **Process**（狀態合法變化：開啟→關閉等）。
- **具體設計方向**：若要導入，Issue 應該和 Page 一樣是 Repository 底下的 Resource，擁有自己的狀態欄位與留言（討論）子資源，存取權限完全繼承 Repository 的授權模型，不另建一套。Issue 狀態變化由自己的有限狀態機與 Evidence 擁有；資料 Commit/Diff/Proposal 可以引用 Issue，但不能取代 Issue transition。
- **明確排除項**：Issue 不得依賴 Source Code commit、code PR 或 git merge 才能關閉；若引用無代碼 Data Commit/Change Proposal，兩者必須位於相同 Repository 授權邊界且不改寫 Issue 的狀態規則。

## URL / UI / UX 逆向工程原則

- URL 結構必須反映「誰擁有什麼」：採用 GitHub 已驗證的 `/{ownerSlug}/{repositorySlug}` 語意作為 Repository 正式路徑，Owner 可以是 User 或 Organization，共用同一個全域唯一命名空間。
- 導覽層級必須對應真實擁有關係：Organization/Team 頁面呈現「這個 Scope 底下有哪些 Repository、誰有什麼權限」，不得把 Organization 做成另一個可以直接承載協作內容的容器。
- 任何 UI 元件若無法回答「這在呈現 Repository 的哪個面向（擁有者、成員、內容產物、活動）」，就不應該存在。

## 輸出格式（審查或設計提案時必須使用，缺一不可）

對每一個被檢查或新增的概念，輸出以下四欄：

| 校正前（原始 GitHub 概念 / 舊設計） | 校正後（套用五步驟後的結果） | 依據（公理 / 五步驟第幾步 / 排除邊界） | 影響範圍（下游需同步的文件/程式碼/UI） |
|---|---|---|---|

若某個概念判定為「不需要校正」，也必須列出並說明為何符合公理與五步驟，不得省略、不得默認「沒提到的就是沒問題」。

## 結尾自我檢查（每次審查/設計完成後強制執行）

1. 是否有任何 Source Code、任意執行、git ref/merge、code review、CI/CD 或 code-specific invariant 洩漏進產品網域？Commit/Branch/Diff/PR/Actions/Gist 若存在，是否完整符合無代碼資料邊界？
2. 是否有任何概念被建模成「Repository 之外的第二個協作容器」？
3. 每個保留下來的概念，是否都能明確標註屬於 Actor / Scope / Principal / Relationship / Artifact / Process / Projection 中的哪一種？
4. 若本次涉及資料歷史、Branch、Diff、Proposal 或 Transfer，是否證明其只處理已接受 schema、重新授權、沒有任意程式碼/運算，且不建立第二 Container？
5. 若以上任一題答案為「是」（第 1、2 題）或「否/不確定」（第 3、4 題），視為本次校正失敗，回到五步驟拆解程序或無代碼資料邊界重新執行，不得帶著矛盾繼續往下游擴散。
