# 第一堂課：等等，這不就是 API 嗎？

> 目標讀者：已經會 Python、會寫 API 或後端服務，接下來要在幾小時內快速學會用 FastMCP 開發 MCP server 的工程師。
>
> 這一章先不急著背名詞。你會先遇到一個熟悉的工程問題，然後一步一步拆開：為什麼「讓 AI 打 API」不是完整答案，以及 MCP 到底補上了哪一塊。

---

## 0. 等等，這不就是 API 嗎？

你正在公司裡做一個 AI 助理。

產品經理走過來，說：

> 我希望它可以幫客服查訂單、看退款政策、建立 ticket。
>
> 另外，工程師也想用它查 deployment 狀態。

你想了一下。

這些東西公司都有 API。

所以你的第一個反應很自然：

> 那我把 API 文件丟給 AI，或讓 AI 直接打 API，不就好了？

先不要急著寫 code。

這正是 MCP 出現的地方。

### 0.1 API 對程式很清楚，對 AI 不一定清楚

API 文件通常告訴程式：

```text
endpoint 是什麼
HTTP method 是什麼
body 長什麼樣子
response 長什麼樣子
```

這些對一般程式足夠。

但是 AI client 還需要知道另一組問題：

```text
這個能力是拿來完成什麼任務？
什麼時候該用？
需要哪些參數？
哪些參數不能亂填？
這個操作會不會改資料？
結果能不能直接拿來回答使用者？
這個操作需要使用者確認嗎？
誰有權限使用？
```

REST API 比較像在說：

```text
你可以怎麼呼叫我。
```

MCP 還要說：

```text
我是什麼能力。
什麼時候該用我。
怎麼安全地用我。
```

這就是第一個轉念：

> API 是給程式呼叫的介面。MCP 是給 AI client 發現、理解、選擇與呼叫能力的介面。

### 0.2 先猜一下

下面哪一個比較像好的 MCP tool？

```python
def call_api(path: str, method: str, body: dict) -> dict:
    ...
```

還是：

```python
def get_order_status(order_id: str) -> dict:
    ...
```

如果你選第二個，你已經抓到 MCP 設計的一半。

第一個很有彈性，但對 AI 來說太模糊，也太危險。

第二個比較窄，但語意清楚。AI client 比較容易判斷：

```text
什麼時候該用它
要傳什麼參數
它會回傳什麼
它大概不會造成什麼副作用
```

好，現在再看一個。

下面哪一個比較像危險的 MCP tool？

```python
def refund_customer_payment(customer_id: str, amount: int) -> dict:
    ...
```

還是：

```python
def read_refund_policy() -> str:
    ...
```

第一個不是不能做，但它會改變真實世界：錢會出去，資料會改變，客服流程會被觸發。

這種 tool 需要權限、確認、審計紀錄，甚至可能不適合第一版就開。

第二個比較像讀資料。它通常更適合做成 Resource，而不是 Tool。

這就是第二個轉念：

> 會寫出能跑的 tool 不難。難的是判斷一個能力應該怎麼被 AI 使用，以及它會不會造成風險。

### 0.3 這堂課不是 MCP 規格導讀

你不需要一開始就讀完整個 protocol specification。

你也不需要先變成 AI 研究員。

你已經會的東西其實很多：

```text
Python function
API
database query
file I/O
authentication
logging
testing
deployment
```

MCP 要你多學的是另一件事：

> 如何把這些 Python 能力，設計成 AI client 可以發現、理解、呼叫，而且可以治理的能力介面。

FastMCP 則是 Python 工程師進入 MCP 最直接的路徑。

你會用 decorator 標記 tools、resources、prompts。

你會用 type hints 產生 schema。

你會用 docstring 告訴 AI client 這個能力什麼時候該用。

但是請先記住：

> FastMCP 讓你很快寫出 MCP server。它不會自動替你設計出好的 MCP server。

### 0.4 讀完這堂課，你應該能做的事

這堂課結束時，你不只是「知道 MCP 是什麼」。

你應該能看著一個需求，做出這些判斷：

```text
這應該是 Tool、Resource，還是 Prompt？
這個能力有沒有 side effect？
這個 tool 名稱是否清楚？
這些參數對 AI client 來說是否明確？
這個能力是否需要權限、確認或審計？
這個需求適不適合第一版就開放？
```

如果你能做出這些判斷，後面學 FastMCP 會快很多。

因為 FastMCP 的語法很短。

真正重要的是你怎麼設計那個 Python function。

---

## 1. 模型不是不聰明，是碰不到你的系統

大型語言模型很會推理、摘要、轉換格式、產生程式碼，也能理解自然語言需求。

但是它有一個根本限制：

> 模型本身不會自然知道你公司最新的資料，也不會自然操作你公司的系統。

它不知道：

- 你資料庫裡今天早上的訂單狀態
- 公司內部最新的退款政策
- Jira、Linear 或 GitHub issue 的即時內容
- production deployment 現在是否成功
- 某個客戶上週是否已經聯絡過客服
- 你本機專案裡目前有哪些檔案與測試結果

所以在實際產品裡，AI 應用程式一定會遇到一個問題：

```text
LLM 很會思考，
但它需要外部世界的資料、工具與工作流程。
```

MCP 就是為這個問題出現的。

### 想像一下

你有一位很聰明的助理，但他被關在一間沒有網路、沒有電話、沒有公司系統帳號的房間裡。

你問他：

> 幫我查一下客戶 A 的訂單為什麼還沒出貨。

他可以幫你分析「可能原因」，但他不能查資料庫。

你問他：

> 幫我開一張 ticket 給工程團隊。

他可以幫你寫 ticket 內容，但他不能真的進 Jira 建立 ticket。

你問他：

> 幫我看 production deployment 是否成功。

他可以告訴你一般 deployment 會看什麼，但他不能讀你公司的 deployment 狀態。

MCP 做的事，就是提供一套標準方式，讓 AI 應用程式可以連上外部系統。

---

## 2. 所以，我們需要一種共同語言

先不要急著背 MCP 的全名。

先看現在的畫面。

AI client 想幫使用者完成任務，但外面每個系統都有自己的說法：

```text
PostgreSQL 說：你要寫 SQL。
Jira 說：你要打我的 REST API。
GitHub 說：你要照我的 API schema。
檔案系統說：你要知道路徑。
公司內部服務說：你要帶 token，照我們的 payload 格式。
```

這些系統對工程師來說不陌生。

但是 AI client 不能靠猜。

它需要一套共同語言來問這些問題：

```text
你有哪些能力？
這個能力叫什麼？
什麼時候該用？
需要哪些參數？
參數型別是什麼？
呼叫後會回來什麼？
這個操作會不會改資料？
這個操作需要權限或確認嗎？
```

這套共同語言，就是 MCP。

MCP，全名 Model Context Protocol，是一個開放標準，用來讓 AI 應用程式連接外部資料、工具與工作流程。

如果說得更貼近 Python 工程師一點：

> MCP 讓你把 Python function、資料來源、內部 API、檔案、工作流程，包成 AI client 可以發現、理解與呼叫的能力。

### 2.1 USB-C 這個比喻有用，但不要想歪

你可能會聽過這句話：

```text
MCP 就像 AI 應用程式的 USB-C。
```

這個比喻有用。

但重點不是「線」。

USB-C 的價值不是某一條線本身，而是大家同意一套連接方式。

筆電、螢幕、充電器、硬碟，不需要每一組都做一條特製線。

MCP 的價值也類似。

Claude、Cursor、Copilot、ChatGPT、自製 agent，不應該每一個都用完全不同的方式連你的資料庫、ticket 系統、文件系統和內部 API。

