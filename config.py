import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask 設定
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Google Maps API Key
    # 請到 https://console.cloud.google.com/ 取得 API Key
    # 需要啟用: Maps JavaScript API, Places API, Directions API
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY') or 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
    
    # OpenWeatherMap API Key (天氣預報)
    # 請到 https://openweathermap.org/api 註冊免費帳號取得 API Key
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY') or ''
    
    # 資料庫設定
    DATABASE = 'trips.db'
    
    # 預設騎行設定
    DEFAULT_DAILY_DISTANCE = 200  # 公里
    MAX_DAILY_DISTANCE = 400  # 公里
    AVERAGE_SPEED = 50  # 公里/小時
    
    # 油耗設定
    FUEL_CONSUMPTION = 25  # 公里/公升
    FUEL_PRICE = 30  # 新台幣/公升
    
    # 其他費用估算
    DAILY_ACCOMMODATION = 1000  # 每日住宿費用（新台幣）
    DAILY_MEAL = 500  # 每日餐費（新台幣）
