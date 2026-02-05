/**
 * Photo Lab Management - Stations, Equipment, Students, Schedule
 */

let photolabData = {
    labs: [],
    stations: [],
    equipment: [],
    students: [],
    schedule: [],
    stationCheckouts: [],
    categories: [],
    stationStatuses: [],
    currentSemester: ''
};

let currentStation = null;
let selectedStudent = null;
let dataInitialized = false;

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupForms();
});

async function loadData() {
    try {
        const storageKey = DataService.config.storagePrefix + 'photolab';

        // Only check for reset on first load
        if (!dataInitialized) {
            const existingData = localStorage.getItem(storageKey);
            if (existingData) {
                try {
                    const parsed = JSON.parse(existingData);
                    // Only reset if it's the OLD format (has reservations but no labs)
                    if (parsed.reservations !== undefined && !parsed.labs) {
                        console.log('Clearing old format photolab data');
                        localStorage.removeItem(storageKey);
                    }
                } catch (e) {
                    localStorage.removeItem(storageKey);
                }
            }
        }

        photolabData = await DataService.getPhotoLab();

        // If no labs exist, create default structure
        if (!photolabData.labs || photolabData.labs.length === 0) {
            console.log('No lab data found - creating default stations');
            photolabData = createDefaultLabData();
            localStorage.setItem(storageKey, JSON.stringify(photolabData));
        }

        // Ensure stationCheckouts array exists
        if (!photolabData.stationCheckouts) {
            photolabData.stationCheckouts = [];
        }

        dataInitialized = true;

        updateStats();
        renderLabSections();
        renderEquipment(photolabData.equipment);
        renderStudents(photolabData.students);
        renderSchedule(photolabData.schedule);
        populateCourseFilter();
        checkCurrentClass();
    } catch (error) {
        console.error('Error loading data:', error);
        photolabData = createDefaultLabData();
        dataInitialized = true;
        updateStats();
        renderLabSections();
        renderEquipment(photolabData.equipment);
        renderStudents(photolabData.students);
        renderSchedule(photolabData.schedule);
    }
}

