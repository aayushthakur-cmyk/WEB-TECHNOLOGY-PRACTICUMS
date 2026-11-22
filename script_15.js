const STORAGE_KEY = 'pharmacare_settings';
const LOW_STOCK = 10;

// Default state of each switch
const defaults = { dark: false, alerts: true, prices: true, large: false };

const toggles = {
    dark: document.getElementById('dark-toggle'),
    alerts: document.getElementById('alert-toggle'),
    prices: document.getElementById('price-toggle'),
    large: document.getElementById('text-toggle')
};
const statusEl = document.getElementById('status');

// ===== Local Storage =====
function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return Object.assign({}, defaults, JSON.parse(saved));
    } catch (error) {
        console.error('Could not read saved settings:', error);
    }
    return Object.assign({}, defaults);
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        statusEl.textContent = 'Could not save settings in this browser.';
    }
}

function readSettings() {
    return {
        dark: toggles.dark.checked,
        alerts: toggles.alerts.checked,
        prices: toggles.prices.checked,
        large: toggles.large.checked
    };
}

// ===== Change the application behaviour =====
function applySettings(settings) {
    // classList.toggle(name, force) adds or removes the class
    document.body.classList.toggle('dark', settings.dark);
    document.body.classList.toggle('hide-alerts', !settings.alerts);
    document.body.classList.toggle('hide-prices', !settings.prices);
    document.body.classList.toggle('large-text', settings.large);

    // Low stock highlight
    document.querySelectorAll('.stock-item').forEach(function (item) {
        const isLow = Number(item.dataset.qty) <= LOW_STOCK;
        item.classList.toggle('low', settings.alerts && isLow);
    });
}

function describe(settings) {
    const on = [];
    if (settings.dark) on.push('Dark mode');
    if (settings.alerts) on.push('Low stock alerts');
    if (settings.prices) on.push('Prices shown');
    if (settings.large) on.push('Large text');
    statusEl.textContent = on.length === 0 ? 'All settings are off.' : 'Active: ' + on.join(', ') + '.';
}

function setSwitches(settings) {
    toggles.dark.checked = settings.dark;
    toggles.alerts.checked = settings.alerts;
    toggles.prices.checked = settings.prices;
    toggles.large.checked = settings.large;
}

// When any switch changes: apply, describe and save
Object.keys(toggles).forEach(function (key) {
    toggles[key].addEventListener('change', function () {
        const settings = readSettings();
        applySettings(settings);
        describe(settings);
        saveSettings(settings);
    });
});

document.getElementById('reset-btn').addEventListener('click', function () {
    setSwitches(defaults);
    applySettings(defaults);
    describe(defaults);
    saveSettings(defaults);
});

// On page load: restore the saved choices
const startSettings = loadSettings();
setSwitches(startSettings);
applySettings(startSettings);
describe(startSettings);
