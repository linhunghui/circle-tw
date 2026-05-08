# 📁 專案結構說明

```
motorcycle-trip-planner/
│
├── 📄 app.py                    # Flask 主應用程式
├── 📄 config.py                 # 設定檔（API Keys、預設值）
├── 📄 init_db.py                # 資料庫初始化腳本
├── 📄 requirements.txt          # Python 依賴套件
├── 📄 start.sh                  # 一鍵啟動腳本
│
├── 📁 templates/                # HTML 模板
│   ├── index.html              # 主頁面
│   └── shared_trip.html        # 分享頁面
│
├── 📁 static/                   # 靜態資源
│   ├── css/
│   │   └── style.css           # 主要樣式表
│   └── js/
│       └── app.js              # 前端 JavaScript
│
├── 📁 .env                      # 環境變數（不上傳 Git）
├── 📁 .env.example              # 環境變數範例
├── 📁 .gitignore                # Git 忽略清單
│
├── 📁 trips.db                  # SQLite 資料庫（自動生成）
│
└── 📚 文件/
    ├── README.md               # 專案說明
    ├── FEATURES.md             # 功能詳細說明
    ├── QUICKSTART.md           # 快速開始指南
    ├── CHANGELOG.md            # 更新日誌
    └── PROJECT_STRUCTURE.md    # 本檔案
```

---

## 📄 核心檔案說明

### `app.py`
Flask 後端主程式，包含：
- 路由定義（11 個 API 端點）
- 資料庫操作
- 業務邏輯處理
- API 整合（Google Maps, OpenWeatherMap）

**主要路由**：
```python
GET  /                          # 主頁面
GET  /api/trips                 # 取得所有行程
POST /api/trips                 # 建立新行程
GET  /api/trips/<id>            # 取得特定行程
PUT  /api/trips/<id>            # 更新行程
DELETE /api/trips/<id>          # 刪除行程
POST /api/calculate-distance    # 計算距離
POST /api/weather               # 取得天氣
POST /api/calculate-cost        # 計算費用
POST /api/share/<id>            # 建立分享連結
GET  /share/<code>              # 查看分享行程
GET  /api/export-pdf/<id>       # 匯出 PDF
```

### `config.py`
設定檔，包含：
- API Keys 設定
- 資料庫路徑
- 預設騎行參數
- 費用計算參數

**可自訂參數**：
```python
DEFAULT_DAILY_DISTANCE = 200    # 每日騎行距離
AVERAGE_SPEED = 50              # 平均速度
FUEL_CONSUMPTION = 25           # 油耗
FUEL_PRICE = 30                 # 油價
DAILY_ACCOMMODATION = 1000      # 住宿費
DAILY_MEAL = 500                # 餐費
```

### `init_db.py`
資料庫初始化腳本，建立：
- `trips` 表：行程資料
- `places` 表：地點資料
- `daily_plans` 表：每日規劃

### `templates/index.html`
主頁面 HTML，包含：
- 頂部導航列
- 側邊欄控制面板
- 地圖顯示區域
- 對話框（儲存、載入）

### `static/css/style.css`
主要樣式表，包含：
- 響應式設計
- 現代化 UI 元件
- 動畫效果
- 手機適配

### `static/js/app.js`
前端 JavaScript，包含：
- Google Maps 初始化
- 路線規劃邏輯
- API 呼叫
- 使用者互動處理

---

## 🗄️ 資料庫結構

