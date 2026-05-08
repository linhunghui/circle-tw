# 🐳 Docker 部署完成

## 更新日期：2026-05-07

---

## 🎉 新增內容

已為專案添加完整的 Docker 部署方案，讓使用者可以輕鬆使用 Docker 部署應用程式。

---

## 📁 新增檔案

### docker/ 資料夾結構

```
docker/
├── Dockerfile              # Docker 映像定義
├── docker-compose.yml      # Docker Compose 設定
├── .env.example            # 環境變數範例
├── .dockerignore           # Docker 忽略檔案
├── README.md               # 完整部署指南
├── QUICKSTART.md           # 快速開始指南
├── start.sh                # 啟動腳本
└── stop.sh                 # 停止腳本
```

---

## ✨ 功能特色

### 1. **一鍵部署**
```bash
cd docker
./start.sh
```

### 2. **資料持久化**
- 使用 Docker Volume 儲存資料
- 容器刪除後資料不會遺失
- 支援備份和還原

### 3. **環境隔離**
- 不影響主機系統
- 依賴完全隔離
- 環境一致性

### 4. **易於管理**
- 簡單的啟動/停止指令
- 自動重啟機制
- 健康檢查

### 5. **完整文件**
- 詳細的部署指南
- 快速開始教學
- 故障排除說明

---

## 🚀 快速開始

### 最簡單的方式

```bash
# 1. 進入 docker 資料夾
cd docker

# 2. 複製環境變數範例
cp .env.example .env

# 3. 編輯 .env，填入 API Keys
nano .env

# 4. 執行啟動腳本
./start.sh

# 5. 訪問網站
# http://localhost:8000
```

### 手動方式

```bash
# 1. 進入 docker 資料夾
cd docker

# 2. 設定環境變數
cp .env.example .env
nano .env

# 3. 啟動服務
docker-compose up -d

# 4. 查看狀態
docker-compose ps

# 5. 查看 logs
docker-compose logs -f
```

---

## 📋 環境變數

### 必填項目

```env
# 應用程式密鑰
SECRET_KEY=your-secret-key-here

# Google Maps API Key（必填）
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 選填項目

```env
# OpenWeather API Key（用於天氣預報）
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

---

## 🔧 Docker Compose 設定

### 服務配置

```yaml
services:
  circle-tw:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: circle-tw-app
    ports:
      - "8000:8000"
    volumes:
      - trip-data:/app/data
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Volume 配置

```yaml
volumes:
  trip-data:
    driver: local
```

---

## 📦 Dockerfile 說明

### 基礎映像

```dockerfile
FROM python:3.9-slim
```

使用輕量級的 Python 3.9 映像。

### 工作流程

```dockerfile
# 1. 設定工作目錄
WORKDIR /app

# 2. 安裝系統依賴
RUN apt-get update && apt-get install -y gcc

# 3. 安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. 複製應用程式
COPY app.py config.py init_db.py ./
COPY templates/ templates/
COPY static/ static/

# 5. 初始化資料庫
RUN python init_db.py

# 6. 暴露端口
EXPOSE 8000

# 7. 啟動應用程式
CMD ["python", "app.py"]
```

---

## 🛠️ 常用指令

### 啟動服務

```bash
# 前景執行（可看到 log）
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

# 完全移除（包含資料）
docker-compose down -v --rmi all
```

### 查看狀態

```bash
# 查看容器狀態
docker-compose ps

# 查看 logs
docker-compose logs

# 即時查看 logs
docker-compose logs -f

# 查看資源使用
docker stats circle-tw-app
```

### 進入容器

```bash
# 進入容器 shell
docker-compose exec circle-tw /bin/bash

# 執行指令
docker-compose exec circle-tw python init_db.py
```

---

## 💾 資料管理

### 備份資料

```bash
# 備份 volume
docker run --rm \
  -v circle-tw_trip-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/trip-data-backup.tar.gz -C /data .
```

### 還原資料

```bash
# 還原 volume
docker run --rm \
  -v circle-tw_trip-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/trip-data-backup.tar.gz -C /data
```

### 查看 Volume

```bash
# 列出 volumes
docker volume ls

# 查看詳細資訊
docker volume inspect circle-tw_trip-data

# 刪除 volume（會刪除資料！）
docker volume rm circle-tw_trip-data
```

---

## 🔒 安全性

### 1. 更改 SECRET_KEY

```bash
# 生成隨機密鑰
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. 保護 .env 檔案

