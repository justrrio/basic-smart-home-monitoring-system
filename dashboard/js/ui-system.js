/**
 * System Status UI Management
 */

function updateSystemStatus() {
    // Active devices count
    let active = 0;
    [1, 2, 3].forEach(num => {
        if (roomData[num].lastUpdate) active++;
    });
    ['mesincuci', 'pompa'].forEach(id => {
        if (applianceData[id].lastUpdate) active++;
    });
    document.getElementById('activeDevices').textContent = `${active} / 5`;

    // Total power consumption
    const totalPower = (applianceData.mesincuci.current + applianceData.pompa.current) * VOLTAGE;
    document.getElementById('totalPower').textContent = `${totalPower.toFixed(0)} W`;
}

function updateTimestamps() {
    [1, 2, 3].forEach(num => {
        const el = document.getElementById(`room-${num}-time`);
        if (roomData[num].lastUpdate) {
            el.textContent = getRelativeTime(roomData[num].lastUpdate);
        }
    });

    ['mesincuci', 'pompa'].forEach(id => {
        const el = document.getElementById(`appliance-${id}-time`);
        if (applianceData[id].lastUpdate) {
            el.textContent = getRelativeTime(applianceData[id].lastUpdate);
        }
    });
}

function getRelativeTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 5) return 'Baru saja';
    if (seconds < 60) return `${seconds} detik lalu`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    return `${hours} jam lalu`;
}

function flashCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.add('data-update');
        setTimeout(() => card.classList.remove('data-update'), 500);
    }
}