MCP 嘗試把這件事標準化。

### 2.2 MCP 不是你的業務邏輯

這點很重要。

MCP 不會替你決定：

```text
訂單狀態怎麼查
退款規則怎麼算
誰可以建立 ticket
deployment 狀態去哪裡拿
哪些資料需要脫敏
```

這些仍然是你的系統設計與業務邏輯。

MCP 做的是定義一個標準外層，讓 AI client 可以用一致方式發現和使用這些能力。

所以你可以這樣分工：

```text
你的 Python code：真正執行查詢、計算、操作
FastMCP：把 Python code 包成 MCP server
MCP：定義 client 和 server 怎麼溝通
AI Host：決定什麼時候需要使用這些能力
```

這就是第二章要建立的概念：

> MCP 不是另一份 API 文件。MCP 是 AI client 和外部系統之間的共同語言。

---

## 3. 連接線一多，系統就開始失控

一開始，事情看起來很簡單。

客服團隊想用 Claude 查訂單。

你寫一個 connector。

```text
Claude -------- 訂單系統
```

沒問題。

隔天，工程團隊說：

> 我們也想在 Cursor 裡查 deployment 狀態。

你又寫一個 connector。

```text
Cursor -------- Deployment 系統
```

還可以。

再過一週，PM 說：

> 既然都做了，那客服也想查 Jira，工程師也想查 GitHub，營運想查公司知識庫。

現在事情開始變得不太一樣。

你有 3 個 AI clients：

- Claude Desktop
- Cursor
- GitHub Copilot

還有 4 個外部系統：

- PostgreSQL
- Jira
- GitHub
- 公司知識庫

如果沒有共同標準，每個 AI client 都要各自接每個系統：

```text
3 個 AI clients x 4 個外部系統 = 12 組整合
```

這裡的「12」不是 12 行程式碼。

每一組整合都可能包含：

```text
authentication
authorization
payload mapping
schema conversion
error handling
retry
rate limit
logging
audit
version upgrade
security review
```

所以你真正維護的不是 12 條線。

你維護的是 12 個小型整合產品。

### 3.1 小測驗：新增一個 client 會發生什麼事？

現在公司又導入一個新的內部 AI agent。

問題來了。

如果沒有 MCP，要讓這個新 agent 使用原本 4 個外部系統，你要新增幾組整合？

```text
新 agent -> PostgreSQL
新 agent -> Jira
新 agent -> GitHub
新 agent -> 公司知識庫
```

答案是 4 組。

如果下個月再新增 2 個外部系統呢？

原本的每個 AI client 又要再接一次。

這就是整合爆炸。

```text
M 個 AI clients x N 個 tools/data sources = M x N integrations
```

### 3.2 問題不是會不會寫，是會不會長期維護

很多工程師會說：

> connector 不難啊，我一天就能寫一個。

也許真的可以。

但請想像下面幾件事同時發生：

```text
Jira API 改版
GitHub token 權限調整
公司知識庫換搜尋 API
訂單系統新增資料脫敏規則
某個 AI client 對錯誤格式有自己的要求
安全團隊要求所有查詢都要有 audit log
```

如果每個 client 都各自整合每個系統，這些改動會被放大。

一個地方改 authentication，可能要改三個 client。

一個 response schema 改掉，可能要修四套 mapping。

一個安全規則新增，可能要回頭檢查所有整合。

這不是程式寫不寫得出來的問題。

這是系統邊界設計的問題。

### 3.3 MCP 改變的是整合的形狀

有了 MCP，形狀不再是每個 client 接每個系統。

而是：

```text
AI client 學會說 MCP
外部系統透過 MCP server 暴露能力
```

圖像化來看：

```text
沒有 MCP：

Claude  -------- PostgreSQL
Claude  -------- Jira
Claude  -------- GitHub
Cursor  -------- PostgreSQL
Cursor  -------- Jira
Cursor  -------- GitHub
Copilot -------- PostgreSQL
Copilot -------- Jira
Copilot -------- GitHub


有 MCP：

Claude  ----\
Cursor  ----- MCP ---- PostgreSQL Server
Copilot ----/   \----- Jira Server
                 \---- GitHub Server
                 \---- Knowledge Base Server
```

這不是說整合突然消失。

你還是要寫連 PostgreSQL 的程式。

你還是要處理 Jira 的 API。

你還是要設計權限、錯誤處理和資料格式。

差別在於：

> 你把每個外部系統包成一個標準 MCP server，而不是為每個 AI client 客製一套整合。

所以複雜度從：

```text
M x N
```

變成比較接近：

```text
M + N
```

每個 AI client 實作 MCP client。

每個外部系統實作 MCP server。

兩邊都面向同一個協議。

### 3.4 這才是 MCP 對工程師的價值

MCP 對工程師最有說服力的地方，不是多了一個新名詞。

而是它把問題從：

```text
每個 AI app 都要客製接每個系統
```

改成：

```text
每個 AI app 都會說 MCP
每個工具或資料來源都提供 MCP server
```

這就是為什麼 MCP 不只是 wrapper。

它改變的是整合邊界。

> MCP 把 AI 工具整合從一堆客製接線，推向一個可以被發現、呼叫、測試與治理的標準介面。

---

## 4. 誰在跟誰說話？Host、Client、Server

到這裡，你已經知道 MCP 是共同語言，也知道它可以減少整合爆炸。

現在要釐清一件很容易混淆的事：

> 當你用 FastMCP 開發時，你通常不是在寫 AI app。你是在寫 MCP server。

先看一個完整畫面。

使用者在 Cursor 裡輸入：

> 幫我查一下 payment-service 最近一次 deployment 有沒有成功。

這時候大概會發生：

```text
User
  |
  v
Cursor
  |
  v
Cursor 裡的 MCP client
  |
  v
Deployment MCP Server
  |
  v
CI/CD API 或內部部署系統
```

這張圖裡有三個 MCP 角色。

### 4.1 Host：使用者真正打開的 AI 應用程式

Host 是使用者看得到、正在操作的 AI 應用程式。

例如：

- Claude Desktop
- ChatGPT
- Cursor
- VS Code with GitHub Copilot
- 自己做的 agent app

Host 負責管理整個使用者體驗：

```text
接收使用者輸入
管理對話
呼叫 LLM
判斷是否需要外部能力
顯示最後答案
處理使用者確認與權限體驗
```

如果使用者說：

> 幫我查 deployment 狀態。

通常是 Host 和 LLM 先理解這句話，然後決定可能需要呼叫某個 MCP tool。

### 4.2 Client：Host 裡面負責講 MCP 的元件

Client 通常不是使用者直接看到的東西。

它在 Host 裡面，負責和某個 MCP server 通訊。

一個 Host 可以同時連多個 MCP servers。

```text
Host
  |
  |-- MCP Client A --> GitHub MCP Server
  |-- MCP Client B --> Filesystem MCP Server
  |-- MCP Client C --> Company CRM MCP Server
```

你可以把 MCP client 想成 Host 裡面的一個通訊代理。

它負責：

```text
連線到 server
詢問 server 有哪些能力
把 tool call 送給 server
把 server 回傳結果交回 Host
```

### 4.3 Server：Python 工程師最常開發的那一層

Server 是暴露能力的外部服務。

如果你用 FastMCP 寫：

```python
@mcp.tool
def get_deployment_status(service: str) -> dict:
    ...
```

你正在寫的是 MCP server 的一部分。

MCP server 負責：

```text
描述自己有哪些 tools/resources/prompts
接收 client 的呼叫
驗證參數
執行 Python code
呼叫資料庫、API、檔案或內部服務
回傳結果
```

