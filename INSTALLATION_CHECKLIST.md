# ✅ 安裝檢查清單

使用這個清單確保所有設定都正確完成。

## 📋 安裝前準備

- [ ] Python 3.7+ 已安裝
  ```bash
  python --version
  # 應該顯示 Python 3.7 或更高版本
  ```

- [ ] pip 已安裝
  ```bash
  pip --version
  ```

- [ ] Git 已安裝（選用）
  ```bash
  git --version
  ```

---

## 📦 步驟 1：安裝依賴套件

- [ ] 執行安裝命令
  ```bash
  pip install -r requirements.txt
  ```

- [ ] 確認套件已安裝
  ```bash
  pip list | grep Flask
  pip list | grep reportlab
  pip list | grep qrcode
  ```

**預期結果**：
```
Flask                3.0.0
Flask-CORS           4.0.0
reportlab            4.0.7
qrcode               7.4.2
```

---

## 🔑 步驟 2：設定 API Keys

### Google Maps API Key（必要）

- [ ] 前往 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 建立新專案或選擇現有專案
- [ ] 啟用以下 API：
  - [ ] Maps JavaScript API
  - [ ] Places API
  - [ ] Directions API
- [ ] 建立 API Key
- [ ] 複製 API Key

### OpenWeatherMap API Key（選用）

- [ ] 前往 [OpenWeatherMap](https://openweathermap.org/api)
- [ ] 註冊免費帳號
- [ ] 取得 API Key
- [ ] 複製 API Key

### 設定環境變數

- [ ] 複製 `.env.example` 為 `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] 編輯 `.env` 檔案
  ```bash
  nano .env
  # 或使用你喜歡的編輯器
  ```

- [ ] 填入 API Keys
  ```env
  SECRET_KEY=motorcycle-trip-planner-2026-secure-key-f8a9b2c3d4e5
  GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_Key
  OPENWEATHER_API_KEY=你的_OpenWeather_API_Key
  ```

- [ ] 儲存檔案

---

## 🗄️ 步驟 3：初始化資料庫

- [ ] 執行初始化腳本
  ```bash
  python init_db.py
  ```

- [ ] 確認資料庫已建立
  ```bash
  ls -lh trips.db
  ```

**預期結果**：
```
資料庫初始化完成！
```

---

## 🚀 步驟 4：啟動伺服器

### 方法 A：使用啟動腳本（推薦）

- [ ] 執行啟動腳本
  ```bash
  ./start.sh
  ```

### 方法 B：手動啟動

- [ ] 執行 Flask 應用
  ```bash
  python app.py
  ```

**預期結果**：
```
 * Running on http://0.0.0.0:5000
 * Running on http://127.0.0.1:5000
```

---

## 🌐 步驟 5：測試網站

### 桌面測試

- [ ] 開啟瀏覽器
- [ ] 訪問 `http://localhost:5000`
- [ ] 確認頁面正常顯示
- [ ] 確認地圖正常載入

### 功能測試

- [ ] 點擊地圖新增路線點
- [ ] 確認路線自動繪製
- [ ] 確認統計資訊更新
- [ ] 測試搜尋功能（住宿、加油站等）
- [ ] 測試儲存行程
- [ ] 測試載入行程

### 進階功能測試

- [ ] 測試天氣查詢（需要 OpenWeather API Key）
- [ ] 測試分享功能
- [ ] 測試 PDF 匯出
- [ ] 確認費用估算顯示

### 手機測試

- [ ] 查詢電腦 IP 位址
  ```bash
  # macOS/Linux
  ifconfig | grep "inet "
  
  # Windows
  ipconfig
  ```

- [ ] 在手機瀏覽器訪問 `http://你的電腦IP:5000`
- [ ] 確認手機版面正常顯示
- [ ] 測試觸控操作

---

## 🐛 疑難排解

### 問題 1：地圖無法顯示

**檢查項目**：
- [ ] Google Maps API Key 是否正確
- [ ] 是否已啟用必要的 API
- [ ] 按 F12 查看 Console 錯誤訊息

**解決方法**：
```javascript
// 常見錯誤訊息
RefererNotAllowedMapError -> 檢查 API Key 的應用程式限制
ApiNotActivatedMapError -> 啟用對應的 API
InvalidKeyMapError -> API Key 錯誤
```

### 問題 2：無法啟動伺服器

**檢查項目**：
- [ ] Port 5000 是否被佔用
- [ ] Python 版本是否正確
- [ ] 依賴套件是否安裝完整

**解決方法**：
```bash
# 檢查 port 佔用
lsof -i :5000

# 更換 port（編輯 app.py）
app.run(debug=True, host='0.0.0.0', port=8000)
```

### 問題 3：天氣功能無法使用

**檢查項目**：
- [ ] OpenWeather API Key 是否設定
- [ ] API Key 是否有效
- [ ] 是否超過免費額度

**解決方法**：
```bash
# 檢查 .env 檔案
cat .env | grep OPENWEATHER

# 測試 API Key
curl "https://api.openweathermap.org/data/2.5/weather?q=Taipei&appid=你的API_KEY"
```

### 問題 4：資料庫錯誤

**檢查項目**：
- [ ] trips.db 檔案是否存在
- [ ] 資料庫權限是否正確
- [ ] 資料表是否建立

**解決方法**：
```bash
# 重新初始化資料庫
rm trips.db
python init_db.py
```

---

## ✅ 最終檢查

### 檔案結構檢查

- [ ] `app.py` 存在
- [ ] `config.py` 存在
- [ ] `init_db.py` 存在
- [ ] `requirements.txt` 存在
- [ ] `templates/` 資料夾存在
- [ ] `static/` 資料夾存在
- [ ] `.env` 檔案存在
- [ ] `trips.db` 檔案存在

### 功能檢查

- [ ] ✅ 地圖顯示正常
- [ ] ✅ 路線規劃功能正常
- [ ] ✅ 統計資訊顯示正常
- [ ] ✅ 地點搜尋功能正常
- [ ] ✅ 行程儲存功能正常
- [ ] ✅ 行程載入功能正常
- [ ] ✅ 天氣查詢功能正常（選用）
- [ ] ✅ 分享功能正常
- [ ] ✅ PDF 匯出功能正常
- [ ] ✅ 費用估算顯示正常

### 響應式設計檢查

- [ ] ✅ 桌面版面正常
- [ ] ✅ 平板版面正常
- [ ] ✅ 手機版面正常
- [ ] ✅ 觸控操作正常

---

## 🎉 安裝完成！

如果所有項目都已勾選，恭喜你！安裝已完成。

### 下一步

1. 📖 閱讀 [QUICKSTART.md](QUICKSTART.md) 學習如何使用
2. 🚀 閱讀 [FEATURES.md](FEATURES.md) 了解所有功能
3. 🏍️ 開始規劃你的環島行程！

### 需要幫助？

- 📚 查看 [README.md](README.md)
- 📁 查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- 📝 查看 [SUMMARY.md](SUMMARY.md)

---

## 📊 安裝時間估計

- 安裝依賴套件：2-5 分鐘
- 設定 API Keys：5-10 分鐘
- 初始化資料庫：< 1 分鐘
- 測試功能：5-10 分鐘

**總計：約 15-30 分鐘**

---

## 🔒 安全提醒

- ⚠️ 不要將 `.env` 檔案上傳到 Git
- ⚠️ 不要分享你的 API Keys
- ⚠️ 定期更新依賴套件
- ⚠️ 生產環境請使用強密碼

---

**祝你安裝順利！🎊**
