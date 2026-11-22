const form = document.getElementById('enquiry-form');
const successBox = document.getElementById('success-message');
const fields = form.querySelectorAll('input, select, textarea');
const notes = document.getElementById('notes');
const delivery = document.getElementById('delivery');

// Delivery date: from tomorrow up to 30 days ahead
function isoDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}
delivery.min = isoDate(1);
delivery.max = isoDate(30);

// Friendly error text for each kind of problem
function getMessage(field) {
    const v = field.validity;
    const label = field.labels[0].textContent.replace(' *', '');

    if (v.valueMissing) {
        if (field.type === 'checkbox') return 'Please confirm before sending.';
        if (field.tagName === 'SELECT') return 'Choose a category from the list.';
        return label + ' is required.';
    }
    if (v.typeMismatch) return 'Enter a valid email address, like name@example.com.';
    if (v.tooShort) return label + ' must be at least ' + field.minLength + ' characters.';
    if (v.rangeUnderflow) {
        return field.type === 'date' ? 'Choose a date from tomorrow onwards.' : 'Value must be at least ' + field.min + '.';
    }
    if (v.rangeOverflow) {
        return field.type === 'date' ? 'Choose a date within the next 30 days.' : 'Value must be ' + field.max + ' or less.';
    }
    if (v.patternMismatch) {
        if (field.id === 'phone') return 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
        if (field.id === 'fullname') return 'Use letters and spaces only.';
    }
    if (v.badInput) return 'Enter a valid value.';
    return '';
}

// Check one field and show or hide its message
function validateField(field) {
    field.setCustomValidity('');            // reset first
    if (!field.checkValidity()) {
        field.setCustomValidity(getMessage(field) || 'Invalid value.');
    }
    // Extra rule: no all-space names or medicine names
    if ((field.id === 'fullname' || field.id === 'medicine') && field.value.length > 0 && field.value.trim() === '') {
        field.setCustomValidity('Enter a real value, not only spaces.');
    }

    const errorEl = document.getElementById(field.id + '-error');
    if (errorEl) {
        errorEl.textContent = field.validationMessage;
        errorEl.classList.toggle('show', !field.checkValidity());
    }
}

fields.forEach(function (field) {
    const eventName = (field.type === 'checkbox' || field.tagName === 'SELECT') ? 'change' : 'input';

    field.addEventListener(eventName, function () {
        field.classList.add('touched');
        validateField(field);
    });
    field.addEventListener('blur', function () {
        if (field.value !== '' || field.classList.contains('touched')) {
            field.classList.add('touched');
            validateField(field);
        }
    });
});

// Notes counter
notes.addEventListener('input', function () {
    document.getElementById('notes-count').textContent = notes.value.length;
});

// Submit
form.addEventListener('submit', function (event) {
    event.preventDefault();
    successBox.hidden = true;

    let firstInvalid = null;
    fields.forEach(function (field) {
        field.classList.add('touched');
        validateField(field);
        if (!field.checkValidity() && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
        firstInvalid.reportValidity();      // shows the browser bubble on the first problem
        firstInvalid.focus();
        return;
    }

    const name = document.getElementById('fullname').value.trim();
    const medicine = document.getElementById('medicine').value.trim();
    successBox.textContent = 'Thank you, ' + name + '. Your enquiry about ' + medicine +
        ' has been sent. We will reply by email within one working day.';
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    resetForm();
});

function resetForm() {
    form.reset();
    fields.forEach(function (field) {
        field.setCustomValidity('');
        field.classList.remove('touched');
    });
    form.querySelectorAll('.error').forEach(function (e) {
        e.textContent = '';
        e.classList.remove('show');
    });
    document.getElementById('notes-count').textContent = '0';
}

document.getElementById('reset-btn').addEventListener('click', function () {
    successBox.hidden = true;
    // form.reset() runs after this click; clear messages and highlights too
    setTimeout(resetForm, 0);
});
