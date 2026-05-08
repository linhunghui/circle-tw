# 🔧 修復：儲存行程後地點名稱消失

## 問題描述

**症狀**：
1. 新增路線點（有地點名稱）
2. 儲存行程
3. 載入行程
4. ❌ 地點名稱變成「地點 1」、「地點 2」等預設名稱

**影響**：
- 無法識別路線點
- 天氣查詢顯示錯誤的地點名稱
- 使用者體驗不佳

---

## 問題原因

### 根本原因

在 `loadTrip` 函數中，載入路線點時沒有傳遞地點名稱參數。

#### 錯誤的程式碼：
```javascript
// 載入路線點
trip.route_data.forEach(wp => {
    addWaypoint(new google.maps.LatLng(wp.lat, wp.lng));
    // ❌ 沒有傳遞 wp.name
});
```

#### addWaypoint 函數定義：
```javascript
function addWaypoint(location, customName) {
    const waypoint = {
        lat: location.lat(),
        lng: location.lng(),
        name: customName || `地點 ${waypoints.length + 1}`
        //     ^^^^^^^^^ 如果沒有傳遞 customName，使用預設名稱
    };
    // ...
}
```

### 問題流程

```
1. 儲存行程
   waypoints = [
     { lat: 25.04, lng: 121.51, name: "台北車站" },
     { lat: 24.15, lng: 120.68, name: "台中火車站" }
   ]
   ✅ 正確儲存到資料庫

2. 載入行程
   trip.route_data = [
     { lat: 25.04, lng: 121.51, name: "台北車站" },
     { lat: 24.15, lng: 120.68, name: "台中火車站" }
   ]
   ✅ 正確從資料庫讀取

3. 呼叫 addWaypoint
   addWaypoint(new google.maps.LatLng(25.04, 121.51))
   //                                                 ❌ 沒有傳遞 name
   
4. 結果
   waypoint.name = "地點 1"  // ❌ 使用預設名稱
```

---

## 解決方案

### 修復程式碼

#### 修復後的 loadTrip 函數：
```javascript
async function loadTrip(tripId) {
    try {
        const response = await fetch(`/api/trips/${tripId}`);
        const trip = await response.json();
        
        // 清除現有路線
        clearAllWaypoints();
        
        // 載入行程資料
        document.getElementById('tripName').value = trip.name;
        document.getElementById('tripDescription').value = trip.description || '';
        
        // 設定當前行程 ID
        currentTripId = trip.id;
        
        // 顯示匯出和分享按鈕
        document.getElementById('exportPDF').style.display = 'inline-flex';
        document.getElementById('shareTrip').style.display = 'inline-flex';
        
        // 載入路線點（包含地點名稱）
        trip.route_data.forEach(wp => {
            addWaypoint(new google.maps.LatLng(wp.lat, wp.lng), wp.name);
            //                                                   ^^^^^^^ ✅ 傳遞地點名稱
        });
        
        closeModals();
        alert('行程載入成功！');
    } catch (error) {
        console.error('Error:', error);
        alert('載入失敗，請稍後再試');
    }
}
```

### 修復重點

**變更**：
```javascript
// 之前（錯誤）
addWaypoint(new google.maps.LatLng(wp.lat, wp.lng));

// 之後（正確）
addWaypoint(new google.maps.LatLng(wp.lat, wp.lng), wp.name);
```

**說明**：
- 傳遞 `wp.name` 作為第二個參數
- `addWaypoint` 函數會使用傳入的名稱
- 如果名稱存在，就不會使用預設名稱

---

## 測試步驟

### 測試 1：儲存和載入行程

1. **新增路線點**
   ```
   - 使用搜尋功能新增「台北車站」
   - 使用搜尋功能新增「台中火車站」
   - 使用搜尋功能新增「高雄車站」
   ```

2. **檢查地點名稱**
   ```
   ✅ 路線點列表應顯示：
   - 台北車站
   - 台中火車站
   - 高雄車站
   ```

3. **儲存行程**
   ```
   - 點擊「儲存行程」
   - 輸入行程名稱：「測試行程」
   - 點擊「確定儲存」
   - 應顯示「行程儲存成功！」
   ```

4. **清除路線點**
   ```
   - 點擊「清除路線點」
   - 確認清除
   - 地圖應該清空
   ```

5. **載入行程**
   ```
   - 點擊「載入行程」
   - 選擇「測試行程」
   - 點擊「載入」
   - 應顯示「行程載入成功！」
   ```

6. **驗證地點名稱**
   ```
   ✅ 路線點列表應顯示：
   - 台北車站  （不是「地點 1」）
   - 台中火車站（不是「地點 2」）
   - 高雄車站  （不是「地點 3」）
   ```