function createDefaultLabData() {
    const labs = [
        { id: 'LAB-001', name: 'Dark Room 1', code: 'DR1', stationPrefix: '', stationCount: 19, type: 'darkroom', description: 'Main black and white darkroom' },
        { id: 'LAB-002', name: 'Color Dark Room', code: 'CDR', stationPrefix: 'C', stationCount: 8, type: 'color', description: 'Color processing darkroom' },
        { id: 'LAB-003', name: 'Individual Dark Rooms', code: 'IDR', stationPrefix: '', stationCount: 19, type: 'individual', description: 'Private darkroom spaces' }
    ];

    const stations = [];

    for (let i = 1; i <= 19; i++) {
        stations.push({ id: `DR1-${i}`, labId: 'LAB-001', number: String(i), status: 'available', currentUser: null, notes: '' });
    }
    for (let i = 1; i <= 8; i++) {
        stations.push({ id: `CDR-C${i}`, labId: 'LAB-002', number: `C${i}`, status: 'available', currentUser: null, notes: '' });
    }
    for (let i = 1; i <= 19; i++) {
        stations.push({ id: `IDR-${i}`, labId: 'LAB-003', number: String(i), status: 'available', currentUser: null, notes: '' });
    }

    const equipment = [
        { id: 'PEQ-001', name: 'Canon EOS 5D Mark IV', category: 'Camera', type: 'DSLR', quantity: 5, available: 5, location: 'Equipment Cage', condition: 'Excellent', accessories: ['Battery', 'Charger', 'Strap'], notes: '' },
        { id: 'PEQ-002', name: 'Canon EOS Rebel T7i', category: 'Camera', type: 'DSLR', quantity: 15, available: 15, location: 'Equipment Cage', condition: 'Good', accessories: ['Battery', 'Charger'], notes: '' },
        { id: 'PEQ-003', name: 'Canon 50mm f/1.8 STM', category: 'Lens', type: 'Prime', quantity: 20, available: 20, location: 'Equipment Cage', condition: 'Good', accessories: ['Lens Cap'], notes: '' },
        { id: 'PEQ-004', name: 'Canon 24-70mm f/2.8L II', category: 'Lens', type: 'Zoom', quantity: 5, available: 5, location: 'Equipment Cage', condition: 'Excellent', accessories: ['Lens Cap', 'Hood'], notes: '' },
        { id: 'PEQ-005', name: 'Manfrotto Tripod 055', category: 'Support', type: 'Tripod', quantity: 25, available: 25, location: 'Equipment Cage', condition: 'Good', accessories: ['Quick Release Plate'], notes: '' },
        { id: 'PEQ-006', name: 'Godox AD600 Pro', category: 'Lighting', type: 'Strobe', quantity: 8, available: 8, location: 'Studio', condition: 'Excellent', accessories: ['Battery', 'Charger', 'Remote'], notes: '' }
    ];

    const students = [
        { id: 'STU-001', name: 'Maria Garcia', studentId: '12345001', email: 'maria.garcia@my.csun.edu', phone: '(818) 555-0001', courses: ['ART 150', 'ART 250'], semester: 'Spring 2024', labAccess: ['LAB-001', 'LAB-002'], trainingComplete: true, notes: '' },
        { id: 'STU-002', name: 'James Wilson', studentId: '12345002', email: 'james.wilson@my.csun.edu', phone: '(818) 555-0002', courses: ['ART 150'], semester: 'Spring 2024', labAccess: ['LAB-001'], trainingComplete: true, notes: '' },
        { id: 'STU-003', name: 'Alex Chen', studentId: '12345003', email: 'alex.chen@my.csun.edu', phone: '(818) 555-0003', courses: ['ART 150', 'ART 250', 'ART 350'], semester: 'Spring 2024', labAccess: ['LAB-001', 'LAB-002', 'LAB-003'], trainingComplete: true, notes: '' },
        { id: 'STU-004', name: 'Sarah Miller', studentId: '12345004', email: 'sarah.miller@my.csun.edu', phone: '(818) 555-0004', courses: ['ART 250'], semester: 'Spring 2024', labAccess: ['LAB-001', 'LAB-002'], trainingComplete: true, notes: '' },
        { id: 'STU-005', name: 'Jennifer Lee', studentId: '12345005', email: 'jennifer.lee@my.csun.edu', phone: '(818) 555-0005', courses: ['ART 350'], semester: 'Spring 2024', labAccess: ['LAB-001', 'LAB-002', 'LAB-003'], trainingComplete: true, notes: '' }
    ];

    const schedule = [
        { id: 'SCH-001', courseCode: 'ART 150', courseName: 'Introduction to Photography', instructor: 'Prof. Thompson', days: ['Monday', 'Wednesday'], startTime: '09:00', endTime: '11:45', lab: 'LAB-001', semester: 'Spring 2024' },
        { id: 'SCH-002', courseCode: 'ART 250', courseName: 'Color Photography', instructor: 'Prof. Martinez', days: ['Tuesday', 'Thursday'], startTime: '14:00', endTime: '16:45', lab: 'LAB-002', semester: 'Spring 2024' },
        { id: 'SCH-003', courseCode: 'ART 350', courseName: 'Advanced Darkroom Techniques', instructor: 'Prof. Thompson', days: ['Friday'], startTime: '10:00', endTime: '14:45', lab: 'LAB-003', semester: 'Spring 2024' }
    ];

    return {
        labs, stations, equipment, students, schedule,
        stationCheckouts: [],
        categories: ['Camera', 'Lens', 'Lighting', 'Support', 'Accessories', 'Film', 'Chemicals', 'Other'],
        stationStatuses: ['available', 'in-use', 'maintenance'],
        currentSemester: 'Spring 2024'
    };
}

function updateStats() {
    const stations = photolabData.stations || [];
    document.getElementById('statAvailable').textContent = stations.filter(s => s.status === 'available').length;
    document.getElementById('statInUse').textContent = stations.filter(s => s.status === 'in-use').length;
    document.getElementById('statMaintenance').textContent = stations.filter(s => s.status === 'maintenance').length;
    document.getElementById('statStudents').textContent = (photolabData.students || []).length;
    document.getElementById('statEquipment').textContent = (photolabData.equipment || []).reduce((sum, e) => sum + e.quantity, 0);
    document.getElementById('currentSemester').textContent = photolabData.currentSemester || 'Not Set';
}

