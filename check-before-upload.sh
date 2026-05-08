#!/bin/bash

# GitHub 上傳前檢查腳本

echo "🔍 GitHub 上傳前安全檢查"
echo "================================"
echo ""

# 檢查是否有敏感檔案
echo "📋 檢查敏感檔案..."
echo ""

SENSITIVE_FILES=(".env" "trips.db" "*.sqlite" "*.db")
FOUND_SENSITIVE=0

for pattern in "${SENSITIVE_FILES[@]}"; do
    if ls $pattern 2>/dev/null | grep -q .; then
        echo "⚠️  發現敏感檔案: $pattern"
        FOUND_SENSITIVE=1
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    echo "✅ 沒有發現敏感檔案在根目錄"
else
    echo ""
    echo "⚠️  請確認這些檔案在 .gitignore 中"
fi

echo ""
echo "================================"
echo ""

# 檢查 .gitignore
echo "📋 檢查 .gitignore..."
echo ""

if [ -f .gitignore ]; then
    echo "✅ .gitignore 存在"
    
    # 檢查必要的項目
    REQUIRED_IGNORES=(".env" "*.db" "__pycache__" "venv")
    
    for item in "${REQUIRED_IGNORES[@]}"; do
        if grep -q "$item" .gitignore; then
            echo "✅ .gitignore 包含: $item"
        else
            echo "❌ .gitignore 缺少: $item"
        fi
    done
else
    echo "❌ .gitignore 不存在！"
fi

echo ""
echo "================================"
echo ""

# 檢查 .env.example
echo "📋 檢查 .env.example..."
echo ""

if [ -f .env.example ]; then
    echo "✅ .env.example 存在"
    
    # 檢查是否包含實際的 API Keys
    if grep -q "AIza" .env.example || grep -q "sk-" .env.example; then
        echo "⚠️  .env.example 可能包含實際的 API Keys！"
    else
        echo "✅ .env.example 看起來安全"
    fi
else
    echo "⚠️  .env.example 不存在"
fi

echo ""
echo "================================"
echo ""

# 檢查程式碼中的 API Keys
echo "📋 檢查程式碼中的 API Keys..."
echo ""

if grep -r "AIza" --include="*.py" --include="*.js" --exclude-dir=venv --exclude-dir=circle-tw . 2>/dev/null; then
    echo "❌ 發現可能的 Google API Key 在程式碼中！"
else
    echo "✅ 沒有發現 API Keys 在程式碼中"
fi

echo ""
echo "================================"
echo ""

# 檢查必要檔案
echo "📋 檢查必要檔案..."
echo ""

REQUIRED_FILES=("README.md" "requirements.txt" "app.py" "LICENSE")

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

echo ""
echo "================================"
echo ""

# 總結
echo "📊 檢查總結"
echo ""
echo "請確認以下事項："
echo "1. ✅ .env 檔案不會被上傳"
echo "2. ✅ trips.db 不會被上傳"
echo "3. ✅ 沒有 API Keys 在程式碼中"
echo "4. ✅ README.md 已完成"
echo "5. ✅ LICENSE 已添加"
echo ""
echo "如果以上都確認無誤，可以執行："
echo ""
echo "  git init"
echo "  git add ."
echo "  git commit -m 'Initial commit: 機車環島行程規劃網站'"
echo "  git remote add origin <你的 GitHub Repository URL>"
echo "  git push -u origin main"
echo ""
