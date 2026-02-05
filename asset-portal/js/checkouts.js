/**
 * Equipment Checkout Management Page - Real-time updates
 */

let checkoutsData = { checkouts: [], borrowerTypes: [], equipmentTypes: [] };
let currentEquipment = [];
let currentViewCheckout = null;
let filtersPopulated = false;

document.addEventListener('DOMContentLoaded', async function() {
    setupModalHandlers();
    setupForm();
    await loadData();
});

async function loadData() {
    try {
        checkoutsData = await DataService.getCheckouts();
        if (!checkoutsData.borrowerTypes) checkoutsData.borrowerTypes = ['Student', 'Faculty', 'Staff', 'Guest'];
        if (!checkoutsData.equipmentTypes) checkoutsData.equipmentTypes = ['Laptop', 'Display Tablet', 'Non-Display Tablet', 'Monitor', 'Camera', 'Other'];

        if (!filtersPopulated) {
            populateFilters();
            filtersPopulated = true;
        }

        updateStats();
        filterCheckouts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function populateFilters() {
    const typeSelect = document.getElementById('filterBorrowerType');
    const formTypeSelect = document.getElementById('borrowerType');

    typeSelect.textContent = '';
    formTypeSelect.textContent = '';

    typeSelect.add(new Option('All Types', ''));
    checkoutsData.borrowerTypes.forEach(type => {
        typeSelect.add(new Option(type, type));
        formTypeSelect.add(new Option(type, type));
    });
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const active = checkoutsData.checkouts.filter(c => c.status === 'Active').length;
    const overdue = checkoutsData.checkouts.filter(c => c.status === 'Active' && c.dueDate < today).length;
    const returned = checkoutsData.checkouts.filter(c => c.status === 'Returned').length;
    const equipmentOut = checkoutsData.checkouts
        .filter(c => c.status === 'Active')
        .reduce((sum, c) => sum + (c.equipment || []).filter(eq => !eq.returnedDate).length, 0);

    document.getElementById('statActive').textContent = active;
    document.getElementById('statOverdue').textContent = overdue;
    document.getElementById('statEquipmentOut').textContent = equipmentOut;
    document.getElementById('statReturned').textContent = returned;
}

function getEquipmentIcon(type) {
    const icons = {
        'Laptop': 'fa-laptop',
        'Display Tablet': 'fa-tablet-screen-button',
        'Non-Display Tablet': 'fa-tablet',
        'Monitor': 'fa-desktop',
        'Camera': 'fa-camera',
        'Other': 'fa-box'
    };
    return icons[type] || 'fa-box';
}

function getStatusClass(status) {
    const classes = {
        'Active': 'status-active',
        'Returned': 'status-returned',
        'Overdue': 'status-overdue',
        'Lost': 'status-lost'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
}

function renderCheckouts(checkouts) {
    const container = document.getElementById('checkoutsList');
    container.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    if (checkouts.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'text-center py-12 text-gray-400';
        const icon = document.createElement('i');
        icon.className = 'fas fa-clipboard-check text-3xl mb-2';
        emptyDiv.appendChild(icon);
        const text = document.createElement('p');
        text.textContent = 'No checkout records';
        emptyDiv.appendChild(text);
        container.appendChild(emptyDiv);
        return;
    }

    const sorted = [...checkouts].sort((a, b) => new Date(b.checkoutDate) - new Date(a.checkoutDate));

    sorted.forEach(checkout => {
        const isOverdue = checkout.status === 'Active' && checkout.dueDate < today;
        const displayStatus = isOverdue ? 'Overdue' : checkout.status;
        const equipmentCount = (checkout.equipment || []).length;
        const returnedCount = (checkout.equipment || []).filter(eq => eq.returnedDate).length;

        const row = document.createElement('div');
        row.className = 'p-4 hover:bg-gray-50 cursor-pointer border-b';
        row.onclick = () => openViewModal(checkout.id);

        const mainContent = document.createElement('div');
        mainContent.className = 'flex items-start justify-between gap-4';

        // Left side
        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex-1';

        const nameRow = document.createElement('div');
        nameRow.className = 'flex items-center gap-2 flex-wrap';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'font-semibold text-gray-900';
        nameSpan.textContent = checkout.fullName;
        nameRow.appendChild(nameSpan);

        const typeSpan = document.createElement('span');
        typeSpan.className = 'text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600';
        typeSpan.textContent = checkout.borrowerType;
        nameRow.appendChild(typeSpan);

        const statusSpan = document.createElement('span');
        statusSpan.className = `text-xs px-2 py-0.5 rounded-full ${getStatusClass(displayStatus)}`;
        statusSpan.textContent = displayStatus;
        nameRow.appendChild(statusSpan);

        leftDiv.appendChild(nameRow);

        const contactDiv = document.createElement('div');
        contactDiv.className = 'text-sm text-gray-500 mt-1';
        const contactParts = [];
        if (checkout.studentId) contactParts.push(`ID: ${checkout.studentId}`);
        contactParts.push(checkout.csunEmail);
        if (checkout.phoneNumber) contactParts.push(checkout.phoneNumber);
        contactDiv.textContent = contactParts.join(' | ');
        leftDiv.appendChild(contactDiv);

        const equipmentDiv = document.createElement('div');
        equipmentDiv.className = 'mt-2 flex flex-wrap gap-1';

        (checkout.equipment || []).forEach(eq => {
            const tag = document.createElement('span');
            tag.className = `equipment-tag ${eq.returnedDate ? 'returned' : ''}`;
            const icon = document.createElement('i');
            icon.className = `fas ${getEquipmentIcon(eq.type)}`;
            tag.appendChild(icon);
            tag.appendChild(document.createTextNode(' ' + eq.name));
            equipmentDiv.appendChild(tag);
        });
        leftDiv.appendChild(equipmentDiv);
        mainContent.appendChild(leftDiv);

        // Right side
        const rightDiv = document.createElement('div');
        rightDiv.className = 'text-right shrink-0';

        const dateDiv = document.createElement('div');
        dateDiv.className = 'text-sm text-gray-600';
        const calIcon = document.createElement('i');
        calIcon.className = 'fas fa-calendar-alt mr-1';
        dateDiv.appendChild(calIcon);
        dateDiv.appendChild(document.createTextNode('Out: ' + formatDate(checkout.checkoutDate)));
        rightDiv.appendChild(dateDiv);

        const dueDiv = document.createElement('div');
        dueDiv.className = `text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`;
        const clockIcon = document.createElement('i');
        clockIcon.className = 'fas fa-clock mr-1';
        dueDiv.appendChild(clockIcon);
        dueDiv.appendChild(document.createTextNode('Due: ' + formatDate(checkout.dueDate)));
        rightDiv.appendChild(dueDiv);

        if (checkout.status === 'Active' && equipmentCount > 0) {
            const progressDiv = document.createElement('div');
            progressDiv.className = 'text-xs text-gray-500 mt-1';
            progressDiv.textContent = `${returnedCount}/${equipmentCount} returned`;
            rightDiv.appendChild(progressDiv);
        }

        mainContent.appendChild(rightDiv);
        row.appendChild(mainContent);
        container.appendChild(row);
    });
}

function filterCheckouts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    const borrowerType = document.getElementById('filterBorrowerType').value;
    const today = new Date().toISOString().split('T')[0];

    const filtered = checkoutsData.checkouts.filter(checkout => {
        const isOverdue = checkout.status === 'Active' && checkout.dueDate < today;
        const effectiveStatus = isOverdue ? 'Overdue' : checkout.status;

        const matchSearch = !search ||
            checkout.fullName.toLowerCase().includes(search) ||
            (checkout.studentId && checkout.studentId.includes(search)) ||
            checkout.csunEmail.toLowerCase().includes(search) ||
            (checkout.equipment || []).some(eq =>
                eq.name.toLowerCase().includes(search) ||
                (eq.assetTag && eq.assetTag.toLowerCase().includes(search))
            );
        const matchStatus = !status || effectiveStatus === status;
        const matchType = !borrowerType || checkout.borrowerType === borrowerType;

        return matchSearch && matchStatus && matchType;
    });

    renderCheckouts(filtered);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterBorrowerType').value = '';
    renderCheckouts(checkoutsData.checkouts);
}

// ==================== Modal Handlers ====================

function setupModalHandlers() {
    ['checkoutModal', 'viewModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (modalId === 'checkoutModal') closeCheckoutModal();
                    else closeViewModal();
                }
            });
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('checkoutModal').classList.contains('active')) closeCheckoutModal();
            if (document.getElementById('viewModal').classList.contains('active')) closeViewModal();
        }
    });
}

