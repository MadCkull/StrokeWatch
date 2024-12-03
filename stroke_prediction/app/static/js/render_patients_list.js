let page = 1;
let loading = false;
let hasMore = true;
let totalPatients = [];

function togglePatientList(btn) {
    const container = document.querySelector('.Patient-List-Container');
    const isHidden = container.classList.contains('hidden');

    if (isHidden) {
        container.classList.remove('hidden');
        if (totalPatients.length > 0) {
            clearPatients();
            renderPatients(totalPatients);
        } else {
            loadPatients(true);
        }
    } else {
        container.classList.add('hidden');
    }
}

async function loadPatients(reset = false) {
    if (loading || !hasMore) return;

    if (reset) {
        page = 1;
        hasMore = true;
        totalPatients = [];
        clearPatients();
    }

    loading = true;
    showLoader();

    try {
        const response = await fetch(`/patient/list?page=${page}`);
        const data = await response.json();

        if (data.patients.length < 10) {
            hasMore = false;
        }

        totalPatients = [...totalPatients, ...data.patients];
        renderPatients(data.patients);
        page++;
    } catch (error) {
        console.error('Error loading patients:', error);
        showToast(error);
    } finally {
        loading = false;
        hideLoader();
    }
}

function renderPatients(patients) {
    const tbody = document.getElementById('patient-list-body');
    const template = document.getElementById('patient-row-template');

    patients.forEach((patient, index) => {
        const clone = template.content.cloneNode(true);
        const row = clone.querySelector('tr');

        row.querySelector('[data-field="patient_id"]').textContent = patient.patient_id;
        row.querySelector('[data-field="name"]').textContent = patient.name;
        row.querySelector('[data-field="age"]').textContent = patient.age;
        row.querySelector('[data-field="gender"]').textContent = patient.gender;

        const riskBadge = row.querySelector('.risk-badge');
        riskBadge.textContent = `${patient.stroke_risk}%`;
        riskBadge.classList.add(getRiskClass(patient.stroke_risk));

        row.querySelector('[data-field="date"]').textContent =
            new Date(patient.record_entry_date).toLocaleDateString();

        tbody.appendChild(row);
    });
}

function getRiskClass(risk) {
    if (risk > 70) return 'high';
    if (risk > 30) return 'medium';
    return 'low';
}

function clearPatients() {
    const tbody = document.getElementById('patient-list-body');
    tbody.innerHTML = '';
}

function showLoader() {
    document.querySelector('.windows-loader').classList.remove('hidden');
}

function hideLoader() {
    document.querySelector('.windows-loader').classList.add('hidden');
}

function isScrolledToBottom(element) {
    return Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
}

// Initialize scroll handler after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.Patient-List-Container');
    if (container) {
        container.addEventListener('scroll', () => {
            if (isScrolledToBottom(container)) {
                loadPatients();
            }
        });
    }
});