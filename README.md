# 機車環島行程規劃網站

現代化的機車環島行程規劃系統，支援手機瀏覽，提供路線規劃、住宿推薦、加油站定位及每日騎行距離估算。

## ✨ 功能特色

### 核心功能
- 🗺️ **Google Maps 整合** - 視覺化路線規劃
- 🏍️ **每日騎行距離估算** - 智慧計算行程天數
- 🏨 **住宿地點標記** - 搜尋附近住宿
- ⛽ **加油站位置查詢** - 即時定位加油站
- 📱 **響應式設計** - 完美支援手機瀏覽
- 💾 **行程儲存** - 雲端儲存你的規劃

### 🚀 進階功能
- ☁️ **天氣預報整合** - 查看路線點天氣
- 🔗 **行程分享功能** - 產生分享連結給朋友
- 📄 **匯出 PDF 行程表** - 下載完整行程文件
- 📅 **多日行程分段規劃** - 自動分配每日行程
- 💰 **油耗與費用估算** - 預算規劃更輕鬆
- 🗺️ **離線地圖支援** - （開發中）

## 技術架構

- **後端**: Python Flask
- **前端**: HTML5, CSS3, JavaScript (Vanilla)
- **地圖**: Google Maps JavaScript API
- **天氣**: OpenWeatherMap API
- **資料庫**: SQLite
- **PDF**: ReportLab
- **樣式**: 響應式設計，支援手機與桌面

## 📦 安裝步驟

### 1. 安裝依賴套件

```bash
pip install -r requirements.txt
```

### 2. 設定 API Keys

#### Google Maps API Key（必要）
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Places API
   - Directions API
4. 建立 API Key
5. 將 API Key 加入 `.env` 檔案

#### OpenWeatherMap API Key（選用 - 天氣功能）
1. 前往 [OpenWeatherMap](https://openweathermap.org/api)
2. 註冊免費帳號
3. 取得 API Key
4. 將 API Key 加入 `.env` 檔案

**`.env` 檔案範例**：
```env
SECRET_KEY=motorcycle-trip-planner-2026-secure-key-f8a9b2c3d4e5
GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_Key
OPENWEATHER_API_KEY=你的_OpenWeather_API_Key
```

### 3. 初始化資料庫

```bash
python init_db.py
```

### 4. 啟動應用程式

```bash
python app.py
```

### 5. 開啟瀏覽器

- 桌面：`http://localhost:5000`
- 手機：`http://你的電腦IP:5000`（例如：`http://192.168.1.100:5000`）

## 📱 使用說明

### 基本操作
1. 在地圖上點擊新增路線點
2. 系統自動計算騎行距離與天數
3. 查看油耗與費用估算
4. 搜尋附近住宿、加油站、餐廳
5. 儲存你的環島計畫

### 進階功能

#### ☁️ 查看天氣預報
1. 新增路線點
2. 點擊「查看天氣」按鈕
3. 查看未來 2 天的天氣資訊

#### 🔗 分享行程
1. 儲存行程
2. 點擊「分享」按鈕
3. 分享連結自動複製到剪貼簿
4. 傳送給朋友查看

#### 📄 匯出 PDF
1. 儲存行程
2. 點擊「匯出 PDF」按鈕
3. 下載完整行程表（含 QR Code）

#### 💰 費用估算
- 系統自動計算：
  - 油耗費用（預設 25 km/L，NT$30/L）
  - 住宿費用（預設 NT$1,000/晚）
  - 餐費（預設 NT$500/天）
- 可在 `config.py` 自訂費率

## ⚙️ 自訂設定

編輯 `config.py` 調整預設值：

```python
# 騎行設定
DEFAULT_DAILY_DISTANCE = 200  # 每日騎行距離（公里）
AVERAGE_SPEED = 50  # 平均速度（公里/小時）

# 費用設定
FUEL_CONSUMPTION = 25  # 油耗（公里/公升）
FUEL_PRICE = 30  # 油價（新台幣/公升）
DAILY_ACCOMMODATION = 1000  # 住宿費（新台幣/晚）
DAILY_MEAL = 500  # 餐費（新台幣/天）
```

## 📚 詳細功能說明

查看 [FEATURES.md](FEATURES.md) 了解所有功能的詳細說明。

## 🔒 安全性

- API Keys 儲存在 `.env` 檔案中
- `.gitignore` 已設定保護敏感資料
- 不要將 `.env` 上傳到 Git

## 🐛 疑難排解

### 看不到網頁
- 確認 Flask 伺服器正在運行
- 檢查 port 是否被佔用
- 避免使用被封鎖的 port（如 6666）

### 地圖無法顯示
- 檢查 Google Maps API Key 是否正確
- 確認已啟用必要的 API
- 查看瀏覽器 Console (F12) 的錯誤訊息

### 天氣功能無法使用
- 確認已設定 OpenWeatherMap API Key
- 檢查 API Key 是否有效
- 免費帳號每月限制 1000 次呼叫

## 📄 授權

MIT License