重要的是：

> MCP server 通常不負責推理，也不負責和使用者聊天。它負責提供能力。

推理主要發生在 Host 和 LLM 那邊。

### 4.4 小測驗：你到底在寫哪一層？

下面幾個東西分別是 Host、Client，還是 Server？

```text
Claude Desktop
Claude Desktop 裡負責連某個 MCP server 的元件
你用 FastMCP 寫的 order server
Cursor
你寫的 get_order_status Python function
```

參考答案：

```text
Claude Desktop -> Host
Claude Desktop 裡負責連某個 MCP server 的元件 -> Client
你用 FastMCP 寫的 order server -> Server
Cursor -> Host
get_order_status Python function -> Server 暴露出來的一個 tool
```

### 4.5 先記住這張圖

後面只要你開始混淆，就回到這張圖：

```text
User
  |
  v
Host / LLM
  |
  v
MCP Client
  |
  v
MCP Server
  |
  v
Python function / API / Database / File / Workflow
```

FastMCP 幫你做的是中間偏下這段：

```text
MCP Server
  |
  v
Python function / API / Database / File / Workflow
```

這個分工清楚之後，後面講 Tools、Resources、Prompts 就容易多了。

---

## 5. Server 到底可以拿出什麼？

現在你知道自己多半是在寫 MCP server。

下一個問題是：

> Server 可以提供哪些東西給 AI client？

不要先背名詞。

回到客服場景。

使用者問：

> 這位客戶說他的包裹還沒到。請幫我查訂單狀態，確認退款政策，然後草擬一封回覆。

這句話其實包含三種不同需求：

```text
查訂單狀態        -> 需要執行查詢
確認退款政策      -> 需要讀一份資料
草擬客服回覆      -> 需要一個任務模板
```

這三種需求，剛好對應 MCP server 最常暴露的三種能力：

```text
Tool      做一件事
Resource  讀一份資料
Prompt    套一個任務模板
```

先用一句話記：

> Tool 是動作，Resource 是資料，Prompt 是任務起手式。

### 5.1 Tool：需要「做事」時使用

如果 AI client 需要執行某個動作，通常就是 Tool。

例如：

```text
查訂單狀態
建立 ticket
呼叫內部 API
查 deployment status
讀 log 並整理成結構化結果
觸發既有 Python workflow
```

在 FastMCP 裡，tool 通常就是一個 Python function：

```python
from fastmcp import FastMCP

mcp = FastMCP("Support Server")

@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment and fulfillment status for one order."""
    return {
        "order_id": order_id,
        "status": "shipped",
        "tracking_number": "TW123456789",
    }
```

注意這個 tool 的幾個細節：

```text
名字是 get_order_status，不是 do_stuff
參數是 order_id，不是一大包 input
回傳是 dict，不是一段難解析文字
docstring 說明它查的是 shipment and fulfillment status
```

Tool 的關鍵不是「它能不能被呼叫」。

而是：

> AI client 能不能判斷什麼時候該呼叫它，以及怎麼安全地呼叫它。

### 5.2 Resource：需要「讀資料」時使用

如果 AI client 只是需要讀一份資料，通常不要急著做成 tool。

例如退款政策：

```python
@mcp.resource("policy://refund")
def refund_policy() -> str:
    return "Customers can request a refund within 30 days."
```

Resource 適合：

```text
公司政策
產品文件
專案設定
read-only 報表
runbook
某個使用者或物件的 read-only profile
```

Resource 的重點是：

```text
它是資料
它可以被命名
它通常應該是 read-only
它不應該偷偷改變系統狀態
```

你可以把 Resource 想成 AI client 可以打開來看的資料頁。

如果只是要讀退款政策，使用 Resource 比使用 `get_refund_policy()` tool 更能表達意圖。

### 5.3 Prompt：需要「任務模板」時使用

Prompt 不是拿來查資料，也不是拿來改系統。

Prompt 是可重用的任務模板。

例如客服回覆草稿：

```python
@mcp.prompt
def draft_customer_reply(topic: str) -> str:
    return f"Draft a polite customer support reply about: {topic}"
```

Prompt 適合：

```text
客服回覆草稿
incident summary 模板
code review checklist
報告生成開頭
固定格式的分析任務
```

Prompt 的價值是讓某些工作有一致的起手式。

例如同樣是客服回覆，你可能希望每次都遵守：

```text
語氣禮貌
先承認問題
再說目前狀態
最後提供下一步
不要承諾系統沒有確認過的事
```

這些規則放在 prompt 裡，比每次叫使用者自己描述更穩定。

### 5.4 同一個需求，三種能力可以一起用

剛剛那句客服需求：

> 這位客戶說他的包裹還沒到。請幫我查訂單狀態，確認退款政策，然後草擬一封回覆。

可以拆成：

```text
get_order_status(order_id)     -> Tool
policy://refund                -> Resource
draft_customer_reply(topic)    -> Prompt
```

注意這不是三選一。

一個好的 MCP server 可以同時提供 tools、resources、prompts。

重點是每個能力放在正確的位置。

### 5.5 小測驗：這應該是哪一種？

請先自己判斷。

```text
1. 查某個 customer_id 的訂閱方案
2. 讀公司請假政策
3. 產生 incident handoff 摘要
4. 建立 GitHub issue
5. 讀 payment-service 的 runbook
```

參考答案：

```text
1. Tool
2. Resource
3. Prompt
4. Tool
5. Resource
```

如果你對第 3 題猶豫，這很正常。

如果 incident handoff 只是「產生一個固定格式的寫作模板」，它是 Prompt。

如果它還要查 log、查 deployment、查 alert，再組合結果，那可能會變成 Tool + Prompt 的組合。

### 5.6 Sampling：先知道有這回事

有些 MCP 介紹也會提到 sampling。

簡化來說，sampling 讓 server 在某些情境下請 client/host 的 LLM 幫忙生成或判斷內容。

第一堂課不用深入 sampling。

你只需要知道：

> Tools、Resources、Prompts 是第一階段最重要的三個概念。Sampling 屬於進階互動能力。

---

## 6. 一次 MCP 呼叫怎麼發生？

現在把前面幾章接起來。

你已經有：

```text
Host
MCP Client
MCP Server
Tool / Resource / Prompt
```

那一次真正的呼叫，是怎麼跑完的？

先不要看完整 protocol。

我們用逐格動畫看。

使用者在 AI 應用程式裡問：

> 這張訂單現在到哪裡了？

### 6.1 第一格：Host 先理解使用者想做什麼

使用者看到的是 Host。

例如 Claude Desktop、Cursor、ChatGPT 或 VS Code。

Host 會把使用者的問題交給 LLM 理解：

```text
使用者不是在閒聊。
使用者想查一張訂單的最新狀態。
這可能需要外部工具。
```

這時候 LLM 本身還不知道訂單狀態。

它需要看看目前可用的 MCP 能力。

### 6.2 第二格：Client 先知道 server 有哪些能力

MCP client 會連到 MCP server。

這件事可能發生在啟動時，也可能發生在需要使用 server 前。

它會問 server：

```text
你有哪些 tools？
你有哪些 resources？
你有哪些 prompts？
每個能力怎麼使用？
```

這個過程叫 discovery。

Server 回傳的不是原始碼，而是能力描述。

例如 `get_order_status` 這個 tool 可能被描述成：

```text
name: get_order_status
description: Return shipment and fulfillment status for one order.
arguments:
  order_id: string
returns:
  object
```

這就是為什麼 tool 名稱、type hints、docstring 很重要。

它們不是裝飾。

它們會變成 AI client 判斷工具的依據。

