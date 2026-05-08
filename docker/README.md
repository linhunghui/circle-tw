# 🐳 Docker 部署指南

使用 Docker Compose 快速部署機車環島行程規劃網站。

---

## 📋 前置需求

### 必須安裝：
- [Docker](https://docs.docker.com/get-docker/) (版本 20.10 或更高)
- [Docker Compose](https://docs.docker.com/compose/install/) (版本 2.0 或更高)

### 檢查安裝：
```bash
docker --version
docker-compose --version
```

---

## 🚀 快速開始

### 步驟 1：準備環境變數

複製環境變數範例檔案：
```bash
cd docker
cp .env.example .env
```

編輯 `.env` 檔案，填入你的 API Keys：
```bash
nano .env
# 或使用其他編輯器
```

**必填項目**：
- `SECRET_KEY`：應用程式密鑰（建議使用隨機字串）
- `GOOGLE_MAPS_API_KEY`：Google Maps API Key

**選填項目**：
- `OPENWEATHER_API_KEY`：OpenWeather API Key（用於天氣預報）

### 步驟 2：啟動服務

在 `docker` 資料夾中執行：
```bash
docker-compose up -d
```

**說明**：
- `-d`：背景執行（detached mode）
- 首次執行會自動建立 Docker 映像（需要幾分鐘）

### 步驟 3：訪問網站

開啟瀏覽器，訪問：
```
http://localhost:8000
```

---

## 📦 Docker Compose 指令

### 啟動服務
```bash
# 前景執行（可以看到 log）
docker-compose up

# 背景執行
docker-compose up -d

# 重新建立並啟動
docker-compose up -d --build
```

### 停止服務
```bash
# 停止服務（保留容器）
docker-compose stop

# 停止並移除容器
docker-compose down

# 停止並移除容器、映像、volumes
docker-compose down -v --rmi all
```

### 查看狀態
```bash
# 查看運行中的容器
docker-compose ps

# 查看 logs
docker-compose logs

# 即時查看 logs
docker-compose logs -f

# 查看特定服務的 logs
docker-compose logs circle-tw
```

### 重新啟動
```bash
# 重新啟動所有服務
docker-compose restart

# 重新啟動特定服務
docker-compose restart circle-tw
```

### 進入容器
```bash
# 進入容器的 shell
docker-compose exec circle-tw /bin/bash

# 執行指令
docker-compose exec circle-tw python init_db.py
```

---

## 🗂️ 檔案結構

```
docker/
├── Dockerfile              # Docker 映像定義
├── docker-compose.yml      # Docker Compose 設定
├── .env.example            # 環境變數範例
├── .env                    # 環境變數（需自行建立）
├── .dockerignore           # Docker 忽略檔案
└── README.md               # 本檔案

父目錄/
├── app.py                  # Flask 應用程式
├── config.py               # 設定檔
├── init_db.py              # 資料庫初始化
├── requirements.txt        # Python 依賴
├── templates/              # HTML 模板
├── static/                 # 靜態檔案
└── .env                    # 環境變數（主要）
```

---

## 🔧 設定說明

### docker-compose.yml

```yaml
services:
  circle-tw:
    build:
      context: ..              # 建立上下文（父目錄）
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"            # 端口映射
    volumes:
      - trip-data:/app/data    # 資料持久化
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
    restart: unless-stopped    # 自動重啟
```

### Dockerfile

```dockerfile
FROM python:3.9-slim         # 基礎映像
WORKDIR /app                 # 工作目錄
COPY requirements.txt .      # 複製依賴清單
RUN pip install -r requirements.txt
COPY . .                     # 複製應用程式
EXPOSE 8000                  # 暴露端口
CMD ["python", "app.py"]     # 啟動指令
```

---

## 💾 資料持久化

### Volume 說明

資料庫檔案儲存在 Docker Volume 中，即使容器被刪除，資料也不會遺失。

```yaml
volumes:
  trip-data:
    driver: local
```

### 備份資料

```bash
# 備份 volume
docker run --rm -v circle-tw_trip-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/trip-data-backup.tar.gz -C /data .

# 還原 volume
docker run --rm -v circle-tw_trip-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/trip-data-backup.tar.gz -C /data
```

### 查看 Volume

```bash
# 列出所有 volumes
docker volume ls

# 查看 volume 詳細資訊
docker volume inspect circle-tw_trip-data

# 刪除 volume（會刪除所有資料！）
docker volume rm circle-tw_trip-data
```

---

## 🔒 安全性建議

### 1. 更改 SECRET_KEY
```bash
# 生成隨機密鑰
python -c "import secrets; print(secrets.token_hex(32))"
```

將生成的密鑰填入 `.env` 檔案。

### 2. 保護 .env 檔案
```bash
# 設定檔案權限（僅擁有者可讀寫）
chmod 600 .env
```

### 3. 不要提交 .env 到 Git
確保 `.gitignore` 包含：
```
.env
docker/.env
```

### 4. 使用 HTTPS
在生產環境中，建議使用 Nginx 或 Traefik 作為反向代理，並啟用 HTTPS。

---

## 🌐 生產環境部署

### 使用 Nginx 反向代理

建立 `docker-compose.prod.yml`：
```yaml
version: '3.8'

services:
  circle-tw:
    # ... (同 docker-compose.yml)
    expose:
      - "8000"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - circle-tw
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
```

啟動：
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🐛 故障排除

### 問題 1：容器無法啟動

**檢查 logs**：
```bash
docker-compose logs circle-tw
```

**常見原因**：
- 端口 8000 已被佔用
- 環境變數未設定
- 映像建立失敗

**解決方法**：
```bash
# 更改端口（編輯 docker-compose.yml）
ports:
  - "8080:8000"  # 改用 8080

# 重新建立映像
docker-compose build --no-cache
docker-compose up -d
```

### 問題 2：無法訪問網站

**檢查容器狀態**：
```bash
docker-compose ps
```

**檢查端口**：
```bash
# macOS/Linux
lsof -i :8000

# 或使用 netstat
netstat -an | grep 8000
```

**檢查防火牆**：
```bash
# 確保端口 8000 開放
sudo ufw allow 8000
```

### 問題 3：資料遺失

**檢查 volume**：
```bash
docker volume ls | grep trip-data
```

**掛載本地目錄**（不建議）：
```yaml
volumes:
  - ./data:/app/data  # 使用本地目錄
```

### 問題 4：映像太大

**查看映像大小**：
```bash
docker images | grep circle-tw
```

**優化建議**：
- 使用 `python:3.9-slim` 而非 `python:3.9`
- 使用 multi-stage build
- 清理不必要的檔案

---

## 📊 監控與日誌

### 查看資源使用

```bash
# 查看容器資源使用
docker stats circle-tw-app

# 查看詳細資訊
docker inspect circle-tw-app
```

### 日誌管理

```bash
# 查看最近 100 行 logs
docker-compose logs --tail=100 circle-tw

# 查看特定時間的 logs
docker-compose logs --since 2024-01-01T00:00:00

# 儲存 logs 到檔案
docker-compose logs > logs.txt
```

### 健康檢查

Docker Compose 已設定健康檢查：
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

查看健康狀態：
```bash
docker inspect --format='{{.State.Health.Status}}' circle-tw-app
```

---

## 🔄 更新應用程式

### 步驟 1：停止服務
```bash
docker-compose down
```

### 步驟 2：更新程式碼
```bash
cd ..
git pull  # 或手動更新檔案
```

### 步驟 3：重新建立映像
```bash
cd docker
docker-compose build --no-cache
```

### 步驟 4：啟動服務
```bash
docker-compose up -d
```

### 快速更新（不重建映像）
```bash
docker-compose restart
```

---

## 🧪 開發環境

### 使用 volume 掛載（即時更新）

建立 `docker-compose.dev.yml`：
```yaml
version: '3.8'

services:
  circle-tw:
    extends:
      file: docker-compose.yml
      service: circle-tw
    volumes:
      - ../app.py:/app/app.py
      - ../templates:/app/templates
      - ../static:/app/static
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
```

啟動開發環境：
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## 📚 相關資源

### Docker 官方文件
- [Docker 文件](https://docs.docker.com/)
- [Docker Compose 文件](https://docs.docker.com/compose/)
- [Dockerfile 最佳實踐](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### 專案文件
- [README.md](../README.md) - 專案說明
- [QUICKSTART.md](../QUICKSTART.md) - 快速開始
- [FEATURES.md](../FEATURES.md) - 功能說明

---

## ❓ 常見問題

### Q1: 為什麼要使用 Docker？
**A**: 
- ✅ 環境一致性（開發、測試、生產環境相同）
- ✅ 快速部署（一鍵啟動）
- ✅ 易於管理（容器化管理）
- ✅ 資源隔離（不影響主機系統）

### Q2: Docker 和直接安裝有什麼差別？
**A**:
- **Docker**：容器化，環境隔離，易於部署
- **直接安裝**：需要手動安裝依賴，可能有環境衝突

### Q3: 如何更改端口？
**A**: 編輯 `docker-compose.yml`：
```yaml
ports:
  - "8080:8000"  # 主機端口:容器端口
```

### Q4: 資料會遺失嗎？
**A**: 不會。資料儲存在 Docker Volume 中，即使容器被刪除也不會遺失。

### Q5: 如何備份資料？
**A**: 參考「資料持久化」章節的備份指令。

---

## 🎯 總結

### 優點
- ✅ 一鍵部署
- ✅ 環境隔離
- ✅ 資料持久化
- ✅ 易於管理
- ✅ 可擴展性

### 適用場景
- 🏠 個人使用
- 👥 團隊開發
- 🌐 生產部署
- 🧪 測試環境

### 下一步
1. 設定環境變數
2. 啟動服務
3. 訪問網站
4. 開始規劃你的環島行程！

**祝你使用愉快！🏍️💨**
