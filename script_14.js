const products = [
    { id: 1, name: 'Paracetamol 500 mg', category: 'Tablets and Capsules', type: 'OTC', price: 25, use: 'Fever and mild pain relief', form: 'Tablet', pack: '15 tablets' },
    { id: 2, name: 'Amoxicillin 250 mg', category: 'Tablets and Capsules', type: 'Prescription', price: 90, use: 'Bacterial infections', form: 'Capsule', pack: '10 capsules' },
    { id: 3, name: 'Cetirizine 10 mg', category: 'Tablets and Capsules', type: 'OTC', price: 35, use: 'Allergy and cold symptoms', form: 'Tablet', pack: '10 tablets' },
    { id: 4, name: 'Vitamin D3 60K', category: 'Vitamins and Supplements', type: 'OTC', price: 70, use: 'Bone and immune support', form: 'Softgel', pack: '4 softgels' },
    { id: 5, name: 'Multivitamin Daily', category: 'Vitamins and Supplements', type: 'OTC', price: 220, use: 'Everyday nutrition', form: 'Tablet', pack: '30 tablets' },
    { id: 6, name: 'Iron and Folic Acid', category: 'Vitamins and Supplements', type: 'Prescription', price: 55, use: 'Anaemia and pregnancy care', form: 'Tablet', pack: '30 tablets' },
    { id: 7, name: 'Digital Thermometer', category: 'Healthcare Products', type: 'OTC', price: 180, use: 'Measuring body temperature', form: 'Device', pack: '1 unit' },
    { id: 8, name: 'Hand Sanitizer 200 ml', category: 'Healthcare Products', type: 'OTC', price: 95, use: 'Hand hygiene', form: 'Liquid', pack: '200 ml' },
    { id: 9, name: 'First Aid Kit', category: 'Healthcare Products', type: 'OTC', price: 450, use: 'Minor cuts and burns', form: 'Kit', pack: '1 kit' }
];

const COLORS = { 'Tablets and Capsules': '#0b6e75', 'Vitamins and Supplements': '#f2a900', 'Healthcare Products': '#2f855a' };
const MAX_COMPARE = 2;

const grid = document.querySelector('#product-grid');
const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const typeSelect = document.querySelector('#type');
const countEl = document.querySelector('#result-count');
const toast = document.querySelector('#toast');

let selectedIds = [];
let toastTimer = null;

// Picture for each product (drawn as SVG so no image files are needed)
function makeImage(product) {
    const color = COLORS[product.category];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="130">' +
        '<rect width="300" height="130" fill="' + color + '" opacity="0.18"/>' +
        '<circle cx="150" cy="65" r="42" fill="' + color + '"/>' +
        '<text x="150" y="78" font-size="38" font-family="Arial" font-weight="700" fill="#ffffff" text-anchor="middle">' +
        product.name.charAt(0) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2500);
}

// ===== Search and filter =====
function getFiltered() {
    const term = searchInput.value.trim().toLowerCase();
    return products.filter(function (p) {
        const matchText = p.name.toLowerCase().includes(term) || p.use.toLowerCase().includes(term);
        const matchCategory = categorySelect.value === 'all' || p.category === categorySelect.value;
        const matchType = typeSelect.value === 'all' || p.type === typeSelect.value;
        return matchText && matchCategory && matchType;
    });
}