### 6.3 第三格：LLM 選擇要不要呼叫 tool

現在 Host / LLM 看到了可用能力。

它可能判斷：

```text
使用者想查訂單狀態。
可用 tool 裡有 get_order_status。
這個 tool 需要 order_id。
使用者問題裡有訂單編號，或需要先追問。
```

如果資訊足夠，它會準備呼叫 tool。

如果資訊不足，它可能先問使用者：

> 請提供訂單編號。

這一點很重要：

> MCP server 不需要自己猜使用者意思。它接收明確的 tool call 和 arguments。

### 6.4 第四格：Client 發出 tool call

當 Host 決定要呼叫 tool，MCP client 會送出類似這樣的請求：

```text
tools/call
  name: get_order_status
  arguments:
    order_id: A10086
```

如果用更簡化的圖表示：

```text
MCP Client -> MCP Server:
  call get_order_status(order_id="A10086")
```

### 6.5 第五格：Server 驗證參數，執行 Python code

MCP server 收到呼叫後，會做幾件事：

```text
確認 tool 存在
驗證 arguments
執行對應的 Python function
呼叫資料庫、API 或內部服務
整理回傳結果
```

例如：

```python
@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment and fulfillment status for one order."""
    return order_service.lookup(order_id)
```

這裡真正查訂單的是你的 Python code。

FastMCP 幫你處理 MCP server 的外層。

### 6.6 第六格：結果回到 Host，再由 LLM 組織回答

Server 回傳結果：

```text
{
  "order_id": "A10086",
  "status": "shipped",
  "tracking_number": "TW123456789"
}
```

MCP client 把結果交回 Host。

Host / LLM 再把結構化結果轉成使用者看得懂的回答：

> 這張訂單已經出貨，物流追蹤號碼是 TW123456789。

注意最後一句通常不是 MCP server 產生的。

MCP server 回傳的是資料。

Host / LLM 負責把資料放回對話脈絡。

### 6.7 整個流程放在一起

```text
User
  |
  v
Host / LLM
  |
  |  decide a capability may be needed
  v
MCP Client
  |
  |  discover capabilities
  |  call get_order_status(...)
  v
MCP Server
  |
  |  validate arguments
  |  execute Python function
  v
Database / API / Files / Workflow
  |
  v
MCP Server
  |
  v
MCP Client
  |
  v
Host / LLM
  |
  v
User-facing answer
```

更協議一點的流程可以簡化成：

```text
initialize
  -> discovery
  -> invocation
  -> result
  -> termination
```

### 6.8 關鍵字：Discovery

Discovery 很重要。

MCP client 不只是「知道某個 URL 可以打」。

它可以向 server 詢問：

```text
你有哪些工具？
每個工具叫什麼名字？
用途是什麼？
需要哪些參數？
參數型別是什麼？
回傳什麼？
```

LLM 不是讀你的原始碼來猜 tool 怎麼用。

它主要靠 server 暴露出來的 metadata 和 schema 做選擇。

所以當你寫：

```python
@mcp.tool
def do_stuff(input: str) -> str:
    """Do stuff."""
    ...
```

你不是只寫了一個醜 API。

你是在給 AI client 一張很難判斷的工具卡。

### 6.9 知道即可：MCP 訊息大概長什麼樣子

第一堂課不需要深講 JSON-RPC，但可以讓學生知道 MCP 通訊不是魔法。

MCP 的底層通訊會有幾類訊息：

```text
Request       client 要求 server 做某件事
Response      server 回覆成功結果
Error         server 回覆錯誤
Notification  單向通知，例如進度更新
```

例如呼叫 tool 時，可以先用這個簡化圖理解：

```text
Client -> Server: tools/call(name="get_order_status", arguments={...})
Server -> Client: result={...}
```

你現在不需要手寫這些訊息。

FastMCP 會幫你處理協議細節。

你需要先理解的是：

> MCP client 能發現 server 有哪些能力，然後用標準訊息呼叫其中一個能力。

---

## 7. 三個很像但不同層的東西

到這裡，很多人腦中會出現三張卡：

```text
REST API
Function calling
MCP
```

它們看起來都和「呼叫外部功能」有關。

所以很容易混在一起。

先用一句話拆開：

```text
REST API          系統提供給程式呼叫的介面
Function calling  模型表示「我要呼叫工具」的一種方式
MCP               AI client 連接、發現、呼叫外部能力的協議
```

### 7.1 REST API：系統原本就有的入口

你的訂單系統可能本來就有 API：

```text
GET /orders/{id}
POST /tickets
GET /customers/{id}/subscriptions
```

這些 API 對一般程式很有用。

程式知道：

```text
我要打哪個 endpoint
我要用哪個 method
我要帶什麼 body
我要怎麼解析 response
```

但是 AI client 還需要另一層語意。

它不只想知道 endpoint。

它想知道：

```text
這個能力叫什麼？
什麼時候該用？
需要哪些參數？
參數對使用者任務的意義是什麼？
回傳結果能不能放進對話？
操作有沒有 side effect？
需不需要權限、確認或審計？
```

所以 MCP 不是 REST API 的替代品。

很多時候，你的 MCP server 內部仍然會呼叫 REST API。

差別是對外暴露的層次不同：

```text
REST API exposes endpoints.
MCP exposes capabilities.
```

例如，內部可以還是：

```text
GET /orders/{id}
```

但對 AI client 暴露成：

```python
@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment and fulfillment status for one order."""
    ...
```

### 7.2 Function calling：模型說「我想用工具」

Function calling 通常是模型平台提供的一種能力。

它讓模型可以用結構化方式表示：

```text
我想呼叫這個函式。
我要傳這些參數。
```

例如模型可能產生類似：

```text
call get_order_status with order_id="A10086"
```

這回答的是「模型如何表達工具呼叫」。

但它沒有完整回答：

```text
工具從哪裡來？
client 怎麼發現工具？
工具 schema 怎麼暴露？
工具跑在哪裡？
不同 AI host 怎麼連同一個工具 server？
resources 和 prompts 怎麼處理？
```

這些是 MCP 所在的層次。

### 7.3 MCP：把工具和資料接到 AI client 的標準方式

MCP 關心的是 AI client 和外部世界之間的連接。

它定義：

```text
client 怎麼連 server
client 怎麼 discovery
server 怎麼描述 tools/resources/prompts
client 怎麼呼叫 tool
server 怎麼回傳結果
```

所以實務上三者可以同時存在：

```text
Host / LLM
  |
  |  function calling style decision
  v
MCP Client
  |
  |  MCP protocol
  v
FastMCP Server
  |
  |  Python code
  v
Internal REST API / Database / Service
```

請注意這張圖的方向。

MCP server 不一定取代你的 REST API。

它常常是把既有 REST API、資料庫、Python workflow，整理成 AI client 比較容易使用的能力層。

### 7.4 小測驗：下面在講哪一層？

```text
1. GET /orders/{id}
2. get_order_status(order_id)
3. 模型決定要呼叫 get_order_status，並產生參數
4. Client 向 server 詢問有哪些 tools
```

參考答案：

```text
1. REST API
2. MCP tool capability
3. Function calling / tool selection
4. MCP discovery
```

這章只要記住一件事：

> REST API、function calling、MCP 不是互相取代，而是站在不同層次處理不同問題。

---

## 8. Server 住在哪裡？stdio 與 HTTP

到目前為止，我們一直說：

```text
MCP Client 連到 MCP Server
```

但 server 到底住在哪裡？

有兩種常見情況。

一種是 server 就在使用者自己的電腦裡。

另一種是 server 跑在遠端，讓很多人或很多 agent 連過去。

