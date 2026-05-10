// 全域變數
let map;
let directionsService;
let directionsRenderer;
let placesService;
let markers = [];
let waypoints = [];
let trafficLayer;
let currentSearchType = null;
let currentTripId = null;
let currentTravelMode = 'TWO_WHEELER'; // 預設機車
let autocomplete;
let searchResultMarker = null; // 搜尋結果標記
let searchResultInfoWindow = null; // 搜尋結果資訊視窗

// 初始化地圖
function initMap() {
    // 台灣中心座標
    const taiwanCenter = { lat: 23.5, lng: 121.0 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: taiwanCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#2563eb',
            strokeWeight: 5
        }
    });
    
    placesService = new google.maps.places.PlacesService(map);
    trafficLayer = new google.maps.TrafficLayer();
    
    // 設定地點搜尋自動完成
    const searchInput = document.getElementById('placeSearch');
    autocomplete = new google.maps.places.Autocomplete(searchInput, {
        componentRestrictions: { country: 'tw' }, // 限制台灣
        fields: ['geometry', 'name', 'formatted_address']
    });
    
    // 地圖點擊事件
    map.addListener('click', (event) => {
        addWaypoint(event.latLng);
    });
    
    initEventListeners();
}

// 初始化事件監聽器
function initEventListeners() {
    // 清除路線點
    document.getElementById('clearWaypoints').addEventListener('click', clearAllWaypoints);
    
    // 回到台灣中心
    document.getElementById('centerMap').addEventListener('click', () => {
        map.setCenter({ lat: 23.5, lng: 121.0 });
        map.setZoom(8);
    });
    
    // 切換路況
    document.getElementById('toggleTraffic').addEventListener('click', () => {
        if (trafficLayer.getMap()) {
            trafficLayer.setMap(null);
        } else {
            trafficLayer.setMap(map);
        }
    });
    
    // 儲存行程
    document.getElementById('saveTrip').addEventListener('click', showSaveModal);
    document.getElementById('confirmSave').addEventListener('click', saveTrip);
    
    // 載入行程
    document.getElementById('loadTrips').addEventListener('click', showLoadModal);
    
    // 匯出 PDF
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    
    // 分享行程
    document.getElementById('shareTrip').addEventListener('click', shareTrip);
    
    // 地點搜尋
    document.getElementById('searchPlace').addEventListener('click', searchAndAddPlace);
    document.getElementById('placeSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAndAddPlace();
        }
    });
    
    // 交通工具選擇
    document.getElementById('travelMode').addEventListener('change', (e) => {
        currentTravelMode = e.target.value;
        if (waypoints.length > 1) {
            calculateRoute();
        }
    });
    
    // 規劃每日行程
    document.getElementById('planDailyTrips').addEventListener('click', showDailyPlanModal);
    
    // 關閉對話框
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // 點擊對話框外部關閉
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
}

// 新增路線點（已移到下方與搜尋功能整合）

// 計算路線
function calculateRoute() {
    if (waypoints.length < 2) return;
    
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypointsForRoute = waypoints.slice(1, -1).map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
    }));
    
    // 根據交通工具選擇對應的模式
    let travelMode;
    let avoidHighways = false;
    let avoidTolls = false;
    
    switch(currentTravelMode) {
        case 'DRIVING':
            travelMode = google.maps.TravelMode.DRIVING;
            avoidHighways = false;
            avoidTolls = false;
            break;
        case 'TWO_WHEELER':
            // 白牌機車（普通重機）- 避開國道、快速道路
            travelMode = google.maps.TravelMode.DRIVING;
            avoidHighways = true;  // 避開高速公路
            avoidTolls = true;     // 避開收費道路（包含快速道路）
            break;
        case 'HEAVY_MOTORCYCLE':
            // 紅黃牌機車（大型重機）- 可以上國道
            travelMode = google.maps.TravelMode.DRIVING;
            avoidHighways = false;
            avoidTolls = false;
            break;
        case 'BICYCLING':
            travelMode = google.maps.TravelMode.BICYCLING;
            break;
        case 'WALKING':
            travelMode = google.maps.TravelMode.WALKING;
            break;
        default:
            travelMode = google.maps.TravelMode.DRIVING;
    }
    
    const request = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypointsForRoute,
        travelMode: travelMode,
        avoidHighways: avoidHighways,
        avoidTolls: avoidTolls,
        optimizeWaypoints: false
    };
    
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // 儲存路線結果供每日行程使用
            window.currentRouteResult = result;
            
            // 計算總距離和總時間
            let totalDistance = 0;
            let totalDuration = 0;
            const route = result.routes[0];
            for (let i = 0; i < route.legs.length; i++) {
                totalDistance += route.legs[i].distance.value;
                totalDuration += route.legs[i].duration.value;
            }
            
            // 更新統計資訊
            const distanceKm = (totalDistance / 1000).toFixed(2);
            const durationHours = (totalDuration / 3600).toFixed(1);
            const estimatedDays = Math.max(1, Math.ceil(distanceKm / 200));
            
            document.getElementById('totalDistance').textContent = `${distanceKm} km`;
            
            // 如果使用者沒有自訂天數，使用自動計算的天數
            const daysElement = document.getElementById('estimatedDays');
            if (!daysElement.dataset.userEdited) {
                daysElement.textContent = estimatedDays;
                daysElement.dataset.autoCalculated = estimatedDays;
            }
            
            document.getElementById('estimatedHours').textContent = `${durationHours} 小時`;
            
            // 計算費用
            const currentDays = parseInt(daysElement.textContent) || estimatedDays;
            calculateCost(parseFloat(distanceKm), currentDays);
        }
    });
}

