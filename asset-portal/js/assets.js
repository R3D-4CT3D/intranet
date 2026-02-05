/**
 * IT Assets Management Page - Optimized for real-time updates
 */

let assetsData = { assets: [], categories: [], types: {}, statuses: [], conditions: [], locations: [] };
let currentViewAsset = null;
let filtersPopulated = false;

// HTML escape function
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async function() {
    setupModalHandlers();
    setupForm();
    await loadAssets();
});

async function loadAssets() {
    try {
        assetsData = await DataService.getAssets();
        ensureDefaults();

        if (!filtersPopulated) {
            populateFilters();
            filtersPopulated = true;
        }

        filterAssets(); // Re-apply current filters
    } catch (error) {
        console.error('Error loading assets:', error);
        ensureDefaults();
        if (!filtersPopulated) {
            populateFilters();
            filtersPopulated = true;
        }
        renderAssets([]);
    }
}

function ensureDefaults() {
    if (!assetsData.categories || assetsData.categories.length === 0) {
        assetsData.categories = ['Computer', 'Monitor', 'Printer', 'Camera', 'Audio', 'Lighting', 'Accessories', 'Software License', 'Other'];
    }
    if (!assetsData.types || Object.keys(assetsData.types).length === 0) {
        assetsData.types = {
            'Computer': ['Desktop', 'Laptop', 'Workstation', 'Mac Pro', 'iMac'],
            'Monitor': ['24 inch', '27 inch', '32 inch', '4K', 'Ultrawide'],
            'Printer': ['Inkjet', 'Laser', 'Large Format', '3D Printer'],
            'Camera': ['DSLR', 'Mirrorless', 'Video', 'Action Cam', 'Webcam'],
            'Audio': ['Microphone', 'Headphones', 'Speakers', 'Audio Interface', 'Mixer'],
            'Lighting': ['LED Panel', 'Softbox', 'Ring Light', 'Strobe', 'Continuous'],
            'Accessories': ['Tripod', 'Memory Card', 'Cable', 'Adapter', 'Case'],
            'Software License': ['Adobe CC', 'Microsoft 365', 'AutoCAD', 'Maya', 'Other'],
            'Other': ['Miscellaneous']
        };
    }
    if (!assetsData.statuses || assetsData.statuses.length === 0) {
        assetsData.statuses = ['Available', 'Checked Out', 'In Repair', 'Reserved', 'Retired', 'Lost'];
    }
    if (!assetsData.conditions || assetsData.conditions.length === 0) {
        assetsData.conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Non-functional'];
    }
    if (!assetsData.locations || assetsData.locations.length === 0) {
        assetsData.locations = [
            'AC 100', 'AC 101', 'AC 102', 'AC 103', 'AC 104', 'AC 110', 'AC 120', 'AC 122', 'AC 124', 'AC 126', 'AC 127', 'AC 128',
            'AC 200', 'AC 201', 'AC 202', 'AC 203', 'AC 204', 'AC 204A', 'AC 204B', 'AC 204C', 'AC 205', 'AC 206', 'AC 210', 'AC 210A', 'AC 211',
            'AC 300', 'AC 301', 'AC 301A', 'AC 313', 'AC 316', 'AC 317', 'AC 317A', 'AC 318', 'AC 318A', 'AC 318B', 'AC 318C', 'AC 318D', 'AC 319', 'AC 320', 'AC 320A', 'AC 321', 'AC 321A', 'AC 321B', 'AC 322', 'AC 323', 'AC 324',
            'AC 400', 'AC 401', 'AC 402', 'AC 403', 'AC 404', 'AC 405', 'AC 407', 'AC 407A', 'AC 408', 'AC 408D', 'AC 409', 'AC 410', 'AC 411',
            'AC 500', 'AC 500A', 'AC 500B', 'AC 501', 'AC 502', 'AC 503', 'AC 504', 'AC 504A', 'AC 505', 'AC 506', 'AC 506A', 'AC 507', 'AC 508', 'AC 509', 'AC 510', 'AC 510A', 'AC 510B', 'AC 510C', 'AC 510D', 'AC 511', 'AC 511B', 'AC 512', 'AC 512A', 'AC 512B', 'AC 512D',
            'AC 600', 'AC 600A', 'AC 600B', 'AC 600C', 'AC 602', 'AC 604', 'AC 606',
            'Storage', 'Other'
        ];
    }
}