function renderProducts() {
    const list = getFiltered();
    grid.innerHTML = '';
    countEl.textContent = 'Showing ' + list.length + ' of ' + products.length + ' products';

    if (list.length === 0) {
        const none = document.createElement('div');
        none.classList.add('no-results');
        none.textContent = 'No products match your search. Try different words or reset the filters.';
        grid.appendChild(none);
        return;
    }

    list.forEach(function (p) {
        const card = document.createElement('div');
        card.classList.add('product');
        if (selectedIds.includes(p.id)) card.classList.add('selected');

        const img = document.createElement('img');
        img.src = makeImage(p);
        img.alt = p.name;

        const badge = document.createElement('span');
        badge.classList.add('badge');
        if (p.type === 'Prescription') badge.classList.add('rx');
        badge.textContent = p.type === 'OTC' ? 'OTC' : 'Rx only';

        const title = document.createElement('h3');
        title.textContent = p.name;
        const use = document.createElement('p');
        use.textContent = p.use;
        const cat = document.createElement('p');
        cat.textContent = p.category;

        const bottom = document.createElement('div');
        bottom.classList.add('product-bottom');
        const price = document.createElement('span');
        price.classList.add('price');
        price.textContent = '\u20B9' + p.price;

        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-small', 'btn-ghost');
        btn.textContent = selectedIds.includes(p.id) ? 'Selected' : 'Compare';
        btn.addEventListener('click', function () { toggleCompare(p.id, card, btn); });

        bottom.appendChild(price);
        bottom.appendChild(btn);
        card.appendChild(img);
        card.appendChild(badge);
        card.appendChild(title);
        card.appendChild(use);
        card.appendChild(cat);
        card.appendChild(bottom);
        grid.appendChild(card);
    });
}

// ===== Compare =====
function toggleCompare(id, card, btn) {
    if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter(function (x) { return x !== id; });
        card.classList.remove('selected');
        btn.textContent = 'Compare';
    } else {
        if (selectedIds.length >= MAX_COMPARE) {
            showToast('You can compare only ' + MAX_COMPARE + ' products. Remove one first.');
            return;
        }
        selectedIds.push(id);
        card.classList.add('selected');
        btn.textContent = 'Selected';
    }
    card.classList.toggle('selected', selectedIds.includes(id));
    renderCompare();
}

function renderCompare() {
    const table = document.querySelector('#compare-table');
    const hint = document.querySelector('#compare-hint');
    table.innerHTML = '';

    if (selectedIds.length < MAX_COMPARE) {
        hint.textContent = selectedIds.length === 0
            ? 'Select the "Compare" button on any two products.'
            : 'Select one more product to compare.';
        return;
    }
    hint.textContent = 'Comparison of your selected products. The cheaper price is highlighted.';

    const a = products.find(function (p) { return p.id === selectedIds[0]; });
    const b = products.find(function (p) { return p.id === selectedIds[1]; });

    const rows = [
        ['', a.name, b.name],
        ['Category', a.category, b.category],
        ['Use', a.use, b.use],
        ['Form', a.form, b.form],
        ['Pack size', a.pack, b.pack],
        ['Availability', a.type === 'OTC' ? 'Over the counter' : 'Prescription only', b.type === 'OTC' ? 'Over the counter' : 'Prescription only'],
        ['Price', '\u20B9' + a.price, '\u20B9' + b.price]
    ];

    rows.forEach(function (row, i) {
        row.forEach(function (text, col) {
            const cell = document.createElement('div');
            if (i === 0) cell.classList.add('head');
            else if (col === 0) cell.classList.add('label');
            if (row[0] === 'Price' && col > 0 && a.price !== b.price) {
                const cheaper = a.price < b.price ? 1 : 2;
                if (col === cheaper) cell.classList.add('win');
            }
            cell.textContent = text;
            table.appendChild(cell);
        });
    });
    document.querySelector('#compare').scrollIntoView({ behavior: 'smooth' });
}

document.querySelector('#clear-compare').addEventListener('click', function () {
    selectedIds = [];
    renderCompare();
    renderProducts();
});

// ===== Events =====
searchInput.addEventListener('input', renderProducts);
categorySelect.addEventListener('change', renderProducts);
typeSelect.addEventListener('change', renderProducts);

document.querySelector('#reset-filters').addEventListener('click', function () {
    searchInput.value = '';
    categorySelect.value = 'all';
    typeSelect.value = 'all';
    renderProducts();
});

// Accordion: only one answer open at a time
const allDetails = document.querySelectorAll('details');
allDetails.forEach(function (d) {
    d.addEventListener('toggle', function () {
        if (d.open) {
            allDetails.forEach(function (other) {
                if (other !== d) other.removeAttribute('open');
            });
        }
    });
});

renderProducts();
renderCompare();