// 更新路線點列表
function updateWaypointsList() {
    const list = document.getElementById('waypointsList');
    
    if (waypoints.length === 0) {
        list.innerHTML = '<p class="empty-message">在地圖上點擊新增路線點</p>';
        return;
    }
    
    list.innerHTML = waypoints.map((wp, index) => `
        <div class="waypoint-item" draggable="true" data-index="${index}">
            <div class="waypoint-drag-handle" style="cursor: move; padding: 0 0.5rem; color: #94a3b8;">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="waypoint-info">
                <div class="waypoint-name">${index + 1}. ${wp.name}</div>
                <div class="waypoint-coords">${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}</div>
            </div>
            <div class="waypoint-actions">
                <button class="btn btn-sm btn-info" onclick="checkWeatherForWaypoint(${index})" title="查看天氣">
                    <i class="fas fa-cloud-sun"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="searchNearWaypoint(${index})" title="搜尋附近">
                    <i class="fas fa-search"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeWaypoint(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // 初始化拖拉功能
    initDragAndDrop();
}

// 初始化拖拉排序功能
function initDragAndDrop() {
    const waypointItems = document.querySelectorAll('.waypoint-item');
    let draggedItem = null;
    let draggedIndex = null;
    
    waypointItems.forEach((item, index) => {
        // 拖拉開始
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            draggedIndex = parseInt(item.dataset.index);
            item.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });
        
        // 拖拉結束
        item.addEventListener('dragend', (e) => {
            item.style.opacity = '1';
            draggedItem = null;
            draggedIndex = null;
        });
        
        // 拖拉經過
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedItem && draggedItem !== item) {
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    item.style.borderTop = '2px solid #3498db';
                    item.style.borderBottom = '';
                } else {
                    item.style.borderTop = '';
                    item.style.borderBottom = '2px solid #3498db';
                }
            }
        });
        
        // 離開拖拉區域
        item.addEventListener('dragleave', (e) => {
            item.style.borderTop = '';
            item.style.borderBottom = '';
        });
        
        // 放下
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = '';
            item.style.borderBottom = '';
            
            if (draggedItem && draggedItem !== item) {
                const dropIndex = parseInt(item.dataset.index);
                
                // 重新排序 waypoints 陣列
                const draggedWaypoint = waypoints[draggedIndex];
                waypoints.splice(draggedIndex, 1);
                
                // 計算新的插入位置
                let newIndex = dropIndex;
                if (draggedIndex < dropIndex) {
                    newIndex = dropIndex;
                }
                
                waypoints.splice(newIndex, 0, draggedWaypoint);
                
                // 更新標記
                updateMarkers();
                
                // 更新列表
                updateWaypointsList();
                
                // 重新計算路線
                if (waypoints.length > 1) {
                    calculateRoute();
                }
            }
        });
    });
}

// 更新地圖標記
function updateMarkers() {
    // 清除所有標記
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // 重新建立標記
    waypoints.forEach((wp, index) => {
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(wp.lat, wp.lng),
            map: map,
            label: String(index + 1),
            animation: google.maps.Animation.DROP,
            title: wp.name
        });
        markers.push(marker);
    });
}

// 搜尋特定路線點附近的地點
function searchNearWaypoint(waypointIndex) {
    const waypoint = waypoints[waypointIndex];
    const location = new google.maps.LatLng(waypoint.lat, waypoint.lng);
    
    // 移動地圖到該路線點
    map.setCenter(location);
    map.setZoom(13);
    
    // 彈出選單讓使用者選擇搜尋類型
    const searchTypes = [
        { type: 'lodging', name: '🏨 住宿', icon: 'hotel' },
        { type: 'gas_station', name: '⛽ 加油站', icon: 'local_gas_station' },
        { type: 'restaurant', name: '🍴 餐廳', icon: 'restaurant' },
        { type: 'tourist_attraction', name: '📷 景點', icon: 'attractions' }
    ];
    
    // 建立選單 HTML
    const menuHtml = `
        <div style="padding: 10px;">
            <h4 style="margin: 0 0 10px 0;">選擇搜尋類型</h4>
            ${searchTypes.map(st => `
                <button 
                    onclick="executeNearbySearch(${waypointIndex}, '${st.type}')" 
                    style="display: block; width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer; text-align: left; font-size: 14px;"
                    onmouseover="this.style.background='#f0f0f0'" 
                    onmouseout="this.style.background='white'"
                >
                    ${st.name}
                </button>
            `).join('')}
        </div>
    `;
    
    // 建立資訊視窗
    const infoWindow = new google.maps.InfoWindow({
        content: menuHtml,
        position: location
    });
    
    infoWindow.open(map);
}

// 執行附近搜尋
function executeNearbySearch(waypointIndex, type) {
    const waypoint = waypoints[waypointIndex];
    const location = new google.maps.LatLng(waypoint.lat, waypoint.lng);
    
    // 更新當前搜尋類型
    currentSearchType = type;
    
    // 執行搜尋
    searchNearby(type, location);
}

// 移除路線點
function removeWaypoint(index) {
    waypoints.splice(index, 1);
    
    if (markers[index]) {
        markers[index].setMap(null);
    }
    markers.splice(index, 1);
    
    // 重新編號標記
    markers.forEach((marker, i) => {
        marker.setLabel(String(i + 1));
    });
    
    updateWaypointsList();
    
    if (waypoints.length > 1) {
        calculateRoute();
    } else {
        directionsRenderer.setDirections({ routes: [] });
    }
    
    updateStats();
}

// 清除所有路線點
function clearAllWaypoints() {
    if (waypoints.length === 0) return;
    
    if (confirm('確定要清除所有路線點嗎？')) {
        waypoints = [];
        
        // 清除所有標記
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        
        // 清除搜尋結果標記
        if (searchResultMarker) {
            searchResultMarker.setMap(null);
            searchResultMarker = null;
        }
        
        // 清除搜尋結果資訊視窗
        if (searchResultInfoWindow) {
            searchResultInfoWindow.close();
            searchResultInfoWindow = null;
        }
        
        // 清除路線
        directionsRenderer.setDirections({ routes: [] });
        
        // 更新介面
        updateWaypointsList();
        updateStats();
    }
}

// 更新統計資訊
function updateStats() {
    if (waypoints.length < 2) {
        document.getElementById('totalDistance').textContent = '0 km';
        document.getElementById('estimatedDays').textContent = '0';
        document.getElementById('estimatedHours').textContent = '0 小時';
        document.getElementById('fuelCost').textContent = 'NT$ 0';
        document.getElementById('totalCost').textContent = 'NT$ 0';
    }
}

// 計算費用
async function calculateCost(distance, days) {
    try {
        const response = await fetch('/api/calculate-cost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                distance: distance,
                days: days
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('fuelCost').textContent = `NT$ ${data.fuel_cost.toLocaleString()}`;
            document.getElementById('totalCost').textContent = `NT$ ${data.total_cost.toLocaleString()}`;
        }
    } catch (error) {
        console.error('Error calculating cost:', error);
    }
}

// 取得搜尋類型名稱
function getSearchTypeName(type) {
    const names = {
        'lodging': '住宿',
        'gas_station': '加油站',
        'restaurant': '餐廳',
        'tourist_attraction': '景點'
    };
    return names[type] || '地點';
}

// 搜尋附近地點（修改為接受位置參數）
function searchNearby(type, location) {
    clearSearchMarkers();
    
    const request = {
        location: location,
        radius: 10000, // 10公里
        type: type
    };
    
    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.slice(0, 10).forEach(place => {
                createSearchMarker(place, type);
            });
        }
    });
}

// 建立搜尋標記
function createSearchMarker(place, type) {
    const icons = {
        lodging: '🏨',
        gas_station: '⛽',
        restaurant: '🍴',
        tourist_attraction: '📷'
    };
    
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <text x="20" y="30" font-size="30" text-anchor="middle">${icons[type]}</text>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0;">${place.name}</h3>
                <p style="margin: 0; color: #666;">${place.vicinity || ''}</p>
                ${place.rating ? `<p style="margin: 5px 0 0 0;">⭐ ${place.rating}</p>` : ''}
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    marker.searchMarker = true;
    markers.push(marker);
}

// 清除搜尋標記
function clearSearchMarkers() {
    markers = markers.filter(marker => {
        if (marker.searchMarker) {
            marker.setMap(null);
            return false;
        }
        return true;
    });
}

// 顯示儲存對話框
function showSaveModal() {
    const tripName = document.getElementById('tripName').value || '未命名行程';
    const totalDistance = document.getElementById('totalDistance').textContent;
    
    document.getElementById('modalTripName').textContent = tripName;
    document.getElementById('modalDistance').textContent = totalDistance;
    
    document.getElementById('saveModal').classList.add('active');
}

// 儲存行程
async function saveTrip() {
    const tripName = document.getElementById('tripName').value || '未命名行程';
    const tripDescription = document.getElementById('tripDescription').value;
    const totalDistance = parseFloat(document.getElementById('totalDistance').textContent);
    const estimatedDays = parseInt(document.getElementById('estimatedDays').textContent);
    
    if (waypoints.length < 2) {
        alert('請至少新增兩個路線點');
        return;
    }
    
    const tripData = {
        name: tripName,
        description: tripDescription,
        route_data: waypoints,
        total_distance: totalDistance,
        estimated_days: estimatedDays,
        daily_plans: window.currentDailyPlans || []  // 加入每日行程資料
    };
    
    try {
        const response = await fetch('/api/trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tripData)
        });
        
        if (response.ok) {
            const result = await response.json();
            currentTripId = result.id;
            alert('行程儲存成功！');
            
            // 顯示匯出和分享按鈕
            document.getElementById('exportPDF').style.display = 'inline-flex';
            document.getElementById('shareTrip').style.display = 'inline-flex';
            
            closeModals();
        } else {
            alert('儲存失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('儲存失敗，請稍後再試');
    }
}

// 顯示載入對話框
async function showLoadModal() {
    try {
        const response = await fetch('/api/trips');
        const trips = await response.json();
        
        const tripsList = document.getElementById('tripsList');
        
        if (trips.length === 0) {
            tripsList.innerHTML = '<p class="empty-message">尚無儲存的行程</p>';
        } else {
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
        }
        
        document.getElementById('loadModal').classList.add('active');
    } catch (error) {
        console.error('Error:', error);
        alert('載入失敗，請稍後再試');
    }
}

// 載入行程
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
        });
        
        // 載入每日行程
        if (trip.daily_plans && trip.daily_plans.length > 0) {
            const dailyPlans = trip.daily_plans.map(plan => ({
                day: plan.day_number,
                start: plan.start_point,
                end: plan.end_point,
                distance: plan.distance,
                duration: (plan.distance / 50).toFixed(1)  // 估算時間（假設平均速度50km/h）
            }));
            displayDailyPlans(dailyPlans);
        }
        
        closeModals();
        alert('行程載入成功！');
    } catch (error) {
        console.error('Error:', error);
        alert('載入失敗，請稍後再試');
    }
}

// 刪除行程
async function deleteTrip(tripId) {
    if (!confirm('確定要刪除這個行程嗎？此操作無法復原。')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/trips/${tripId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('行程刪除成功！');
            
            // 如果刪除的是當前行程，清除當前行程 ID
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

// 關閉所有對話框
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// 搜尋並標記地點（不自動加入路線）
function searchAndAddPlace() {
    const searchInput = document.getElementById('placeSearch');
    const searchText = searchInput.value.trim();
    
    if (!searchText) {
        alert('請輸入要搜尋的地點');
        return;
    }
    
    // 清除之前的搜尋結果標記
    if (searchResultMarker) {
        searchResultMarker.setMap(null);
    }
    if (searchResultInfoWindow) {
        searchResultInfoWindow.close();
    }
    
    const place = autocomplete.getPlace();
    
    if (place && place.geometry) {
        // 使用自動完成的結果
        showSearchResult(place.geometry.location, place.name);
        searchInput.value = '';
    } else {
        // 使用 Places API 搜尋
        const request = {
            query: searchText,
            fields: ['name', 'geometry'],
            locationBias: map.getCenter()
        };
        
        placesService.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const place = results[0];
                showSearchResult(place.geometry.location, place.name);
                searchInput.value = '';
            } else {
                alert('找不到該地點，請嘗試其他關鍵字');
            }
        });
    }
}

// 顯示搜尋結果並詢問是否加入
function showSearchResult(location, name) {
    // 建立搜尋結果標記
    searchResultMarker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.BOUNCE,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    });
    
    // 建立資訊視窗
    searchResultInfoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0;">${name}</h3>
                <button onclick="confirmAddWaypoint()" class="btn btn-primary" style="margin-right: 5px;">
                    <i class="fas fa-plus"></i> 加入路線
                </button>
                <button onclick="cancelSearchResult()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        `
    });
    
    searchResultInfoWindow.open(map, searchResultMarker);
    
    // 移動地圖到該位置
    map.setCenter(location);
    map.setZoom(14);
    
    // 儲存位置和名稱供後續使用
    window.tempSearchLocation = location;
    window.tempSearchName = name;
}