function populateFilters() {
    // Categories - clear first
    const catSelect = document.getElementById('filterCategory');
    const formCatSelect = document.getElementById('assetCategory');
    catSelect.textContent = '';
    formCatSelect.textContent = '';

    catSelect.add(new Option('All Categories', ''));
    formCatSelect.add(new Option('Select category...', ''));
    assetsData.categories.forEach(cat => {
        catSelect.add(new Option(cat, cat));
        formCatSelect.add(new Option(cat, cat));
    });

    // Statuses - clear first
    const statusSelect = document.getElementById('filterStatus');
    const formStatusSelect = document.getElementById('assetStatus');
    statusSelect.textContent = '';
    formStatusSelect.textContent = '';

    statusSelect.add(new Option('All Statuses', ''));
    formStatusSelect.add(new Option('Select status...', ''));
    assetsData.statuses.forEach(status => {
        statusSelect.add(new Option(status, status));
        formStatusSelect.add(new Option(status, status));
    });

    // Locations - clear first
    const locSelect = document.getElementById('filterLocation');
    const formLocSelect = document.getElementById('assetLocation');
    locSelect.textContent = '';
    formLocSelect.textContent = '';

    locSelect.add(new Option('All Locations', ''));
    formLocSelect.add(new Option('Select location...', ''));
    assetsData.locations.forEach(loc => {
        locSelect.add(new Option(loc, loc));
        formLocSelect.add(new Option(loc, loc));
    });

    // Conditions - clear first
    const condSelect = document.getElementById('assetCondition');
    condSelect.textContent = '';
    condSelect.add(new Option('Select condition...', ''));
    assetsData.conditions.forEach(cond => {
        condSelect.add(new Option(cond, cond));
    });
}

function updateTypeOptions() {
    const category = document.getElementById('assetCategory').value;
    const typeSelect = document.getElementById('assetType');
    typeSelect.textContent = '';
    typeSelect.add(new Option('Select type...', ''));

    if (category && assetsData.types[category]) {
        assetsData.types[category].forEach(type => {
            typeSelect.add(new Option(type, type));
        });
    }
}

function createActionButton(iconClass, colorClass, title, clickHandler) {
    const btn = document.createElement('button');
    btn.className = `${colorClass} px-2 py-1`;
    btn.title = title;
    btn.type = 'button';
    btn.onclick = (e) => {
        e.stopPropagation();
        clickHandler();
    };
    const icon = document.createElement('i');
    icon.className = iconClass;
    btn.appendChild(icon);
    return btn;
}

function renderAssets(assets) {
    const tbody = document.getElementById('assetsTableBody');
    tbody.textContent = '';

    if (assets.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.className = 'text-center py-12 text-gray-400';
        const icon = document.createElement('i');
        icon.className = 'fas fa-box-open text-3xl mb-2';
        const text = document.createElement('p');
        text.textContent = 'No assets found';
        cell.appendChild(icon);
        cell.appendChild(document.createElement('br'));
        cell.appendChild(text);
        row.appendChild(cell);
        tbody.appendChild(row);
        document.getElementById('showingCount').textContent = '0';
        document.getElementById('totalCount').textContent = assetsData.assets.length;
        return;
    }

    assets.forEach(asset => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 cursor-pointer';
        row.onclick = () => viewAsset(asset.id);

        // Asset name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'px-4 py-3';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'font-medium text-gray-900';
        nameDiv.textContent = asset.name;
        const typeDiv = document.createElement('div');
        typeDiv.className = 'text-xs text-gray-500';
        typeDiv.textContent = asset.type || '';
        nameCell.appendChild(nameDiv);
        nameCell.appendChild(typeDiv);

        // Category cell
        const catCell = document.createElement('td');
        catCell.className = 'px-4 py-3 text-sm text-gray-600';
        catCell.textContent = asset.category;

        // CSUN Tag cell
        const tagCell = document.createElement('td');
        tagCell.className = 'px-4 py-3';
        const tagCode = document.createElement('code');
        tagCode.className = 'text-xs bg-gray-100 px-2 py-1 rounded';
        tagCode.textContent = asset.csunTag || 'N/A';
        tagCell.appendChild(tagCode);

        // Location cell
        const locCell = document.createElement('td');
        locCell.className = 'px-4 py-3 text-sm text-gray-600';
        locCell.textContent = asset.location;

        // Status cell
        const statusCell = document.createElement('td');
        statusCell.className = 'px-4 py-3';
        const statusSpan = document.createElement('span');
        statusSpan.className = `text-xs px-2 py-1 rounded-full ${getStatusClass(asset.status)}`;
        statusSpan.textContent = asset.status;
        statusCell.appendChild(statusSpan);

        // Assigned To cell
        const assignedCell = document.createElement('td');
        assignedCell.className = 'px-4 py-3 text-sm text-gray-600';
        assignedCell.textContent = asset.assignedTo || '-';

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-3 text-center';

        const assetId = asset.id;
        actionsCell.appendChild(createActionButton('fas fa-eye', 'text-blue-600 hover:text-blue-800', 'View', () => viewAsset(assetId)));
        actionsCell.appendChild(createActionButton('fas fa-edit', 'text-green-600 hover:text-green-800', 'Edit', () => editAsset(assetId)));
        actionsCell.appendChild(createActionButton('fas fa-trash', 'text-red-600 hover:text-red-800', 'Delete', () => deleteAsset(assetId)));

        row.appendChild(nameCell);
        row.appendChild(catCell);
        row.appendChild(tagCell);
        row.appendChild(locCell);
        row.appendChild(statusCell);
        row.appendChild(assignedCell);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });

    document.getElementById('showingCount').textContent = assets.length;
    document.getElementById('totalCount').textContent = assetsData.assets.length;
}

