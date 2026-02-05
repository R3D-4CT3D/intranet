/**
 * Room Inventory Management
 */

let roomsData = { rooms: [], roomTypes: [], equipmentTypes: [], equipmentStatuses: [], buildings: [] };
let currentRoom = null;
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', async function() {
    await loadRooms();
    setupForms();
});

async function loadRooms() {
    try {
        roomsData = await DataService.getRooms();

        // Ensure dropdown defaults exist
        if (!roomsData.roomTypes || roomsData.roomTypes.length === 0) {
            roomsData.roomTypes = ['Office', 'Lab', 'Classroom', 'Conference', 'Studio', 'Storage', 'Other'];
        }
        if (!roomsData.equipmentTypes || roomsData.equipmentTypes.length === 0) {
            roomsData.equipmentTypes = ['Computer', 'Display', 'Projector', 'Printer', 'Audio', 'Camera', 'Network', 'Other'];
        }
        if (!roomsData.equipmentStatuses || roomsData.equipmentStatuses.length === 0) {
            roomsData.equipmentStatuses = ['Working', 'In Repair', 'Not Working', 'Retired'];
        }
        if (!roomsData.buildings || roomsData.buildings.length === 0) {
            roomsData.buildings = ['Art Building', 'Design Building'];
        }

        populateFilters();
        renderRooms(roomsData.rooms);
        updateStats();
    } catch (error) {
        console.error('Error loading rooms:', error);
        // Use defaults on error
        roomsData = {
            rooms: [],
            roomTypes: ['Office', 'Lab', 'Classroom', 'Conference', 'Studio', 'Storage', 'Other'],
            equipmentTypes: ['Computer', 'Display', 'Projector', 'Printer', 'Audio', 'Camera', 'Network', 'Other'],
            equipmentStatuses: ['Working', 'In Repair', 'Not Working', 'Retired'],
            buildings: ['Art Building', 'Design Building']
        };
        populateFilters();
        renderRooms(roomsData.rooms);
        updateStats();
    }
}

function populateFilters() {
    // Room types
    const typeSelect = document.getElementById('filterType');
    const formTypeSelect = document.getElementById('roomType');
    roomsData.roomTypes.forEach(type => {
        typeSelect.add(new Option(type, type));
        formTypeSelect.add(new Option(type, type));
    });

    // Buildings
    const buildingSelect = document.getElementById('roomBuilding');
    roomsData.buildings.forEach(b => {
        buildingSelect.add(new Option(b, b));
    });

    // Floors (extract from data)
    const floors = [...new Set(roomsData.rooms.map(r => r.floor).filter(f => f))].sort();
    const floorSelect = document.getElementById('filterFloor');
    floors.forEach(f => {
        floorSelect.add(new Option(`Floor ${f}`, f));
    });

    // Equipment types and statuses for equipment modal
    const eqTypeSelect = document.getElementById('eqType');
    roomsData.equipmentTypes.forEach(t => {
        eqTypeSelect.add(new Option(t, t));
    });

    const eqStatusSelect = document.getElementById('eqStatus');
    roomsData.equipmentStatuses.forEach(s => {
        eqStatusSelect.add(new Option(s, s));
    });
}

function updateStats() {
    const totalRooms = roomsData.rooms.length;
    let totalEquipment = 0;
    let issueCount = 0;

    roomsData.rooms.forEach(room => {
        if (room.equipment) {
            totalEquipment += room.equipment.length;
            room.equipment.forEach(eq => {
                if (eq.status !== 'Working') issueCount++;
            });
        }
    });

    document.getElementById('statRooms').textContent = totalRooms;
    document.getElementById('statWorking').textContent = totalEquipment - issueCount;
    document.getElementById('statIssues').textContent = issueCount;
}