function checkCurrentClass() {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    const currentClass = (photolabData.schedule || []).find(sch =>
        sch.days.includes(currentDay) && sch.startTime <= currentTime && sch.endTime >= currentTime
    );

    const classEl = document.getElementById('statCurrentClass');
    if (currentClass) {
        classEl.textContent = currentClass.courseCode;
        classEl.title = `${currentClass.courseName} - ${currentClass.instructor}`;
    } else {
        classEl.textContent = 'No Class';
    }
}

// ==================== Tab Switching ====================

function switchTab(tab) {
    const tabs = ['stations', 'equipment', 'students', 'schedule'];
    tabs.forEach(t => {
        const tabBtn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const tabContent = document.getElementById(`${t}Tab`);
        if (t === tab) {
            tabBtn.classList.add('active');
            tabBtn.classList.remove('bg-white');
            tabContent.classList.remove('hidden');
        } else {
            tabBtn.classList.remove('active');
            tabBtn.classList.add('bg-white');
            tabContent.classList.add('hidden');
        }
    });
}

// ==================== Station Rendering ====================

function renderLabSections() {
    const container = document.getElementById('labSections');
    container.innerHTML = '';

    if (!photolabData.labs || photolabData.labs.length === 0) {
        container.innerHTML = '<div class="text-center py-12 text-gray-400"><i class="fas fa-door-closed text-3xl mb-2"></i><p>No labs configured</p></div>';
        return;
    }

    photolabData.labs.forEach(lab => {
        const labStations = (photolabData.stations || []).filter(s => s.labId === lab.id);
        const availableCount = labStations.filter(s => s.status === 'available').length;

        let stationsHtml = '';
        labStations.forEach(station => {
            const tooltip = station.status === 'in-use' ? `In use by ${station.currentUser}` :
                           station.status === 'maintenance' ? (station.notes || 'Under maintenance') : 'Available';
            stationsHtml += `<div class="station ${station.status}" title="${tooltip}" onclick="openStationModal('${station.id}')">${station.number}</div>`;
        });

        container.innerHTML += `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="csun-red p-4 flex items-center justify-between">
                    <div>
                        <h2 class="text-white font-bold text-lg">${lab.name}</h2>
                        <p class="text-white/80 text-sm">${lab.description}</p>
                    </div>
                    <div class="bg-white/20 text-white px-3 py-1 rounded-lg">
                        <span class="font-bold">${availableCount}</span> / ${labStations.length} open
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex flex-wrap gap-2">${stationsHtml}</div>
                </div>
            </div>
        `;
    });
}

function openStationModal(stationId) {
    currentStation = photolabData.stations.find(s => s.id === stationId);
    if (!currentStation) {
        console.error('Station not found:', stationId);
        return;
    }

    const lab = photolabData.labs.find(l => l.id === currentStation.labId);
    document.getElementById('stationModalTitle').textContent = `${lab?.name || 'Lab'} - Station ${currentStation.number}`;

    let statusClass = currentStation.status === 'available' ? 'bg-green-50 text-green-800' :
                      currentStation.status === 'in-use' ? 'bg-red-50 text-red-800' :
                      'bg-yellow-50 text-yellow-800';

    let statusText = currentStation.status.charAt(0).toUpperCase() + currentStation.status.slice(1).replace('-', ' ');
    let userInfo = currentStation.currentUser ? `<div class="text-sm mt-1">Student: ${currentStation.currentUser}</div>` : '';
    let notesInfo = currentStation.notes ? `<div class="text-sm mt-1 opacity-80">${currentStation.notes}</div>` : '';

    // Show equipment if in-use
    let equipmentInfo = '';
    if (currentStation.status === 'in-use') {
        const checkout = (photolabData.stationCheckouts || []).find(c => c.stationId === currentStation.id && !c.checkedIn);
        if (checkout && checkout.equipment && checkout.equipment.length > 0) {
            let eqList = checkout.equipment.map(eqId => {
                const eq = photolabData.equipment.find(e => e.id === eqId);
                return eq ? `<div class="text-xs ml-2">• ${eq.name}</div>` : '';
            }).join('');
            equipmentInfo = `<div class="text-sm mt-2 pt-2 border-t border-current/20"><div class="font-medium">Equipment:</div>${eqList}</div>`;
        }
    }

    let buttons = '';
    if (currentStation.status === 'available') {
        buttons = `
            <button onclick="openCheckoutModal()" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium">Check Out Station</button>
            <button onclick="markMaintenance()" class="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium">Mark Maintenance</button>
        `;
    } else if (currentStation.status === 'in-use') {
        buttons = `<button onclick="releaseStation()" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium col-span-2">Check In / Release</button>`;
    } else if (currentStation.status === 'maintenance') {
        buttons = `<button onclick="markAvailable()" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium col-span-2">Mark Available</button>`;
    }

    document.getElementById('stationModalContent').innerHTML = `
        <div class="p-4 rounded-lg mb-4 ${statusClass}">
            <div class="text-sm font-medium">${statusText}</div>
            ${userInfo}${notesInfo}${equipmentInfo}
        </div>
        <div class="grid grid-cols-2 gap-2">${buttons}</div>
    `;

    document.getElementById('stationModal').classList.add('active');
}