// 確認加入路線點
function confirmAddWaypoint() {
    if (window.tempSearchLocation && window.tempSearchName) {
        addWaypoint(window.tempSearchLocation, window.tempSearchName);
        cancelSearchResult();
    }
}

// 取消搜尋結果
function cancelSearchResult() {
    if (searchResultMarker) {
        searchResultMarker.setMap(null);
        searchResultMarker = null;
    }
    if (searchResultInfoWindow) {
        searchResultInfoWindow.close();
        searchResultInfoWindow = null;
    }
    window.tempSearchLocation = null;
    window.tempSearchName = null;
}

// 修改 addWaypoint 函數以支援自訂名稱
function addWaypoint(location, customName) {
    const waypoint = {
        lat: location.lat(),
        lng: location.lng(),
        name: customName || `地點 ${waypoints.length + 1}`
    };
    
    waypoints.push(waypoint);
    
    // 建立標記
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        label: String(waypoints.length),
        animation: google.maps.Animation.DROP,
        title: waypoint.name
    });
    
    markers.push(marker);
    
    // 更新路線
    if (waypoints.length > 1) {
        calculateRoute();
    }
    
    updateWaypointsList();
    updateStats();
    
    // 顯示每日行程規劃按鈕
    if (waypoints.length >= 2) {
        document.getElementById('planDailyTrips').style.display = 'block';
    }
}

