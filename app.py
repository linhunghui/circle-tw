from flask import Flask, render_template, request, jsonify, send_file, url_for
from flask_cors import CORS
import sqlite3
import json
import requests
import secrets
from datetime import datetime, timedelta
from config import Config
from io import BytesIO
import qrcode

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

def get_db():
    """取得資料庫連線"""
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """首頁"""
    return render_template('index.html', 
                         google_maps_api_key=app.config['GOOGLE_MAPS_API_KEY'])

@app.route('/test')
def test():
    """API 測試頁面"""
    return render_template('test.html', 
                         google_maps_api_key=app.config['GOOGLE_MAPS_API_KEY'])

@app.route('/simple')
def simple():
    """簡單測試頁面"""
    return render_template('simple_test.html', 
                         google_maps_api_key=app.config['GOOGLE_MAPS_API_KEY'])

@app.route('/api/trips', methods=['GET'])
def get_trips():
    """取得所有行程"""
    conn = get_db()
    trips = conn.execute('SELECT * FROM trips ORDER BY created_at DESC').fetchall()
    conn.close()
    
    return jsonify([dict(trip) for trip in trips])

@app.route('/api/trips', methods=['POST'])
def create_trip():
    """建立新行程"""
    data = request.json
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO trips (name, description, route_data, total_distance, estimated_days)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['name'],
        data.get('description', ''),
        json.dumps(data['route_data']),
        data['total_distance'],
        data['estimated_days']
    ))
    
    trip_id = cursor.lastrowid
    
    # 儲存每日行程
    daily_plans = data.get('daily_plans', [])
    if daily_plans:
        for plan in daily_plans:
            cursor.execute('''
                INSERT INTO daily_plans (trip_id, day_number, start_point, end_point, distance)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                trip_id,
                plan.get('day'),
                plan.get('start'),
                plan.get('end'),
                plan.get('distance', 0)
            ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'id': trip_id, 'message': '行程建立成功'}), 201

@app.route('/api/trips/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    """取得特定行程"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 取得行程基本資料
    trip = cursor.execute('SELECT * FROM trips WHERE id = ?', (trip_id,)).fetchone()
    
    if trip is None:
        conn.close()
        return jsonify({'error': '行程不存在'}), 404
    
    trip_dict = dict(trip)
    trip_dict['route_data'] = json.loads(trip_dict['route_data'])
    
    # 取得每日行程
    daily_plans = cursor.execute('''
        SELECT day_number, start_point, end_point, distance 
        FROM daily_plans 
        WHERE trip_id = ? 
        ORDER BY day_number
    ''', (trip_id,)).fetchall()
    
    trip_dict['daily_plans'] = [dict(plan) for plan in daily_plans]
    
    conn.close()
    return jsonify(trip_dict)

@app.route('/api/trips/<int:trip_id>', methods=['PUT'])
def update_trip(trip_id):
    """更新行程"""
    data = request.json
    
    conn = get_db()
    conn.execute('''
        UPDATE trips 
        SET name = ?, description = ?, route_data = ?, 
            total_distance = ?, estimated_days = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (
        data['name'],
        data.get('description', ''),
        json.dumps(data['route_data']),
        data['total_distance'],
        data['estimated_days'],
        trip_id
    ))
    conn.commit()
    conn.close()
    
    return jsonify({'message': '行程更新成功'})