### 測試 2：天氣查詢

1. **載入行程**（使用測試 1 儲存的行程）

2. **查看天氣**
   ```
   - 點擊「台北車站」旁的 ☁️ 按鈕
   - 天氣視窗應顯示「台北車站」
   - 不應該顯示「地點 1」
   ```

3. **驗證所有路線點**
   ```
   - 依序點擊每個路線點的 ☁️ 按鈕
   - 確認顯示正確的地點名稱
   ```

### 測試 3：每日行程

1. **載入行程**（使用測試 1 儲存的行程）

2. **規劃每日行程**
   ```
   - 點擊「規劃每日行程」
   - 選擇每天的終點
   - 點擊「確定」
   ```

3. **驗證地點名稱**
   ```
   ✅ 每日行程應顯示：
   第 1 天
   起點：台北車站
   終點：台中火車站
   
   第 2 天
   起點：台中火車站
   終點：高雄車站
   ```

---

## 相關功能檢查

### 確認不受影響的功能

#### 1. 新增路線點
- ✅ 點擊地圖新增（預設名稱：「地點 1」、「地點 2」）
- ✅ 搜尋新增（使用搜尋結果的名稱）

#### 2. 儲存行程
- ✅ 正確儲存所有路線點資訊
- ✅ 包含地點名稱、座標

#### 3. 載入行程
- ✅ 正確載入所有路線點資訊
- ✅ **修復**：現在正確載入地點名稱

#### 4. 天氣查詢
- ✅ 使用正確的地點名稱
- ✅ 顯示在天氣視窗中

#### 5. 每日行程
- ✅ 使用正確的地點名稱
- ✅ 顯示在每日行程列表中

---

## 資料流程圖

### 修復前（錯誤）

```
新增路線點
  ↓
waypoints = [{ lat, lng, name: "台北車站" }]
  ↓
儲存到資料庫
  ↓
資料庫 = [{ lat, lng, name: "台北車站" }]
  ↓
從資料庫載入
  ↓
trip.route_data = [{ lat, lng, name: "台北車站" }]
  ↓
addWaypoint(location)  ← ❌ 沒有傳遞 name
  ↓
waypoints = [{ lat, lng, name: "地點 1" }]  ← ❌ 錯誤
```

### 修復後（正確）

```
新增路線點
  ↓
waypoints = [{ lat, lng, name: "台北車站" }]
  ↓
儲存到資料庫
  ↓
資料庫 = [{ lat, lng, name: "台北車站" }]
  ↓
從資料庫載入
  ↓
trip.route_data = [{ lat, lng, name: "台北車站" }]
  ↓
addWaypoint(location, name)  ← ✅ 傳遞 name
  ↓
waypoints = [{ lat, lng, name: "台北車站" }]  ← ✅ 正確
```

---

## 預防措施

### 未來開發建議

#### 1. 資料驗證
```javascript
// 載入時驗證資料完整性
trip.route_data.forEach(wp => {
    if (!wp.name) {
        console.warn('路線點缺少名稱:', wp);
    }
    addWaypoint(
        new google.maps.LatLng(wp.lat, wp.lng), 
        wp.name || '未命名地點'
    );
});
```

#### 2. 單元測試
```javascript
// 測試儲存和載入
test('saveAndLoadTrip', async () => {
    const originalWaypoints = [
        { lat: 25.04, lng: 121.51, name: "台北車站" }
    ];
    
    await saveTrip(originalWaypoints);
    const loadedWaypoints = await loadTrip(tripId);
    
    expect(loadedWaypoints[0].name).toBe("台北車站");
});
```

#### 3. 型別檢查（TypeScript）
```typescript
interface Waypoint {
    lat: number;
    lng: number;
    name: string;  // 必填
}

function addWaypoint(location: google.maps.LatLng, name: string): void {
    // name 是必填參數
}
```

---

## 相關文件

- [UPDATE_v2.4.md](UPDATE_v2.4.md) - 版本 2.4 更新說明
- [WEATHER_IMPROVEMENT.md](WEATHER_IMPROVEMENT.md) - 天氣顯示改善

---

## 總結

### 問題
- ❌ 載入行程後地點名稱消失

### 原因
- ❌ `loadTrip` 函數沒有傳遞地點名稱參數

### 解決
- ✅ 修改 `loadTrip` 函數，傳遞 `wp.name` 參數

### 影響
- ✅ 路線點名稱正確顯示
- ✅ 天氣查詢顯示正確地點
- ✅ 每日行程顯示正確地點
- ✅ 使用者體驗改善

**修復完成！現在儲存和載入行程都能正確保留地點名稱了！** 🎉
