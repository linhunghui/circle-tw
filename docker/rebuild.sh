#!/bin/bash

set -e  # 遇到錯誤立即停止

echo "🔄 Docker 映像重建腳本"
echo "===================="
echo ""

# 檢查是否在 docker 目錄
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 錯誤：請在 docker 目錄中執行此腳本"
    exit 1
fi

# 停止容器
echo "⏹️  停止容器..."
docker-compose down
echo "✅ 容器已停止"
echo ""

# 重新建立映像
echo "🔨 重新建立映像（不使用快取）..."
docker-compose build --no-cache
echo "✅ 映像建立完成"
echo ""

# 啟動容器
echo "🚀 啟動容器..."
docker-compose up -d
echo "✅ 容器已啟動"
echo ""

# 等待容器啟動
echo "⏳ 等待容器啟動..."
sleep 3

# 顯示狀態
echo "📊 容器狀態："
docker-compose ps
echo ""

# 顯示最近的 logs
echo "📝 最近的 logs："
docker-compose logs --tail=20
echo ""

# 完成
echo "✅ 重建完成！"
echo ""
echo "🌐 訪問網站: http://localhost:8000"
echo "📊 查看 logs: docker-compose logs -f"
echo "⏹️  停止容器: docker-compose down"
