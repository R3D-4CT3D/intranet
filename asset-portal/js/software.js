/**
 * Software License Management Page
 */

let softwareData = { software: [], categories: [], licenseTypes: [], assignmentTypes: [], billingCycles: [], statuses: [] };
let currentViewSoftware = null;
let pendingInvoice = null; // Stores invoice data before save

document.addEventListener('DOMContentLoaded', async function() {
    await loadSoftware();
    setupForm();
});

async function loadSoftware() {
    try {
        softwareData = await DataService.getSoftware();

        // Ensure dropdown defaults exist
        if (!softwareData.categories || softwareData.categories.length === 0) {
            softwareData.categories = ['Design Software', '3D/Animation', 'Office/Productivity', 'Development', 'Video/Audio', 'Operating System', 'Utility', 'Other'];
        }
        if (!softwareData.licenseTypes || softwareData.licenseTypes.length === 0) {
            softwareData.licenseTypes = ['Subscription', 'Perpetual', 'Site License', 'Per-Seat', 'Concurrent', 'Free/Open Source'];
        }
        if (!softwareData.assignmentTypes || softwareData.assignmentTypes.length === 0) {
            softwareData.assignmentTypes = ['Lab', 'Individual', 'Department-Wide', 'Mixed'];
        }
        if (!softwareData.billingCycles || softwareData.billingCycles.length === 0) {
            softwareData.billingCycles = ['Monthly', 'Annual', 'Multi-Year', 'One-Time'];
        }
        if (!softwareData.statuses || softwareData.statuses.length === 0) {
            softwareData.statuses = ['Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Pending Renewal'];
        }

        populateFilters();
        populateFormSelects();
        renderSoftware(softwareData.software);
        updateStats();
        checkRenewalAlerts();
    } catch (error) {
        console.error('Error loading software:', error);
        // Use defaults on error
        softwareData = {
            software: [],
            categories: ['Design Software', '3D/Animation', 'Office/Productivity', 'Development', 'Video/Audio', 'Other'],
            licenseTypes: ['Subscription', 'Perpetual', 'Site License', 'Per-Seat'],
            assignmentTypes: ['Lab', 'Individual', 'Department-Wide'],
            billingCycles: ['Monthly', 'Annual', 'One-Time'],
            statuses: ['Active', 'Expiring Soon', 'Expired', 'Cancelled']
        };
        populateFilters();
        populateFormSelects();
        renderSoftware(softwareData.software);
    }
}

function populateFilters() {
    const catSelect = document.getElementById('filterCategory');
    softwareData.categories.forEach(cat => {
        catSelect.add(new Option(cat, cat));
    });

    const statusSelect = document.getElementById('filterStatus');
    softwareData.statuses.forEach(status => {
        statusSelect.add(new Option(status, status));
    });

    const assignSelect = document.getElementById('filterAssignment');
    softwareData.assignmentTypes.forEach(type => {
        assignSelect.add(new Option(type, type));
    });
}

function populateFormSelects() {
    const catSelect = document.getElementById('swCategory');
    softwareData.categories.forEach(cat => {
        catSelect.add(new Option(cat, cat));
    });

    const licenseSelect = document.getElementById('swLicenseType');
    softwareData.licenseTypes.forEach(type => {
        licenseSelect.add(new Option(type, type));
    });

    const assignSelect = document.getElementById('swAssignmentType');
    softwareData.assignmentTypes.forEach(type => {
        assignSelect.add(new Option(type, type));
    });

    const billingSelect = document.getElementById('swBillingCycle');
    softwareData.billingCycles.forEach(cycle => {
        billingSelect.add(new Option(cycle, cycle));
    });

    const statusSelect = document.getElementById('swStatus');
    softwareData.statuses.forEach(status => {
        statusSelect.add(new Option(status, status));
    });
}

