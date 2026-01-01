/**
 * MQTT Client Connection and Message Handling
 */

function connectMQTT() {
    const config = getConfig();
    const url = `${config.protocol}://${config.broker}:${config.port}`;
    const clientId = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        mqttClient = mqtt.connect(url, {
            clientId,
            username: config.username || undefined,
            password: config.password || undefined,
            clean: false,
            reconnectPeriod: 5000,
            connectTimeout: 10000
        });

        mqttClient.on('connect', onMqttConnect);
        mqttClient.on('error', onMqttError);
        mqttClient.on('close', onMqttClose);
        mqttClient.on('message', handleMessage);
    } catch (err) {
        console.error('Connection error:', err);
        updateConnectionStatus(false);
    }
}

function onMqttConnect() {
    updateConnectionStatus(true);
    subscribeToTopics();
    showToast('success', 'Terhubung', 'Berhasil terhubung ke MQTT broker');
}

function onMqttError(err) {
    console.error('MQTT Error:', err);
    updateConnectionStatus(false);
    showToast('error', 'Error', 'Gagal terhubung ke MQTT broker');
}

function onMqttClose() {
    updateConnectionStatus(false);
}

function subscribeToTopics() {
    const topics = [
        'rumah/kamar1/status', 'rumah/kamar1/lampu',
        'rumah/kamar2/status', 'rumah/kamar2/lampu',
        'rumah/kamar3/status', 'rumah/kamar3/lampu',
        'rumah/mesincuci/arus', 'rumah/mesincuci/relay/state',
        'rumah/pompa/arus', 'rumah/pompa/relay/state'
    ];
    topics.forEach(topic => mqttClient.subscribe(topic, { qos: 1 }));
}

function handleMessage(topic, message) {
    const payload = message.toString();
    console.log(`Received: ${topic} = ${payload}`);

    // Room status
    const roomStatusMatch = topic.match(/rumah\/kamar(\d)\/status/);
    if (roomStatusMatch) {
        const roomNum = parseInt(roomStatusMatch[1]);
        roomData[roomNum].occupancy = payload;
        roomData[roomNum].lastUpdate = new Date();
        updateRoomCard(roomNum);
        flashCard(`room-${roomNum}`);
    }

    // Room lamp
    const roomLampMatch = topic.match(/rumah\/kamar(\d)\/lampu/);
    if (roomLampMatch) {
        const roomNum = parseInt(roomLampMatch[1]);
        roomData[roomNum].lamp = payload;
        roomData[roomNum].lastUpdate = new Date();
        updateRoomCard(roomNum);
        flashCard(`room-${roomNum}`);
    }

    // Appliance current
    const currentMatch = topic.match(/rumah\/(mesincuci|pompa)\/arus/);
    if (currentMatch) {
        const device = currentMatch[1];
        const current = parseFloat(payload) || 0;
        applianceData[device].current = current;
        applianceData[device].history.push(current);
        if (applianceData[device].history.length > 20) {
            applianceData[device].history.shift();
        }
        applianceData[device].lastUpdate = new Date();
        updateApplianceCard(device);
        flashCard(`appliance-${device}`);
    }

    // Appliance relay
    const relayMatch = topic.match(/rumah\/(mesincuci|pompa)\/relay\/state/);
    if (relayMatch) {
        const device = relayMatch[1];
        applianceData[device].relay = payload;
        applianceData[device].lastUpdate = new Date();
        updateApplianceCard(device);
        flashCard(`appliance-${device}`);
    }

    updateSystemStatus();
}

function updateConnectionStatus(connected) {
    const dot = document.getElementById('mqttStatusDot');
    const text = document.getElementById('mqttStatusText');
    const status = document.getElementById('connectionStatus');

    if (connected) {
        dot.classList.add('connected');
        text.textContent = 'Connected';
        status.textContent = 'Online';
    } else {
        dot.classList.remove('connected');
        text.textContent = 'Disconnected';
        status.textContent = 'Offline';
    }
}