// ==================== New Checkout Modal ====================

function openCheckoutModal() {
    currentEquipment = [];
    document.getElementById('checkoutForm').reset();
    renderEquipmentList();

    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    document.getElementById('dueDate').value = twoWeeks.toISOString().split('T')[0];

    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    currentEquipment = [];
}

function addEquipmentItem() {
    const type = document.getElementById('newEquipmentType').value;
    const name = document.getElementById('newEquipmentName').value.trim();
    const tag = document.getElementById('newEquipmentTag').value.trim();

    if (!name) {
        alert('Please enter equipment name');
        return;
    }

    currentEquipment.push({
        id: 'EQ-' + Date.now(),
        type: type,
        name: name,
        assetTag: tag,
        returnedDate: null
    });

    document.getElementById('newEquipmentName').value = '';
    document.getElementById('newEquipmentTag').value = '';
    renderEquipmentList();
}

function removeEquipmentItem(index) {
    currentEquipment.splice(index, 1);
    renderEquipmentList();
}

function renderEquipmentList() {
    const container = document.getElementById('equipmentList');
    container.innerHTML = '';

    if (currentEquipment.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'text-sm text-gray-400 text-center py-4 border border-dashed rounded-lg';
        emptyDiv.textContent = 'No equipment added yet. Add items below.';
        container.appendChild(emptyDiv);
        return;
    }

    currentEquipment.forEach((eq, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-lg';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center gap-2';

        const icon = document.createElement('i');
        icon.className = `fas ${getEquipmentIcon(eq.type)} text-gray-500`;
        leftDiv.appendChild(icon);

        const textDiv = document.createElement('div');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'font-medium text-sm';
        nameSpan.textContent = eq.name;
        textDiv.appendChild(nameSpan);

        if (eq.assetTag) {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'text-xs text-gray-500 ml-2';
            tagSpan.textContent = `(${eq.assetTag})`;
            textDiv.appendChild(tagSpan);
        }

        const typeSpan = document.createElement('div');
        typeSpan.className = 'text-xs text-gray-400';
        typeSpan.textContent = eq.type;
        textDiv.appendChild(typeSpan);

        leftDiv.appendChild(textDiv);
        item.appendChild(leftDiv);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'text-red-500 hover:text-red-700 p-1';
        removeBtn.onclick = () => removeEquipmentItem(index);
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-times';
        removeBtn.appendChild(removeIcon);
        item.appendChild(removeBtn);

        container.appendChild(item);
    });
}