// 匯出 PDF
function exportToPDF() {
    if (!currentTripId) {
        alert('請先儲存行程');
        return;
    }
    
    window.open(`/api/export-pdf/${currentTripId}`, '_blank');
}

// 分享行程
async function shareTrip() {
    if (!currentTripId) {
        alert('請先儲存行程');
        return;
    }
    
    try {
        const response = await fetch(`/api/share/${currentTripId}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // 複製分享連結到剪貼簿
            navigator.clipboard.writeText(data.share_url).then(() => {
                alert(`分享連結已複製到剪貼簿！\n\n${data.share_url}`);
            }).catch(() => {
                prompt('分享連結：', data.share_url);
            });
        } else {
            alert('建立分享連結失敗');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('建立分享連結失敗');
    }
}

// 查看天氣
async function checkWeather() {
    if (waypoints.length === 0) {
        alert('請先新增路線點');
        return;
    }
    
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = '<p style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> 載入中...</p>';
    
    try {
        // 取得最後一個路線點的天氣
        const lastWaypoint = waypoints[waypoints.length - 1];
        
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: lastWaypoint.lat,
                lng: lastWaypoint.lng
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            let html = `<h3 style="margin-bottom: 0.5rem;">${data.city}</h3>`;
            
            data.forecasts.slice(0, 4).forEach(forecast => {
                const date = new Date(forecast.datetime);
                const timeStr = date.toLocaleString('zh-TW', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit' 
                });
                
                html += `
                    <div style="padding: 0.5rem; margin: 0.5rem 0; background: var(--bg-color); border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${timeStr}</div>
                                <div style="font-weight: 500;">${forecast.temp}°C</div>
                                <div style="font-size: 0.85rem;">${forecast.description}</div>
                            </div>
                            <div style="text-align: right;">
                                <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" width="50">
                                <div style="font-size: 0.85rem;">💨 ${forecast.wind_speed} km/h</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            weatherInfo.innerHTML = html;
        } else {
            const error = await response.json();
            let errorMsg = '<p style="color: var(--danger-color); padding: 10px;">❌ 無法取得天氣資訊</p>';
            
            if (error.message) {
                errorMsg += `<p style="font-size: 0.9rem; padding: 10px; background: #fff3cd; border-radius: 5px; margin: 10px 0;">${error.message}</p>`;
            }
            
            weatherInfo.innerHTML = errorMsg;
        }
    } catch (error) {
        console.error('Error:', error);
        weatherInfo.innerHTML = `<p style="color: var(--danger-color);">天氣服務暫時無法使用</p>`;
    }
}