@app.route('/api/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    """刪除行程"""
    conn = get_db()
    conn.execute('DELETE FROM trips WHERE id = ?', (trip_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': '行程刪除成功'})

@app.route('/api/calculate-distance', methods=['POST'])
def calculate_distance():
    """計算路線距離（使用 Google Directions API）"""
    data = request.json
    waypoints = data.get('waypoints', [])
    
    if len(waypoints) < 2:
        return jsonify({'error': '至少需要兩個地點'}), 400
    
    # 這裡可以呼叫 Google Directions API 取得精確距離
    # 目前先回傳估算值
    total_distance = 0
    for i in range(len(waypoints) - 1):
        # 簡單的直線距離估算（實際應使用 Google API）
        lat1, lng1 = waypoints[i]['lat'], waypoints[i]['lng']
        lat2, lng2 = waypoints[i + 1]['lat'], waypoints[i + 1]['lng']
        
        # 使用 Haversine 公式計算距離
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # 地球半徑（公里）
        dlat = radians(lat2 - lat1)
        dlng = radians(lng2 - lng1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c
        
        total_distance += distance
    
    estimated_days = max(1, round(total_distance / app.config['DEFAULT_DAILY_DISTANCE']))
    estimated_hours = total_distance / app.config['AVERAGE_SPEED']
    
    return jsonify({
        'total_distance': round(total_distance, 2),
        'estimated_days': estimated_days,
        'estimated_hours': round(estimated_hours, 2)
    })

@app.route('/api/weather', methods=['POST'])
def get_weather():
    """取得天氣預報"""
    data = request.json
    lat = data.get('lat')
    lng = data.get('lng')
    location_name = data.get('name', '')  # 從前端傳來的地點名稱
    
    if not app.config['OPENWEATHER_API_KEY'] or app.config['OPENWEATHER_API_KEY'] == 'your_openweather_api_key_here':
        return jsonify({
            'error': '未設定天氣 API Key',
            'message': '請到 https://openweathermap.org/api 註冊並取得免費 API Key，然後設定到 .env 檔案中的 OPENWEATHER_API_KEY'
        }), 400
    
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast"
        params = {
            'lat': lat,
            'lon': lng,
            'appid': app.config['OPENWEATHER_API_KEY'],
            'units': 'metric',
            'lang': 'zh_tw'
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        weather_data = response.json()
        
        # 整理未來5天的天氣資料
        forecasts = []
        for item in weather_data['list'][:8]:  # 取前8筆（約2天）
            forecasts.append({
                'datetime': item['dt_txt'],
                'temp': round(item['main']['temp']),
                'temp_min': round(item['main']['temp_min']),
                'temp_max': round(item['main']['temp_max']),
                'description': item['weather'][0]['description'],
                'icon': item['weather'][0]['icon'],
                'humidity': item['main']['humidity'],
                'wind_speed': round(item['wind']['speed'] * 3.6, 1)  # 轉換為 km/h
            })
        
        # 優先使用前端傳來的地點名稱，否則使用 API 回傳的城市名稱
        city_name = location_name if location_name else weather_data['city']['name']
        
        return jsonify({
            'city': city_name,
            'forecasts': forecasts
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calculate-cost', methods=['POST'])
def calculate_cost():
    """計算油耗與費用"""
    data = request.json
    distance = data.get('distance', 0)
    days = data.get('days', 1)
    
    # 油耗計算
    fuel_needed = distance / app.config['FUEL_CONSUMPTION']
    fuel_cost = fuel_needed * app.config['FUEL_PRICE']
    
    # 住宿費用（天數-1，因為最後一天不需要住宿）
    accommodation_cost = max(0, days - 1) * app.config['DAILY_ACCOMMODATION']
    
    # 餐費
    meal_cost = days * app.config['DAILY_MEAL']
    
    # 總費用
    total_cost = fuel_cost + accommodation_cost + meal_cost
    
    return jsonify({
        'fuel_needed': round(fuel_needed, 2),
        'fuel_cost': round(fuel_cost, 0),
        'accommodation_cost': round(accommodation_cost, 0),
        'meal_cost': round(meal_cost, 0),
        'total_cost': round(total_cost, 0),
        'breakdown': {
            'fuel': round(fuel_cost, 0),
            'accommodation': round(accommodation_cost, 0),
            'meals': round(meal_cost, 0)
        }
    })

@app.route('/api/share/<int:trip_id>', methods=['POST'])
def create_share_link(trip_id):
    """建立分享連結"""
    conn = get_db()
    trip = conn.execute('SELECT * FROM trips WHERE id = ?', (trip_id,)).fetchone()
    
    if trip is None:
        conn.close()
        return jsonify({'error': '行程不存在'}), 404
    
    # 生成唯一的分享代碼
    share_code = secrets.token_urlsafe(16)
    
    # 儲存分享代碼
    conn.execute('''
        UPDATE trips SET share_code = ?, shared_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (share_code, trip_id))
    conn.commit()
    conn.close()
    
    share_url = url_for('view_shared_trip', share_code=share_code, _external=True)
    
    return jsonify({
        'share_code': share_code,
        'share_url': share_url
    })

@app.route('/share/<share_code>')
def view_shared_trip(share_code):
    """查看分享的行程"""
    conn = get_db()
    trip = conn.execute('SELECT * FROM trips WHERE share_code = ?', (share_code,)).fetchone()
    conn.close()
    
    if trip is None:
        return "行程不存在或已被刪除", 404
    
    trip_dict = dict(trip)
    trip_dict['route_data'] = json.loads(trip_dict['route_data'])
    
    return render_template('shared_trip.html', 
                         trip=trip_dict,
                         google_maps_api_key=app.config['GOOGLE_MAPS_API_KEY'])

@app.route('/api/export-pdf/<int:trip_id>')
def export_pdf(trip_id):
    """匯出 PDF 行程表"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    conn = get_db()
    trip = conn.execute('SELECT * FROM trips WHERE id = ?', (trip_id,)).fetchone()
    conn.close()
    
    if trip is None:
        return jsonify({'error': '行程不存在'}), 404
    
    trip_dict = dict(trip)
    route_data = json.loads(trip_dict['route_data'])
    
    # 建立 PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # 標題
    p.setFont("Helvetica-Bold", 24)
    p.drawString(2*cm, height - 3*cm, trip_dict['name'])
    
    # 行程資訊
    p.setFont("Helvetica", 12)
    y = height - 5*cm
    
    p.drawString(2*cm, y, f"Total Distance: {trip_dict['total_distance']} km")
    y -= 0.8*cm
    p.drawString(2*cm, y, f"Estimated Days: {trip_dict['estimated_days']} days")
    y -= 0.8*cm
    
    if trip_dict['description']:
        p.drawString(2*cm, y, f"Description: {trip_dict['description']}")
        y -= 0.8*cm
    
    # 路線點
    y -= 1*cm
    p.setFont("Helvetica-Bold", 14)
    p.drawString(2*cm, y, "Route Points:")
    y -= 1*cm
    
    p.setFont("Helvetica", 11)
    for i, waypoint in enumerate(route_data, 1):
        if y < 3*cm:
            p.showPage()
            y = height - 3*cm
        
        p.drawString(2.5*cm, y, f"{i}. {waypoint['name']}")
        y -= 0.6*cm
        p.setFont("Helvetica", 9)
        p.drawString(3*cm, y, f"   ({waypoint['lat']:.4f}, {waypoint['lng']:.4f})")
        y -= 0.8*cm
        p.setFont("Helvetica", 11)
    
    # 生成 QR Code（分享連結）
    if trip_dict.get('share_code'):
        share_url = url_for('view_shared_trip', share_code=trip_dict['share_code'], _external=True)
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(share_url)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # 將 QR Code 加入 PDF
        p.drawImage(qr_buffer, width - 6*cm, 2*cm, width=4*cm, height=4*cm)
        p.setFont("Helvetica", 9)
        p.drawString(width - 6*cm, 1.5*cm, "Scan to view online")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'{trip_dict["name"]}.pdf'
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
