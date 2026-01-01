/**
 * Simulator Mode Controls
 */

function updateSimulatorControls() {
    const device = document.getElementById('simDevice').value;
    const isRoom = device.startsWith('kamar');

    document.getElementById('roomControls').classList.toggle('hidden', !isRoom);
    document.getElementById('applianceControls').classList.toggle('hidden', isRoom);

    updateTopicInfo();
}

function updateCurrentDisplay() {
    const value = document.getElementById('simCurrent').value;
    document.getElementById('simCurrentValue').textContent = `${parseFloat(value).toFixed(1)} A`;
}

function updateTopicInfo() {
    const device = document.getElementById('simDevice').value;
    const info = document.getElementById('topicInfo');
    let html = '<div class="topic-info-title">📡 Informasi Topic MQTT</div>';

    if (device.startsWith('kamar')) {
        const num = device.replace('kamar', '');
        html += `
            <div class="topic-item">
                <span class="topic-label">Status:</span>
                <span class="topic-value">rumah/kamar${num}/status</span>
            </div>
            <div class="topic-item">
                <span class="topic-label">Lampu:</span>
                <span class="topic-value">rumah/kamar${num}/lampu</span>
            </div>
            <div class="topic-item">
                <span class="topic-label">Payload:</span>
                <span class="topic-value">"OCCUPIED" | "EMPTY" | "ON" | "OFF"</span>
            </div>
        `;
    } else {
        html += `
            <div class="topic-item">
                <span class="topic-label">Arus:</span>
                <span class="topic-value">rumah/${device}/arus</span>
            </div>
            <div class="topic-item">
                <span class="topic-label">Relay:</span>
                <span class="topic-value">rumah/${device}/relay/state</span>
            </div>
            <div class="topic-item">
                <span class="topic-label">Payload:</span>
                <span class="topic-value">"0.00" - "30.00" | "ON" | "OFF"</span>
            </div>
        `;
    }

    info.innerHTML = html;
}

function publishRoomStatus() {
    const device = document.getElementById('simDevice').value;
    const num = device.replace('kamar', '');
    const status = document.querySelector('input[name="simOccupancy"]:checked').value;
    const topic = `rumah/kamar${num}/status`;

    publishMessage(topic, status);
}

function publishRoomLamp() {
    const device = document.getElementById('simDevice').value;
    const num = device.replace('kamar', '');
    const lamp = document.querySelector('input[name="simLamp"]:checked').value;
    const topic = `rumah/kamar${num}/lampu`;

    publishMessage(topic, lamp);
}

function publishApplianceCurrent() {
    const device = document.getElementById('simDevice').value;
    const current = parseFloat(document.getElementById('simCurrent').value).toFixed(2);
    const topic = `rumah/${device}/arus`;

    publishMessage(topic, current);
}

function publishApplianceRelay() {
    const device = document.getElementById('simDevice').value;
    const relay = document.querySelector('input[name="simRelay"]:checked').value;
    const topic = `rumah/${device}/relay/state`;

    publishMessage(topic, relay);
}

function publishMessage(topic, payload) {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    let success = false;

    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(topic, payload, { qos: 1 });
        success = true;
        showToast('success', 'Berhasil', `Pesan dipublikasikan ke ${topic}`);
    } else {
        showToast('error', 'Gagal', 'Tidak terhubung ke MQTT broker');
    }

    // Add to log
    publishLog.unshift({ timestamp, topic, payload, success });
    if (publishLog.length > 10) publishLog.pop();
    renderPublishLog();
}

function renderPublishLog() {
    const content = document.getElementById('logContent');

    if (publishLog.length === 0) {
        content.innerHTML = '<div class="log-empty">Belum ada pesan yang dipublikasikan</div>';
        return;
    }

    content.innerHTML = publishLog.map(entry => `
        <div class="log-entry ${entry.success ? 'success' : 'error'}">
            <span class="log-time">[${entry.timestamp}]</span>
            Topic: <span class="log-topic">${entry.topic}</span> |
            Payload: <span class="log-payload">${entry.payload}</span> |
            Status: ${entry.success ? '✅ Success' : '❌ Failed'}
        </div>
    `).join('');
}