function getStatusClass(status) {
    const classes = {
        'Available': 'status-available',
        'Checked Out': 'status-checked-out',
        'In Repair': 'status-in-repair',
        'Reserved': 'status-reserved',
        'Retired': 'status-retired',
        'Lost': 'status-in-repair'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
}

function filterAssets() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const status = document.getElementById('filterStatus').value;
    const location = document.getElementById('filterLocation').value;

    const filtered = assetsData.assets.filter(asset => {
        const matchSearch = !search ||
            asset.name.toLowerCase().includes(search) ||
            (asset.csunTag && asset.csunTag.toLowerCase().includes(search)) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(search));
        const matchCategory = !category || asset.category === category;
        const matchStatus = !status || asset.status === status;
        const matchLocation = !location || asset.location === location;

        return matchSearch && matchCategory && matchStatus && matchLocation;
    });

    renderAssets(filtered);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterLocation').value = '';
    renderAssets(assetsData.assets);
}

// ==================== Modal Functions ====================

function setupModalHandlers() {
    // Click outside to close for all modals
    ['assetModal', 'viewModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (modalId === 'assetModal') closeModal();
                    else if (modalId === 'viewModal') closeViewModal();
                }
            });
        }
    });

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('assetModal').classList.contains('active')) {
                closeModal();
            }
            if (document.getElementById('viewModal').classList.contains('active')) {
                closeViewModal();
            }
        }
    });

    // Close assignee dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('assigneeDropdown');
        const input = document.getElementById('assetAssignedTo');
        if (dropdown && input && !dropdown.contains(e.target) && e.target !== input) {
            dropdown.classList.add('hidden');
        }
    });
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Asset';
    document.getElementById('assetForm').reset();
    document.getElementById('assetId').value = '';
    updateTypeOptions();
    document.getElementById('assetModal').classList.add('active');
}

function closeModal() {
    document.getElementById('assetModal').classList.remove('active');
}

function editAsset(id) {
    const asset = assetsData.assets.find(a => a.id === id);
    if (!asset) {
        console.error('Asset not found:', id);
        return;
    }

    document.getElementById('modalTitle').textContent = 'Edit Asset';
    document.getElementById('assetId').value = asset.id;
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetCategory').value = asset.category;
    updateTypeOptions();
    document.getElementById('assetType').value = asset.type || '';
    document.getElementById('assetSerial').value = asset.serialNumber || '';
    document.getElementById('assetCsunTag').value = asset.csunTag || '';
    document.getElementById('assetLocation').value = asset.location || '';
    document.getElementById('assetStatus').value = asset.status || '';
    document.getElementById('assetCondition').value = asset.condition || '';
    document.getElementById('assetAssignedTo').value = asset.assignedTo || '';
    document.getElementById('assetPurchaseDate').value = asset.purchaseDate || '';
    document.getElementById('assetWarrantyExpiry').value = asset.warrantyExpiry || '';
    document.getElementById('assetNotes').value = asset.notes || '';

    document.getElementById('assetModal').classList.add('active');
}