// 查看特定路線點的天氣
async function checkWeatherForWaypoint(waypointIndex) {
    const waypoint = waypoints[waypointIndex];
    const location = new google.maps.LatLng(waypoint.lat, waypoint.lng);
    
    // 移動地圖到該路線點
    map.setCenter(location);
    
    try {
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: waypoint.lat,
                lng: waypoint.lng,
                name: waypoint.name  // 傳送地點名稱
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            let html = `
                <div style="padding: 15px; max-width: 420px;">
                    <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        <i class="fas fa-map-marker-alt" style="margin-right: 8px; color: #e74c3c;"></i>
                        ${waypoint.name}
                    </h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">
                        <i class="fas fa-info-circle"></i> 未來 24 小時天氣預報
                    </p>
            `;
            
            data.forecasts.slice(0, 4).forEach((forecast, index) => {
                const date = new Date(forecast.datetime);
                const timeStr = date.toLocaleString('zh-TW', { 
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                html += `
                    <div style="padding: 12px; margin: 8px 0; background: ${index % 2 === 0 ? '#f8f9fa' : '#ffffff'}; border-radius: 8px; border-left: 3px solid #3498db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-size: 0.9rem; color: #666; margin-bottom: 6px; font-weight: 500;">
                                    📅 ${timeStr}
                                </div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: #2c3e50; margin: 4px 0;">
                                    ${forecast.temp}°C
                                </div>
                                <div style="font-size: 0.95rem; color: #555; margin: 6px 0;">
                                    ${forecast.description}
                                </div>
                                <div style="font-size: 0.85rem; color: #666; margin-top: 6px; display: flex; gap: 12px;">
                                    <span>💨 風速 ${forecast.wind_speed} km/h</span>
                                    <span>💧 濕度 ${forecast.humidity}%</span>
                                </div>
                            </div>
                            <div style="text-align: center; margin-left: 10px;">
                                <img src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" width="70" style="display: block;">
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 6px; font-size: 0.85rem; color: #1976d2;">
                    <i class="fas fa-lightbulb"></i> 資料來源：OpenWeather
                </div>
            </div>`;
            
            // 建立資訊視窗
            const infoWindow = new google.maps.InfoWindow({
                content: html,
                position: location
            });
            
            infoWindow.open(map);
            
        } else {
            const error = await response.json();
            let errorMsg = `
                <div style="padding: 15px; max-width: 300px;">
                    <h3 style="margin: 0 0 10px 0; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle"></i> 無法取得天氣資訊
                    </h3>
            `;
            
            if (error.message) {
                errorMsg += `<p style="font-size: 0.9rem; margin: 0; color: #666;">${error.message}</p>`;
            }
            
            errorMsg += '</div>';
            
            const infoWindow = new google.maps.InfoWindow({
                content: errorMsg,
                position: location
            });
            
            infoWindow.open(map);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('天氣服務暫時無法使用');
    }
}

// 編輯天數
function editDays() {
    const daysElement = document.getElementById('estimatedDays');
    const currentDays = parseInt(daysElement.textContent) || 1;
    const autoCalculated = parseInt(daysElement.dataset.autoCalculated) || currentDays;
    const totalDistance = parseFloat(document.getElementById('totalDistance').textContent) || 0;
    
    // 計算建議的最小和最大天數
    const minDays = totalDistance > 0 ? Math.max(1, Math.ceil(totalDistance / 300)) : 1;
    const maxDays = totalDistance > 0 ? Math.max(minDays, Math.ceil(totalDistance / 100)) : 30;
    
    let promptMessage = `請輸入行程天數：\n\n`;
    
    if (totalDistance > 0) {
        promptMessage += `總距離：${totalDistance} km\n`;
        promptMessage += `系統建議：${autoCalculated} 天（每天約 ${(totalDistance / autoCalculated).toFixed(0)} km）\n`;
        promptMessage += `建議範圍：${minDays} - ${maxDays} 天\n\n`;
    } else {
        promptMessage += `尚未規劃路線\n`;
        promptMessage += `您可以先設定預計天數\n\n`;
    }
    
    promptMessage += `請輸入天數（1-30）：`;
    
    const newDays = prompt(promptMessage, currentDays);
    
    if (newDays === null) {
        return; // 使用者取消
    }
    
    const days = parseInt(newDays);
    
    // 驗證輸入
    if (isNaN(days) || days < 1 || days > 30) {
        alert('請輸入有效的天數（1-30）');
        return;
    }
    
    // 更新天數
    daysElement.textContent = days;
    daysElement.dataset.userEdited = 'true';
    
    // 重新計算費用
    if (totalDistance > 0) {
        calculateCost(totalDistance, days);
        
        // 提示使用者
        const avgDistance = (totalDistance / days).toFixed(0);
        if (days < minDays) {
            alert(`⚠️ 注意：您設定的天數較少，平均每天需騎行 ${avgDistance} km，請評估體力負荷。`);
        } else if (days > maxDays) {
            alert(`✓ 您設定的天數較充裕，平均每天騎行 ${avgDistance} km，可以更輕鬆地享受旅程。`);
        } else {
            alert(`✓ 天數已更新為 ${days} 天，平均每天騎行 ${avgDistance} km。`);
        }
    } else {
        alert(`✓ 天數已設定為 ${days} 天。新增路線點後會自動計算距離和費用。`);
    }
}

// 顯示每日行程規劃對話框
function showDailyPlanModal() {
    if (waypoints.length < 2) {
        alert('請至少新增 2 個路線點');
        return;
    }
    
    const daysElement = document.getElementById('estimatedDays');
    const estimatedDays = parseInt(daysElement.textContent) || 1;
    const isUserEdited = daysElement.dataset.userEdited === 'true';
    const autoCalculated = parseInt(daysElement.dataset.autoCalculated) || estimatedDays;
    
    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    
    // 顯示天數資訊
    if (isUserEdited) {
        html += `<p style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <i class="fas fa-info-circle"></i> 
            使用自訂天數：<strong>${estimatedDays} 天</strong>
            （系統建議：${autoCalculated} 天）
        </p>`;
    } else {
        html += `<p style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <i class="fas fa-calculator"></i> 
            使用系統建議天數：<strong>${estimatedDays} 天</strong>
        </p>`;
    }
    
    html += '<p>請為每一天選擇終點：</p>';
    
    for (let day = 1; day <= estimatedDays; day++) {
        html += `
            <div class="form-group">
                <label for="day${day}End">第 ${day} 天終點</label>
                <select id="day${day}End" class="form-select">
                    <option value="">請選擇</option>
                    ${waypoints.map((wp, index) => 
                        `<option value="${index}">${wp.name}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }
    
    html += '</div>';
    html += `
        <div style="margin-top: 1rem;">
            <button onclick="saveDailyPlan()" class="btn btn-primary">確定</button>
            <button onclick="closeDailyPlanModal()" class="btn btn-secondary">取消</button>
        </div>
    `;
    
    document.getElementById('dailyPlansList').innerHTML = html;
}

// 儲存每日行程規劃
async function saveDailyPlan() {
    const estimatedDays = parseInt(document.getElementById('estimatedDays').textContent);
    const dailyPlans = [];
    
    let startIndex = 0;
    for (let day = 1; day <= estimatedDays; day++) {
        const endIndex = parseInt(document.getElementById(`day${day}End`).value);
        
        if (isNaN(endIndex)) {
            alert(`請選擇第 ${day} 天的終點`);
            return;
        }
        
        dailyPlans.push({
            day: day,
            start: waypoints[startIndex].name,
            end: waypoints[endIndex].name,
            startIndex: startIndex,
            endIndex: endIndex
        });
        
        startIndex = endIndex;
    }
    
    // 計算每日距離
    await calculateDailyDistances(dailyPlans);
}

// 計算每日距離
async function calculateDailyDistances(plans) {
    const directionsService = new google.maps.DirectionsService();
    const dailyPlansWithDistance = [];
    
    // 根據交通工具選擇對應的模式
    let travelMode;
    let avoidHighways = false;
    let avoidTolls = false;
    
    switch(currentTravelMode) {
        case 'DRIVING':
            travelMode = google.maps.TravelMode.DRIVING;
            break;
        case 'TWO_WHEELER':
            travelMode = google.maps.TravelMode.DRIVING;
            avoidHighways = true;
            avoidTolls = true;
            break;
        case 'HEAVY_MOTORCYCLE':
            travelMode = google.maps.TravelMode.DRIVING;
            break;
        case 'BICYCLING':
            travelMode = google.maps.TravelMode.BICYCLING;
            break;
        case 'WALKING':
            travelMode = google.maps.TravelMode.WALKING;
            break;
        default:
            travelMode = google.maps.TravelMode.DRIVING;
    }
    
    // 顯示載入中
    document.getElementById('dailyPlansList').innerHTML = '<p style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> 計算每日距離中...</p>';
    
    // 依序計算每天的距離
    for (const plan of plans) {
        try {
            // 取得該天的路線點
            const dayWaypoints = waypoints.slice(plan.startIndex, plan.endIndex + 1);
            
            if (dayWaypoints.length < 2) {
                dailyPlansWithDistance.push({
                    ...plan,
                    distance: 0,
                    duration: 0
                });
                continue;
            }
            
            // 建立路線請求
            const origin = dayWaypoints[0];
            const destination = dayWaypoints[dayWaypoints.length - 1];
            const waypointsForRoute = dayWaypoints.slice(1, -1).map(wp => ({
                location: new google.maps.LatLng(wp.lat, wp.lng),
                stopover: true
            }));
            
            const request = {
                origin: new google.maps.LatLng(origin.lat, origin.lng),
                destination: new google.maps.LatLng(destination.lat, destination.lng),
                waypoints: waypointsForRoute,
                travelMode: travelMode,
                avoidHighways: avoidHighways,
                avoidTolls: avoidTolls,
                optimizeWaypoints: false
            };
            
            // 使用 Promise 包裝 callback
            const result = await new Promise((resolve, reject) => {
                directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        resolve(result);
                    } else {
                        reject(status);
                    }
                });
            });
            
            // 計算該天的總距離和時間
            let totalDistance = 0;
            let totalDuration = 0;
            const route = result.routes[0];
            for (let i = 0; i < route.legs.length; i++) {
                totalDistance += route.legs[i].distance.value;
                totalDuration += route.legs[i].duration.value;
            }
            
            dailyPlansWithDistance.push({
                ...plan,
                distance: (totalDistance / 1000).toFixed(2),
                duration: (totalDuration / 3600).toFixed(1)
            });
            
        } catch (error) {
            console.error(`計算第 ${plan.day} 天距離失敗:`, error);
            dailyPlansWithDistance.push({
                ...plan,
                distance: 0,
                duration: 0,
                error: true
            });
        }
    }
    
    // 顯示每日行程
    displayDailyPlans(dailyPlansWithDistance);
}

// 顯示每日行程
function displayDailyPlans(plans) {
    // 儲存每日行程資料到全域變數，供儲存功能使用
    window.currentDailyPlans = plans;
    
    let html = '';
    let totalDistance = 0;
    let totalDuration = 0;
    
    plans.forEach(plan => {
        totalDistance += parseFloat(plan.distance || 0);
        totalDuration += parseFloat(plan.duration || 0);
        
        html += `
            <div class="daily-plan-item">
                <div class="daily-plan-header">
                    <strong>第 ${plan.day} 天</strong>
                    ${plan.distance ? `<span style="color: #3498db; font-weight: bold;">${plan.distance} km</span>` : ''}
                </div>
                <div class="daily-plan-content">
                    <div><i class="fas fa-map-marker-alt"></i> 起點：${plan.start}</div>
                    <div><i class="fas fa-flag-checkered"></i> 終點：${plan.end}</div>
                    ${plan.duration ? `<div><i class="fas fa-clock"></i> 騎行時間：約 ${plan.duration} 小時</div>` : ''}
                    ${plan.error ? '<div style="color: #e74c3c; font-size: 0.85rem;"><i class="fas fa-exclamation-triangle"></i> 無法計算距離</div>' : ''}
                </div>
            </div>
        `;
    });
    
    // 添加總計
    if (plans.length > 0 && totalDistance > 0) {
        html += `
            <div class="daily-plan-item" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                <div class="daily-plan-header">
                    <strong>總計</strong>
                </div>
                <div class="daily-plan-content">
                    <div><i class="fas fa-road"></i> 總距離：${totalDistance.toFixed(2)} km</div>
                    <div><i class="fas fa-clock"></i> 總騎行時間：約 ${totalDuration.toFixed(1)} 小時</div>
                    <div><i class="fas fa-calendar-days"></i> 天數：${plans.length} 天</div>
                    <div><i class="fas fa-chart-line"></i> 平均每天：${(totalDistance / plans.length).toFixed(2)} km</div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('dailyPlansList').innerHTML = html;
}

// 關閉每日行程對話框
function closeDailyPlanModal() {
    document.getElementById('dailyPlansList').innerHTML = '<p class="empty-message">新增至少 2 個路線點後可規劃每日行程</p>';
}


// 頁面載入時初始化地圖
window.addEventListener('load', initMap);