function updateStats() {
    const total = softwareData.software.length;
    const active = softwareData.software.filter(s => s.status === 'Active').length;

    // Expiring within 60 days
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);
    const expiring = softwareData.software.filter(s => {
        if (!s.renewalDate || s.status === 'Cancelled' || s.status === 'Expired') return false;
        const renewal = new Date(s.renewalDate);
        return renewal <= sixtyDays && renewal >= new Date();
    }).length;

    const totalLicenses = softwareData.software.reduce((sum, s) => sum + (s.totalLicenses || 0), 0);
    const annualCost = softwareData.software
        .filter(s => s.status === 'Active')
        .reduce((sum, s) => sum + (s.cost || 0), 0);

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statExpiring').textContent = expiring;
    document.getElementById('statLicenses').textContent = totalLicenses.toLocaleString();
    document.getElementById('statCost').textContent = '$' + annualCost.toLocaleString();
}

function checkRenewalAlerts() {
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);

    const expiringSoon = softwareData.software.filter(s => {
        if (!s.renewalDate || s.status === 'Cancelled' || s.status === 'Expired') return false;
        const renewal = new Date(s.renewalDate);
        return renewal <= sixtyDays && renewal >= new Date();
    }).sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

    const alertsContainer = document.getElementById('renewalAlerts');
    const alertsList = document.getElementById('renewalAlertsList');

    if (expiringSoon.length === 0) {
        alertsContainer.style.display = 'none';
        return;
    }

    alertsContainer.style.display = 'block';
    alertsList.textContent = '';

    expiringSoon.forEach(sw => {
        const daysUntil = Math.ceil((new Date(sw.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between bg-white rounded-lg p-3';

        const info = document.createElement('div');
        const name = document.createElement('span');
        name.className = 'font-medium';
        name.textContent = sw.name;
        const detail = document.createElement('span');
        detail.className = 'text-sm text-gray-600 ml-2';
        detail.textContent = `- ${sw.vendor}`;
        info.appendChild(name);
        info.appendChild(detail);

        const badge = document.createElement('span');
        badge.className = daysUntil <= 30 ? 'text-sm font-bold text-red-600' : 'text-sm font-medium text-yellow-700';
        badge.textContent = `${daysUntil} days (${formatDate(sw.renewalDate)})`;

        row.appendChild(info);
        row.appendChild(badge);
        alertsList.appendChild(row);
    });
}

function createActionButton(iconClass, colorClass, title, clickHandler) {
    const btn = document.createElement('button');
    btn.className = `${colorClass} px-2`;
    btn.title = title;
    btn.onclick = clickHandler;
    const icon = document.createElement('i');
    icon.className = iconClass;
    btn.appendChild(icon);
    return btn;
}

function renderSoftware(software) {
    const tbody = document.getElementById('softwareTableBody');
    tbody.textContent = '';

    if (software.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.className = 'text-center py-12 text-gray-400';
        const icon = document.createElement('i');
        icon.className = 'fas fa-cube text-3xl mb-2';
        const text = document.createElement('p');
        text.textContent = 'No software licenses found';
        cell.appendChild(icon);
        cell.appendChild(document.createElement('br'));
        cell.appendChild(text);
        row.appendChild(cell);
        tbody.appendChild(row);
        document.getElementById('showingCount').textContent = '0';
        document.getElementById('totalCount').textContent = softwareData.software.length;
        return;
    }

    software.forEach(sw => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        // Software name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'px-4 py-3';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'font-medium text-gray-900';
        nameDiv.textContent = sw.name;
        const vendorDiv = document.createElement('div');
        vendorDiv.className = 'text-xs text-gray-500';
        vendorDiv.textContent = `${sw.vendor}${sw.version ? ' v' + sw.version : ''}`;
        nameCell.appendChild(nameDiv);
        nameCell.appendChild(vendorDiv);

        // Licenses cell
        const licenseCell = document.createElement('td');
        licenseCell.className = 'px-4 py-3';
        const licenseCount = document.createElement('div');
        licenseCount.className = 'font-medium';
        licenseCount.textContent = `${sw.usedLicenses || 0} / ${sw.totalLicenses}`;
        const licenseType = document.createElement('div');
        licenseType.className = 'text-xs text-gray-500';
        licenseType.textContent = sw.licenseType;
        licenseCell.appendChild(licenseCount);
        licenseCell.appendChild(licenseType);

        // Assigned cell
        const assignedCell = document.createElement('td');
        assignedCell.className = 'px-4 py-3';
        const assignedType = document.createElement('div');
        assignedType.className = 'text-sm font-medium';
        assignedType.textContent = sw.assignmentType;
        const assignedTo = document.createElement('div');
        assignedTo.className = 'text-xs text-gray-500';
        assignedTo.textContent = sw.assignedTo || '-';
        assignedCell.appendChild(assignedType);
        assignedCell.appendChild(assignedTo);

        // Cost cell
        const costCell = document.createElement('td');
        costCell.className = 'px-4 py-3';
        const costAmount = document.createElement('div');
        costAmount.className = 'font-medium';
        costAmount.textContent = sw.cost ? '$' + sw.cost.toLocaleString() : 'Free';
        const costCycle = document.createElement('div');
        costCycle.className = 'text-xs text-gray-500';
        costCycle.textContent = sw.billingCycle || '';
        costCell.appendChild(costAmount);
        costCell.appendChild(costCycle);

        // Renewal cell
        const renewalCell = document.createElement('td');
        renewalCell.className = 'px-4 py-3';
        if (sw.renewalDate) {
            const daysUntil = Math.ceil((new Date(sw.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysUntil <= 60 && daysUntil > 0;
            const isExpired = daysUntil < 0;

            const renewalDate = document.createElement('div');
            renewalDate.className = isExpired ? 'text-red-600 font-bold' : (isExpiringSoon ? 'text-yellow-600 font-medium' : '');
            renewalDate.textContent = formatDate(sw.renewalDate);

            const daysText = document.createElement('div');
            daysText.className = 'text-xs ' + (isExpired ? 'text-red-500' : (isExpiringSoon ? 'text-yellow-600' : 'text-gray-500'));
            daysText.textContent = isExpired ? 'EXPIRED' : `${daysUntil} days`;

            renewalCell.appendChild(renewalDate);
            renewalCell.appendChild(daysText);
        } else {
            renewalCell.textContent = '-';
            renewalCell.className = 'px-4 py-3 text-gray-400';
        }

        // Status cell
        const statusCell = document.createElement('td');
        statusCell.className = 'px-4 py-3';
        const statusSpan = document.createElement('span');
        statusSpan.className = `text-xs px-2 py-1 rounded-full ${getStatusClass(sw.status)}`;
        statusSpan.textContent = sw.status;
        statusCell.appendChild(statusSpan);

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-3 text-center';

        const swId = sw.id;
        actionsCell.appendChild(createActionButton('fas fa-eye', 'text-blue-600 hover:text-blue-800', 'View', () => viewSoftware(swId)));
        actionsCell.appendChild(createActionButton('fas fa-edit', 'text-green-600 hover:text-green-800', 'Edit', () => editSoftware(swId)));
        actionsCell.appendChild(createActionButton('fas fa-trash', 'text-red-600 hover:text-red-800', 'Delete', () => deleteSoftware(swId)));

        row.appendChild(nameCell);
        row.appendChild(licenseCell);
        row.appendChild(assignedCell);
        row.appendChild(costCell);
        row.appendChild(renewalCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });

    document.getElementById('showingCount').textContent = software.length;
    document.getElementById('totalCount').textContent = softwareData.software.length;
}

function getStatusClass(status) {
    const classes = {
        'Active': 'status-active',
        'Expiring Soon': 'status-expiring',
        'Expired': 'status-expired',
        'Pending Renewal': 'status-pending',
        'Cancelled': 'status-cancelled'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
}

function filterSoftware() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const status = document.getElementById('filterStatus').value;
    const assignment = document.getElementById('filterAssignment').value;

    const filtered = softwareData.software.filter(sw => {
        const matchSearch = !search ||
            sw.name.toLowerCase().includes(search) ||
            sw.vendor.toLowerCase().includes(search);
        const matchCategory = !category || sw.category === category;
        const matchStatus = !status || sw.status === status;
        const matchAssignment = !assignment || sw.assignmentType === assignment;

        return matchSearch && matchCategory && matchStatus && matchAssignment;
    });

    renderSoftware(filtered);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterAssignment').value = '';
    renderSoftware(softwareData.software);
}

// Invoice handling functions
function handleInvoiceUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        input.value = '';
        return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a PDF, PNG, or JPG file.');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        pendingInvoice = {
            name: file.name,
            type: file.type,
            data: e.target.result
        };
        updateInvoiceUI(file.name, true);
    };
    reader.readAsDataURL(file);
}

function removeInvoice() {
    pendingInvoice = null;
    document.getElementById('swInvoice').value = '';
    updateInvoiceUI('Choose PDF or image...', false);
}

function updateInvoiceUI(fileName, hasFile) {
    document.getElementById('invoiceFileName').textContent = fileName;
    document.getElementById('removeInvoiceBtn').classList.toggle('hidden', !hasFile);
    document.getElementById('invoicePreview').classList.add('hidden');
}

function showExistingInvoice(invoice) {
    if (invoice && invoice.data) {
        pendingInvoice = invoice;
        document.getElementById('invoiceFileName').textContent = invoice.name || 'Existing invoice';
        document.getElementById('removeInvoiceBtn').classList.remove('hidden');
        document.getElementById('invoicePreview').classList.remove('hidden');
        document.getElementById('invoiceLink').href = invoice.data;
        document.getElementById('invoiceLinkText').textContent = `View: ${invoice.name || 'invoice'}`;
    } else {
        pendingInvoice = null;
        updateInvoiceUI('Choose PDF or image...', false);
    }
}

// Modal functions
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Software';
    document.getElementById('softwareForm').reset();
    document.getElementById('softwareId').value = '';
    document.getElementById('swStatus').value = 'Active';
    pendingInvoice = null;
    updateInvoiceUI('Choose PDF or image...', false);
    document.getElementById('softwareModal').classList.add('active');
}

function closeModal() {
    document.getElementById('softwareModal').classList.remove('active');
}

function editSoftware(id) {
    const sw = softwareData.software.find(s => s.id === id);
    if (!sw) return;

    document.getElementById('modalTitle').textContent = 'Edit Software';
    document.getElementById('softwareId').value = sw.id;
    document.getElementById('swName').value = sw.name;
    document.getElementById('swVendor').value = sw.vendor;
    document.getElementById('swVersion').value = sw.version || '';
    document.getElementById('swCategory').value = sw.category;
    document.getElementById('swLicenseType').value = sw.licenseType;
    document.getElementById('swTotalLicenses').value = sw.totalLicenses;
    document.getElementById('swUsedLicenses').value = sw.usedLicenses || 0;
    document.getElementById('swStatus').value = sw.status;
    document.getElementById('swCost').value = sw.cost || 0;
    document.getElementById('swBillingCycle').value = sw.billingCycle || '';
    document.getElementById('swPurchaseDate').value = sw.purchaseDate || '';
    document.getElementById('swRenewalDate').value = sw.renewalDate || '';
    document.getElementById('swAssignmentType').value = sw.assignmentType;
    document.getElementById('swAssignedTo').value = sw.assignedTo || '';
    document.getElementById('swContactName').value = sw.supportContact?.name || '';
    document.getElementById('swContactEmail').value = sw.supportContact?.email || '';
    document.getElementById('swContactPhone').value = sw.supportContact?.phone || '';
    document.getElementById('swAccountRep').value = sw.supportContact?.accountRep || '';
    document.getElementById('swNotes').value = sw.notes || '';

    // Load existing invoice
    showExistingInvoice(sw.invoice);

    document.getElementById('softwareModal').classList.add('active');
}

function viewSoftware(id) {
    const sw = softwareData.software.find(s => s.id === id);
    if (!sw) return;

    currentViewSoftware = sw;
    document.getElementById('viewModalTitle').textContent = sw.name;

    const content = document.getElementById('viewModalContent');
    content.textContent = '';

    // Basic info section
    const sections = [
        {
            title: 'Basic Information',
            icon: 'info-circle',
            fields: [
                { label: 'Vendor', value: sw.vendor },
                { label: 'Version', value: sw.version || 'N/A' },
                { label: 'Category', value: sw.category },
                { label: 'Status', value: sw.status, isStatus: true }
            ]
        },
        {
            title: 'License Details',
            icon: 'key',
            fields: [
                { label: 'License Type', value: sw.licenseType },
                { label: 'Total Licenses', value: sw.totalLicenses },
                { label: 'Used Licenses', value: sw.usedLicenses || 0 },
                { label: 'Available', value: sw.totalLicenses - (sw.usedLicenses || 0) }
            ]
        },
        {
            title: 'Cost & Billing',
            icon: 'dollar-sign',
            fields: [
                { label: 'Cost', value: sw.cost ? '$' + sw.cost.toLocaleString() : 'Free' },
                { label: 'Billing Cycle', value: sw.billingCycle || 'N/A' },
                { label: 'Purchase Date', value: sw.purchaseDate ? formatDate(sw.purchaseDate) : 'N/A' },
                { label: 'Renewal Date', value: sw.renewalDate ? formatDate(sw.renewalDate) : 'N/A' }
            ]
        },
        {
            title: 'Assignment',
            icon: 'building',
            fields: [
                { label: 'Type', value: sw.assignmentType },
                { label: 'Assigned To', value: sw.assignedTo || 'N/A' }
            ]
        },
        {
            title: 'Support Contact',
            icon: 'headset',
            fields: [
                { label: 'Contact', value: sw.supportContact?.name || 'N/A' },
                { label: 'Email', value: sw.supportContact?.email || 'N/A' },
                { label: 'Phone', value: sw.supportContact?.phone || 'N/A' },
                { label: 'Account Rep', value: sw.supportContact?.accountRep || 'N/A' }
            ]
        }
    ];

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-6';

        const titleDiv = document.createElement('h4');
        titleDiv.className = 'font-bold text-gray-700 mb-2 flex items-center gap-2';
        const icon = document.createElement('i');
        icon.className = `fas fa-${section.icon} csun-red-text`;
        titleDiv.appendChild(icon);
        titleDiv.appendChild(document.createTextNode(' ' + section.title));
        sectionDiv.appendChild(titleDiv);

        const fieldsGrid = document.createElement('div');
        fieldsGrid.className = 'grid grid-cols-2 gap-2';

        section.fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'flex justify-between py-1 border-b';

            const label = document.createElement('span');
            label.className = 'text-sm text-gray-500';
            label.textContent = field.label;

            const value = document.createElement('span');
            if (field.isStatus) {
                value.className = `text-xs px-2 py-1 rounded-full ${getStatusClass(field.value)}`;
            } else {
                value.className = 'text-sm font-medium text-gray-900';
            }
            value.textContent = field.value;

            row.appendChild(label);
            row.appendChild(value);
            fieldsGrid.appendChild(row);
        });

        sectionDiv.appendChild(fieldsGrid);
        content.appendChild(sectionDiv);
    });

    // Invoice
    if (sw.invoice && sw.invoice.data) {
        const invoiceDiv = document.createElement('div');
        invoiceDiv.className = 'mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200';
        const invoiceLabel = document.createElement('div');
        invoiceLabel.className = 'text-xs text-blue-600 mb-2 flex items-center gap-2';
        const invoiceIcon = document.createElement('i');
        invoiceIcon.className = 'fas fa-file-invoice';
        invoiceLabel.appendChild(invoiceIcon);
        invoiceLabel.appendChild(document.createTextNode(' Invoice / Document'));
        invoiceDiv.appendChild(invoiceLabel);

        const invoiceLink = document.createElement('a');
        invoiceLink.href = sw.invoice.data;
        invoiceLink.target = '_blank';
        invoiceLink.className = 'inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium';
        const linkIcon = document.createElement('i');
        linkIcon.className = sw.invoice.type === 'application/pdf' ? 'fas fa-file-pdf' : 'fas fa-image';
        invoiceLink.appendChild(linkIcon);
        invoiceLink.appendChild(document.createTextNode(sw.invoice.name || 'View Document'));
        const extIcon = document.createElement('i');
        extIcon.className = 'fas fa-external-link-alt text-xs';
        invoiceLink.appendChild(extIcon);
        invoiceDiv.appendChild(invoiceLink);
        content.appendChild(invoiceDiv);
    }

    // Notes
    if (sw.notes) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'mt-4 p-3 bg-gray-50 rounded-lg';
        const notesLabel = document.createElement('div');
        notesLabel.className = 'text-xs text-gray-500 mb-1';
        notesLabel.textContent = 'Notes';
        const notesText = document.createElement('div');
        notesText.className = 'text-sm';
        notesText.textContent = sw.notes;
        notesDiv.appendChild(notesLabel);
        notesDiv.appendChild(notesText);
        content.appendChild(notesDiv);
    }

    document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
    currentViewSoftware = null;
}

