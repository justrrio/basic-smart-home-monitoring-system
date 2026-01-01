/**
 * Mode Switching (Monitor / Simulator)
 */

function toggleModeDropdown() {
    document.getElementById('modeDropdown').classList.toggle('show');
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('modeDropdown').classList.remove('show');

    // Update button
    const icon = document.getElementById('modeBtnIcon');
    const text = document.getElementById('modeBtnText');

    if (mode === 'monitor') {
        icon.textContent = '📊';
        text.textContent = 'Monitor';
    } else {
        icon.textContent = '🔧';
        text.textContent = 'Simulator';
    }

    // Update dropdown options
    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.mode === mode);
    });

    // Toggle views
    document.getElementById('monitorMode').classList.toggle('hidden', mode !== 'monitor');
    document.getElementById('simulatorMode').classList.toggle('hidden', mode !== 'simulator');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.mode-switcher')) {
        document.getElementById('modeDropdown').classList.remove('show');
    }
});