function closeStationModal() {
    document.getElementById('stationModal').classList.remove('active');
}

// ==================== Station Actions ====================

async function markMaintenance() {
    if (!currentStation) return;

    const notes = prompt('Maintenance notes (optional):');
    if (notes === null) return; // User cancelled

    currentStation.status = 'maintenance';
    currentStation.currentUser = null;
    currentStation.notes = notes || '';

    await saveAndRefresh();
}

async function markAvailable() {
    if (!currentStation) return;

    currentStation.status = 'available';
    currentStation.currentUser = null;
    currentStation.notes = '';

    await saveAndRefresh();
}

async function releaseStation() {
    if (!currentStation) return;

    // Find and close any active checkout
    const checkout = (photolabData.stationCheckouts || []).find(c => c.stationId === currentStation.id && !c.checkedIn);
    if (checkout) {
        checkout.checkedIn = true;
        checkout.checkinTime = new Date().toISOString();

        // Return equipment
        (checkout.equipment || []).forEach(eqId => {
            const eq = photolabData.equipment.find(e => e.id === eqId);
            if (eq) eq.available++;
        });
    }

    currentStation.status = 'available';
    currentStation.currentUser = null;
    currentStation.notes = '';

    await saveAndRefresh();
}

async function saveAndRefresh() {
    // Update station in array
    const index = photolabData.stations.findIndex(s => s.id === currentStation.id);
    if (index >= 0) {
        photolabData.stations[index] = { ...currentStation };
    }

    // Save to storage
    await savePhotoLabData();

    // Close modal and refresh
    closeStationModal();
    currentStation = null;

    updateStats();
    renderLabSections();
}

// ==================== Checkout Modal ====================

function openCheckoutModal() {
    if (!currentStation) return;

    const lab = photolabData.labs.find(l => l.id === currentStation.labId);
    document.getElementById('checkoutModalTitle').textContent = `Check Out: ${lab?.name || 'Lab'} - Station ${currentStation.number}`;
    document.getElementById('coStationId').value = currentStation.id;

    // Reset form
    document.getElementById('stationCheckoutForm').reset();
    document.getElementById('coStudentId').value = '';
    document.getElementById('studentWarning').classList.add('hidden');
    document.getElementById('selectedStudentInfo').classList.add('hidden');
    document.getElementById('studentSearchResults').classList.add('hidden');
    selectedStudent = null;

    // Populate equipment
    populateEquipmentCheckboxes();

    // Switch modals
    document.getElementById('stationModal').classList.remove('active');
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    selectedStudent = null;
}

function populateEquipmentCheckboxes() {
    const container = document.getElementById('equipmentCheckboxes');
    const availableEquipment = (photolabData.equipment || []).filter(eq => eq.available > 0);

    if (availableEquipment.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm py-2">No equipment available for checkout</div>';
        return;
    }

    container.innerHTML = availableEquipment.map(eq => `
        <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" name="equipment" value="${eq.id}" class="rounded text-red-600">
            <div class="flex-1">
                <span class="font-medium text-gray-800">${eq.name}</span>
                <span class="text-xs text-gray-500 ml-2">(${eq.available} available)</span>
            </div>
        </label>
    `).join('');
}

