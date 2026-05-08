# 🚀 Docker 快速開始

只需 3 步驟，立即啟動機車環島行程規劃網站！

**最新版本**: v2.5.0 - 新增可編輯行程天數功能 ✨

---

## 📋 前置需求

- ✅ 已安裝 [Docker](https://docs.docker.com/get-docker/)
- ✅ 已安裝 [Docker Compose](https://docs.docker.com/compose/install/)
- ✅ 有 Google Maps API Key

---

## 🎯 3 步驟啟動

### 步驟 1：設定環境變數

```bash
cd docker
cp .env.example .env
nano .env  # 或使用其他編輯器
```

填入你的 API Keys：
```env
SECRET_KEY=your-secret-key-here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here  # 選填
```

### 步驟 2：啟動服務

**方法 1：使用腳本（推薦）**
```bash
./start.sh
```

**方法 2：手動啟動**
```bash
docker-compose up -d
```

### 步驟 3：訪問網站

開啟瀏覽器：
```
http://localhost:8000
```

---

## 🛑 停止服務

**方法 1：使用腳本**
```bash
./stop.sh
```

**方法 2：手動停止**
```bash
# 停止服務
docker-compose stop

# 停止並移除容器
docker-compose down
```

---

## 📊 查看狀態

```bash
# 查看運行狀態
docker-compose ps

# 查看 logs
docker-compose logs -f
```

---

## 🔄 更新應用程式

```bash
# 停止服務
docker-compose down

# 更新程式碼（如果使用 git）
cd ..
git pull
cd docker

# 重新建立並啟動
docker-compose up -d --build
```

---

## ❓ 常見問題

### Q: 端口 8000 已被佔用？
**A**: 編輯 `docker-compose.yml`，更改端口：
```yaml
ports:
  - "8080:8000"  # 改用 8080
```

### Q: 無法訪問網站？
**A**: 檢查容器狀態和 logs：
```bash
docker-compose ps
docker-compose logs
```

### Q: 如何備份資料？
**A**: 
```bash
docker run --rm -v circle-tw_trip-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .
```

---

## 📚 詳細文件

需要更多資訊？請參考：
- [README.md](README.md) - 完整部署指南
- [../README.md](../README.md) - 專案說明
- [../FEATURES.md](../FEATURES.md) - 功能說明

---

## 🎉 完成！

現在你可以開始規劃你的環島行程了！🏍️💨