這就會牽涉到 transport。

Transport 不改變 tool 的設計。

它只回答一個問題：

> Client 和 server 要怎麼通訊？

### 8.1 Local / stdio：server 跟 Host 在同一台機器

stdio 常見於本機工具。

你可以想成：

```text
Host 啟動一個 MCP server subprocess
Host 透過 stdin/stdout 和 server 傳訊息
```

圖像化：

```text
User's laptop

Host
  |
  |  stdin/stdout
  v
Local MCP Server
  |
  v
Local files / local project / local scripts
```

stdio 適合：

```text
本機檔案操作
IDE 工具
開發階段
個人使用的 automation
不需要開 port 的 local server
```

例如，IDE 想讓 AI 讀你本機專案檔案，stdio 就很自然。

### 8.2 Remote / HTTP：server 跑在網路另一端

HTTP 適合遠端服務。

```text
Host / MCP Client 透過網路連到 MCP Server
```

圖像化：

```text
User / Agent
  |
  v
Host
  |
  |  HTTP
  v
Remote MCP Server
  |
  v
Company API / Database / Workflow
```

HTTP 適合：

```text
團隊共享服務
cloud agent
production deployment
集中治理
監控與 logging
權限控管
```

但遠端也代表你不能只想「跑起來」。

你還要想：

```text
authentication
authorization
TLS
rate limit
timeout
logging
audit
deployment
versioning
```

### 8.3 小測驗：你會選哪一種？

```text
1. 讓 Cursor 讀目前專案裡的檔案
2. 讓全公司客服 AI 查訂單狀態
3. 開發階段先測一個 demo server
4. 讓 cloud agent 查公司內部 deployment 狀態
```

參考答案：

```text
1. Local / stdio
2. Remote / HTTP
3. Local / stdio 或 HTTP 都可以，看你要測什麼
4. Remote / HTTP
```

### 8.4 對 FastMCP 的意義

後面寫 FastMCP 時，你會看到：

```python
if __name__ == "__main__":
    mcp.run()
```

也會看到 CLI：

```bash
fastmcp run server.py:mcp
fastmcp run server.py:mcp --transport http --port 8000
```

不要把 transport 想成另一種 tool。

同一個 tool：

```python
@mcp.tool
def get_order_status(order_id: str) -> dict:
    ...
```

可以透過不同 transport 被 client 使用。

> Transport 改變的是連線方式，不是能力本身。

---

## 9. FastMCP：你終於要寫的那段 Python

前面講了很多架構。

現在回到 Python 工程師最在意的問題：

> 所以我到底要寫什麼？

答案通常是：

```text
你寫 Python function。
FastMCP 把它變成 MCP server capability。
```

MCP 是標準。

FastMCP 是 Python 開發 MCP server 的高階框架。

### 9.1 最小可跑範例

如果你會寫 Python function，就可以很快寫出第一個 MCP server：

```python
from fastmcp import FastMCP

mcp = FastMCP("Demo Server")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

if __name__ == "__main__":
    mcp.run()
```

先不要小看這幾行。

它裡面其實有一整套轉換：

```text
Python function  -> MCP tool
type hints       -> input schema
docstring        -> tool description
return value     -> MCP response
mcp.run()        -> server runtime
```

### 9.2 這幾行分別在做什麼？

```python
mcp = FastMCP("Demo Server")
```

這行建立一個 MCP server。

```python
@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b
```

這段把 `add` 註冊成一個 tool。

FastMCP 會看：

```text
function name
parameters
type hints
docstring
return type
```

然後把它整理成 MCP client 可以 discovery 的能力描述。

```python
if __name__ == "__main__":
    mcp.run()
```

這段啟動 server。

### 9.3 FastMCP 幫你省掉什麼？

如果不用框架，你需要自己處理很多協議細節。

FastMCP 幫你處理：

```text
tool registration
schema generation
request parsing
argument validation
response formatting
transport runtime
client interaction
```

所以你可以把注意力放在更重要的問題：

```text
我要暴露什麼能力？
這個能力應該是 tool、resource，還是 prompt？
參數是否清楚？
回傳是否結構化？
是否有 side effect？
是否需要權限、確認或審計？
LLM 能不能根據名稱和描述正確使用它？
```

### 9.4 小心：短程式不代表簡單設計

FastMCP 的語法會讓第一個 demo 很快跑起來。

這是好事。

但它也容易讓人誤會：

> 只要加 decorator，就完成 MCP server 設計了。

不對。

Decorator 只是把 Python function 暴露出去。

真正的工程判斷在於你暴露了什麼、怎麼命名、怎麼限制、怎麼測試，以及誰可以使用。

下一章就專門處理這件事：

> 不要從 API 清單開始設計 MCP server。要從任務開始。

---

## 10. 設計 MCP 能力：不要從 API 開始，從任務開始

很多工程師會想：

> 我們公司有 200 個 REST API endpoint，我是不是全部包成 MCP tools？

通常不要。

MCP server 應該從 AI client 要完成的任務開始設計，而不是從現有 endpoint 清單開始。

### 10.1 壞設計

```python
@mcp.tool
def call_api(method: str, path: str, body: dict) -> dict:
    """Call an internal API."""
    ...
```

這對 LLM 來說太模糊，也太危險。

它不知道哪些 path 可以用，不知道 body 格式，不知道操作風險，也可能誤打高風險 API。

### 10.2 好一點的設計

```python
@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment and fulfillment status for one order."""
    ...

@mcp.tool
def create_support_ticket(
    customer_id: str,
    title: str,
    description: str,
    priority: str = "normal",
) -> dict:
    """Create a support ticket for a customer issue."""
    ...
```

這些 tool 有清楚的業務語意。

LLM 比較容易知道：

- 什麼時候該用
- 要傳什麼參數
- 會產生什麼結果
- 是否可能有副作用

### 10.3 Tool 設計準則

好的 tool 通常有這些特徵：

- 名稱清楚，通常是動詞開頭：`search_orders`、`create_ticket`
- 參數少而明確
- type hints 完整
- docstring 寫給 LLM 看，不只是寫給人看
- 回傳結構化資料，而不是一大段難解析文字
- 高風險操作有權限、確認、審計
- 不要用萬用參數如 `input: str` 承載所有東西
- 不要用 `*args` 或 `**kwargs` 當 tool 參數

### 10.4 好工具像一個清楚的按鈕

想像每個 tool 都是 AI client 介面上的一顆隱形按鈕。

如果按鈕叫：

```text
do_stuff
```

沒人知道它會做什麼。

如果按鈕叫：

```text
refund_customer_payment
```

大家至少知道這是高風險動作，需要權限和確認。

---

## 11. 安全：MCP 不會自動替你做權限設計

MCP 標準化的是連接方式，不是替你的公司完成安全設計。

這一點要在第一堂課就講。

MCP server 可能連到：

- 客戶資料
- 內部文件
- production 系統
- ticket 系統
- email
- 付款或退款流程
- deployment pipeline

這些都不是玩具。

### 11.1 高風險 tool

以下 tool 需要特別小心：

- 刪除資料
- 寄送 email
- 建立付款或退款
- 修改權限
- 執行 deployment
- 執行任意 SQL
- 操作 production
- 存取敏感個資

### 11.2 基本安全原則

至少要有這些觀念：

- 最小權限：tool 只拿它需要的權限
- 明確授權：不要因為 AI client 會呼叫就信任它
- 輸入驗證：LLM 產生的 arguments 仍然是外部輸入
- 審計紀錄：誰在什麼時間透過哪個 tool 做了什麼
- 高風險操作確認：刪除、付款、寄信、部署不要自動亂跑
- 資料最小化：不要把不必要的敏感資料回傳給 LLM
- 防 prompt injection：外部資料可能包含惡意指令
- tool 數量控制：暴露太多 tool 會降低選擇準確度，也增加風險