function getEquipmentIcon(type) {
    const icons = {
        'Computer': 'fa-desktop',
        'Display': 'fa-tv',
        'Projector': 'fa-video',
        'Printer': 'fa-print',
        'Audio': 'fa-volume-up',
        'Camera': 'fa-camera',
        'Network': 'fa-network-wired',
        'Other': 'fa-cube'
    };
    return icons[type] || 'fa-cube';
}

function getRoomStatus(room) {
    if (!room.equipment || room.equipment.length === 0) return 'empty';
    const hasIssues = room.equipment.some(eq => eq.status !== 'Working');
    const allBroken = room.equipment.every(eq => eq.status !== 'Working');
    if (allBroken) return 'problems';
    if (hasIssues) return 'has-issues';
    return 'all-good';
}

function getRoomTypeClass(type) {
    const classes = {
        'Lab': 'type-lab',
        'Office': 'type-office',
        'Classroom': 'type-classroom',
        'Conference': 'type-conference',
        'Studio': 'type-studio'
    };
    return classes[type] || 'type-other';
}

function setView(view) {
    currentView = view;
    document.getElementById('viewGrid').className = view === 'grid'
        ? 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white'
        : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100';
    document.getElementById('viewList').className = view === 'list'
        ? 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white'
        : 'px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100';

    document.getElementById('roomsGrid').classList.toggle('hidden', view !== 'grid');
    document.getElementById('roomsList').classList.toggle('hidden', view !== 'list');

    if (view === 'list') {
        renderRoomsList(roomsData.rooms);
    }
}

