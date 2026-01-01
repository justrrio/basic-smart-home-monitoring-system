/**
 * Appliance Cards UI Management
 */

function renderApplianceCards() {
    const grid = document.getElementById('appliancesGrid');
    const devices = [
        { id: 'mesincuci', name: 'Mesin Cuci', icon: '🧺' },
        { id: 'pompa', name: 'Pompa Air', icon: '💧' }
    ];

    grid.innerHTML = devices.map(device => `
        <div class="card" id="appliance-${device.id}">
            <div class="card-header">
                <div class="card-title">
                    <span class="card-title-icon">${device.icon}</span>
                    ${device.name}
                </div>
                <span class="badge ${applianceData[device.id].relay === 'ON' ? 'running' : 'stopped'}" id="appliance-${device.id}-badge">
                    ${applianceData[device.id].relay === 'ON' ? 'Aktif' : 'Mati'}
                </span>
            </div>
            <div class="card-body">
                <div class="appliance-hero">
                    <div class="current-value">
                        <span id="appliance-${device.id}-current">${applianceData[device.id].current.toFixed(2)}</span>
                        <span class="current-unit">A</span>
                    </div>
                    <div class="power-estimate" id="appliance-${device.id}-power">
                        ≈ ${(applianceData[device.id].current * VOLTAGE).toFixed(0)} W
                    </div>
                </div>
                <div class="sparkline-container">
                    <svg class="sparkline" id="sparkline-${device.id}" viewBox="0 0 200 44" preserveAspectRatio="none" style="display:none;"></svg>
                    <div class="sparkline-placeholder" id="sparkline-${device.id}-placeholder">
                        📊 Grafik muncul setelah ada data
                    </div>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">Kontrol Relay</span>
                    <div class="toggle-switch ${applianceData[device.id].relay === 'ON' ? 'on' : ''}" 
                         id="appliance-${device.id}-toggle" 
                         onclick="toggleApplianceRelay('${device.id}')"></div>
                </div>
            </div>
            <div class="card-footer">
                <span>🕐</span>
                <span id="appliance-${device.id}-time">Menunggu data...</span>
            </div>
        </div>
    `).join('');
}

function updateApplianceCard(deviceId) {
    const data = applianceData[deviceId];

    // Badge
    const badge = document.getElementById(`appliance-${deviceId}-badge`);
    badge.className = `badge ${data.relay === 'ON' ? 'running' : 'stopped'}`;
    badge.textContent = data.relay === 'ON' ? 'Aktif' : 'Mati';

    // Current value
    document.getElementById(`appliance-${deviceId}-current`).textContent = data.current.toFixed(2);
    document.getElementById(`appliance-${deviceId}-power`).textContent = `≈ ${(data.current * VOLTAGE).toFixed(0)} W`;

    // Toggle
    const toggle = document.getElementById(`appliance-${deviceId}-toggle`);
    toggle.className = `toggle-switch ${data.relay === 'ON' ? 'on' : ''}`;

    // Sparkline
    updateSparkline(deviceId);
}

function updateSparkline(deviceId) {
    const svg = document.getElementById(`sparkline-${deviceId}`);
    const placeholder = document.getElementById(`sparkline-${deviceId}-placeholder`);
    const history = applianceData[deviceId].history;

    if (history.length < 2) {
        svg.innerHTML = '';
        svg.style.display = 'none';
        placeholder.style.display = 'flex';
        return;
    }

    // Hide placeholder, show sparkline
    placeholder.style.display = 'none';
    svg.style.display = 'block';

    const max = Math.max(...history, 1);
    const width = 200;
    const height = 44;
    const padding = 2;

    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - padding - ((val / max) * (height - padding * 2));
        return `${x},${y}`;
    });

    const pathD = `M${points.join(' L')}`;
    const areaD = `M0,${height} L${points.join(' L')} L${width},${height} Z`;

    svg.innerHTML = `
        <path class="sparkline-area" d="${areaD}"></path>
        <path class="sparkline-path" d="${pathD}"></path>
    `;
}

function toggleApplianceRelay(deviceId) {
    const data = applianceData[deviceId];
    const newState = data.relay === 'ON' ? 'OFF' : 'ON';

    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(`rumah/${deviceId}/relay/set`, newState, { qos: 1 });
        
        // Optimistic update - langsung update UI tanpa tunggu response ESP
        applianceData[deviceId].relay = newState;
        applianceData[deviceId].lastUpdate = new Date();
        updateApplianceCard(deviceId);
        
        const name = deviceId === 'mesincuci' ? 'Mesin Cuci' : 'Pompa Air';
        showToast('info', 'Perintah Dikirim', `${name}: ${newState}`);
    } else {
        showToast('error', 'Error', 'Tidak terhubung ke MQTT broker');
    }
}