function setupForm() {
    document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (currentEquipment.length === 0) {
            alert('Please add at least one equipment item');
            return;
        }

        const checkout = {
            fullName: document.getElementById('fullName').value,
            studentId: document.getElementById('studentId').value,
            csunEmail: document.getElementById('csunEmail').value,
            personalEmail: document.getElementById('personalEmail').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            borrowerType: document.getElementById('borrowerType').value,
            equipment: currentEquipment,
            checkoutDate: new Date().toISOString().split('T')[0],
            dueDate: document.getElementById('dueDate').value,
            checkedInDate: null,
            purpose: document.getElementById('checkoutPurpose').value,
            status: 'Active',
            notes: document.getElementById('checkoutNotes').value,
            checkedOutBy: document.getElementById('checkedOutBy').value
        };

        await DataService.saveCheckout(checkout);
        closeCheckoutModal();
        await loadData();
    });
}

// ==================== View Modal - Real-time Updates ====================

function openViewModal(checkoutId) {
    const checkout = checkoutsData.checkouts.find(c => c.id === checkoutId);
    if (!checkout) return;

    // Create a deep copy to work with
    currentViewCheckout = JSON.parse(JSON.stringify(checkout));
    renderViewModalContent();
    document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
    currentViewCheckout = null;
}

function renderViewModalContent() {
    if (!currentViewCheckout) return;

    const content = document.getElementById('viewModalContent');
    // Force clear all content
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    const today = new Date().toISOString().split('T')[0];
    const isOverdue = currentViewCheckout.status === 'Active' && currentViewCheckout.dueDate < today;
    const displayStatus = isOverdue ? 'Overdue' : currentViewCheckout.status;

    // Status banner
    const statusBanner = document.createElement('div');
    statusBanner.className = `text-center py-3 px-4 rounded-lg mb-4 font-bold text-lg ${getStatusClass(displayStatus)}`;
    statusBanner.textContent = displayStatus.toUpperCase();
    content.appendChild(statusBanner);

    // Borrower section
    const borrowerSection = document.createElement('div');
    borrowerSection.className = 'mb-4';

    const borrowerTitle = document.createElement('h3');
    borrowerTitle.className = 'font-semibold text-gray-700 mb-2 text-sm';
    const userIcon = document.createElement('i');
    userIcon.className = 'fas fa-user mr-2';
    borrowerTitle.appendChild(userIcon);
    borrowerTitle.appendChild(document.createTextNode('Borrower'));
    borrowerSection.appendChild(borrowerTitle);

    const borrowerInfo = document.createElement('div');
    borrowerInfo.className = 'bg-gray-50 rounded-lg p-3 space-y-1 text-sm';

    const infoLines = [
        { label: 'Name', value: currentViewCheckout.fullName },
        { label: 'Type', value: currentViewCheckout.borrowerType },
        { label: 'ID', value: currentViewCheckout.studentId || 'N/A' },
        { label: 'Email', value: currentViewCheckout.csunEmail },
        { label: 'Phone', value: currentViewCheckout.phoneNumber || 'N/A' }
    ];

    infoLines.forEach(line => {
        const div = document.createElement('div');
        div.className = 'flex justify-between';
        const label = document.createElement('span');
        label.className = 'text-gray-500';
        label.textContent = line.label + ':';
        const value = document.createElement('span');
        value.className = 'font-medium';
        value.textContent = line.value;
        div.appendChild(label);
        div.appendChild(value);
        borrowerInfo.appendChild(div);
    });

    borrowerSection.appendChild(borrowerInfo);
    content.appendChild(borrowerSection);

    // Equipment section
    const equipmentSection = document.createElement('div');
    equipmentSection.className = 'mb-4';

    const equipmentTitle = document.createElement('h3');
    equipmentTitle.className = 'font-semibold text-gray-700 mb-2 text-sm';
    const laptopIcon = document.createElement('i');
    laptopIcon.className = 'fas fa-laptop mr-2';
    equipmentTitle.appendChild(laptopIcon);
    equipmentTitle.appendChild(document.createTextNode('Equipment'));
    equipmentSection.appendChild(equipmentTitle);

    const equipmentList = document.createElement('div');
    equipmentList.className = 'space-y-2';

    (currentViewCheckout.equipment || []).forEach((eq, index) => {
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-3 rounded-lg ${eq.returnedDate ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center gap-3';

        const icon = document.createElement('i');
        icon.className = `fas ${getEquipmentIcon(eq.type)} ${eq.returnedDate ? 'text-green-500' : 'text-gray-500'}`;
        leftDiv.appendChild(icon);

        const textDiv = document.createElement('div');
        const nameSpan = document.createElement('div');
        nameSpan.className = `font-medium ${eq.returnedDate ? 'line-through text-gray-400' : ''}`;
        nameSpan.textContent = eq.name;
        textDiv.appendChild(nameSpan);

        const detailSpan = document.createElement('div');
        detailSpan.className = 'text-xs text-gray-500';
        detailSpan.textContent = eq.assetTag ? `${eq.type} - ${eq.assetTag}` : eq.type;
        textDiv.appendChild(detailSpan);

        if (eq.returnedDate) {
            const returnedSpan = document.createElement('div');
            returnedSpan.className = 'text-xs text-green-600 font-medium';
            returnedSpan.textContent = `✓ Returned: ${formatDate(eq.returnedDate)}`;
            textDiv.appendChild(returnedSpan);
        }

        leftDiv.appendChild(textDiv);
        item.appendChild(leftDiv);

        // Only show return button if checkout is Active and item not returned
        if (currentViewCheckout.status === 'Active' && !eq.returnedDate) {
            const returnBtn = document.createElement('button');
            returnBtn.className = 'bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-medium';
            returnBtn.textContent = 'Return';
            const idx = index;
            returnBtn.onclick = function(e) {
                e.stopPropagation();
                returnSingleItem(idx);
            };
            item.appendChild(returnBtn);
        }

        equipmentList.appendChild(item);
    });

    equipmentSection.appendChild(equipmentList);
    content.appendChild(equipmentSection);

    // Dates
    const datesSection = document.createElement('div');
    datesSection.className = 'grid grid-cols-2 gap-3 mb-4';

    const outDate = document.createElement('div');
    outDate.className = 'bg-gray-50 rounded-lg p-3 text-center';
    const outLabel = document.createElement('div');
    outLabel.className = 'text-xs text-gray-500';
    outLabel.textContent = 'Checked Out';
    const outValue = document.createElement('div');
    outValue.className = 'font-semibold';
    outValue.textContent = formatDate(currentViewCheckout.checkoutDate);
    outDate.appendChild(outLabel);
    outDate.appendChild(outValue);
    datesSection.appendChild(outDate);

    const dueDate = document.createElement('div');
    dueDate.className = `${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'} rounded-lg p-3 text-center`;
    const dueLabel = document.createElement('div');
    dueLabel.className = `text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`;
    dueLabel.textContent = 'Due Date';
    const dueValue = document.createElement('div');
    dueValue.className = `font-semibold ${isOverdue ? 'text-red-600' : ''}`;
    dueValue.textContent = formatDate(currentViewCheckout.dueDate);
    dueDate.appendChild(dueLabel);
    dueDate.appendChild(dueValue);
    datesSection.appendChild(dueDate);

    content.appendChild(datesSection);

    // Action buttons - only show for Active checkouts
    if (currentViewCheckout.status === 'Active') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'flex gap-2 pt-4 border-t';

        const allReturned = (currentViewCheckout.equipment || []).every(eq => eq.returnedDate);

        if (!allReturned) {
            const returnAllBtn = document.createElement('button');
            returnAllBtn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium';
            const returnIcon = document.createElement('i');
            returnIcon.className = 'fas fa-check-double mr-2';
            returnAllBtn.appendChild(returnIcon);
            returnAllBtn.appendChild(document.createTextNode('Return All'));
            returnAllBtn.onclick = function() { returnAllItems(); };
            actionsDiv.appendChild(returnAllBtn);
        } else {
            const completeBtn = document.createElement('button');
            completeBtn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium';
            const completeIcon = document.createElement('i');
            completeIcon.className = 'fas fa-check mr-2';
            completeBtn.appendChild(completeIcon);
            completeBtn.appendChild(document.createTextNode('Complete Checkout'));
            completeBtn.onclick = function() { completeCheckout(); };
            actionsDiv.appendChild(completeBtn);
        }

        const lostBtn = document.createElement('button');
        lostBtn.className = 'flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium';
        const lostIcon = document.createElement('i');
        lostIcon.className = 'fas fa-exclamation-triangle mr-2';
        lostBtn.appendChild(lostIcon);
        lostBtn.appendChild(document.createTextNode('Mark Lost'));
        lostBtn.onclick = function() { markAsLost(); };
        actionsDiv.appendChild(lostBtn);

        content.appendChild(actionsDiv);
    } else {
        // Show final status for non-active checkouts
        const finalStatus = document.createElement('div');
        finalStatus.className = 'text-center py-3 border-t text-sm text-gray-500';
        if (currentViewCheckout.status === 'Returned') {
            finalStatus.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-2"></i>All items returned on ' + formatDate(currentViewCheckout.checkedInDate);
        } else if (currentViewCheckout.status === 'Lost') {
            finalStatus.innerHTML = '<i class="fas fa-exclamation-triangle text-orange-500 mr-2"></i>Marked as lost';
        }
        content.appendChild(finalStatus);
    }
}