function renderRooms(rooms) {
    const container = document.getElementById('roomsContainer');
    container.textContent = '';

    if (rooms.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'col-span-full text-center py-12 text-gray-400';
        const icon = document.createElement('i');
        icon.className = 'fas fa-door-open text-4xl mb-2';
        const text = document.createElement('p');
        text.textContent = 'No rooms found';
        empty.appendChild(icon);
        empty.appendChild(document.createElement('br'));
        empty.appendChild(text);
        container.appendChild(empty);
        return;
    }

    // Sort rooms by room number
    const sorted = [...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

    sorted.forEach(room => {
        const status = getRoomStatus(room);
        const card = document.createElement('div');
        card.className = `room-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer status-${status}`;
        card.onclick = () => openRoomDetail(room.id);

        // Header
        const header = document.createElement('div');
        header.className = `${getRoomTypeClass(room.type)} p-4 text-white`;

        const headerTop = document.createElement('div');
        headerTop.className = 'flex items-center justify-between';

        const roomNumDiv = document.createElement('div');
        const roomNum = document.createElement('div');
        roomNum.className = 'text-xl font-bold';
        roomNum.textContent = room.roomNumber;
        const roomName = document.createElement('div');
        roomName.className = 'text-sm opacity-80';
        roomName.textContent = room.name || room.type;
        roomNumDiv.appendChild(roomNum);
        roomNumDiv.appendChild(roomName);

        const typeBadge = document.createElement('span');
        typeBadge.className = 'bg-white/20 text-xs px-2 py-1 rounded';
        typeBadge.textContent = room.type;

        headerTop.appendChild(roomNumDiv);
        headerTop.appendChild(typeBadge);
        header.appendChild(headerTop);
        card.appendChild(header);

        // Body - Equipment summary
        const body = document.createElement('div');
        body.className = 'p-4';

        // Equipment icons row
        const equipRow = document.createElement('div');
        equipRow.className = 'flex flex-wrap gap-2 mb-3';

        if (room.equipment && room.equipment.length > 0) {
            // Group equipment by type
            const grouped = {};
            room.equipment.forEach(eq => {
                if (!grouped[eq.type]) grouped[eq.type] = { count: 0, hasIssue: false };
                grouped[eq.type].count++;
                if (eq.status !== 'Working') grouped[eq.type].hasIssue = true;
            });

            Object.entries(grouped).forEach(([type, info]) => {
                const iconDiv = document.createElement('div');
                iconDiv.className = `equipment-icon ${info.hasIssue ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`;
                iconDiv.title = `${info.count} ${type}${info.count > 1 ? 's' : ''}${info.hasIssue ? ' (has issues)' : ''}`;

                const icon = document.createElement('i');
                icon.className = `fas ${getEquipmentIcon(type)}`;
                iconDiv.appendChild(icon);

                if (info.count > 1) {
                    const count = document.createElement('span');
                    count.className = 'text-xs ml-1';
                    count.textContent = info.count;
                    iconDiv.appendChild(count);
                }

                equipRow.appendChild(iconDiv);
            });
        } else {
            const emptyMsg = document.createElement('span');
            emptyMsg.className = 'text-sm text-gray-400 italic';
            emptyMsg.textContent = 'No equipment';
            equipRow.appendChild(emptyMsg);
        }

        body.appendChild(equipRow);

        // Equipment count summary
        const summary = document.createElement('div');
        summary.className = 'text-sm text-gray-600';

        if (room.equipment && room.equipment.length > 0) {
            const computers = room.equipment.filter(eq => eq.type === 'Computer').length;
            const displays = room.equipment.filter(eq => ['Display', 'Projector'].includes(eq.type)).length;
            const others = room.equipment.length - computers - displays;

            const parts = [];
            if (computers > 0) parts.push(`${computers} computer${computers > 1 ? 's' : ''}`);
            if (displays > 0) parts.push(`${displays} display${displays > 1 ? 's' : ''}`);
            if (others > 0) parts.push(`${others} other`);
            summary.textContent = parts.join(', ');
        }
        body.appendChild(summary);

        // Status indicator
        if (status === 'has-issues' || status === 'problems') {
            const statusDiv = document.createElement('div');
            statusDiv.className = `mt-2 text-xs ${status === 'problems' ? 'text-red-600' : 'text-yellow-600'}`;
            const issueCount = room.equipment.filter(eq => eq.status !== 'Working').length;
            const issueIcon = document.createElement('i');
            issueIcon.className = 'fas fa-exclamation-triangle mr-1';
            statusDiv.appendChild(issueIcon);
            statusDiv.appendChild(document.createTextNode(`${issueCount} item${issueCount > 1 ? 's' : ''} need${issueCount === 1 ? 's' : ''} attention`));
            body.appendChild(statusDiv);
        }

        card.appendChild(body);
        container.appendChild(card);
    });

    // Also update list view if visible
    if (currentView === 'list') {
        renderRoomsList(rooms);
    }
}

function renderRoomsList(rooms) {
    const tbody = document.getElementById('roomsTableBody');
    tbody.textContent = '';

    const sorted = [...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

    sorted.forEach(room => {
        const status = getRoomStatus(room);
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 cursor-pointer';
        row.onclick = () => openRoomDetail(room.id);

        // Room cell
        const roomCell = document.createElement('td');
        roomCell.className = 'px-4 py-3';
        const roomNum = document.createElement('div');
        roomNum.className = 'font-bold';
        roomNum.textContent = room.roomNumber;
        const roomName = document.createElement('div');
        roomName.className = 'text-xs text-gray-500';
        roomName.textContent = room.name || '';
        roomCell.appendChild(roomNum);
        roomCell.appendChild(roomName);

        // Type cell
        const typeCell = document.createElement('td');
        typeCell.className = 'px-4 py-3';
        const typeBadge = document.createElement('span');
        typeBadge.className = `text-xs px-2 py-1 rounded ${getRoomTypeClass(room.type)} text-white`;
        typeBadge.textContent = room.type;
        typeCell.appendChild(typeBadge);

        // Equipment cell
        const eqCell = document.createElement('td');
        eqCell.className = 'px-4 py-3 text-sm';
        if (room.equipment && room.equipment.length > 0) {
            const computers = room.equipment.filter(eq => eq.type === 'Computer').length;
            const displays = room.equipment.filter(eq => ['Display', 'Projector'].includes(eq.type)).length;
            eqCell.textContent = `${computers} computer${computers !== 1 ? 's' : ''}, ${displays} display${displays !== 1 ? 's' : ''}`;
        } else {
            eqCell.textContent = 'None';
            eqCell.className += ' text-gray-400';
        }

        // Status cell
        const statusCell = document.createElement('td');
        statusCell.className = 'px-4 py-3';
        const statusBadge = document.createElement('span');
        if (status === 'all-good') {
            statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700';
            statusBadge.textContent = 'All Working';
        } else if (status === 'has-issues') {
            statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700';
            const issueCount = room.equipment.filter(eq => eq.status !== 'Working').length;
            statusBadge.textContent = `${issueCount} Issue${issueCount > 1 ? 's' : ''}`;
        } else if (status === 'problems') {
            statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-700';
            statusBadge.textContent = 'Needs Attention';
        } else {
            statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500';
            statusBadge.textContent = 'Empty';
        }
        statusCell.appendChild(statusBadge);

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-3 text-center';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'text-blue-600 hover:text-blue-800 px-2';
        viewBtn.title = 'View Details';
        viewBtn.onclick = (e) => { e.stopPropagation(); openRoomDetail(room.id); };
        const viewIcon = document.createElement('i');
        viewIcon.className = 'fas fa-eye';
        viewBtn.appendChild(viewIcon);
        actionsCell.appendChild(viewBtn);

        row.appendChild(roomCell);
        row.appendChild(typeCell);
        row.appendChild(eqCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function filterRooms() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('filterType').value;
    const floor = document.getElementById('filterFloor').value;

    const filtered = roomsData.rooms.filter(room => {
        const matchSearch = !search ||
            room.roomNumber.toLowerCase().includes(search) ||
            (room.name && room.name.toLowerCase().includes(search)) ||
            (room.equipment && room.equipment.some(eq =>
                eq.name.toLowerCase().includes(search) ||
                (eq.assetTag && eq.assetTag.toLowerCase().includes(search))
            ));
        const matchType = !type || room.type === type;
        const matchFloor = !floor || room.floor === floor;

        return matchSearch && matchType && matchFloor;
    });

    renderRooms(filtered);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterFloor').value = '';
    renderRooms(roomsData.rooms);
}

// Room Detail Modal
function openRoomDetail(roomId) {
    const room = roomsData.rooms.find(r => r.id === roomId);
    if (!room) return;

    currentRoom = room;

    document.getElementById('detailRoomNumber').textContent = room.roomNumber;
    document.getElementById('detailRoomName').textContent = room.name || '';
    document.getElementById('detailType').textContent = room.type;
    document.getElementById('detailBuilding').textContent = room.building || 'Not specified';
    document.getElementById('detailUpdated').textContent = room.lastUpdated || 'N/A';
    document.getElementById('detailNotes').textContent = room.notes || '';

    renderEquipmentList(room);
    document.getElementById('roomDetailModal').classList.add('active');
}

function renderEquipmentList(room) {
    const container = document.getElementById('detailEquipmentList');
    container.textContent = '';

    if (!room.equipment || room.equipment.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center py-8 text-gray-400';
        empty.textContent = 'No equipment in this room';
        container.appendChild(empty);
        return;
    }

    // Group by type for labs with many items
    const isLab = room.type === 'Lab' && room.equipment.length > 5;

    if (isLab) {
        // Group view for labs
        const grouped = {};
        room.equipment.forEach(eq => {
            if (!grouped[eq.type]) grouped[eq.type] = [];
            grouped[eq.type].push(eq);
        });

        Object.entries(grouped).forEach(([type, items]) => {
            const group = document.createElement('div');
            group.className = 'mb-4';

            const groupHeader = document.createElement('div');
            groupHeader.className = 'flex items-center gap-2 mb-2 pb-2 border-b';
            const groupIcon = document.createElement('i');
            groupIcon.className = `fas ${getEquipmentIcon(type)} text-gray-500`;
            const groupTitle = document.createElement('span');
            groupTitle.className = 'font-medium text-gray-700';
            groupTitle.textContent = `${type}s (${items.length})`;
            groupHeader.appendChild(groupIcon);
            groupHeader.appendChild(groupTitle);
            group.appendChild(groupHeader);

            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-2';

            items.forEach(eq => {
                itemsGrid.appendChild(createEquipmentItem(eq, true));
            });

            group.appendChild(itemsGrid);
            container.appendChild(group);
        });
    } else {
        // Simple list for smaller rooms
        room.equipment.forEach(eq => {
            container.appendChild(createEquipmentItem(eq, false));
        });
    }
}

function createEquipmentItem(eq, compact) {
    const item = document.createElement('div');
    item.className = `flex items-center gap-3 p-3 rounded-lg ${eq.status === 'Working' ? 'bg-gray-50' : 'bg-yellow-50 border border-yellow-200'}`;

    const icon = document.createElement('div');
    icon.className = `w-10 h-10 rounded-lg flex items-center justify-center ${eq.status === 'Working' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-200 text-yellow-700'}`;
    const iconEl = document.createElement('i');
    iconEl.className = `fas ${getEquipmentIcon(eq.type)}`;
    icon.appendChild(iconEl);

    const info = document.createElement('div');
    info.className = 'flex-1 min-w-0';
    const name = document.createElement('div');
    name.className = 'font-medium text-gray-900 truncate';
    name.textContent = eq.name;
    info.appendChild(name);

    if (!compact) {
        if (eq.assetTag) {
            const tag = document.createElement('div');
            tag.className = 'text-xs text-gray-500';
            tag.textContent = eq.assetTag;
            info.appendChild(tag);
        }
    }

    if (eq.status !== 'Working') {
        const status = document.createElement('div');
        status.className = 'text-xs text-yellow-700';
        status.textContent = eq.status;
        if (eq.notes) status.textContent += ` - ${eq.notes}`;
        info.appendChild(status);
    } else if (eq.notes && !compact) {
        const notes = document.createElement('div');
        notes.className = 'text-xs text-gray-400';
        notes.textContent = eq.notes;
        info.appendChild(notes);
    }

    const actions = document.createElement('div');
    actions.className = 'flex gap-1';

    const editBtn = document.createElement('button');
    editBtn.className = 'text-gray-400 hover:text-blue-600 p-1';
    editBtn.title = 'Edit';
    editBtn.onclick = (e) => { e.stopPropagation(); editEquipment(eq.id); };
    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit text-sm';
    editBtn.appendChild(editIcon);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-gray-400 hover:text-red-600 p-1';
    deleteBtn.title = 'Remove';
    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteEquipment(eq.id); };
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash text-sm';
    deleteBtn.appendChild(deleteIcon);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(actions);

    return item;
}

function closeDetailModal() {
    document.getElementById('roomDetailModal').classList.remove('active');
    currentRoom = null;
}

function editCurrentRoom() {
    if (currentRoom) {
        closeDetailModal();
        editRoom(currentRoom.id);
    }
}

// Room Add/Edit Modal
function openAddRoomModal() {
    document.getElementById('roomModalTitle').textContent = 'Add Room';
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('roomModal').classList.add('active');
}

function editRoom(roomId) {
    const room = roomsData.rooms.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('roomModalTitle').textContent = 'Edit Room';
    document.getElementById('roomId').value = room.id;
    document.getElementById('roomNumber').value = room.roomNumber;
    document.getElementById('roomName').value = room.name || '';
    document.getElementById('roomBuilding').value = room.building || '';
    document.getElementById('roomFloor').value = room.floor || '';
    document.getElementById('roomType').value = room.type;
    document.getElementById('roomNotes').value = room.notes || '';

    document.getElementById('roomModal').classList.add('active');
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.remove('active');
}

// Equipment Modal
function addEquipmentToRoom() {
    if (!currentRoom) return;

    document.getElementById('equipmentModalTitle').textContent = 'Add Equipment';
    document.getElementById('equipmentForm').reset();
    document.getElementById('eqId').value = '';
    document.getElementById('eqRoomId').value = currentRoom.id;
    document.getElementById('eqStatus').value = 'Working';
    document.getElementById('equipmentModal').classList.add('active');
}

function editEquipment(eqId) {
    if (!currentRoom) return;

    const eq = currentRoom.equipment.find(e => e.id === eqId);
    if (!eq) return;

    document.getElementById('equipmentModalTitle').textContent = 'Edit Equipment';
    document.getElementById('eqId').value = eq.id;
    document.getElementById('eqRoomId').value = currentRoom.id;
    document.getElementById('eqType').value = eq.type;
    document.getElementById('eqName').value = eq.name;
    document.getElementById('eqAssetTag').value = eq.assetTag || '';
    document.getElementById('eqSerial').value = eq.serialNumber || '';
    document.getElementById('eqStatus').value = eq.status;
    document.getElementById('eqNotes').value = eq.notes || '';

    document.getElementById('equipmentModal').classList.add('active');
}

function closeEquipmentModal() {
    document.getElementById('equipmentModal').classList.remove('active');
}

async function deleteEquipment(eqId) {
    if (!currentRoom) return;

    const eq = currentRoom.equipment.find(e => e.id === eqId);
    if (!eq) return;

    if (confirm(`Remove "${eq.name}" from ${currentRoom.roomNumber}?`)) {
        currentRoom.equipment = currentRoom.equipment.filter(e => e.id !== eqId);
        await DataService.saveRoom(currentRoom);
        renderEquipmentList(currentRoom);
        await loadRooms();
    }
}

// Modal handlers for click-outside-to-close and ESC key
function setupModalHandlers() {
    const modals = ['roomDetailModal', 'roomModal', 'equipmentModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                if (modalId === 'roomDetailModal') currentRoom = null;
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    if (modalId === 'roomDetailModal') currentRoom = null;
                }
            });
        }
    });
}

