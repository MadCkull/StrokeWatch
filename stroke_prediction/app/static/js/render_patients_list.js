// static/js/render_patients_list.js

let page = 1;
let loading = false;
let hasMore = true;

function togglePatientList(btn) {
    const container = document.querySelector('.Patient-List-Container');
    const isHidden = container.classList.contains('hidden');

    if (isHidden) {
        container.classList.remove('hidden');
        loadPatients(true);
    } else {
        container.classList.add('hidden');
        clearPatients();
    }
}

async function loadPatients(reset = false) {
    if (loading || !hasMore) return;

    if (reset) {
        page = 1;
        hasMore = true;
        clearPatients();
    }

    loading = true;
    showLoader();

    try {
        const response = await fetch(`/patient/list?page=${page}`);
        const data = await response.json();

        if (data.patients.length < 50) hasMore = false;

        renderPatients(data.patients);
        page++;
    } catch (error) {
        console.error('Error loading patients:', error);
        // showToast('Error loading patients', error, 'error');
        showToast(error);
    } finally {
        loading = false;
        hideLoader();
    }
}

function renderPatients(patients) {
    const tbody = document.getElementById('patient-list-body');
    const template = document.getElementById('patient-row-template');

    patients.forEach(patient => {
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

// Infinite scroll
const container = document.querySelector('.Patient-List-Container');
container.addEventListener('scroll', () => {
    if (container.scrollHeight - container.scrollTop === container.clientHeight) {
        loadPatients();
    }
});