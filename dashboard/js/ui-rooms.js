/**
 * Room Cards UI Management
 */

function renderRoomCards() {
    const grid = document.getElementById('roomsGrid');
    grid.innerHTML = [1, 2, 3].map(num => `
        <div class="card" id="room-${num}">
            <div class="card-header">
                <div class="card-title">
                    <span class="card-title-icon">🛏️</span>
                    Kamar ${num}
                </div>
                <span class="badge ${roomData[num].occupancy === 'OCCUPIED' ? 'occupied' : 'empty'}" id="room-${num}-badge">
                    ${roomData[num].occupancy === 'OCCUPIED' ? 'Berpenghuni' : 'Kosong'}
                </span>
            </div>
            <div class="card-body">
                <div class="room-visual">
                    <div class="lamp-icon ${roomData[num].lamp === 'ON' ? 'on' : ''}" id="room-${num}-lamp">
                        ${roomData[num].lamp === 'ON' ? '💡' : '⚫'}
                    </div>
                </div>
                <div class="room-status">
                    <span class="room-status-icon">${roomData[num].occupancy === 'OCCUPIED' ? '👤' : '🚫'}</span>
                    <span id="room-${num}-status-text">${roomData[num].occupancy === 'OCCUPIED' ? 'Ruangan berpenghuni' : 'Ruangan kosong'}</span>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">Kontrol Lampu</span>
                    <div class="toggle-switch ${roomData[num].lamp === 'ON' ? 'on' : ''}" 
                         id="room-${num}-toggle" 
                         onclick="toggleRoomLamp(${num})"></div>
                </div>
            </div>
            <div class="card-footer">
                <span>🕐</span>
                <span id="room-${num}-time">Menunggu data...</span>
            </div>
        </div>
    `).join('');
}

function updateRoomCard(num) {
    const data = roomData[num];
    
    // Badge
    const badge = document.getElementById(`room-${num}-badge`);
    badge.className = `badge ${data.occupancy === 'OCCUPIED' ? 'occupied' : 'empty'}`;
    badge.textContent = data.occupancy === 'OCCUPIED' ? 'Berpenghuni' : 'Kosong';

    // Lamp icon
    const lamp = document.getElementById(`room-${num}-lamp`);
    lamp.className = `lamp-icon ${data.lamp === 'ON' ? 'on' : ''}`;
    lamp.textContent = data.lamp === 'ON' ? '💡' : '⚫';

    // Status text
    const statusText = document.getElementById(`room-${num}-status-text`);
    statusText.textContent = data.occupancy === 'OCCUPIED' ? 'Ruangan berpenghuni' : 'Ruangan kosong';

    // Toggle
    const toggle = document.getElementById(`room-${num}-toggle`);
    toggle.className = `toggle-switch ${data.lamp === 'ON' ? 'on' : ''}`;
}

function toggleRoomLamp(num) {
    const data = roomData[num];
    const newState = data.lamp === 'ON' ? 'OFF' : 'ON';

    // Safety check - cannot turn off lamp if room is occupied
    if (newState === 'OFF' && data.occupancy === 'OCCUPIED') {
        showToast('warning', 'Keamanan', 'Tidak dapat mematikan lampu - Ruangan berpenghuni');
        return;
    }

    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(`rumah/kamar${num}/lampu/set`, newState, { qos: 1 });
        
        // Optimistic update - langsung update UI tanpa tunggu response ESP
        roomData[num].lamp = newState;
        roomData[num].lastUpdate = new Date();
        updateRoomCard(num);
        
        showToast('info', 'Perintah Dikirim', `Lampu Kamar ${num}: ${newState}`);
    } else {
        showToast('error', 'Error', 'Tidak terhubung ke MQTT broker');
    }
}