function searchStudent(query) {
    const resultsContainer = document.getElementById('studentSearchResults');

    if (!query || query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }

    const matches = (photolabData.students || []).filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.includes(query) ||
        s.email.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length > 0) {
        resultsContainer.innerHTML = matches.slice(0, 5).map(student => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0" onclick="selectStudent('${student.id}')">
                <div class="font-medium text-gray-800">${student.name}</div>
                <div class="text-xs text-gray-500">${student.studentId} • ${(student.courses || []).join(', ') || 'No courses'}</div>
            </div>
        `).join('');
    } else {
        resultsContainer.innerHTML = `
            <div class="p-2 hover:bg-yellow-50 cursor-pointer" onclick="selectUnregisteredStudent('${query.replace(/'/g, "\\'")}')">
                <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                <span class="text-gray-700">Use "${query}" (not registered)</span>
            </div>
        `;
    }
    resultsContainer.classList.remove('hidden');
}

function selectStudent(studentId) {
    const student = photolabData.students.find(s => s.id === studentId);
    if (!student) return;

    selectedStudent = student;
    document.getElementById('coStudentId').value = student.id;
    document.getElementById('coStudentSearch').value = student.name;

    document.getElementById('selectedStudentName').textContent = student.name;
    document.getElementById('selectedStudentDetails').textContent =
        `${student.studentId} • ${(student.courses || []).join(', ') || 'No courses'} • ${student.trainingComplete ? 'Trained' : 'Training pending'}`;

    document.getElementById('selectedStudentInfo').classList.remove('hidden');
    document.getElementById('studentWarning').classList.add('hidden');
    document.getElementById('studentSearchResults').classList.add('hidden');
}

function selectUnregisteredStudent(name) {
    selectedStudent = { name: name, unregistered: true };
    document.getElementById('coStudentId').value = '';
    document.getElementById('coStudentSearch').value = name;

    document.getElementById('studentWarning').classList.remove('hidden');
    document.getElementById('selectedStudentInfo').classList.add('hidden');
    document.getElementById('studentSearchResults').classList.add('hidden');
}

function clearSelectedStudent() {
    selectedStudent = null;
    document.getElementById('coStudentId').value = '';
    document.getElementById('coStudentSearch').value = '';
    document.getElementById('selectedStudentInfo').classList.add('hidden');
    document.getElementById('studentWarning').classList.add('hidden');
}

async function processStationCheckout(e) {
    e.preventDefault();

    if (!currentStation) {
        alert('Error: No station selected');
        return;
    }

    const studentName = document.getElementById('coStudentSearch').value.trim();
    if (!studentName) {
        alert('Please enter a student name');
        return;
    }

    // Warn for unregistered students
    if (selectedStudent?.unregistered) {
        if (!confirm('This student is not registered.\n\nHave they completed the Safety Form and confirmed their class enrollment?')) {
            return;
        }
    }

    // Get selected equipment
    const selectedEquipment = [];
    document.querySelectorAll('#equipmentCheckboxes input:checked').forEach(cb => {
        selectedEquipment.push(cb.value);
    });

    // Create checkout record
    const checkout = {
        id: 'SCO-' + Date.now(),
        stationId: currentStation.id,
        studentId: document.getElementById('coStudentId').value || null,
        studentName: studentName,
        equipment: selectedEquipment,
        checkoutTime: new Date().toISOString(),
        checkedIn: false,
        notes: document.getElementById('coNotes').value || ''
    };

    photolabData.stationCheckouts = photolabData.stationCheckouts || [];
    photolabData.stationCheckouts.push(checkout);

    // Update station
    currentStation.status = 'in-use';
    currentStation.currentUser = studentName;

    // Update equipment availability
    selectedEquipment.forEach(eqId => {
        const eq = photolabData.equipment.find(e => e.id === eqId);
        if (eq && eq.available > 0) eq.available--;
    });

    // Update station in array
    const index = photolabData.stations.findIndex(s => s.id === currentStation.id);
    if (index >= 0) {
        photolabData.stations[index] = { ...currentStation };
    }

    // Save
    await savePhotoLabData();

    // Close and refresh
    closeCheckoutModal();
    currentStation = null;

    updateStats();
    renderLabSections();
    renderEquipment(photolabData.equipment);

    alert('Station checked out successfully!');
}

// ==================== Equipment Rendering ====================

function renderEquipment(equipment) {
    const grid = document.getElementById('equipmentGrid');

    if (!equipment || equipment.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-camera text-3xl mb-2"></i><p>No equipment</p></div>';
        return;
    }

    grid.innerHTML = equipment.map(eq => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-start mb-2">
                <div class="font-semibold text-gray-900">${eq.name}</div>
                <span class="text-xs px-2 py-1 rounded-full ${eq.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${eq.available}/${eq.quantity}</span>
            </div>
            <div class="text-sm text-gray-500 space-y-1">
                <div><i class="fas fa-tag w-4"></i> ${eq.category} - ${eq.type || 'N/A'}</div>
                <div><i class="fas fa-map-marker-alt w-4"></i> ${eq.location || 'Unknown'}</div>
                <div><i class="fas fa-star w-4"></i> ${eq.condition}</div>
            </div>
        </div>
    `).join('');
}

