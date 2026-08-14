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
2. **剝離程式碼前提**：拿掉「程式碼」「版本控制」「軟體開發」這些前提後，這個原始問題還存在嗎？
   - 存在 → 進入第 3 步
   - 不存在（問題本身就是因為內容可被逐行比對、可分支、可合併才成立）→ **整個概念直接淘汰。禁止用比喻、重新命名、或「更通用的包裝」保留它。**
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

## 強制排除邊界（在五步驟的任何一步都適用，優先權最高）

以下概念，無論在推導過程中看起來多麼「順理成章」或「看似必要」，一律判定為不適用，必須被排除，不得以無代碼化包裝的方式保留：

- commit（提交）、branch（分支）、diff（差異比對）、merge（合併）
- 任何建立在「內容是可逐行比對文字」前提上的版本追蹤機制
- 任何試圖成為 Repository 之外第二個「協作容器」的實體（例如讓 Organization 或 Team 可以獨立擁有協作空間、獨立於 Repository 存在）

**判斷準則：如果某個 GitHub 語意元素的成立前提是 git 版本控制邏輯，該元素本身即判定為不適用。**

### 重要範圍澄清（避免誤判）

上述排除邊界管轄的是**本產品對外呈現的網域語意**（使用者在無程式碼協作平台上會看到、操作、理解的概念）。它**不**管轄開發本專案時使用的工程流程本身（例如用 git/GitHub PR 管理原始碼、code review 使用 diff、資料庫用 migration 做 schema 版本演進）。這兩者是不同層次：

- 產品網域裡出現「commit」「branch」「diff」語意 → 違反，必須排除
- 開發團隊用 GitHub PR + git commit 來管理這個專案的原始碼本身 → 不在此公理管轄範圍內，屬於必要的工程實務

審查時若不確定某個詞屬於哪一層，優先問：「使用者在產品 UI 上會不會看到這個詞或這個心智模型？」會看到 → 產品網域，套用排除邊界；不會看到，只存在於開發者的終端機/CI/PR 流程裡 → 不套用。

## 版本控制的兩種語意：程式碼版控（禁止）vs 資料版本控制（未來可能需要，適用不同規則）

「版本控制」這個詞在本專案裡必須拆成兩個完全不同的概念，不得混為一談：

### A. 程式碼版本控制（.git／commit／branch／diff／merge）—— 絕對排除，永久不需要

本專案不依賴 `.git`、不引入 commit/branch/diff/merge 語意，原因不是「目前還沒做」，而是**這個問題本身在無程式碼協作容器裡不成立**：

- 程式碼版控解決的原始問題是「多人平行修改同一份可執行原始碼，需要合併衝突、需要保留每一行程式碼的作者與時間」。這個問題的成立前提是「內容＝可逐行比對、可執行的文字」。
- Repository 裡的協作產物（Page 等）不是「可逐行比對的原始碼文字」，因此這個問題**永久不會在產品網域裡重新出現**，不是「暫緩」而是「五步驟第 2 步就淘汰」。
- 任何未來需求如果聽起來像「我們需要 branch 來做草稿」「需要 merge 兩個人的編輯」「需要 diff 顯示改了什麼」，第一反應必須是回到五步驟重新拆解原始問題，而不是直接引入 git 語意的包裝版本（例如把「草稿」做成「branch 的另一個名字」）。

### B. 資料版本控制（Data Versioning）—— 未來可能需要，是完全不同的問題，適用不同判準

資料版本控制解決的原始問題是「使用者需要知道一筆資料（例如一個 Page 的內容、一筆記錄）過去長什麼樣子、是誰在什麼時候改的、可不可以回復到之前的狀態」。這個問題**不依賴程式碼假設**，在無程式碼協作容器裡完全合理存在，因此**不受第三部分排除邊界管轄**。

判斷「這是資料版控、不是程式碼版控」的準則：

