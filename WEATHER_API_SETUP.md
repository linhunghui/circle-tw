# 🌤️ 天氣 API 設定指南

## 問題修復

已修復以下問題：

### 1. ✅ 天氣 API 400 錯誤
**原因**：`.env` 檔案中的 `OPENWEATHER_API_KEY` 未設定

**解決方案**：
- 後端現在會提供更清楚的錯誤訊息
- 前端會顯示設定指引

### 2. ✅ 附近搜尋功能改善
**原問題**：使用者需要先點擊搜尋類型按鈕，再點擊路線點旁的搜尋按鈕，流程不直覺

**新功能**：
- 直接點擊路線點旁的 🔍 按鈕
- 會彈出選單讓你選擇搜尋類型（住宿、加油站、餐廳、景點）
- 選擇後立即顯示附近地點

---

## 如何取得 OpenWeather API Key

### 步驟 1：註冊帳號
1. 前往 [OpenWeatherMap](https://openweathermap.org/api)
2. 點擊右上角的 **Sign In** 或 **Sign Up**
3. 填寫註冊資訊（Email、密碼等）
4. 確認 Email

### 步驟 2：取得 API Key
1. 登入後，點擊右上角的使用者名稱
2. 選擇 **My API Keys**
3. 你會看到一個預設的 API Key
4. 或者點擊 **Generate** 建立新的 API Key
5. 複製 API Key（格式類似：`xxxxxxxxxxxxxxxxx`）

### 步驟 3：設定到專案
1. 開啟專案根目錄的 `.env` 檔案
2. 找到這一行：
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
3. 將 `your_openweather_api_key_here` 替換成你的 API Key：

4. 儲存檔案

### 步驟 4：重新啟動伺服器
```bash
# 停止目前的伺服器（按 Ctrl+C）
# 然後重新啟動
python app.py
```

---

## 免費方案限制

OpenWeather 的免費方案包含：
- ✅ 每分鐘 60 次 API 呼叫
- ✅ 每天 1,000,000 次呼叫
- ✅ 5 天天氣預報
- ✅ 當前天氣資料
- ✅ 歷史天氣資料（1 天）

對於個人使用或小型專案來說，免費方案已經非常足夠！

---

## 測試天氣功能

設定完成後：

1. 開啟網站 `http://localhost:8000`
2. 在地圖上新增至少一個路線點
3. 點擊右側面板的 **查看天氣** 按鈕
4. 應該會顯示該地點未來 2 天的天氣預報

### 顯示內容包含：
- 🌡️ 溫度
- ☁️ 天氣狀況描述
- 💨 風速
- 💧 濕度
- 🖼️ 天氣圖示

---

## 常見問題

### Q1: API Key 無效
**錯誤訊息**：`401 Unauthorized`

**解決方法**：
- 確認 API Key 複製正確（沒有多餘空格）
- 新建立的 API Key 需要等待 10-15 分鐘才會生效
- 確認帳號已經通過 Email 驗證

### Q2: 超過呼叫限制
**錯誤訊息**：`429 Too Many Requests`

**解決方法**：
- 免費方案每分鐘限制 60 次呼叫
- 等待一分鐘後再試
- 考慮升級到付費方案

### Q3: 天氣資料不準確
**說明**：
- OpenWeather 的預報資料每 3 小時更新一次
- 台灣地區的資料可能不如中央氣象局準確
- 建議作為參考用途

---

## 附近搜尋新功能使用說明

### 舊流程（已改善）：
1. ❌ 先點擊底部的搜尋類型按鈕（住宿、加油站等）
2. ❌ 再點擊路線點旁的 🔍 按鈕
3. ❌ 流程不直覺，容易忘記

### 新流程（更簡單）：
1. ✅ 直接點擊路線點旁的 🔍 按鈕
2. ✅ 彈出選單顯示所有搜尋類型
3. ✅ 點擊想要的類型（🏨 住宿、⛽ 加油站、🍴 餐廳、📷 景點）
4. ✅ 立即顯示附近地點

### 功能特色：
- 🎯 一鍵操作，不需要記住流程
- 📍 自動將地圖移動到該路線點
- 🔍 搜尋半徑 10 公里
- 📊 顯示最多 10 個結果
- ⭐ 顯示評分（如果有的話）

---

## 更新內容總結

### 後端修改（app.py）
```python
# 改善錯誤訊息
if not app.config['OPENWEATHER_API_KEY'] or app.config['OPENWEATHER_API_KEY'] == 'your_openweather_api_key_here':
    return jsonify({
        'error': '未設定天氣 API Key',
        'message': '請到 https://openweathermap.org/api 註冊並取得免費 API Key，然後設定到 .env 檔案中的 OPENWEATHER_API_KEY'
    }), 400
```

### 前端修改（static/js/app.js）

#### 1. 附近搜尋改善
```javascript
// 新增彈出式選單
function searchNearWaypoint(waypointIndex) {
    // 顯示搜尋類型選單
    const searchTypes = [
        { type: 'lodging', name: '🏨 住宿' },
        { type: 'gas_station', name: '⛽ 加油站' },
        { type: 'restaurant', name: '🍴 餐廳' },
        { type: 'tourist_attraction', name: '📷 景點' }
    ];
    // ... 建立選單並顯示
}
```

#### 2. 天氣錯誤訊息改善
```javascript
// 顯示詳細的錯誤訊息和設定指引
if (error.message) {
    errorMsg += `<p style="...">設定指引</p>`;
}
```

---

## 下一步

設定完成後，你可以：

1. ✅ 測試天氣功能
2. ✅ 測試新的附近搜尋功能
3. ✅ 規劃你的環島行程
4. ✅ 分享行程給朋友

**祝你使用愉快！🏍️💨**
