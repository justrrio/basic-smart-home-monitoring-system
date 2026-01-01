/**
 * Settings Modal and Configuration Management
 */

function openSettingsModal() {
    const config = getConfig();
    document.getElementById('mqttBroker').value = config.broker;
    document.getElementById('mqttPort').value = config.port;
    document.getElementById('mqttUsername').value = config.username;
    document.getElementById('mqttPassword').value = config.password;
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
    const config = {
        broker: document.getElementById('mqttBroker').value || 'localhost',
        port: parseInt(document.getElementById('mqttPort').value) || 9001,
        protocol: 'ws',
        username: document.getElementById('mqttUsername').value,
        password: document.getElementById('mqttPassword').value
    };

    localStorage.setItem('mqttConfig', JSON.stringify(config));
    closeSettingsModal();

    // Reconnect with new settings
    if (mqttClient) {
        mqttClient.end(true);
    }
    connectMQTT();
    showToast('info', 'Pengaturan Disimpan', 'Menghubungkan ulang ke broker...');
}

function loadSettings() {
    const saved = localStorage.getItem('mqttConfig');
    if (saved) {
        Object.assign(MQTT_CONFIG, JSON.parse(saved));
    }
}

function getConfig() {
    const saved = localStorage.getItem('mqttConfig');
    return saved ? JSON.parse(saved) : MQTT_CONFIG;
}