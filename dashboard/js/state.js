/**
 * Application State Management
 */

// MQTT Client instance
let mqttClient = null;

// Current dashboard mode
let currentMode = 'monitor';

// Simulator publish log
let publishLog = [];

// Room data state
const roomData = {
    1: { occupancy: 'EMPTY', lamp: 'OFF', lastUpdate: null },
    2: { occupancy: 'EMPTY', lamp: 'OFF', lastUpdate: null },
    3: { occupancy: 'EMPTY', lamp: 'OFF', lastUpdate: null }
};

// Appliance data state
const applianceData = {
    mesincuci: { current: 0, relay: 'OFF', history: [], lastUpdate: null },
    pompa: { current: 0, relay: 'OFF', history: [], lastUpdate: null }
};