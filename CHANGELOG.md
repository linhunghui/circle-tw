# 更新日誌 (Changelog)

所有重要的專案變更都會記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [2.5.0] - 2026-05-08

### 新增
- ✨ **可編輯行程天數功能**
  - 使用者可自訂行程天數（1-30天）
  - 智慧對話框顯示總距離、系統建議、建議範圍
  - 根據輸入天數給予適當建議（太少/太多/適中）
  - 使用者自訂的天數不會被路線更新覆蓋
  - 天數變更後自動重新計算費用
  - 規劃每日行程時使用自訂天數

### 改進
- 🎨 優化天數顯示介面
- 📊 改善每日行程規劃對話框，顯示天數來源（自訂 vs 系統建議）

### 技術變更
- 新增 `editDays()` 函數
- 修改 `calculateRoute()` 函數以保留使用者自訂天數
- 修改 `updateStats()` 函數以控制編輯按鈕顯示
- 修改 `showDailyPlanModal()` 函數以使用自訂天數
- 新增資料屬性 `data-user-edited` 和 `data-auto-calculated`

## [2.4.0] - 2026-05-07

### 新增
- 🗑️ **刪除行程功能**
  - 在載入行程列表中新增刪除按鈕
  - 刪除前顯示確認對話框
  - 刪除後自動重新整理行程列表

### 改進
- 🎨 優化行程列表介面

## [2.3.1] - 2026-05-06

### 修復
- 🐛 修復清除路線點後地圖上標記仍然存在的問題
- 🐛 修復搜尋結果標記未被清除的問題

## [2.3.0] - 2026-05-05

### 新增
- 🏍️ **白牌機車路線規劃**
  - 白牌機車自動避開國道、快速道路
  - 紅黃牌機車可使用國道
  - 新增交通工具選項：白牌機車、紅黃牌機車
- 📊 **每日行程距離計算**
  - 顯示每天騎行公里數
  - 顯示每天騎行時間
  - 顯示總計與平均統計

### 改進
- 🗺️ 優化路線計算邏輯
- 🎨 改善每日行程顯示介面

### 修復
- 🐛 修復附近搜尋報錯問題
- 🐛 修復天氣顯示地點名稱錯誤

## [2.2.0] - 2026-05-04

### 新增
- 🔍 **地點搜尋功能**
  - Google Places 自動完成
  - 搜尋結果顯示藍色標記
  - 確認對話框後才加入路線
  - 限制搜尋範圍為台灣
  - 支援 Enter 快速搜尋

### 改進
- 🗺️ 優化路線規劃 UX
- 🎨 改善搜尋介面

### 修復
- 🐛 修復機車路線規劃問題（新增 avoidHighways）
- 🐛 修復騎行時間計算（使用 Google API 實際時間）
- 🐛 修復附近搜尋 UX 問題

## [2.1.0] - 2026-05-03

### 新增
- ☁️ **天氣預報整合**
  - OpenWeatherMap API 整合
  - 顯示未來 24 小時天氣
  - 路線點天氣查詢
- 🔗 **行程分享功能**
  - 產生唯一分享連結
  - 分享頁面顯示完整行程
- 📄 **PDF 匯出功能**
  - 使用 ReportLab 產生 PDF
  - 包含 QR Code 分享連結
- 💰 **油耗與費用估算**
  - 自動計算油耗費用
  - 估算住宿與餐費
  - 顯示總費用

### 改進
- 📊 新增統計資訊面板
- 🎨 優化使用者介面

## [2.0.0] - 2026-05-02

### 新增
- 🗺️ **Google Maps 整合**
  - 視覺化路線規劃
  - 點擊地圖新增路線點
  - 自動計算路線
- 🏍️ **交通工具選擇**
  - 支援汽車、機車、自行車、步行
- 🔍 **附近搜尋功能**
  - 搜尋住宿、加油站、餐廳、景點
- 💾 **行程儲存與載入**
  - SQLite 資料庫儲存
  - 行程列表管理
- 📱 **響應式設計**
  - 支援桌面與手機瀏覽

### 技術架構
- Python Flask 後端
- SQLite 資料庫
- Google Maps JavaScript API
- 響應式 CSS

## [1.0.0] - 2026-05-01

### 新增
- 🎉 初始版本發布
- 基本路線規劃功能
- 距離計算
- 簡單的使用者介面

---

## 版本號說明

- **主版本號 (Major)**: 重大功能變更或不相容的 API 變更
- **次版本號 (Minor)**: 新增功能，向後相容
- **修訂號 (Patch)**: 錯誤修復，向後相容

## 連結

- [2.5.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.5.0
- [2.4.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.4.0
- [2.3.1]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.3.1
- [2.3.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.3.0
- [2.2.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.2.0
- [2.1.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.1.0
- [2.0.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v2.0.0
- [1.0.0]: https://github.com/yourusername/motorcycle-trip-planner/releases/tag/v1.0.0