function viewAsset(id) {
    const asset = assetsData.assets.find(a => a.id === id);
    if (!asset) return;

    currentViewAsset = asset;
    const content = document.getElementById('viewModalContent');
    content.textContent = '';

    const grid = document.createElement('div');
    grid.className = 'space-y-3';

    const fields = [
        { label: 'Name', value: asset.name },
        { label: 'Category', value: `${asset.category}${asset.type ? ' - ' + asset.type : ''}` },
        { label: 'CSUN Tag', value: asset.csunTag || 'N/A' },
        { label: 'Serial Number', value: asset.serialNumber || 'N/A' },
        { label: 'Location', value: asset.location },
        { label: 'Status', value: asset.status, isStatus: true },
        { label: 'Condition', value: asset.condition || 'N/A' },
        { label: 'Assigned To', value: asset.assignedTo || 'Unassigned' },
        { label: 'Purchase Date', value: asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A' },
        { label: 'Warranty Expiry', value: asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'N/A' },
        { label: 'Notes', value: asset.notes || 'No notes' }
    ];

    fields.forEach(field => {
        const row = document.createElement('div');
        row.className = 'flex justify-between py-2 border-b';

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
        grid.appendChild(row);
    });

    content.appendChild(grid);
    document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
    currentViewAsset = null;
}

function editFromView() {
    if (currentViewAsset) {
        closeViewModal();
        editAsset(currentViewAsset.id);
    }
}

async function deleteAsset(id) {
    const asset = assetsData.assets.find(a => a.id === id);
    if (!asset) return;

    if (confirm(`Delete "${asset.name}"?\n\nThis action cannot be undone.`)) {
        try {
            await DataService.deleteAsset(id);
            await loadAssets();
        } catch (error) {
            console.error('Error deleting asset:', error);
            alert('Error deleting asset. Please try again.');
        }
    }
}

function setupForm() {
    document.getElementById('assetForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const asset = {
            id: document.getElementById('assetId').value || null,
            name: document.getElementById('assetName').value,
            category: document.getElementById('assetCategory').value,
            type: document.getElementById('assetType').value,
            serialNumber: document.getElementById('assetSerial').value,
            csunTag: document.getElementById('assetCsunTag').value,
            location: document.getElementById('assetLocation').value,
            status: document.getElementById('assetStatus').value,
            condition: document.getElementById('assetCondition').value,
            assignedTo: document.getElementById('assetAssignedTo').value || null,
            purchaseDate: document.getElementById('assetPurchaseDate').value || null,
            warrantyExpiry: document.getElementById('assetWarrantyExpiry').value || null,
            notes: document.getElementById('assetNotes').value
        };

        try {
            await DataService.saveAsset(asset);
            closeModal();
            await loadAssets();
            alert('Asset saved successfully!');
        } catch (error) {
            console.error('Error saving asset:', error);
            alert('Error saving asset: ' + (error.message || 'Unknown error. Check console for details.'));
        }
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function exportAssets() {
    DataService.exportAssetsToCSV();
}

// ==================== Autofill ====================
let assigneeSearchTimeout = null;

async function searchAssignee(query) {
    const dropdown = document.getElementById('assigneeDropdown');
    if (!dropdown) return;

    if (assigneeSearchTimeout) clearTimeout(assigneeSearchTimeout);

    if (!query || query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    assigneeSearchTimeout = setTimeout(async () => {
        try {
            const results = await DataService.searchPersonnel(query);
            if (results.length === 0) {
                dropdown.classList.add('hidden');
                return;
            }

            dropdown.textContent = '';
            results.forEach(person => {
                const option = document.createElement('div');
                option.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0';

                const nameSpan = document.createElement('div');
                nameSpan.className = 'font-medium text-gray-900';
                nameSpan.textContent = person.name;

                const detailSpan = document.createElement('div');
                detailSpan.className = 'text-xs text-gray-500';
                detailSpan.textContent = `${person.title} - ${person.category}`;

                option.appendChild(nameSpan);
                option.appendChild(detailSpan);
                option.addEventListener('click', () => {
                    document.getElementById('assetAssignedTo').value = person.name;
                    dropdown.classList.add('hidden');
                });

                dropdown.appendChild(option);
            });
            dropdown.classList.remove('hidden');
        } catch (error) {
            console.error('Error searching personnel:', error);
            dropdown.classList.add('hidden');
        }
    }, 200);
}