```bash
# 設定檔案權限
chmod 600 docker/.env
```

### 3. 不要提交敏感資料

`.gitignore` 已設定：
```
.env
docker/.env
```

---

## 🌐 生產環境

### 使用 Nginx 反向代理

建議在生產環境中使用 Nginx 作為反向代理：

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - circle-tw
```

### 啟用 HTTPS

使用 Let's Encrypt 取得免費 SSL 憑證：

```bash
# 使用 Certbot
certbot certonly --standalone -d yourdomain.com
```

---

## 🐛 故障排除

### 問題 1：端口被佔用

**錯誤訊息**：
```
Error: bind: address already in use
```

**解決方法**：
```yaml
# 編輯 docker-compose.yml
ports:
  - "8080:8000"  # 改用其他端口
```

### 問題 2：容器無法啟動

**檢查方法**：
```bash
# 查看 logs
docker-compose logs circle-tw

# 查看容器狀態
docker-compose ps
```

### 問題 3：無法訪問網站

**檢查清單**：
- ✅ 容器是否運行：`docker-compose ps`
- ✅ 端口是否開放：`netstat -an | grep 8000`
- ✅ 防火牆設定
- ✅ 環境變數是否正確

---

## 📊 監控

### 健康檢查

```bash
# 查看健康狀態
docker inspect --format='{{.State.Health.Status}}' circle-tw-app
```

### 資源監控

```bash
# 查看資源使用
docker stats circle-tw-app

# 查看詳細資訊
docker inspect circle-tw-app
```

---

## 🔄 更新流程

### 步驟 1：停止服務
```bash
docker-compose down
```

### 步驟 2：更新程式碼
```bash
cd ..
git pull
cd docker
```

### 步驟 3：重新建立
```bash
docker-compose build --no-cache
```

### 步驟 4：啟動服務
```bash
docker-compose up -d
```

---

## 📚 文件索引

### Docker 相關
- [docker/README.md](docker/README.md) - 完整部署指南
- [docker/QUICKSTART.md](docker/QUICKSTART.md) - 快速開始
- [docker/Dockerfile](docker/Dockerfile) - Docker 映像定義
- [docker/docker-compose.yml](docker/docker-compose.yml) - Compose 設定

### 專案文件
- [README.md](README.md) - 專案說明
- [FEATURES.md](FEATURES.md) - 功能說明
- [QUICKSTART.md](QUICKSTART.md) - 快速開始

---

## 🎯 使用情境

### 情境 1：個人使用
```bash
# 在個人電腦上快速部署
cd docker
./start.sh
```

### 情境 2：團隊開發
```bash
# 統一開發環境
git clone <repository>
cd circle-tw/docker
cp .env.example .env
# 編輯 .env
docker-compose up -d
```

### 情境 3：生產部署
```bash
# 在伺服器上部署
cd /opt/circle-tw/docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## ✅ 優點

### 對使用者
- 🚀 一鍵部署
- 🔒 環境隔離
- 💾 資料持久化
- 🔄 易於更新

### 對開發者
- 🧪 統一環境
- 🐛 易於除錯
- 📦 易於分發
- 🔧 易於維護

---

## 📈 效能

### 資源需求

- **CPU**：1 核心（建議 2 核心）
- **記憶體**：512 MB（建議 1 GB）
- **硬碟**：500 MB（映像 + 資料）

### 啟動時間

- **首次建立**：2-5 分鐘（下載映像 + 建立）
- **後續啟動**：5-10 秒

---

## 🎓 學習資源

### Docker 官方
- [Docker 文件](https://docs.docker.com/)
- [Docker Compose 文件](https://docs.docker.com/compose/)
- [Dockerfile 最佳實踐](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### 教學資源
- [Docker 入門教學](https://docs.docker.com/get-started/)
- [Docker Compose 教學](https://docs.docker.com/compose/gettingstarted/)

---

## 🎉 總結

### 完成項目
- ✅ Dockerfile
- ✅ docker-compose.yml
- ✅ 環境變數範例
- ✅ 啟動/停止腳本
- ✅ 完整文件
- ✅ 快速開始指南

### 使用者受益
- 🚀 快速部署
- 🔒 安全隔離
- 💾 資料保護
- 📚 完整文件

**Docker 部署方案已完成！現在可以輕鬆使用 Docker 部署應用程式了！** 🐳🎉
