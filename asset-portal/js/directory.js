/**
 * Department Directory Page
 */

let personnelData = { personnel: [], categories: [] };

document.addEventListener('DOMContentLoaded', async function() {
    await loadPersonnel();
    setupForm();
});

async function loadPersonnel() {
    try {
        personnelData = await DataService.getPersonnel();
        updateStats();
        renderPersonnel(personnelData.personnel);
    } catch (error) {
        console.error('Error loading personnel:', error);
        personnelData = { personnel: [], categories: [] };
        renderPersonnel([]);
    }
}

function updateStats() {
    const personnel = personnelData.personnel;
    document.getElementById('statTotal').textContent = personnel.length;
    document.getElementById('statAdmin').textContent = personnel.filter(p => p.category === 'Administration').length;
    document.getElementById('statTech').textContent = personnel.filter(p => p.category === 'Technician').length;
    document.getElementById('statFullTime').textContent = personnel.filter(p => p.category === 'Full-Time Faculty').length;
    document.getElementById('statPartTime').textContent = personnel.filter(p => p.category === 'Part-Time Faculty').length;
    document.getElementById('statOther').textContent = personnel.filter(p =>
        p.category === 'Teaching Associate' || p.category === 'Art Galleries'
    ).length;
}

function getCategoryClass(category) {
    const classes = {
        'Administration': 'category-admin',
        'Technician': 'category-tech',
        'Full-Time Faculty': 'category-fulltime',
        'Part-Time Faculty': 'category-parttime',
        'Teaching Associate': 'category-ta',
        'Art Galleries': 'category-gallery'
    };
    return classes[category] || 'bg-gray-100 text-gray-600';
}

function getCategoryIcon(category) {
    const icons = {
        'Administration': 'fa-user-tie',
        'Technician': 'fa-tools',
        'Full-Time Faculty': 'fa-chalkboard-teacher',
        'Part-Time Faculty': 'fa-user-graduate',
        'Teaching Associate': 'fa-user-friends',
        'Art Galleries': 'fa-palette'
    };
    return icons[category] || 'fa-user';
}

function createContactItem(iconClass, text, isEmail) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 text-sm text-gray-600';

    const icon = document.createElement('i');
    icon.className = `fas ${iconClass} w-4`;
    div.appendChild(icon);

    if (isEmail) {
        const link = document.createElement('a');
        link.href = `mailto:${text}`;
        link.className = 'text-blue-600 hover:underline';
        link.textContent = text;
        div.appendChild(link);
    } else {
        const span = document.createElement('span');
        span.textContent = text;
        div.appendChild(span);
    }

    return div;
}

function createActionButton(iconClass, title, clickHandler, hoverColor) {
    const btn = document.createElement('button');
    btn.className = `text-gray-400 hover:${hoverColor} p-1`;
    btn.title = title;
    btn.onclick = clickHandler;

    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    btn.appendChild(icon);

    return btn;
}

