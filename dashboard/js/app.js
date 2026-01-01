/**
 * Application Entry Point
 * Initialize all components on DOM ready
 */

document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    loadSettings();
    
    // Render UI components
    renderRoomCards();
    renderApplianceCards();
    updateSimulatorControls();
    
    // Connect to MQTT broker
    connectMQTT();
    
    // Start timestamp update interval
    setInterval(updateTimestamps, 1000);
    
    console.log('Smart Home Dashboard initialized');
});