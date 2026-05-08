# 🚀 進階功能說明

## 已實現的功能

### 1. ☁️ 天氣預報整合

**功能說明**：
- 查看路線點的即時天氣預報
- 顯示未來 2 天的天氣資訊
- 包含溫度、天氣描述、風速等資訊

**使用方式**：
1. 新增路線點後
2. 點擊「查看天氣」按鈕
3. 系統會顯示最後一個路線點的天氣預報

**設定步驟**：
1. 前往 [OpenWeatherMap](https://openweathermap.org/api)
2. 註冊免費帳號（每月 1000 次免費呼叫）
3. 取得 API Key
4. 將 API Key 加入 `.env` 檔案：
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

---

### 2. 🔗 行程分享功能

**功能說明**：
- 產生唯一的分享連結
- 其他人可透過連結查看你的行程
- 包含完整路線地圖和資訊

**使用方式**：
1. 儲存行程後
2. 點擊「分享」按鈕
3. 系統自動複製分享連結到剪貼簿
4. 將連結傳送給朋友

**分享連結格式**：
```
http://localhost:5000/share/xxxxxxxxxxxxxxxx
```

---

### 3. 📄 匯出 PDF 行程表

**功能說明**：
- 將行程匯出為 PDF 檔案
- 包含完整路線點資訊
- 附帶 QR Code 分享連結

**使用方式**：
1. 儲存行程後
2. 點擊「匯出 PDF」按鈕
3. 瀏覽器會自動下載 PDF 檔案

**PDF 內容**：
- 行程名稱與描述
- 總距離與預計天數
- 所有路線點座標
- QR Code（掃描即可查看線上版本）

---

### 4. 💰 油耗與費用估算

**功能說明**：
- 自動計算油耗費用
- 估算住宿與餐費
- 顯示總費用預算

**計算方式**：
- **油耗**：距離 ÷ 25 km/L × NT$30/L
- **住宿**：(天數 - 1) × NT$1,000/晚
- **餐費**：天數 × NT$500/天

**自訂設定**（在 `config.py`）：
```python
FUEL_CONSUMPTION = 25  # 公里/公升
FUEL_PRICE = 30  # 新台幣/公升
DAILY_ACCOMMODATION = 1000  # 每日住宿費用
DAILY_MEAL = 500  # 每日餐費
```

---

### 5. 📅 多日行程分段規劃

**功能說明**：
- 系統自動根據距離分配天數
- 預設每天騎行 200 公里
- 可在資料庫中儲存每日詳細規劃

**資料庫結構**：
```sql
CREATE TABLE daily_plans (
    id INTEGER PRIMARY KEY,
    trip_id INTEGER,
    day_number INTEGER,
    start_point TEXT,
    end_point TEXT,
    distance REAL,
    notes TEXT
)
```

---

## 🔜 待實現功能

### 6. 🗺️ 離線地圖支援

**實現方式**：
1. 使用 Service Worker 快取地圖資料
2. 整合 Leaflet.js 搭配離線圖磚
3. 儲存路線資料到 LocalStorage

**技術選擇**：
- **選項 A**：Google Maps Offline API（需付費）
- **選項 B**：OpenStreetMap + Leaflet.js（免費）
- **選項 C**：Mapbox GL JS（有免費額度）

**建議實作步驟**：
```javascript
// 1. 註冊 Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

// 2. 快取地圖圖磚
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('tile.openstreetmap.org')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});

// 3. 儲存路線到 LocalStorage
localStorage.setItem('offline_route', JSON.stringify(waypoints));
```

---

## 📦 安裝新依賴

執行以下命令安裝所有新功能所需的套件：

```bash
pip install -r requirements.txt
```

新增的套件：
- `reportlab` - PDF 生成
- `qrcode` - QR Code 生成
- `Pillow` - 圖片處理

---

## 🔧 設定檢查清單

- [ ] Google Maps API Key 已設定
- [ ] OpenWeatherMap API Key 已設定（天氣功能）
- [ ] 執行 `python init_db.py` 更新資料庫結構
- [ ] 安裝新的 Python 套件
- [ ] 重新啟動 Flask 伺服器

---

## 💡 使用建議

1. **天氣預報**：建議在出發前 3-5 天查看，天氣預報較準確
2. **費用估算**：可根據個人習慣調整 `config.py` 中的預設值
3. **分享連結**：分享連結永久有效，除非刪除行程
4. **PDF 匯出**：建議在確定行程後再匯出，避免重複下載

---

## 🐛 已知問題

1. 天氣預報需要 API Key，未設定時會顯示錯誤訊息
2. PDF 中文字型可能需要額外設定（目前使用 Helvetica）
3. 離線地圖功能尚未實現

---

## 📞 技術支援

如有問題，請檢查：
1. 瀏覽器 Console (F12) 的錯誤訊息
2. Flask 終端機的錯誤日誌
3. API Key 是否正確設定
