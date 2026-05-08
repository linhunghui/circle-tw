# 更新日誌

## [2.2.0] - 2026-05-07

### 🐛 問題修正

#### 1. 機車路線優化
- 機車模式現在會避開高速公路
- 加入 `avoidHighways: true` 參數
- 只走省道和一般道路
- 更符合實際機車環島路線

#### 2. 騎行時數正確計算
- 使用 Google Directions API 回傳的實際時間
- 不再使用簡單的距離÷速度計算
- 考慮路況、道路類型等因素
- 顯示更準確的預估時間

#### 3. 地點搜尋體驗改進
- 搜尋後先在地圖上顯示藍色標記
- 彈出資訊視窗詢問是否加入路線
- 提供「加入路線」和「取消」按鈕
- 使用者可以決定是否加入

#### 4. 天氣 API 設定
- 在 `.env` 加入 `OPENWEATHER_API_KEY` 欄位
- 提供清楚的設定說明
- 修正天氣功能無法使用的問題

#### 5. 附近搜尋改進
- 改為點擊路線點旁的 🔍 按鈕搜尋
- 先選擇搜尋類型（住宿、加油站等）
- 再選擇要搜尋的路線點
- 更靈活的搜尋方式

### ✨ 新增功能

#### 6. 每日行程規劃
- 新增「每日行程」面板
- 可以為每一天選擇終點
- 顯示每日起點和終點
- 方便規劃多日行程

### 🔧 改進

- 優化路線計算邏輯
- 改進搜尋結果顯示
- 新增搜尋結果標記動畫
- 優化使用者互動流程
- 新增每日行程 CSS 樣式

### 📝 文件更新

- 新增 `FIXES_v2.2.md` - 問題修正說明
- 新增 `TEST_FIXES.md` - 測試指南

---

## [2.1.0] - 2026-05-07

### ✨ 新增功能

#### 1. 🔍 地點搜尋功能
- 新增地點搜尋輸入框
- 整合 Google Places Autocomplete API
- 支援自動完成建議
- 限制台灣地區搜尋
- 按 Enter 快速搜尋
- 自動移動地圖到搜尋結果

#### 2. 🚗 交通工具選擇
- 新增交通工具下拉選單
- 支援 4 種交通模式：
  - 🚗 汽車
  - 🏍️ 機車（預設）
  - 🚴 自行車
  - 🚶 步行
- 切換交通工具自動重新計算路線
- 不同模式顯示不同路線

### 🔧 改進

- 優化 addWaypoint 函數支援自訂地點名稱
- 改進路線計算邏輯支援多種交通模式
- 新增表單元素樣式（select 下拉選單）
- 優化使用者體驗流程

### 📝 文件更新

- 新增 `UPDATE_v2.1.md` - 更新說明
- 新增 `TEST_NEW_FEATURES.md` - 測試指南

### 🐛 修復

- 修正重複的 addWaypoint 函數定義
- 優化事件監聽器綁定

---

## [2.0.0] - 2026-05-07

### ✨ 新增功能

#### 1. ☁️ 天氣預報整合
- 整合 OpenWeatherMap API
- 顯示路線點未來 2 天天氣
- 包含溫度、天氣描述、濕度、風速
- 天氣圖示視覺化顯示

#### 2. 🔗 行程分享功能
- 產生唯一分享連結
- 分享連結永久有效
- 自動複製到剪貼簿
- 獨立的分享頁面展示

#### 3. 📄 匯出 PDF 行程表
- 使用 ReportLab 生成 PDF
- 包含完整行程資訊
- 附帶 QR Code 分享連結
- 一鍵下載功能

#### 4. 💰 油耗與費用估算
- 自動計算油耗費用
- 估算住宿費用
- 估算餐費
- 顯示總費用預算
- 可自訂費率設定

#### 5. 📅 多日行程分段規劃
- 新增 daily_plans 資料表
- 支援每日詳細規劃
- 自動分配騎行天數
- 資料庫結構優化

### 🔧 改進

- 更新資料庫結構（新增 share_code, shared_at 欄位）
- 優化前端介面（新增費用顯示區塊）
- 改進統計資訊顯示
- 新增天氣資訊面板
- 優化按鈕佈局

### 📦 新增依賴

- `reportlab==4.0.7` - PDF 生成
- `qrcode==7.4.2` - QR Code 生成
- `Pillow==10.1.0` - 圖片處理

### 📝 文件更新

- 新增 `FEATURES.md` - 詳細功能說明
- 新增 `QUICKSTART.md` - 快速開始指南
- 新增 `CHANGELOG.md` - 更新日誌
- 新增 `start.sh` - 一鍵啟動腳本
- 更新 `README.md` - 完整使用說明
- 更新 `.env.example` - 新增天氣 API Key

### 🗄️ 資料庫變更

```sql
-- trips 表新增欄位
ALTER TABLE trips ADD COLUMN share_code TEXT UNIQUE;
ALTER TABLE trips ADD COLUMN shared_at TIMESTAMP;

-- 新增 daily_plans 表
CREATE TABLE daily_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,
    day_number INTEGER NOT NULL,
    start_point TEXT,
    end_point TEXT,
    distance REAL,
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);
```

---

## [1.0.0] - 2026-05-07

### ✨ 初始版本

#### 核心功能
- 🗺️ Google Maps 整合
- 🏍️ 路線規劃與距離計算
- 🏨 住宿搜尋
- ⛽ 加油站定位
- 🍴 餐廳推薦
- 📷 景點查詢
- 💾 行程儲存與載入
- 📱 響應式設計

#### 技術架構
- Python Flask 後端
- SQLite 資料庫
- Google Maps JavaScript API
- 原生 JavaScript 前端
- 現代化 CSS 樣式

#### 基本功能
- 地圖點擊新增路線點
- 自動計算路線距離
- 估算騎行天數與時數
- 搜尋附近地點
- 儲存行程到資料庫
- 載入已儲存行程

---

## 🔜 未來計畫

### v2.1.0（計畫中）
- [ ] 離線地圖支援
- [ ] 多語言介面（英文、日文）
- [ ] 深色模式
- [ ] 行程評論與評分
- [ ] 社群分享功能

### v2.2.0（計畫中）
- [ ] 即時路況整合
- [ ] 景點推薦系統
- [ ] AI 行程規劃助手
- [ ] 行程範本庫
- [ ] 匯出 Excel 格式

### v3.0.0（長期計畫）
- [ ] 手機 App（React Native）
- [ ] 即時位置追蹤
- [ ] 多人協作規劃
- [ ] 行程直播功能
- [ ] 社群互動平台

---

## 📊 統計資訊

- **總程式碼行數**：~2,500 行
- **支援的 API**：Google Maps, OpenWeatherMap
- **資料庫表格**：3 個（trips, places, daily_plans）
- **前端頁面**：2 個（主頁面、分享頁面）
- **後端路由**：11 個

---

## 🙏 致謝

感謝以下開源專案：
- Flask - Web 框架
- Google Maps API - 地圖服務
- OpenWeatherMap - 天氣資料
- ReportLab - PDF 生成
- Font Awesome - 圖示庫