function renderPersonnel(personnel) {
    const grid = document.getElementById('directoryGrid');
    grid.textContent = '';

    if (personnel.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'col-span-full text-center py-12 text-gray-400';

        const icon = document.createElement('i');
        icon.className = 'fas fa-users text-4xl mb-3';
        emptyDiv.appendChild(icon);

        const text = document.createElement('p');
        text.textContent = 'No personnel found';
        emptyDiv.appendChild(text);

        grid.appendChild(emptyDiv);
        return;
    }

    // Sort by category priority, then by name
    const categoryOrder = ['Administration', 'Technician', 'Art Galleries', 'Full-Time Faculty', 'Part-Time Faculty', 'Teaching Associate'];
    personnel.sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category);
        const catB = categoryOrder.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return a.lastName.localeCompare(b.lastName);
    });

    personnel.forEach(person => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition';

        const categoryClass = getCategoryClass(person.category);
        const categoryIcon = getCategoryIcon(person.category);

        // Header row
        const headerRow = document.createElement('div');
        headerRow.className = 'flex items-start justify-between mb-3';

        // Left side - avatar and name
        const leftSide = document.createElement('div');
        leftSide.className = 'flex items-center gap-3';

        const avatar = document.createElement('div');
        avatar.className = `w-12 h-12 rounded-full ${categoryClass} flex items-center justify-center`;
        const avatarIcon = document.createElement('i');
        avatarIcon.className = `fas ${categoryIcon} text-lg`;
        avatar.appendChild(avatarIcon);

        const nameDiv = document.createElement('div');
        const nameH3 = document.createElement('h3');
        nameH3.className = 'font-bold text-gray-900';
        nameH3.textContent = person.name;
        const titleP = document.createElement('p');
        titleP.className = 'text-sm text-gray-500';
        titleP.textContent = person.title;
        nameDiv.appendChild(nameH3);
        nameDiv.appendChild(titleP);

        leftSide.appendChild(avatar);
        leftSide.appendChild(nameDiv);

        // Right side - action buttons
        const actionDiv = document.createElement('div');
        actionDiv.className = 'flex gap-1';

        const personId = person.id;
        actionDiv.appendChild(createActionButton('fa-edit', 'Edit', () => editPerson(personId), 'text-blue-600'));
        actionDiv.appendChild(createActionButton('fa-trash', 'Delete', () => deletePerson(personId), 'text-red-600'));

        headerRow.appendChild(leftSide);
        headerRow.appendChild(actionDiv);

        // Category badge
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'mb-3';
        const badge = document.createElement('span');
        badge.className = `text-xs px-2 py-1 rounded-full ${categoryClass}`;
        badge.textContent = person.category;
        badgeDiv.appendChild(badge);

        card.appendChild(headerRow);
        card.appendChild(badgeDiv);

        // Contact info
        if (person.office || person.phone || person.email) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'space-y-1 border-t pt-3';

            if (person.office) {
                contactDiv.appendChild(createContactItem('fa-door-open', person.office, false));
            }
            if (person.phone) {
                contactDiv.appendChild(createContactItem('fa-phone', person.phone, false));
            }
            if (person.email) {
                contactDiv.appendChild(createContactItem('fa-envelope', person.email, true));
            }

            card.appendChild(contactDiv);
        }

        grid.appendChild(card);
    });
}

function filterPersonnel() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;

    const filtered = personnelData.personnel.filter(person => {
        const matchSearch = !search ||
            person.name.toLowerCase().includes(search) ||
            person.firstName.toLowerCase().includes(search) ||
            person.lastName.toLowerCase().includes(search) ||
            (person.title && person.title.toLowerCase().includes(search)) ||
            (person.office && person.office.toLowerCase().includes(search)) ||
            (person.email && person.email.toLowerCase().includes(search));
        const matchCategory = !category || person.category === category;

        return matchSearch && matchCategory;
    });

    renderPersonnel(filtered);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCategory').value = '';
    renderPersonnel(personnelData.personnel);
}

// Modal functions
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Person';
    document.getElementById('personForm').reset();
    document.getElementById('personId').value = '';
    document.getElementById('personModal').classList.add('active');
}

function closeModal() {
    document.getElementById('personModal').classList.remove('active');
}

function editPerson(id) {
    const person = personnelData.personnel.find(p => p.id === id);
    if (!person) return;

    document.getElementById('modalTitle').textContent = 'Edit Person';
    document.getElementById('personId').value = person.id;
    document.getElementById('firstName').value = person.firstName;
    document.getElementById('lastName').value = person.lastName;
    document.getElementById('personTitle').value = person.title || '';
    document.getElementById('personCategory').value = person.category;
    document.getElementById('personOffice').value = person.office || '';
    document.getElementById('personPhone').value = person.phone || '';
    document.getElementById('personEmail').value = person.email || '';

    document.getElementById('personModal').classList.add('active');
}

async function deletePerson(id) {
    const person = personnelData.personnel.find(p => p.id === id);
    if (!person) return;

    if (confirm(`Delete "${person.name}"?\n\nThis action cannot be undone.`)) {
        await DataService.deletePersonnel(id);
        await loadPersonnel();
    }
}

function setupForm() {
    document.getElementById('personForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const person = {
            id: document.getElementById('personId').value || null,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
            title: document.getElementById('personTitle').value,
            category: document.getElementById('personCategory').value,
            department: 'Art & Design',
            office: document.getElementById('personOffice').value || null,
            phone: document.getElementById('personPhone').value || null,
            email: document.getElementById('personEmail').value || null
        };

        await DataService.savePersonnel(person);
        closeModal();
        await loadPersonnel();
        alert('Person saved successfully!');
    });

    // Click outside modal to close
    document.getElementById('personModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('personModal').classList.contains('active')) {
            closeModal();
        }
    });
}

function exportDirectory() {
    const headers = ['Name', 'First Name', 'Last Name', 'Title', 'Category', 'Office', 'Phone', 'Email'];
    const rows = personnelData.personnel.map(p => [
        p.name, p.firstName, p.lastName, p.title, p.category, p.office || '', p.phone || '', p.email || ''
    ]);

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };

    const csv = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Department_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}