async function returnSingleItem(equipmentIndex) {
    if (!currentViewCheckout) return;

    const today = new Date().toISOString().split('T')[0];

    // Update the equipment item
    currentViewCheckout.equipment[equipmentIndex].returnedDate = today;

    // Check if all items are now returned
    const allReturned = currentViewCheckout.equipment.every(eq => eq.returnedDate);
    if (allReturned) {
        currentViewCheckout.status = 'Returned';
        currentViewCheckout.checkedInDate = today;
    }

    // Save to DataService
    await DataService.saveCheckout(currentViewCheckout);

    // Update the local data array
    const index = checkoutsData.checkouts.findIndex(c => c.id === currentViewCheckout.id);
    if (index >= 0) {
        checkoutsData.checkouts[index] = JSON.parse(JSON.stringify(currentViewCheckout));
    }

    // Update UI immediately
    updateStats();
    filterCheckouts();

    // Force re-render the modal content
    renderViewModalContent();
}

async function returnAllItems() {
    if (!currentViewCheckout) return;

    const today = new Date().toISOString().split('T')[0];

    // Mark all equipment as returned
    currentViewCheckout.equipment.forEach(eq => {
        if (!eq.returnedDate) eq.returnedDate = today;
    });

    currentViewCheckout.status = 'Returned';
    currentViewCheckout.checkedInDate = today;

    // Save to DataService
    await DataService.saveCheckout(currentViewCheckout);

    // Update local data
    const index = checkoutsData.checkouts.findIndex(c => c.id === currentViewCheckout.id);
    if (index >= 0) {
        checkoutsData.checkouts[index] = JSON.parse(JSON.stringify(currentViewCheckout));
    }

    // Update UI
    updateStats();
    filterCheckouts();
    renderViewModalContent();
}