function filterEquipment() {
    const search = document.getElementById('equipmentSearch').value.toLowerCase();
    const filtered = (photolabData.equipment || []).filter(eq =>
        eq.name.toLowerCase().includes(search) || eq.category.toLowerCase().includes(search)
    );
    renderEquipment(filtered);
}

// ==================== Students Rendering ====================

function renderStudents(students) {
    const tbody = document.getElementById('studentsTableBody');

    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-gray-400"><i class="fas fa-users text-3xl mb-2"></i><p>No students enrolled</p></td></tr>';
        return;
    }

    tbody.innerHTML = students.map(stu => {
        const labNames = (stu.labAccess || []).map(labId => {
            const lab = photolabData.labs.find(l => l.id === labId);
            return lab ? lab.code : labId;
        }).join(', ');

        const trainIcon = stu.trainingComplete ? '<i class="fas fa-check-circle text-green-500"></i> Trained' : '<i class="fas fa-clock text-yellow-500"></i> Pending';

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${stu.name}</div>
                    <div class="text-xs text-gray-500">${trainIcon}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${stu.studentId}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${stu.email}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${(stu.courses || []).join(', ')}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${labNames}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="editStudent('${stu.id}')" class="text-blue-600 hover:text-blue-800 px-2"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteStudent('${stu.id}')" class="text-red-600 hover:text-red-800 px-2"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function populateCourseFilter() {
    const select = document.getElementById('studentCourse');
    const courses = new Set();
    (photolabData.students || []).forEach(stu => {
        (stu.courses || []).forEach(c => courses.add(c));
    });

    select.innerHTML = '<option value="">All Courses</option>' +
        Array.from(courses).map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const course = document.getElementById('studentCourse').value;

    const filtered = (photolabData.students || []).filter(stu => {
        const matchSearch = !search || stu.name.toLowerCase().includes(search) ||
            stu.studentId.includes(search) || stu.email.toLowerCase().includes(search);
        const matchCourse = !course || (stu.courses || []).includes(course);
        return matchSearch && matchCourse;
    });

    renderStudents(filtered);
}

// ==================== Schedule Rendering ====================

function renderSchedule(schedule) {
    const tbody = document.getElementById('scheduleTableBody');

    if (!schedule || schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-gray-400"><i class="fas fa-calendar text-3xl mb-2"></i><p>No classes scheduled</p></td></tr>';
        return;
    }

    tbody.innerHTML = schedule.map(sch => {
        const lab = photolabData.labs.find(l => l.id === sch.lab);
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${sch.courseCode}</div>
                    <div class="text-xs text-gray-500">${sch.courseName}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${sch.instructor}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${(sch.days || []).join(', ')}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${sch.startTime} - ${sch.endTime}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${lab ? lab.name : sch.lab}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="deleteSchedule('${sch.id}')" class="text-red-600 hover:text-red-800 px-2"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== Modals ====================

function openStudentModal() {
    document.getElementById('studentForm').reset();
    populateLabAccessCheckboxes();
    document.getElementById('studentModal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

function populateLabAccessCheckboxes() {
    const container = document.getElementById('stuLabAccess');
    container.innerHTML = (photolabData.labs || []).map(lab => `
        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="labAccess" value="${lab.id}" class="rounded">
            ${lab.name}
        </label>
    `).join('');
}

function openEquipmentModal() {
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipmentModal').classList.add('active');
}

function closeEquipmentModal() {
    document.getElementById('equipmentModal').classList.remove('active');
}

function openImportScheduleModal() {
    document.getElementById('importScheduleModal').classList.add('active');
}

function closeImportScheduleModal() {
    document.getElementById('importScheduleModal').classList.remove('active');
}

function openImportStudentsModal() {
    alert('Import students feature - upload a CSV with columns: Name, Student ID, Email, Phone, Courses');
}

function openScheduleModal() {
    alert('Add class feature - coming soon');
}

// ==================== Form Handlers ====================

function setupForms() {
    document.getElementById('stationCheckoutForm').addEventListener('submit', processStationCheckout);

    document.getElementById('studentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const labAccess = [];
        document.querySelectorAll('#stuLabAccess input:checked').forEach(cb => labAccess.push(cb.value));

        const student = {
            id: 'STU-' + Date.now(),
            name: document.getElementById('stuName').value,
            studentId: document.getElementById('stuStudentId').value,
            email: document.getElementById('stuEmail').value,
            phone: document.getElementById('stuPhone').value,
            courses: document.getElementById('stuCourses').value.split(',').map(c => c.trim()).filter(c => c),
            semester: photolabData.currentSemester,
            labAccess: labAccess,
            trainingComplete: document.getElementById('stuTraining').checked,
            notes: ''
        };

        photolabData.students = photolabData.students || [];
        photolabData.students.push(student);
        await savePhotoLabData();
        closeStudentModal();
        renderStudents(photolabData.students);
        updateStats();
        populateCourseFilter();
        alert('Student added successfully!');
    });

    document.getElementById('equipmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const equipment = {
            id: 'PEQ-' + Date.now(),
            name: document.getElementById('eqName').value,
            category: document.getElementById('eqCategory').value,
            type: document.getElementById('eqType').value,
            quantity: parseInt(document.getElementById('eqQuantity').value),
            available: parseInt(document.getElementById('eqAvailable').value),
            location: document.getElementById('eqLocation').value,
            condition: document.getElementById('eqCondition').value,
            accessories: [],
            notes: document.getElementById('eqNotes').value
        };

        photolabData.equipment = photolabData.equipment || [];
        photolabData.equipment.push(equipment);
        await savePhotoLabData();
        closeEquipmentModal();
        renderEquipment(photolabData.equipment);
        updateStats();
        alert('Equipment added successfully!');
    });
}

async function savePhotoLabData() {
    try {
        if (DataService.config.useApi) {
            await fetch(DataService.config.apiUrl + 'photolab.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(photolabData)
            });
        } else {
            localStorage.setItem(DataService.config.storagePrefix + 'photolab', JSON.stringify(photolabData));
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

async function deleteStudent(studentId) {
    if (confirm('Delete this student?')) {
        photolabData.students = (photolabData.students || []).filter(s => s.id !== studentId);
        await savePhotoLabData();
        renderStudents(photolabData.students);
        updateStats();
        populateCourseFilter();
    }
}

async function deleteSchedule(scheduleId) {
    if (confirm('Delete this class from schedule?')) {
        photolabData.schedule = (photolabData.schedule || []).filter(s => s.id !== scheduleId);
        await savePhotoLabData();
        renderSchedule(photolabData.schedule);
    }
}

function editStudent(studentId) {
    alert('Edit student feature - coming soon');
}

function handleScheduleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            if (cols.length >= 7) {
                const schedule = {
                    id: 'SCH-' + Date.now() + i,
                    courseCode: cols[0],
                    courseName: cols[1],
                    instructor: cols[2],
                    days: cols[3].split('/').map(d => d.trim()),
                    startTime: cols[4],
                    endTime: cols[5],
                    lab: cols[6],
                    semester: photolabData.currentSemester
                };
                photolabData.schedule = photolabData.schedule || [];
                photolabData.schedule.push(schedule);
                imported++;
            }
        }

        await savePhotoLabData();
        closeImportScheduleModal();
        renderSchedule(photolabData.schedule);
        alert(`Schedule imported! ${imported} classes added.`);
    };
    reader.readAsText(file);
}

function exportPhotoLab() {
    DataService.exportPhotoLabToCSV();
}
