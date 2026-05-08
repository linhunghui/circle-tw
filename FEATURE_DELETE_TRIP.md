# 🗑️ 新功能：刪除行程

## 更新日期：2026-05-07

---

## 🎯 功能說明

在「載入行程」對話框中，每個行程項目旁邊新增刪除按鈕，讓使用者可以輕鬆刪除不需要的行程。

---

## ✨ 功能特色

### 1. **刪除按鈕**
- 🗑️ 每個行程項目右側有紅色刪除按鈕
- 🖱️ 點擊刪除按鈕不會觸發載入行程
- ⚠️ 刪除前會顯示確認對話框

### 2. **安全確認**
- ✅ 刪除前必須確認
- ✅ 提示「此操作無法復原」
- ✅ 可以取消刪除操作

### 3. **智能處理**
- ✅ 刪除後自動重新載入行程列表
- ✅ 如果刪除的是當前行程，自動清除相關按鈕
- ✅ 錯誤處理完善

---

## 🎨 介面設計

### 行程列表佈局

```
┌─────────────────────────────────────────┐
│ 載入行程                          ✕     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ 台灣環島七日遊              🗑️ │    │
│ │ 從台北出發，順時針環島         │    │
│ │ 1200 km · 7 天                 │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ 東部海岸線三日遊            🗑️ │    │
│ │ 花蓮、台東美景                 │    │
│ │ 450 km · 3 天                  │    │
│ └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 互動說明

#### 點擊行程內容：
- 載入該行程
- 關閉對話框
- 顯示路線點

#### 點擊刪除按鈕：
- 顯示確認對話框
- 確認後刪除行程
- 重新載入列表

---

## 💻 程式碼實作

### 前端（static/js/app.js）

#### 1. 更新 showLoadModal 函數

**新增刪除按鈕**：
```javascript
tripsList.innerHTML = trips.map(trip => `
    <div class="trip-item">
        <div onclick="loadTrip(${trip.id})" style="flex: 1; cursor: pointer;">
            <h3>${trip.name}</h3>
            <p>${trip.description || '無描述'}</p>
            <p style="font-size: 0.85rem; color: #64748b;">
                ${trip.total_distance} km · ${trip.estimated_days} 天
            </p>
        </div>
        <button 
            class="btn btn-sm btn-danger" 
            onclick="event.stopPropagation(); deleteTrip(${trip.id})"
            title="刪除行程"
            style="margin-left: 10px;">
            <i class="fas fa-trash"></i>
        </button>
    </div>
`).join('');
```

**重點說明**：
- `event.stopPropagation()`：防止點擊刪除按鈕時觸發載入行程
- `flex: 1`：讓行程內容佔據剩餘空間
- `cursor: pointer`：滑鼠移到行程內容時顯示手指游標

#### 2. 新增 deleteTrip 函數

```javascript
async function deleteTrip(tripId) {
    // 確認刪除
    if (!confirm('確定要刪除這個行程嗎？此操作無法復原。')) {
        return;
    }
    
    try {
        // 呼叫刪除 API
        const response = await fetch(`/api/trips/${tripId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('行程刪除成功！');
            
            // 如果刪除的是當前行程，清除相關狀態
            if (currentTripId === tripId) {
                currentTripId = null;
                document.getElementById('exportPDF').style.display = 'none';
                document.getElementById('shareTrip').style.display = 'none';
            }
            
            // 重新載入行程列表
            showLoadModal();
        } else {
            alert('刪除失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('刪除失敗，請稍後再試');
    }
}
```

**功能說明**：
1. **確認對話框**：防止誤刪
2. **DELETE 請求**：呼叫後端 API
3. **清除狀態**：如果刪除當前行程，隱藏匯出和分享按鈕
4. **重新載入**：刪除後更新列表
5. **錯誤處理**：顯示友善的錯誤訊息

### 後端（app.py）

後端已經有刪除 API，不需要修改：

```python
@app.route('/api/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    """刪除行程"""
    conn = get_db()
    conn.execute('DELETE FROM trips WHERE id = ?', (trip_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': '行程刪除成功'})
```

### CSS（static/css/style.css）

**更新 trip-item 樣式**：
```css
.trip-item {
    display: flex;                    /* 使用 flexbox */
    align-items: center;              /* 垂直置中 */
    justify-content: space-between;   /* 兩端對齊 */
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: var(--bg-color);
    border-radius: 6px;
    transition: all 0.2s;
}

.trip-item:hover {
    background: var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* 新增陰影 */
}
```

---

## 🧪 使用方式

### 步驟 1：開啟載入行程對話框
```
1. 點擊頂部的「載入行程」按鈕
2. 對話框顯示所有已儲存的行程
```

### 步驟 2：刪除行程
```
1. 找到要刪除的行程
2. 點擊右側的紅色 🗑️ 按鈕
3. 確認對話框出現
4. 點擊「確定」刪除
5. 或點擊「取消」放棄刪除
```

### 步驟 3：確認刪除
```
1. 刪除成功後顯示「行程刪除成功！」
2. 行程列表自動更新
3. 該行程從列表中消失
```

---

## ⚠️ 注意事項

### 1. **無法復原**
- ❌ 刪除的行程無法恢復
- ❌ 資料庫中的記錄會被永久刪除
- ✅ 刪除前請確認

### 2. **當前行程**
如果刪除的是當前載入的行程：
- 🗑️ 行程會被刪除
- 🚫 「匯出 PDF」按鈕會隱藏
- 🚫 「分享行程」按鈕會隱藏
- ✅ 地圖上的路線點不會被清除（需要手動清除）

### 3. **網路錯誤**
如果刪除失敗：
- ⚠️ 顯示「刪除失敗，請稍後再試」
- ✅ 行程不會被刪除
- ✅ 可以重試

---

## 🎯 使用情境

### 情境 1：清理測試行程
```
問題：測試時建立了很多行程
解決：逐一刪除不需要的測試行程
```

### 情境 2：更新行程
```
問題：行程規劃有誤，想重新規劃
解決：
1. 刪除舊行程
2. 重新規劃路線
3. 儲存新行程
```

### 情境 3：管理行程
```
問題：行程太多，難以管理
解決：定期刪除已完成或不需要的行程
```

---

## 🔒 安全性

### 確認機制
```javascript
if (!confirm('確定要刪除這個行程嗎？此操作無法復原。')) {
    return;  // 使用者取消，不執行刪除
}
```

### 錯誤處理
```javascript
try {
    // 刪除操作
} catch (error) {
    console.error('Error:', error);
    alert('刪除失敗，請稍後再試');
}
```

### 事件隔離
```javascript
onclick="event.stopPropagation(); deleteTrip(${trip.id})"
//       ^^^^^^^^^^^^^^^^^^^^^^^^ 防止觸發父元素的點擊事件
```

---

## 📊 測試案例

### 測試 1：正常刪除
```
1. 開啟「載入行程」
2. 點擊任一行程的刪除按鈕
3. 確認對話框出現
4. 點擊「確定」
5. ✅ 顯示「行程刪除成功！」
6. ✅ 行程從列表中消失
```

### 測試 2：取消刪除
```
1. 開啟「載入行程」
2. 點擊任一行程的刪除按鈕
3. 確認對話框出現
4. 點擊「取消」
5. ✅ 行程仍在列表中
6. ✅ 沒有任何變化
```

### 測試 3：刪除當前行程
```
1. 載入一個行程
2. 確認「匯出 PDF」和「分享行程」按鈕顯示
3. 再次開啟「載入行程」
4. 刪除剛才載入的行程
5. ✅ 行程被刪除
6. ✅ 「匯出 PDF」和「分享行程」按鈕隱藏
7. ✅ 地圖上的路線點仍然存在
```

### 測試 4：刪除所有行程
```
1. 開啟「載入行程」
2. 逐一刪除所有行程
3. ✅ 最後顯示「尚無儲存的行程」
```

### 測試 5：點擊行程內容
```
1. 開啟「載入行程」
2. 點擊行程內容（不是刪除按鈕）
3. ✅ 載入該行程
4. ✅ 對話框關閉
5. ✅ 地圖顯示路線
```

---

## 🎨 視覺效果

### 刪除按鈕樣式
- 🔴 紅色背景（danger 顏色）
- 🗑️ 垃圾桶圖示
- 📏 小尺寸按鈕（btn-sm）
- 🖱️ 滑鼠移上時變深色

### 行程項目樣式
- 📦 Flexbox 佈局
- 👆 行程內容可點擊（cursor: pointer）
- 🎨 滑鼠移上時背景變色
- 🌟 滑鼠移上時顯示陰影

---

## 🔜 未來改善

### 短期（1-2 週）
- [ ] 批次刪除（選擇多個行程一次刪除）
- [ ] 刪除確認對話框美化
- [ ] 刪除動畫效果

### 中期（1-2 個月）
- [ ] 回收站功能（刪除後可恢復）
- [ ] 行程歸檔（不刪除但隱藏）
- [ ] 刪除歷史記錄

### 長期（3-6 個月）
- [ ] 行程分類管理
- [ ] 行程標籤系統
- [ ] 行程搜尋功能

---

## 📚 相關文件

- [UPDATE_v2.4.md](UPDATE_v2.4.md) - 版本 2.4 更新說明
- [BUGFIX_SAVE_LOAD.md](BUGFIX_SAVE_LOAD.md) - 儲存載入修復

---

## 🎯 總結

### 新增功能
- ✅ 刪除行程按鈕
- ✅ 刪除確認對話框
- ✅ 自動更新列表
- ✅ 智能狀態管理

### 使用者受益
- 🗑️ 輕鬆刪除不需要的行程
- 🔒 安全確認機制
- 🎨 直覺的操作介面
- ✨ 流暢的使用體驗

**刪除功能已完成！現在可以輕鬆管理你的行程了！** 🎉