async function completeCheckout() {
    if (!currentViewCheckout) return;

    currentViewCheckout.status = 'Returned';
    currentViewCheckout.checkedInDate = new Date().toISOString().split('T')[0];

    await DataService.saveCheckout(currentViewCheckout);

    const index = checkoutsData.checkouts.findIndex(c => c.id === currentViewCheckout.id);
    if (index >= 0) {
        checkoutsData.checkouts[index] = JSON.parse(JSON.stringify(currentViewCheckout));
    }

    updateStats();
    filterCheckouts();
    renderViewModalContent();
}

async function markAsLost() {
    if (!currentViewCheckout) return;

    if (!confirm(`Mark this checkout as LOST?\n\nBorrower: ${currentViewCheckout.fullName}\n\nThis action cannot be undone.`)) {
        return;
    }

    // Update status
    currentViewCheckout.status = 'Lost';
    currentViewCheckout.notes = currentViewCheckout.notes
        ? `${currentViewCheckout.notes}\n\nMarked as LOST on ${new Date().toLocaleDateString()}`
        : `Marked as LOST on ${new Date().toLocaleDateString()}`;

    // Save to DataService
    await DataService.saveCheckout(currentViewCheckout);

    // Update local data
    const index = checkoutsData.checkouts.findIndex(c => c.id === currentViewCheckout.id);
    if (index >= 0) {
        checkoutsData.checkouts[index] = JSON.parse(JSON.stringify(currentViewCheckout));
    }

    // Update UI immediately
    updateStats();
    filterCheckouts();

    // Force re-render the modal
    renderViewModalContent();
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function exportCheckouts() {
    DataService.exportCheckoutsToCSV();
}
