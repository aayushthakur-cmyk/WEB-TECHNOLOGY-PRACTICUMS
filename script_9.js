// ===== Toast notifications =====
const toastArea = document.getElementById('toast-area');

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastArea.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('hide');
        setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
}

// ===== Hero button: scroll to products =====
const exploreBtn = document.getElementById('explore-btn');
exploreBtn.addEventListener('click', function () {
    exploreBtn.classList.remove('btn-pulse');
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

// ===== Product cards: open / close details =====
document.querySelectorAll('.toggle-details').forEach(function (button) {
    button.addEventListener('click', function () {
        const details = button.closest('.card').querySelector('.details');
        details.classList.toggle('open');
        const isOpen = details.classList.contains('open');
        button.textContent = isOpen ? 'Hide details' : 'Show details';
        button.setAttribute('aria-expanded', isOpen);
    });
});

// ===== Add to enquiry list =====
const countEl = document.getElementById('enquiry-count');
let enquiryCount = 0;

document.querySelectorAll('.add-enquiry').forEach(function (button) {
    button.addEventListener('click', function () {
        enquiryCount++;
        countEl.textContent = enquiryCount;
        countEl.classList.remove('bump');
        void countEl.offsetWidth; // restart the animation
        countEl.classList.add('bump');
        showToast(button.dataset.name + ' added to your enquiry list.');
    });
});

// ===== Modal =====
const overlay = document.getElementById('modal-overlay');

function openModal() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
}
function closeModal() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
}

document.getElementById('open-modal').addEventListener('click', openModal);
document.getElementById('close-modal').addEventListener('click', closeModal);
overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
});

// ===== Quality check: steps light up in sequence =====
const runCheck = document.getElementById('run-check');
const qualitySection = document.getElementById('quality');
const steps = qualitySection.querySelectorAll('.step');
const bar = document.getElementById('progress-bar');

runCheck.addEventListener('click', function () {
    runCheck.disabled = true;
    qualitySection.classList.add('quality-active');
    steps.forEach(function (s) { s.classList.remove('active'); });
    bar.style.width = '0';

    steps.forEach(function (step, i) {
        setTimeout(function () {
            step.classList.add('active');
            bar.style.width = ((i + 1) / steps.length * 100) + '%';
        }, 900 * (i + 1));
    });

    setTimeout(function () {
        qualitySection.classList.remove('quality-active');
        runCheck.disabled = false;
        showToast('Quality check complete. All steps passed.');
    }, 900 * (steps.length + 1));
});

// ===== Send enquiry =====
document.getElementById('send-enquiry').addEventListener('click', function () {
    if (enquiryCount === 0) {
        showToast('Your enquiry list is empty. Add a product first.');
        return;
    }
    showToast('Enquiry sent for ' + enquiryCount + ' product(s). We will reply by email.');
    enquiryCount = 0;
    countEl.textContent = 0;
});