### 11.3 重要提醒

> MCP server 是一個新的能力邊界，也是一個新的攻擊面。

所以不要只問：

```text
這個 tool 能不能做？
```

還要問：

```text
誰可以用？
什麼情境可以用？
輸入可信嗎？
結果會不會外洩資料？
操作有沒有紀錄？
失敗時會怎麼樣？
```

---

## 12. 什麼適合做 MCP server？

適合：

- 查詢內部文件
- 查詢訂單與客戶狀態
- 查 deployment status
- 查 log、metrics、incident 狀態
- 建立 Jira、Linear、GitHub issue
- 呼叫既有 Python workflow
- 包裝內部 API 成少量高語意 tools
- 提供公司政策、產品文件、runbook 給 AI client

不適合：

- 把 200 個 REST endpoints 原封不動暴露
- 給 LLM 任意 SQL 執行權
- 沒有權限控管的寫入操作
- 高風險 production 操作直接自動執行
- 用一個 `do_anything(input: str)` 包所有功能
- 回傳大量未過濾敏感資料

---

## 13. 小練習：判斷 Tool、Resource、Prompt

請判斷下面能力應該設計成 Tool、Resource，還是 Prompt。

```text
1. 查詢使用者目前訂閱方案
2. 讀取公司退款政策
3. 幫客服產生一封道歉信
4. 建立 Jira ticket
5. 查詢最近一次部署狀態
6. 讀取某份產品規格文件
7. 產生 incident report 草稿
8. 取消使用者訂閱
```

參考答案：

```text
1. Tool
2. Resource
3. Prompt
4. Tool
5. Tool 或 Resource，取決於是否需要即時計算或查外部系統
6. Resource
7. Prompt，或 Tool + Prompt，取決於是否需要查資料
8. Tool，而且是高風險 side-effect tool
```

### 討論重點

第 5 題為什麼可以是 Tool 或 Resource？

如果 deployment status 是一份已經產生好的 read-only 狀態頁，那它可以是 Resource。

如果需要即時呼叫 CI/CD API、聚合多個系統狀態、計算結果，那它比較像 Tool。

---

## 14. 小練習：修正壞 tool

下面這個 tool 有什麼問題？

```python
@mcp.tool
def do_stuff(input: str) -> str:
    """Do stuff."""
    ...
```

問題：

- 名稱沒有語意
- 參數太模糊
- docstring 沒有幫助
- 回傳格式不清楚
- 不知道是否有副作用
- LLM 很難知道什麼時候該呼叫

可以改成：

```python
@mcp.tool
def search_customer_orders(customer_email: str, limit: int = 10) -> list[dict]:
    """Search recent orders for a customer by email address."""
    ...
```

或：

```python
@mcp.tool
def create_customer_support_ticket(
    customer_email: str,
    subject: str,
    summary: str,
    priority: str = "normal",
) -> dict:
    """Create a customer support ticket and return the ticket ID."""
    ...
```

---

## 15. 第一堂課建議安排：60 到 90 分鐘

如果只有一堂 MCP 介紹課，我建議這樣排：

| 時間 | 主題 | 目的 |
|---:|---|---|
| 10 分鐘 | 模型隔離問題 | 讓學生知道為什麼需要 MCP |
| 10 分鐘 | M x N 整合問題 | 讓工程師理解標準化價值 |
| 15 分鐘 | Host / Client / Server 架構 | 建立共通語言 |
| 15 分鐘 | Tools / Resources / Prompts | 建立設計判斷 |
| 10 分鐘 | MCP 呼叫流程與 discovery | 理解 schema、docstring 的重要性 |
| 10 分鐘 | MCP vs REST API vs function calling | 排除常見誤解 |
| 10 分鐘 | 安全與適用場景 | 避免 demo 心態 |
| 10 分鐘 | 練習與討論 | 讓學生真的會分類與設計 |

如果只有 60 分鐘，可以壓縮掉 protocol 細節，保留：

```text
問題 -> 架構 -> 能力分類 -> 呼叫流程 -> 安全 -> 練習
```

---

## 16. 後續 FastMCP 工作坊：3.5 小時版本

第一堂介紹 MCP 後，接下來的 FastMCP 實作課可以這樣排。

### 課前環境

建議用 Python 3.11+ 或 3.12，並用虛擬環境管理依賴。

安裝 FastMCP：

```bash
pip install fastmcp
```

或使用 uv：

```bash
uv add fastmcp
```

驗證：

```bash
fastmcp version
```

Production 專案建議 pin 版本，例如：

```text
fastmcp==3.0.0
```

原因很實際：MCP 生態仍在快速演進，production 不應該用過寬的版本範圍承擔不必要的 breaking change 風險。

### 16.1 第一段：第一個 FastMCP server，45 分鐘

目標：每個人都跑起來。

```python
from fastmcp import FastMCP

mcp = FastMCP("Demo Server")

@mcp.tool
def greet(name: str) -> str:
    """Return a greeting."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run()
```

要講：

- `FastMCP(...)` 是 server
- `@mcp.tool` 註冊工具
- type hints 會變 schema
- docstring 會變描述
- `mcp.run()` 啟動 server
- CLI 可以指定 transport

### 16.2 第二段：Tools 實戰，45 分鐘

讓學生做三種 tool：

```text
pure function tool
I/O query tool
side-effect tool
```

例如：

- `calculate_discount(price, rate)`
- `get_order_status(order_id)`
- `create_support_ticket(...)`

重點不是 decorator，而是 tool 設計。

### 16.3 第三段：Resources / Prompts，35 分鐘

讓學生知道不是所有能力都該做成 tool。

```python
@mcp.resource("config://app")
def app_config() -> dict:
    return {"env": "dev", "version": "1.0.0"}

@mcp.prompt
def summarize_incident(incident_id: str) -> str:
    return f"Summarize incident {incident_id} for an engineering handoff."
```

### 16.4 第四段：測試，35 分鐘

不要只靠 AI client 手動測。

用 FastMCP Client 和 pytest 建立開發迴圈：

```python
from fastmcp import Client
from server import mcp

async def test_add():
    async with Client(mcp) as client:
        result = await client.call_tool("add", {"a": 1, "b": 2})
        assert result
```

要測：

- list tools
- call tool
- 錯誤輸入
- 回傳格式
- side-effect 是否受控

### 16.5 第五段：工程化與 production，30 分鐘

至少講：

- pin `fastmcp==x.y.z`
- HTTP 部署要有 auth
- log / metrics / tracing
- timeout
- 權限控管
- 高風險 tool 的確認流程
- 不要一次暴露太多 tools
- schema 和 docstring 要 review

---

## 17. 課程總路線

如果要做成完整短課，我會安排成四堂：

```text
第 1 堂：MCP 概念與架構
第 2 堂：用 FastMCP 寫第一個 server
第 3 堂：Tools / Resources / Prompts 實戰
第 4 堂：測試、部署、安全與 production pattern
```

第一堂建立語言。

第二堂建立手感。

第三堂建立設計能力。

第四堂建立工程品質。

---

## 18. 講師備忘：這堂課最重要的幾句話

你可以在課堂中反覆使用這幾句：

```text
MCP 不是讓模型變聰明，而是讓模型能接觸外部世界。
```

```text
MCP server 通常不負責推理，它負責提供能力。
```

```text
REST API 暴露 endpoints，MCP 暴露 capabilities。
```

