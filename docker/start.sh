#!/bin/bash

# 機車環島行程規劃網站 - Docker 快速啟動腳本

set -e

echo "🏍️  機車環島行程規劃網站 - Docker 部署"
echo "=========================================="
echo ""

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ 錯誤：未安裝 Docker"
    echo "請先安裝 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 錯誤：未安裝 Docker Compose"
    echo "請先安裝 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 已安裝"
echo "✅ Docker Compose 已安裝"
echo ""

# 檢查 .env 檔案
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 檔案"
    echo "正在從 .env.example 建立 .env..."
    cp .env.example .env
    echo "✅ .env 檔案已建立"
    echo ""
    echo "⚠️  請編輯 .env 檔案，填入你的 API Keys："
    echo "   - SECRET_KEY"
    echo "   - GOOGLE_MAPS_API_KEY"
    echo "   - OPENWEATHER_API_KEY (選填)"
    echo ""
    read -p "按 Enter 繼續編輯 .env 檔案..."
    ${EDITOR:-nano} .env
    echo ""
fi

# 檢查 GOOGLE_MAPS_API_KEY 是否設定
source .env
if [ -z "$GOOGLE_MAPS_API_KEY" ] || [ "$GOOGLE_MAPS_API_KEY" = "your_google_maps_api_key_here" ]; then
    echo "❌ 錯誤：GOOGLE_MAPS_API_KEY 未設定"
    echo "請編輯 .env 檔案，填入你的 Google Maps API Key"
    exit 1
fi

echo "✅ 環境變數已設定"
echo ""

# 詢問是否重新建立映像
read -p "是否重新建立 Docker 映像？(y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 正在建立 Docker 映像..."
    docker-compose build --no-cache
    echo "✅ Docker 映像建立完成"
    echo ""
fi

# 啟動服務
echo "🚀 正在啟動服務..."
docker-compose up -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 5

# 檢查服務狀態
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ 服務啟動成功！"
    echo ""
    echo "=========================================="
    echo "🌐 網站地址: http://localhost:8000"
    echo "=========================================="
    echo ""
    echo "📝 常用指令："
    echo "   查看 logs:     docker-compose logs -f"
    echo "   停止服務:      docker-compose stop"
    echo "   重新啟動:      docker-compose restart"
    echo "   完全移除:      docker-compose down"
    echo ""
    echo "📚 詳細說明請參考: README.md"
    echo ""
else
    echo ""
    echo "❌ 服務啟動失敗"
    echo "請查看 logs: docker-compose logs"
    exit 1
fi
