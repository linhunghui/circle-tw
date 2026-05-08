# 使用 Python 3.9 作為基礎映像
FROM python:3.9-slim

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 複製 requirements.txt
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式檔案
COPY app.py .
COPY config.py .
COPY init_db.py .
COPY templates/ templates/
COPY static/ static/

# 建立資料庫目錄
RUN mkdir -p /app/data

# 初始化資料庫
RUN python init_db.py

# 暴露端口
EXPOSE 8000

# 設定環境變數
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# 啟動應用程式
CMD ["python", "app.py"]
