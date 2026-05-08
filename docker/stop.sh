#!/bin/bash

# 機車環島行程規劃網站 - Docker 停止腳本

set -e

echo "🛑 停止機車環島行程規劃網站"
echo "=========================================="
echo ""

# 詢問停止方式
echo "請選擇停止方式："
echo "1) 停止服務（保留容器和資料）"
echo "2) 停止並移除容器（保留資料）"
echo "3) 完全移除（包含資料，無法復原！）"
echo ""
read -p "請選擇 (1-3): " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo "🛑 正在停止服務..."
        docker-compose stop
        echo "✅ 服務已停止"
        echo "💡 使用 'docker-compose start' 可以重新啟動"
        ;;
    2)
        echo "🛑 正在停止並移除容器..."
        docker-compose down
        echo "✅ 容器已移除"
        echo "💡 資料已保留在 Docker Volume 中"
        echo "💡 使用 'docker-compose up -d' 可以重新啟動"
        ;;
    3)
        echo "⚠️  警告：這將刪除所有資料，包括已儲存的行程！"
        read -p "確定要繼續嗎？(yes/no) " -r
        echo ""
        if [ "$REPLY" = "yes" ]; then
            echo "🗑️  正在完全移除..."
            docker-compose down -v --rmi all
            echo "✅ 已完全移除（容器、映像、資料）"
        else
            echo "❌ 已取消"
        fi
        ;;
    *)
        echo "❌ 無效的選擇"
        exit 1
        ;;
esac

echo ""
