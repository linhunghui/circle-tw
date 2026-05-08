import sqlite3
from config import Config

def init_database():
    """初始化資料庫"""
    conn = sqlite3.connect(Config.DATABASE)
    cursor = conn.cursor()
    
    # 建立行程表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            route_data TEXT NOT NULL,
            total_distance REAL,
            estimated_days INTEGER,
            share_code TEXT UNIQUE,
            shared_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 建立地點表（儲存住宿、加油站等）
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            address TEXT,
            notes TEXT,
            day_number INTEGER,
            FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        )
    ''')
    
    # 建立每日行程表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            day_number INTEGER NOT NULL,
            start_point TEXT,
            end_point TEXT,
            distance REAL,
            notes TEXT,
            FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print("資料庫初始化完成！")

if __name__ == '__main__':
    init_database()
