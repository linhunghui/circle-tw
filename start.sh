#!/bin/bash

echo "🏍️  機車環島行程規劃網站"
echo "=========================="
echo ""

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 找不到 Python3，請先安裝 Python"
    exit 1
fi

echo "✅ Python 已安裝"

# 檢查依賴套件
if ! python3 -c "import flask" &> /dev/null; then
    echo "📦 安裝依賴套件..."
    pip3 install -r requirements.txt
fi

echo "✅ 依賴套件已安裝"

# 檢查資料庫
if [ ! -f "trips.db" ]; then
    echo "🗄️  初始化資料庫..."
    python3 init_db.py
fi

echo "✅ 資料庫已就緒"

# 檢查 .env 檔案
if [ ! -f ".env" ]; then
    echo "⚠️  警告：找不到 .env 檔案"
    echo "請複製 .env.example 並設定你的 API Keys"
    exit 1
fi

echo "✅ 環境變數已設定"
echo ""
echo "🚀 啟動伺服器..."
echo "📱 請開啟瀏覽器訪問："
echo "   http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止伺服器"
echo ""

python3 app.py