```text
不要從 API 清單開始設計 MCP server，要從 AI client 要完成的任務開始。
```

```text
Tool 的 docstring 是寫給 LLM 的使用說明。
```

```text
用了 MCP 不代表自動安全。權限、審計、確認流程仍然是你的責任。
```

```text
FastMCP 的 decorator 很簡單，真正困難的是能力設計。
```

---

## 19. 一頁式總結

MCP 是 AI 應用程式連接外部系統的開放標準。

它解決的是 AI client 和外部 tools/data sources 之間的整合問題。沒有 MCP，每個 client 都要客製連每個系統，形成 M x N 的整合爆炸。有了 MCP，client 和 server 都面向同一個標準，整合成本變成 M + N。

MCP 架構裡，Host 是使用者面對的 AI app，Client 是 Host 裡負責 MCP 通訊的元件，Server 是暴露能力的外部服務。Python 工程師通常要寫的是 MCP server。

MCP server 主要暴露 Tools、Resources、Prompts。Tool 用來執行動作，Resource 用來提供 read-only data，Prompt 用來提供可重用的任務模板。

FastMCP 是 Python 開發 MCP server 的高階框架。它讓你用 Python function、type hints、docstring 和 decorator 快速建立 MCP tools、resources、prompts。

但是，FastMCP 只讓開發變簡單，不會自動讓設計變好。好的 MCP server 需要清楚的能力邊界、乾淨的 tool schema、合理的權限、安全的 side-effect 控制，以及可測試的開發流程。

---

## 20. 課後作業與評量

### 作業 A：能力分類

請挑一個你熟悉的內部系統，例如客服系統、訂單系統、部署系統或文件系統，列出 10 個 AI 可能需要的能力。

對每個能力標記：

```text
Tool / Resource / Prompt
是否有 side effect
是否需要權限
是否需要審計
是否適合第一版就開放
```

### 作業 B：設計 5 個 tools

請設計 5 個 tools，只需要寫 signature 和 docstring。

範例：

```python
def get_customer_subscription(customer_id: str) -> dict:
    """Return the current subscription plan and renewal status for one customer."""
```

評量標準：

- tool 名稱是否清楚
- 參數是否具體
- docstring 是否能幫 LLM 判斷使用時機
- 回傳型別是否明確
- 是否看得出 side effect 風險

### 作業 C：找出風險

請檢查下面 tool 設計，指出風險並提出改法：

```python
def run_sql(query: str) -> str:
    """Run SQL against production database."""
```

至少應該討論：

- 任意 SQL 的風險
- read-only 與 write 權限分離
- 查詢範圍限制
- 結果資料脫敏
- 審計紀錄
- 是否應改成少量明確查詢 tools

---

## 21. 常見誤解

### 誤解 1：MCP server 就是聊天機器人

不是。

MCP server 通常不負責和使用者聊天，也不負責產生最終自然語言回答。

它更像一個能力供應者：

```text
Host / LLM 負責理解問題與組織回答
MCP server 負責提供可被呼叫的能力
```

如果學生已經寫過 FastAPI，可以這樣類比：

```text
FastAPI app 通常提供 HTTP endpoints
FastMCP server 提供 AI client 可發現、可呼叫的 capabilities
```

### 誤解 2：MCP 會取代 RAG

不一定。

RAG 通常用來把大量文件切片、索引、檢索，再把相關內容放進 LLM context。

MCP 則是讓 AI client 用標準方式連接外部 tools、resources、prompts。

兩者可以互補：

```text
RAG：適合大量非結構化文件檢索
MCP Resource：適合暴露明確、可命名、可治理的資料來源
MCP Tool：適合執行查詢、計算、操作或 workflow
```

例如，公司知識庫可以先用 RAG 做搜尋；但「查某張訂單最新狀態」更適合做成 tool。

### 誤解 3：只要把所有 API 轉成 MCP tools 就完成了

這是很常見、也很危險的想法。

AI client 不需要一堆低階 endpoint。它需要少量、穩定、語意明確的能力。

如果直接把 API 轉成 tools，常會出現：

- tool 太多，LLM 不知道選哪個
- endpoint 命名對人類 API 開發者清楚，對 LLM 任務語意不清楚
- 權限邊界不明
- side effect 太容易被誤觸
- response 太像系統內部格式，不適合放回對話

比較好的方式是先問：

```text
AI client 要幫使用者完成什麼任務？
完成這個任務需要哪些最小能力？
每個能力是否應該是 tool、resource，還是 prompt？
```

### 誤解 4：MCP 是安全的，所以 tool 可以放心開

MCP 提供標準化連接方式，但安全仍然要由系統設計負責。

你仍然需要：

- authentication
- authorization
- input validation
- audit logging
- rate limiting
- sensitive data filtering
- human approval for high-risk actions

可以這樣提醒學生：

> MCP 讓 AI client 比以前更容易使用你的系統。這也代表錯誤設計的能力，會比以前更容易被誤用。

### 誤解 5：FastMCP 太簡單，所以 production 應該也很簡單

FastMCP 讓「寫出能跑的 server」很簡單。

Production 難的是：

- 能力邊界
- 權限模型
- 錯誤處理
- timeout
- observability
- versioning
- backward compatibility
- tool description quality
- 測試與審計

Decorator 不是工程品質的終點，只是入口。

---

## 22. 三個完整案例

### 案例 A：客服助理

需求：

```text
客服希望 AI 可以查訂單狀態、查退款政策、產生回覆草稿，必要時建立內部 ticket。
```

能力設計：

| 能力 | 類型 | 說明 |
|---|---|---|
| `get_order_status(order_id)` | Tool | 即時查詢訂單狀態 |
| `policy://refund` | Resource | 提供退款政策 |
| `draft_customer_reply(order_id, tone)` | Prompt | 產生客服回覆草稿 |
| `create_support_ticket(...)` | Tool | 建立 ticket，有 side effect |

設計提醒：

- `get_order_status` 回傳資料要避免包含不必要個資
- `create_support_ticket` 要留下審計紀錄
- `draft_customer_reply` 不應該直接寄信，寄信應該是另一個高風險 tool

可能的 tool signature：

```python
@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment, payment, and fulfillment status for one order."""
    ...

@mcp.tool
def create_support_ticket(
    customer_id: str,
    subject: str,
    summary: str,
    priority: str = "normal",
) -> dict:
    """Create a support ticket for a customer issue and return the ticket ID."""
    ...
```

### 案例 B：DevOps 助理

需求：

```text
工程師希望 AI 可以查部署狀態、查最近錯誤、讀 runbook，並產生 incident summary。
```

能力設計：

| 能力 | 類型 | 說明 |
|---|---|---|
| `get_deployment_status(service, environment)` | Tool | 查 CI/CD 或部署平台 |
| `search_recent_errors(service, minutes)` | Tool | 查 log 或 observability 系統 |
| `runbook://service/{service}` | Resource | 讀服務 runbook |
| `incident_summary(service, incident_time)` | Prompt | 產生 incident 摘要模板 |

設計提醒：

- 查 log 的 tool 要限制時間範圍與筆數
- production 操作如 rollback 不應第一版就開
- 如果要做 rollback，必須有權限與人工確認

一個刻意保守的第一版：

```text
只讀狀態，不做修改。
只查最近 60 分鐘，不開任意查詢。
只提供 runbook，不自動執行 remediation。
```

### 案例 C：資料分析助理

需求：

```text
營運同仁希望 AI 可以查每日營收、比較區間、產生分析摘要。
```

能力設計：