### `trips` 表
```sql
CREATE TABLE trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- 行程名稱
    description TEXT,                      -- 行程描述
    route_data TEXT NOT NULL,              -- 路線資料（JSON）
    total_distance REAL,                   -- 總距離
    estimated_days INTEGER,                -- 預計天數
    share_code TEXT UNIQUE,                -- 分享代碼
    shared_at TIMESTAMP,                   -- 分享時間
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `places` 表
```sql
CREATE TABLE places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,                       -- 關聯行程 ID
    name TEXT NOT NULL,                    -- 地點名稱
    type TEXT NOT NULL,                    -- 類型（住宿/加油站等）
    latitude REAL NOT NULL,                -- 緯度
    longitude REAL NOT NULL,               -- 經度
    address TEXT,                          -- 地址
    notes TEXT,                            -- 備註
    day_number INTEGER,                    -- 第幾天
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);
```

### `daily_plans` 表
```sql
CREATE TABLE daily_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,                       -- 關聯行程 ID
    day_number INTEGER NOT NULL,           -- 第幾天
    start_point TEXT,                      -- 起點
    end_point TEXT,                        -- 終點
    distance REAL,                         -- 當日距離
    notes TEXT,                            -- 備註
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);
```

---

## 🔌 API 整合

### Google Maps API
**使用的服務**：
- Maps JavaScript API - 地圖顯示
- Places API - 地點搜尋
- Directions API - 路線規劃

**需要的權限**：
- 地圖顯示
- 地點搜尋
- 路線計算

### OpenWeatherMap API
**使用的服務**：
- 5 Day / 3 Hour Forecast API

**免費額度**：
- 每月 1,000 次呼叫
- 每分鐘 60 次呼叫

---

## 📦 依賴套件

### 後端依賴
```
Flask==3.0.0              # Web 框架
Flask-CORS==4.0.0         # 跨域請求支援
python-dotenv==1.0.0      # 環境變數管理
requests==2.31.0          # HTTP 請求
reportlab==4.0.7          # PDF 生成
qrcode==7.4.2             # QR Code 生成
Pillow==10.1.0            # 圖片處理
```

### 前端依賴（CDN）
```
Google Maps JavaScript API
Font Awesome 6.4.0
```

---

## 🔒 安全性考量

### 敏感資料保護
- `.env` 檔案不上傳 Git
- API Keys 儲存在環境變數
- `.gitignore` 設定完整

### 資料庫安全
- 使用參數化查詢防止 SQL Injection
- 外鍵約束確保資料完整性
- 自動時間戳記

### API 安全
- CORS 設定
- 錯誤處理
- 輸入驗證

---

## 🎨 前端架構

### CSS 架構
```
style.css
├── 全域樣式（變數、重置）
├── 佈局（容器、網格）
├── 元件（按鈕、表單、卡片）
├── 頁面特定樣式
└── 響應式設計（@media）
```

### JavaScript 架構
```
app.js
├── 全域變數
├── 地圖初始化
├── 事件監聽器
├── 路線規劃
├── 地點搜尋
├── API 呼叫
└── UI 更新
```

---

## 📱 響應式設計

### 斷點設定
```css
/* 手機 */
@media (max-width: 768px) {
    /* 側邊欄變為頂部面板 */
    /* 按鈕堆疊顯示 */
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
    /* 優化佈局 */
}

/* 桌面 */
@media (min-width: 1025px) {
    /* 完整功能顯示 */
}
```

---

## 🚀 部署建議

### 開發環境
```bash
python app.py
# 訪問 http://localhost:5000
```

### 生產環境
```bash
# 使用 Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 或使用 uWSGI
pip install uwsgi
uwsgi --http :5000 --wsgi-file app.py --callable app
```

### Docker 部署（建議）
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

---

## 📊 效能優化

### 前端優化
- 地圖圖磚快取
- 圖片延遲載入
- JavaScript 非同步載入

### 後端優化
- 資料庫索引
- API 回應快取
- 連線池管理

### 資料庫優化
```sql
-- 建議的索引
CREATE INDEX idx_trips_share_code ON trips(share_code);
CREATE INDEX idx_places_trip_id ON places(trip_id);
CREATE INDEX idx_daily_plans_trip_id ON daily_plans(trip_id);
```

---

## 🧪 測試建議

### 單元測試
```python
# test_app.py
import unittest
from app import app

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
    
    def test_index(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
```

### 整合測試
- API 端點測試
- 資料庫操作測試
- 外部 API 整合測試

---

## 📝 開發規範

### 程式碼風格
- Python: PEP 8
- JavaScript: ES6+
- CSS: BEM 命名法

### Git 提交訊息
```
feat: 新增功能
fix: 修復錯誤
docs: 文件更新
style: 格式調整
refactor: 重構程式碼
test: 測試相關
chore: 雜項更新
```

---

## 🔧 維護指南

### 定期維護
- 更新依賴套件
- 檢查 API 額度
- 備份資料庫
- 檢視錯誤日誌

### 監控項目
- API 呼叫次數
- 資料庫大小
- 伺服器效能
- 使用者回饋

---

## 📞 技術支援

遇到問題？
1. 查看 [README.md](README.md)
2. 查看 [QUICKSTART.md](QUICKSTART.md)
3. 檢查瀏覽器 Console
4. 檢查 Flask 終端機日誌
