// ===== Data (kept in memory, no page reload needed) =====
let medicines = [
    { id: 1, name: 'Paracetamol 500 mg', category: 'Tablets and Capsules', qty: 120 },
    { id: 2, name: 'Vitamin D3', category: 'Vitamins and Supplements', qty: 8 },
    { id: 3, name: 'Digital Thermometer', category: 'Healthcare Products', qty: 35 }
];
let nextId = 4;
let editingId = null;
const LOW_STOCK = 10;

// ===== Element references =====
const nameInput = document.getElementById('med-name');
const categoryInput = document.getElementById('med-category');
const qtyInput = document.getElementById('med-qty');
const messageEl = document.getElementById('form-message');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const searchBox = document.getElementById('search-box');
const listEl = document.getElementById('med-list');

// Stops typed text from being treated as HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.setAttribute('class', 'message ' + type);
}

// ===== Display =====
function render() {
    const term = searchBox.value.trim().toLowerCase();
    listEl.innerHTML = '';

    const visible = medicines.filter(function (m) {
        return m.name.toLowerCase().includes(term) || m.category.toLowerCase().includes(term);
    });

    if (visible.length === 0) {
        const empty = document.createElement('li');
        empty.setAttribute('class', 'empty');
        empty.textContent = medicines.length === 0
            ? 'No medicines yet. Add your first one using the form.'
            : 'No medicines match your search.';
        listEl.appendChild(empty);
    }

    visible.forEach(function (m) {
        const li = document.createElement('li');
        li.setAttribute('class', 'med-item' + (m.qty <= LOW_STOCK ? ' low' : '') + (m.id === editingId ? ' editing' : ''));
        li.setAttribute('data-id', m.id);

        const lowBadge = m.qty <= LOW_STOCK ? '<span class="badge">Low stock</span>' : '';
        li.innerHTML =
            '<div class="med-info">' +
                '<span class="med-name">' + escapeHtml(m.name) + lowBadge + '</span>' +
                '<span class="med-meta">' + escapeHtml(m.category) + ' &middot; ' + m.qty + ' in stock</span>' +
            '</div>';

        const actions = document.createElement('div');
        actions.setAttribute('class', 'med-actions');

        const editBtn = document.createElement('button');
        editBtn.setAttribute('class', 'btn btn-small btn-edit');
        editBtn.setAttribute('aria-label', 'Edit ' + m.name);
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () { startEdit(m.id); });

        const delBtn = document.createElement('button');
        delBtn.setAttribute('class', 'btn btn-small btn-danger');
        delBtn.setAttribute('aria-label', 'Remove ' + m.name);
        delBtn.style.marginTop = '0';
        delBtn.textContent = 'Remove';
        delBtn.addEventListener('click', function () { removeMedicine(m.id, li); });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(actions);
        listEl.appendChild(li);
    });

    updateSummary();
}

function updateSummary() {
    let units = 0;
    let low = 0;
    medicines.forEach(function (m) {
        units += m.qty;
        if (m.qty <= LOW_STOCK) low++;
    });
    document.getElementById('total-items').textContent = medicines.length;
    document.getElementById('total-units').textContent = units;
    document.getElementById('low-items').textContent = low;
}

// ===== Add / Modify =====
function resetForm() {
    nameInput.value = '';
    categoryInput.value = '';
    qtyInput.value = '';
    editingId = null;
    formTitle.textContent = 'Add a medicine';
    saveBtn.textContent = 'Add medicine';
    cancelBtn.style.display = 'none';
}

function startEdit(id) {
    const m = medicines.find(function (item) { return item.id === id; });
    editingId = id;
    nameInput.value = m.name;
    categoryInput.value = m.category;
    qtyInput.value = m.qty;
    formTitle.textContent = 'Edit medicine';
    saveBtn.textContent = 'Save changes';
    cancelBtn.style.display = 'inline-block';
    showMessage('Editing "' + m.name + '". Change the details and save.', 'ok');
    nameInput.focus();
    render();
}

saveBtn.addEventListener('click', function () {
    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const qty = parseInt(qtyInput.value, 10);

    if (name === '' || category === '') {
        showMessage('Enter both a medicine name and a category.', 'error');
        return;
    }
    if (isNaN(qty) || qty < 0) {
        showMessage('Enter a quantity of 0 or more.', 'error');
        return;
    }

    if (editingId === null) {
        medicines.push({ id: nextId++, name: name, category: category, qty: qty });
        showMessage('"' + name + '" added.', 'ok');
    } else {
        const m = medicines.find(function (item) { return item.id === editingId; });
        m.name = name;
        m.category = category;
        m.qty = qty;
        showMessage('"' + name + '" updated.', 'ok');
    }
    resetForm();
    render();
});

cancelBtn.addEventListener('click', function () {
    resetForm();
    showMessage('Edit cancelled.', 'ok');
    render();
});

// ===== Remove =====
function removeMedicine(id, li) {
    const m = medicines.find(function (item) { return item.id === id; });
    medicines = medicines.filter(function (item) { return item.id !== id; });
    if (editingId === id) resetForm();
    li.remove();
    updateSummary();
    showMessage('"' + m.name + '" removed.', 'ok');
    if (medicines.length === 0) render();
}

document.getElementById('clear-btn').addEventListener('click', function () {
    if (medicines.length === 0) {
        showMessage('The list is already empty.', 'error');
        return;
    }
    medicines = [];
    resetForm();
    showMessage('All medicines removed.', 'ok');
    render();
});

// ===== Search =====
searchBox.addEventListener('input', render);

// Press Enter in any form field to save
document.querySelector('#add-section').querySelectorAll('input').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') saveBtn.click();
    });
});

render();
console.log('Inventory ready: ' + document.querySelector('#med-list').children.length + ' item(s).');