| 能力 | 類型 | 說明 |
|---|---|---|
| `get_daily_revenue(date)` | Tool | 查指定日期營收 |
| `compare_revenue(start_date, end_date)` | Tool | 比較區間資料 |
| `metric://revenue-definition` | Resource | 指標定義 |
| `revenue_analysis_report(period)` | Prompt | 產生分析報告模板 |

設計提醒：

- 不要提供 `run_sql(query)` 作為第一版能力
- 用明確 tool 包住允許的查詢
- 回傳資料要結構化，例如日期、數值、幣別、資料更新時間
- 指標定義用 Resource，避免 LLM 自己猜營收公式

---

## 23. MCP Server 設計檢查表

設計一個 MCP server 前，先過這張表。

### 任務與範圍

```text
[ ] 這個 server 服務哪一類使用者？
[ ] 它要幫 AI client 完成哪些任務？
[ ] 哪些任務明確不做？
[ ] 第一版是否可以只做 read-only 能力？
```

### Tool 設計

```text
[ ] tool 名稱是否是清楚的動詞片語？
[ ] 每個 tool 是否只做一件清楚的事？
[ ] 參數是否少而明確？
[ ] 是否避免使用任意字串承載複雜操作？
[ ] 是否避免 *args / **kwargs？
[ ] docstring 是否寫給 LLM 判斷使用時機？
[ ] 回傳是否是結構化資料？
```

### Resource 設計

```text
[ ] resource URI 是否穩定？
[ ] resource 是否 read-only？
[ ] resource 是否有清楚 mime type 或資料格式？
[ ] 是否避免回傳不必要敏感資料？
[ ] 大型資料是否需要分頁、摘要或範圍限制？
```

### Prompt 設計

```text
[ ] prompt 是否代表可重用的任務模板？
[ ] prompt 參數是否清楚？
[ ] prompt 是否避免硬編不存在的資料？
[ ] prompt 是否能和 tools/resources 搭配？
```

### 安全與治理

```text
[ ] 是否有 authentication？
[ ] 是否有 authorization？
[ ] 高風險 tool 是否需要確認？
[ ] 是否記錄誰呼叫了哪個 tool？
[ ] 是否限制 rate / quota？
[ ] 是否處理 timeout？
[ ] 是否過濾敏感資料？
[ ] 是否考慮 prompt injection？
```

### 測試

```text
[ ] 是否測 list_tools？
[ ] 是否測每個 tool 的成功案例？
[ ] 是否測錯誤輸入？
[ ] 是否測權限不足？
[ ] 是否測 side effect 沒有重複發生？
[ ] 是否測 response schema？
```

---

## 24. 課堂互動問題

這些問題適合穿插在第一堂課中，避免學生只是聽講。

### 問題 1

如果 AI 要幫工程師「查某個 service 最近 10 分鐘的錯誤率」，你會設計成 Tool 還是 Resource？

參考討論：

```text
通常是 Tool，因為它需要即時查詢 metrics 系統，並根據參數計算結果。
```

### 問題 2

如果 AI 要讀「公司請假政策」，你會設計成 Tool 還是 Resource？

參考討論：

```text
通常是 Resource，因為它是 read-only 文件，不需要執行動作。
```

### 問題 3

如果 AI 要「幫客戶取消訂閱」，這個 tool 第一版可以開嗎？

參考討論：

```text
可以設計，但不一定第一版開放。
它有 side effect，需要權限、確認、審計，也可能需要 dry-run 或 preview。
```

### 問題 4

如果你有 80 個 tools，會發生什麼問題？

參考討論：

```text
LLM tool selection 可能變差。
context 變大。
安全審查變難。
維護成本上升。
應該用 toolsets、分 server、分任務域，或先收斂第一版能力。
```

### 問題 5

為什麼 docstring 不是可有可無？

參考討論：

```text
因為 tool description 是 LLM 選擇工具的重要依據。
不清楚的 docstring 會導致錯用、漏用或傳錯參數。
```

---

## 25. 從概念課銜接到實作課的 Demo

第一堂課最後可以用一個 10 分鐘 demo 收尾。

目的不是教完整 FastMCP，而是讓學生看到：

```text
剛剛講的 capability，真的可以用很少 Python 程式碼表達。
```

Demo 程式：

```python
from fastmcp import FastMCP

mcp = FastMCP("Support Demo")

@mcp.tool
def get_order_status(order_id: str) -> dict:
    """Return shipment and fulfillment status for one order."""
    return {
        "order_id": order_id,
        "status": "shipped",
        "tracking_number": "TW123456789",
    }

@mcp.resource("policy://refund")
def refund_policy() -> str:
    """Return the current refund policy."""
    return "Customers can request a refund within 30 days."

@mcp.prompt
def draft_customer_reply(topic: str) -> str:
    """Create a customer support reply draft."""
    return f"Draft a polite and concise customer support reply about: {topic}"

if __name__ == "__main__":
    mcp.run()
```

講解順序：

```text
1. 這是 server：FastMCP("Support Demo")
2. 這是 tool：get_order_status
3. 這是 resource：policy://refund
4. 這是 prompt：draft_customer_reply
5. type hints 和 docstring 會變成 AI client 可理解的 schema/metadata
6. 下一堂課我們會真的跑起來、測它、再改成更像 production 的版本
```

---

## 26. 術語表

### MCP

Model Context Protocol。AI 應用程式連接外部資料、工具與工作流程的開放標準。

### Host

使用者直接互動的 AI 應用程式，例如 Claude Desktop、Cursor、VS Code、ChatGPT 或自製 agent app。

### Client

Host 裡負責和某個 MCP server 通訊的元件。通常一個 client 對一個 server 連線。

### Server

暴露 capabilities 的外部程式或服務。Python 工程師用 FastMCP 寫的通常就是 server。

### Tool

可執行能力。通常對應 Python function，可以查詢、計算、呼叫 API 或產生 side effect。

### Resource

可讀資料。通常是 read-only context，例如文件、設定、狀態、政策。

### Prompt

可重用的提示模板，用來建立一致的任務流程或對話起點。

### Transport

Client 和 server 的通訊方式。例如本機 `stdio` 或遠端 `http`。

### Discovery

Client 向 server 詢問可用 capabilities 的過程。這是 MCP 和傳統硬編碼 API 呼叫的一個重要差異。

### Side Effect

會改變外部系統狀態的操作，例如建立 ticket、寄信、退款、刪除資料、觸發部署。

### Tool Schema

描述 tool 需要哪些參數、型別與格式的資料。FastMCP 會從 Python type hints 產生 schema。

---

## 27. 參考來源

- MCP 官方介紹：https://modelcontextprotocol.io/docs/getting-started/intro
- Anthropic MCP 發布文：https://www.anthropic.com/news/model-context-protocol
- Hugging Face MCP Course：https://huggingface.co/learn/mcp-course/en/unit1/introduction
- Hugging Face MCP Key Concepts：https://huggingface.co/learn/mcp-course/en/unit1/key-concepts
- Hugging Face MCP Architecture：https://huggingface.co/learn/mcp-course/en/unit1/architectural-components
- GitHub Copilot MCP 文件：https://docs.github.com/en/copilot/concepts/context/mcp
- Microsoft Azure API Management MCP：https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview
- Cloudflare MCP 說明：https://www.cloudflare.com/learning/ai/what-is-model-context-protocol-mcp/
- FastMCP Quickstart：https://gofastmcp.com/getting-started/quickstart
- FastMCP Tools：https://gofastmcp.com/servers/tools
- FastMCP Resources：https://gofastmcp.com/servers/resources
- FastMCP Prompts：https://gofastmcp.com/servers/prompts
- FastMCP Testing：https://gofastmcp.com/servers/testing
