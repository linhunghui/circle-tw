# 🚀 上傳到 GitHub 指南

## 快速步驟

### 1️⃣ 執行安全檢查

```bash
./check-before-upload.sh
```

確認沒有敏感資料會被上傳。

---

### 2️⃣ 初始化 Git

```bash
git init
```

---

### 3️⃣ 添加檔案

```bash
git add .
```

---

### 4️⃣ 檢查狀態

```bash
git status
```

**確認以下檔案不在列表中**：
- ❌ `.env`
- ❌ `trips.db`
- ❌ `__pycache__/`
- ❌ `venv/`
- ❌ `circle-tw/`

---

### 5️⃣ 提交

```bash
git commit -m "Initial commit: 機車環島行程規劃網站

✨ 功能：
- 路線規劃（支援白牌機車）
- 天氣預報
- 住宿/加油站搜尋
- 每日行程規劃
- PDF 匯出
- Docker 部署支援"
```

---

### 6️⃣ 建立 GitHub Repository

1. 前往 https://github.com/new
2. 填寫資訊：
   - **Repository name**: `motorcycle-trip-planner` (或其他名稱)
   - **Description**: `🏍️ 台灣機車環島行程規劃網站`
   - **Public** 或 **Private**
   - **不要**勾選 "Initialize this repository with a README"
3. 點擊 **Create repository**

---

### 7️⃣ 連結遠端 Repository

```bash
git remote add origin https://github.com/你的使用者名稱/repository名稱.git
```

---

### 8️⃣ 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

---

## ✅ 完成！

你的專案已經上傳到 GitHub！

### 接下來可以做：

1. **設定 Repository**
   - 添加 Topics: `taiwan`, `motorcycle`, `trip-planner`, `flask`
   - 添加 Description
   - 設定 About

2. **添加 README 徽章**
   ```markdown
   ![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
   ![Flask](https://img.shields.io/badge/flask-2.3+-green.svg)
   ![License](https://img.shields.io/badge/license-MIT-blue.svg)
   ```

3. **分享你的專案**
   - Twitter
   - Facebook
   - PTT
   - Dcard

---

## 🔒 安全提醒

### 如果不小心上傳了敏感資料：

#### 1. 立即刪除檔案
```bash
git rm --cached .env
git commit -m "Remove sensitive file"
git push
```

#### 2. 更改 API Keys
- 立即到 Google Cloud Console 刪除舊的 API Key
- 建立新的 API Key
- 更新本地的 `.env` 檔案

#### 3. 清除 Git 歷史（如果需要）
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

---

## 📚 相關文件

- [GITHUB_CHECKLIST.md](GITHUB_CHECKLIST.md) - 完整檢查清單
- [README.md](README.md) - 專案說明
- [LICENSE](LICENSE) - 授權條款

---

## ❓ 常見問題

### Q: 如何更新 Repository？

```bash
git add .
git commit -m "更新說明"
git push
```

### Q: 如何建立新分支？

```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

### Q: 如何回復到之前的版本？

```bash
git log  # 查看歷史
git checkout <commit-hash>
```

---

**祝你上傳順利！** 🎉
