const STORAGE_KEY = 'pharmacare_tasks';
const STATUSES = ['To Do', 'In Progress', 'Done'];
const DEPARTMENTS = ['Dispensing', 'Inventory', 'Quality Control', 'Customer Care'];

let tasks = loadTasks();
let editingId = null;
let activeFilter = 'All';

const form = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const deptInput = document.getElementById('department');
const priorityInput = document.getElementById('priority');
const dueInput = document.getElementById('due');
const statusInput = document.getElementById('status');
const messageEl = document.getElementById('form-message');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const listEl = document.getElementById('task-list');

// ===== Local Storage =====
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (error) {
        console.error('Could not read saved tasks:', error);
    }
    // First visit: sample tasks
    return [
        { id: 1, title: 'Check expiry dates on shelf B', description: 'Remove anything expiring this month.', department: 'Inventory', priority: 'High', due: dateOffset(1), status: 'To Do' },
        { id: 2, title: 'Calibrate lab balance', description: 'Monthly calibration before batch testing.', department: 'Quality Control', priority: 'Medium', due: dateOffset(3), status: 'In Progress' },
        { id: 3, title: 'Call patients for refill reminders', description: '', department: 'Customer Care', priority: 'Low', due: dateOffset(-1), status: 'Done' }
    ];
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        showMessage('Could not save to your browser storage.', 'error');
    }
}

function dateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function nextId() {
    return tasks.length === 0 ? 1 : Math.max.apply(null, tasks.map(function (t) { return t.id; })) + 1;
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.setAttribute('class', 'message ' + type);
}

// ===== READ: show the task list =====
function renderTasks() {
    listEl.textContent = '';
    const visible = tasks.filter(function (t) {
        return activeFilter === 'All' || t.status === activeFilter;
    });

    if (visible.length === 0) {
        const empty = document.createElement('li');
        empty.setAttribute('class', 'empty');
        empty.textContent = tasks.length === 0 ? 'No tasks yet. Add your first task.' : 'No tasks in this status.';
        listEl.appendChild(empty);
    }

    const today = dateOffset(0);

    visible.forEach(function (t) {
        const li = document.createElement('li');
        li.setAttribute('class', 'task p-' + t.priority + (t.status === 'Done' ? ' done' : '') + (t.id === editingId ? ' editing' : ''));

        const top = document.createElement('div');
        top.setAttribute('class', 'task-top');
        const title = document.createElement('p');
        title.setAttribute('class', 'task-title');
        title.textContent = t.title;
        top.appendChild(title);
        li.appendChild(top);

        if (t.description) {
            const desc = document.createElement('p');
            desc.setAttribute('class', 'task-desc');
            desc.textContent = t.description;
            li.appendChild(desc);
        }

        const meta = document.createElement('div');
        meta.setAttribute('class', 'task-meta');
        const overdue = t.status !== 'Done' && t.due < today;
        [t.department, t.priority + ' priority', (overdue ? 'Overdue: ' : 'Due: ') + t.due].forEach(function (text, i) {
            const chip = document.createElement('span');
            chip.setAttribute('class', 'chip' + (i === 2 && overdue ? ' overdue' : ''));
            chip.textContent = text;
            meta.appendChild(chip);
        });
        li.appendChild(meta);

        const actions = document.createElement('div');
        actions.setAttribute('class', 'task-actions');

        // UPDATE status
        const statusSelect = document.createElement('select');
        statusSelect.setAttribute('aria-label', 'Status for ' + t.title);
        STATUSES.forEach(function (s) {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            if (s === t.status) opt.selected = true;
            statusSelect.appendChild(opt);
        });
        statusSelect.addEventListener('change', function () {
            const task = tasks.find(function (x) { return x.id === t.id; });
            task.status = statusSelect.value;
            saveTasks();
            renderTasks();
        });

        // UPDATE details
        const editBtn = document.createElement('button');
        editBtn.setAttribute('class', 'btn btn-small btn-edit');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () { startEdit(t.id); });

        // DELETE
        const delBtn = document.createElement('button');
        delBtn.setAttribute('class', 'btn btn-small btn-danger');
        delBtn.style.marginTop = '0';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', function () { deleteTask(t.id, li); });

        actions.appendChild(statusSelect);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(actions);
        listEl.appendChild(li);
    });

    renderOverview();
}

// Overview table: tasks per department and status
function renderOverview() {
    const body = document.getElementById('overview-body');
    body.textContent = '';

    function addRow(label, dept) {
        const tr = document.createElement('tr');
        const first = document.createElement('td');
        first.textContent = label;
        tr.appendChild(first);

        const group = tasks.filter(function (t) { return dept === null || t.department === dept; });
        STATUSES.forEach(function (s) {
            const td = document.createElement('td');
            td.textContent = group.filter(function (t) { return t.status === s; }).length;
            tr.appendChild(td);
        });
        const total = document.createElement('td');
        total.textContent = group.length;
        tr.appendChild(total);
        body.appendChild(tr);
    }

    DEPARTMENTS.forEach(function (d) { addRow(d, d); });
    addRow('All departments', null);
}

// ===== CREATE and UPDATE =====
function resetForm() {
    form.reset();
    editingId = null;
    document.getElementById('form-title').textContent = 'Add a task';
    saveBtn.textContent = 'Add task';
    cancelBtn.style.display = 'none';
}

function startEdit(id) {
    const t = tasks.find(function (x) { return x.id === id; });
    editingId = id;
    titleInput.value = t.title;
    descInput.value = t.description;
    deptInput.value = t.department;
    priorityInput.value = t.priority;
    dueInput.value = t.due;
    statusInput.value = t.status;
    document.getElementById('form-title').textContent = 'Edit task';
    saveBtn.textContent = 'Save changes';
    cancelBtn.style.display = 'inline-block';
    showMessage('Editing "' + t.title + '".', 'ok');
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    titleInput.focus();
    renderTasks();
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = titleInput.value.trim();

    if (title === '') {
        showMessage('Please enter a task title.', 'error');
        titleInput.focus();
        return;
    }
    if (dueInput.value === '') {
        showMessage('Please choose a due date.', 'error');
        dueInput.focus();
        return;
    }

    const data = {
        title: title,
        description: descInput.value.trim(),
        department: deptInput.value,
        priority: priorityInput.value,
        due: dueInput.value,
        status: statusInput.value
    };

    if (editingId === null) {
        data.id = nextId();
        tasks.push(data);
        showMessage('Task added.', 'ok');
    } else {
        const task = tasks.find(function (x) { return x.id === editingId; });
        Object.assign(task, data);
        showMessage('Task updated.', 'ok');
    }

    saveTasks();
    resetForm();
    renderTasks();
});

cancelBtn.addEventListener('click', function () {
    resetForm();
    showMessage('Edit cancelled.', 'ok');
    renderTasks();
});

// ===== DELETE =====
function deleteTask(id, li) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    if (editingId === id) resetForm();
    li.remove();
    saveTasks();
    renderTasks();
    showMessage('Task deleted.', 'ok');
}

document.getElementById('clear-done').addEventListener('click', function () {
    const before = tasks.length;
    tasks = tasks.filter(function (t) { return t.status !== 'Done'; });
    saveTasks();
    renderTasks();
    showMessage(before === tasks.length ? 'No completed tasks to delete.' : 'Completed tasks deleted.', before === tasks.length ? 'error' : 'ok');
});

// ===== Filters =====
document.querySelectorAll('#filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('#filters button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderTasks();
    });
});

dueInput.value = dateOffset(1);
renderTasks();