function editFromView() {
    if (currentViewSoftware) {
        closeViewModal();
        editSoftware(currentViewSoftware.id);
    }
}

async function deleteSoftware(id) {
    const sw = softwareData.software.find(s => s.id === id);
    if (!sw) return;

    if (confirm(`Delete "${sw.name}"?\n\nThis action cannot be undone.`)) {
        await DataService.deleteSoftware(id);
        await loadSoftware();
    }
}

function setupModalHandlers() {
    const modals = ['softwareModal', 'viewModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                if (modalId === 'softwareModal') pendingInvoice = null;
                if (modalId === 'viewModal') currentViewSoftware = null;
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    if (modalId === 'softwareModal') pendingInvoice = null;
                    if (modalId === 'viewModal') currentViewSoftware = null;
                }
            });
        }
    });
}

function setupForm() {
    setupModalHandlers();

    document.getElementById('softwareForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const software = {
            id: document.getElementById('softwareId').value || null,
            name: document.getElementById('swName').value,
            vendor: document.getElementById('swVendor').value,
            version: document.getElementById('swVersion').value,
            licenseType: document.getElementById('swLicenseType').value,
            totalLicenses: parseInt(document.getElementById('swTotalLicenses').value),
            usedLicenses: parseInt(document.getElementById('swUsedLicenses').value) || 0,
            cost: parseFloat(document.getElementById('swCost').value) || 0,
            billingCycle: document.getElementById('swBillingCycle').value,
            purchaseDate: document.getElementById('swPurchaseDate').value || null,
            renewalDate: document.getElementById('swRenewalDate').value,
            assignmentType: document.getElementById('swAssignmentType').value,
            assignedTo: document.getElementById('swAssignedTo').value,
            assignedAssets: [],
            category: document.getElementById('swCategory').value,
            status: document.getElementById('swStatus').value,
            notes: document.getElementById('swNotes').value,
            supportContact: {
                name: document.getElementById('swContactName').value,
                email: document.getElementById('swContactEmail').value,
                phone: document.getElementById('swContactPhone').value,
                accountRep: document.getElementById('swAccountRep').value
            },
            invoice: pendingInvoice
        };

        await DataService.saveSoftware(software);
        pendingInvoice = null;
        closeModal();
        await loadSoftware();
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function exportSoftware() {
    DataService.exportSoftwareToCSV();
}