1. 它處理的是**單一 Artifact（如一筆 Page）的狀態快照序列**，不是「多人平行分支後合併」的問題。
2. 它不需要 branch（平行分支）、不需要 merge（合併衝突解決）——資料版本控制通常是線性的「快照 → 快照 → 快照」或「目前版本 + 歷史快照列表」，不是分支圖。
3. 對使用者呈現的心智模型是「歷史紀錄／復原到某個時間點」（像文件編輯軟體的版本歷史），不是「diff 比對兩個分支」。
4. 若未來要設計這個功能，五步驟拆解結果應該落在 **Process**（Artifact 狀態如何合法變化並保留歷程）或 **Evidence/歷史 Projection**，而不是新的 Container 或 Repository 之外的協作單位。

**結論**：看到「版本控制」四個字時，第一件事是先分類它屬於 A 還是 B。屬於 A → 直接依第三部分排除邊界拒絕，不必跑五步驟。屬於 B → 正常跑五步驟拆解程序，用 Process/Evidence/Projection 語意設計，且設計時仍要避免不小心把它做成「靠 branch/merge 心智模型運作的東西」。

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
- **明確排除項**：不因 GitHub 有 Wiki 就建立新的 Resource family；不做「每次編輯都留一筆可逐行 diff 的歷史」；如果需要歷史，套用前面「資料版本控制」段落的線性快照模型，不做分支/合併式的編輯歷史。

### Projects

- **原始問題**：團隊需要規劃與追蹤一批工作項目的進度（看板、時程）。
- **五步驟結果**：問題成立，不依賴程式碼；角色是 **Projection**（對既有 Repository-scoped 協作產物的規劃視角），不是新的擁有權/授權 Container。
- **具體設計方向**：Project-style planning view 可以投影一個或多個 Repository 中已接受的工作 Artifact。跨 Repository 本身不會讓 Projection 變成 Container；每個被投影項目必須保留自己的 source Repository identity，讀寫與可見性都回到該 Repository 的 authorization facts。Planning view 本身不擁有內容、不能被單獨授權，也不能產生新的跨 Repository authority。
- **明確排除項**：不建立 Project-owned Artifact、不建立 Project 專屬協作者/Grant、不讓 Project 成為獨立寫入或 ownership boundary。禁止的是第二 Collaboration Container，不是單純跨 Repository 的 read/planning Projection。

### Issues

- **原始問題**：需要追蹤一個個獨立的「待辦/問題/討論項目」，並記錄狀態變化（開啟/處理中/關閉）與討論串。
- **五步驟結果**：問題成立，不依賴程式碼；角色是 **Repository 內部的 Artifact**（與 Page 平行的另一種 Resource 型態）+ 附帶的 **Process**（狀態合法變化：開啟→關閉等）。
- **具體設計方向**：若要導入，Issue 應該和 Page 一樣是 Repository 底下的 Resource，擁有自己的狀態欄位與留言（討論）子資源，存取權限完全繼承 Repository 的授權模型，不另建一套。狀態變化用簡單的 Process（有限狀態機：開啟/關閉，可加中間狀態）建模，不需要、也不應該用「commit 訊息」或「activity diff」的方式記錄每次留言變化。
- **明確排除項**：不做「Issue 連結到某次 commit/PR 才能關閉」這種依賴 git 語意的機制；在被正式列為已接受的 Resource 之前，先在 `docs/domains` 標記為 Deferred/Candidate，不得直接建表。

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

1. 是否有任何 commit / branch / diff / merge 或版本控制式比喻，殘留在**產品網域語意**中（不含開發流程本身的 git 使用）？
2. 是否有任何概念被建模成「Repository 之外的第二個協作容器」？
3. 每個保留下來的概念，是否都能明確標註屬於 Actor / Scope / Principal / Relationship / Artifact / Process / Projection 中的哪一種？
4. 若本次涉及「歷史/版本/回復」相關需求，是否已明確分類為「A. 程式碼版控（應排除）」或「B. 資料版本控制（線性快照，可設計）」？是否誤把 B 做成需要 branch/merge 的機制？
5. 若以上任一題答案為「是」（第 1、2、4 題後半）或「否/不確定」（第 3、4 題前半），視為本次校正失敗，回到五步驟拆解程序或排除邊界重新執行，不得帶著矛盾繼續往下游擴散。
