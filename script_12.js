const API_URL = 'https://api.fda.gov/drug/enforcement.json?limit=20&sort=report_date:desc';
const BAD_URL = 'https://api.fda.gov/drug/enforcement.json?limit=abc&search=%%%';

const statusEl = document.getElementById('status');
const tbody = document.getElementById('table-body');
const loadBtn = document.getElementById('load-btn');
const errorBtn = document.getElementById('error-btn');

let allRecords = [];
let activeFilter = 'all';

function showStatus(type, text) {
    statusEl.textContent = '';
    statusEl.setAttribute('class', 'status show ' + type);
    if (type === 'loading') {
        const spin = document.createElement('div');
        spin.setAttribute('class', 'spinner');
        statusEl.appendChild(spin);
    }
    const msg = document.createElement('span');
    msg.textContent = text;
    statusEl.appendChild(msg);
}

function hideStatus() {
    statusEl.setAttribute('class', 'status');
}

// Fetch data from an endpoint
async function fetchRecalls(url) {
    loadBtn.disabled = true;
    errorBtn.disabled = true;
    showStatus('loading', 'Loading data from the endpoint...');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Server replied with status ' + response.status +
                (response.status === 404 ? ' (no matching records)' : ''));
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('The endpoint returned no records.');
        }
        allRecords = data.results;
        render();
        showStatus('ok', 'Loaded ' + allRecords.length + ' records successfully.');
        document.getElementById('source-note').textContent = 'Source: ' + url;
    } catch (error) {
        allRecords = [];
        render();
        const offline = error instanceof TypeError;
        showStatus('error', offline
            ? 'Could not reach the endpoint. Check your internet connection and try again.'
            : 'Something went wrong: ' + error.message);
    } finally {
        loadBtn.disabled = false;
        errorBtn.disabled = false;
    }
}

function formatDate(value) {
    if (!value || value.length !== 8) return 'N/A';
    return value.slice(6, 8) + '-' + value.slice(4, 6) + '-' + value.slice(0, 4);
}

function shorten(text, max) {
    if (!text) return 'N/A';
    return text.length > max ? text.slice(0, max) + '...' : text;
}

function makeCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

// Build the table from the data
function render() {
    tbody.textContent = '';
    const rows = allRecords.filter(function (r) {
        return activeFilter === 'all' || r.classification === activeFilter;
    });

    if (rows.length === 0) {
        const tr = document.createElement('tr');
        const td = makeCell(allRecords.length === 0
            ? 'No data to show.'
            : 'No records match this filter.');
        td.setAttribute('colspan', '6');
        td.setAttribute('class', 'empty');
        tr.appendChild(td);
        tbody.appendChild(tr);
    }

    rows.forEach(function (r) {
        const tr = document.createElement('tr');
        tr.appendChild(makeCell(shorten(r.product_description, 90)));
        tr.appendChild(makeCell(r.recalling_firm || 'N/A'));

        const classCell = document.createElement('td');
        const tag = document.createElement('span');
        const roman = (r.classification || '').replace('Class ', '');
        tag.setAttribute('class', 'tag class-' + roman);
        tag.textContent = r.classification || 'N/A';
        classCell.appendChild(tag);
        tr.appendChild(classCell);

        tr.appendChild(makeCell(r.status || 'N/A'));
        tr.appendChild(makeCell(formatDate(r.report_date)));
        tr.appendChild(makeCell(shorten(r.reason_for_recall, 110)));
        tbody.appendChild(tr);
    });

    updateSummary();
}

function updateSummary() {
    const count = function (c) {
        return allRecords.filter(function (r) { return r.classification === c; }).length;
    };
    document.getElementById('s-total').textContent = allRecords.length;
    document.getElementById('s-1').textContent = count('Class I');
    document.getElementById('s-2').textContent = count('Class II');
    document.getElementById('s-3').textContent = count('Class III');
}

// Events
loadBtn.addEventListener('click', function () { fetchRecalls(API_URL); });
errorBtn.addEventListener('click', function () { fetchRecalls(BAD_URL); });

document.getElementById('clear-btn').addEventListener('click', function () {
    allRecords = [];
    render();
    hideStatus();
    document.getElementById('source-note').textContent = '';
});

document.querySelectorAll('#filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('#filters button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        render();
    });
});

// Load data when the page opens
fetchRecalls(API_URL);
