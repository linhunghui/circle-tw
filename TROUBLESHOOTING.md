# 🔧 問題排除指南

## 地圖和搜尋無法顯示

### 快速診斷

1. **訪問測試頁面**
   ```
   http://localhost:8000/test
   ```
   這個頁面會自動檢測所有 API 問題

2. **查看測試結果**
   - ✅ 綠色 = 正常
   - ❌ 紅色 = 有問題

---

## 常見問題與解決方法

### 問題 1: API Key 認證失敗

**症狀**：
- 地圖顯示灰色
- Console 顯示 "Google Maps API error"
- 測試頁面顯示認證失敗

**解決方法**：

#### 步驟 1: 檢查 API Key
```bash
# 查看 .env 檔案
cat .env

# 確認 GOOGLE_MAPS_API_KEY 是否正確
```

#### 步驟 2: 檢查 API 啟用狀態
前往 [Google Cloud Console](https://console.cloud.google.com/apis/library)

確認已啟用：
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Directions API

#### 步驟 3: 檢查 API Key 限制
前往 [API 憑證頁面](https://console.cloud.google.com/apis/credentials)

1. 點擊你的 API Key
2. 查看「應用程式限制」
3. 選擇以下其中一種：

**選項 A：無限制（開發用）**
```
應用程式限制：無
```

**選項 B：HTTP referrer（建議）**
```
應用程式限制：HTTP referrer
網站限制：
  http://localhost:8000/*
  http://127.0.0.1:8000/*
```

4. 點擊「儲存」

#### 步驟 4: 重新啟動
```bash
# 停止伺服器
按 Ctrl + C

# 重新啟動
python app.py

# 清除瀏覽器快取
按 Cmd + Shift + R
```

---

### 問題 2: API 配額用完

**症狀**：
- 之前可以用，現在不行
- Console 顯示 "OVER_QUERY_LIMIT"

**解決方法**：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
2. 查看「配額」頁面
3. 檢查是否超過免費額度

**免費額度**：
- Maps JavaScript API: 每月 $200 美元額度
- 約等於 28,000 次地圖載入

**如果超過**：
- 等待下個月重置
- 或啟用計費帳戶

---

### 問題 3: Port 被佔用

**症狀**：
- 無法啟動伺服器
- 顯示 "Address already in use"

**解決方法**：

```bash
# 查看 port 8000 是否被佔用
lsof -i :8000

# 如果有程式佔用，終止它
kill -9 <PID>

# 或改用其他 port
# 編輯 app.py，改成 port=8080
```

---

### 問題 4: 瀏覽器快取問題

**症狀**：
- 更新後沒有變化
- 舊版本的介面

**解決方法**：

```
方法 1: 強制重新整理
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)

方法 2: 清除快取
Chrome: 設定 → 隱私權和安全性 → 清除瀏覽資料

方法 3: 無痕模式
Cmd + Shift + N (Mac)
Ctrl + Shift + N (Windows)
```

---

### 問題 5: JavaScript 錯誤

**症狀**：
- 功能無法使用
- Console 有錯誤訊息

**解決方法**：

1. **開啟 Console**
   ```
   按 F12 或 Cmd + Option + I
   切換到 Console 標籤
   ```

2. **查看錯誤訊息**
   ```
   常見錯誤：
   - "google is not defined" → API 未載入
   - "Cannot read property" → 變數未定義
   - "Uncaught TypeError" → 函數呼叫錯誤
   ```

3. **重新載入頁面**
   ```
   清除快取後重新載入
   ```

---

### 問題 6: 網路連線問題

**症狀**：
- 地圖載入很慢
- 搜尋沒反應

**解決方法**：

```
1. 檢查網路連線
   ping google.com

2. 檢查防火牆設定
   確認允許連線到 Google API

3. 檢查 DNS
   嘗試使用 8.8.8.8 (Google DNS)
```

---

## 診斷流程圖

```
開始
  ↓
訪問 http://localhost:8000/test
  ↓
地圖顯示了嗎？
  ├─ 是 → 功能正常 ✅
  └─ 否 ↓
     Console 有錯誤嗎？
       ├─ "API Key 錯誤" → 檢查 API Key 設定
       ├─ "配額用完" → 檢查配額
       ├─ "google is not defined" → API 未載入
       └─ 其他錯誤 → 查看錯誤訊息
```

---

## 完整檢查清單

### API 設定檢查
- [ ] API Key 已設定在 .env
- [ ] Maps JavaScript API 已啟用
- [ ] Places API 已啟用
- [ ] Directions API 已啟用
- [ ] API Key 限制設定正確
- [ ] 配額未用完

### 伺服器檢查
- [ ] 伺服器正在運行
- [ ] Port 8000 未被佔用
- [ ] 可以訪問 http://localhost:8000
- [ ] 測試頁面可以訪問

### 瀏覽器檢查
- [ ] 已清除快取
- [ ] Console 沒有錯誤
- [ ] 網路連線正常
- [ ] 沒有阻擋 JavaScript

---

## 測試步驟

### 步驟 1: 基本測試
```
1. 訪問 http://localhost:8000/test
2. 查看所有測試項目是否為綠色 ✅
3. 如果有紅色 ❌，查看錯誤訊息
```

### 步驟 2: 功能測試
```
1. 訪問 http://localhost:8000
2. 地圖應該顯示台灣
3. 點擊地圖應該可以新增路線點
4. 搜尋功能應該可以使用
```

### 步驟 3: Console 檢查
```
1. 按 F12 開啟 Console
2. 應該沒有紅色錯誤訊息
3. 如果有錯誤，記下錯誤訊息
```

---

## 聯絡資訊

如果以上方法都無法解決問題：

1. **查看 Console 錯誤訊息**
   - 按 F12
   - 切換到 Console 標籤
   - 截圖錯誤訊息

2. **查看測試頁面結果**
   - 訪問 http://localhost:8000/test
   - 截圖測試結果

3. **檢查 API Key 設定**
   - 確認 API Key 正確
   - 確認 API 已啟用
   - 確認限制設定正確

---

## 快速修復命令

```bash
# 完整重置流程
# 1. 停止伺服器
按 Ctrl + C

# 2. 檢查 .env
cat .env

# 3. 重新啟動
python app.py

# 4. 訪問測試頁面
# 開啟瀏覽器：http://localhost:8000/test

# 5. 清除快取
# 在瀏覽器按 Cmd + Shift + R
```

---

**祝你順利解決問題！🔧✨**