// Form submissions
function setupForms() {
    setupModalHandlers();
    // Room form
    document.getElementById('roomForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const roomId = document.getElementById('roomId').value;
        const existingRoom = roomId ? roomsData.rooms.find(r => r.id === roomId) : null;

        const room = {
            id: roomId || null,
            roomNumber: document.getElementById('roomNumber').value,
            name: document.getElementById('roomName').value,
            building: document.getElementById('roomBuilding').value,
            floor: document.getElementById('roomFloor').value,
            type: document.getElementById('roomType').value,
            equipment: existingRoom ? existingRoom.equipment : [],
            notes: document.getElementById('roomNotes').value
        };

        await DataService.saveRoom(room);
        closeRoomModal();
        await loadRooms();
    });

    // Equipment form
    document.getElementById('equipmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const roomId = document.getElementById('eqRoomId').value;
        const room = roomsData.rooms.find(r => r.id === roomId);
        if (!room) return;

        const eqId = document.getElementById('eqId').value;

        const equipment = {
            id: eqId || `EQ-${Date.now()}`,
            type: document.getElementById('eqType').value,
            name: document.getElementById('eqName').value,
            assetTag: document.getElementById('eqAssetTag').value,
            serialNumber: document.getElementById('eqSerial').value,
            status: document.getElementById('eqStatus').value,
            notes: document.getElementById('eqNotes').value
        };

        if (!room.equipment) room.equipment = [];

        if (eqId) {
            const index = room.equipment.findIndex(e => e.id === eqId);
            if (index >= 0) room.equipment[index] = equipment;
        } else {
            room.equipment.push(equipment);
        }

        await DataService.saveRoom(room);
        closeEquipmentModal();
        currentRoom = room;
        renderEquipmentList(room);
        await loadRooms();
    });
}

function exportRooms() {
    DataService.exportRoomsToCSV();
}
