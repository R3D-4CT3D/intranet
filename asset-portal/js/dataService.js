/**
 * CSUN Art & Design Asset Portal - Data Service
 *
 * Handles all data operations with support for:
 * 1. Backend API (PHP/Node.js) when available
 * 2. localStorage fallback for standalone use
 *
 * For SharePoint migration: Use exportToCSV() functions
 */

const DataService = {
    // Configuration
    config: {
        apiUrl: 'api/',  // Change this if your API is hosted elsewhere
        useApi: false,   // Will auto-detect if API is available
        storagePrefix: 'csun_asset_'
    },

    // Initialize - always use localStorage for this standalone version
    async init() {
        this.config.useApi = false;
        console.log('Using localStorage for data storage');
        await this.initLocalStorage();
        return false;
    },

    // Initialize localStorage with default data if empty
    async initLocalStorage() {
        const collections = ['assets', 'checkouts', 'photolab', 'software', 'rooms'];
        for (const collection of collections) {
            const key = this.config.storagePrefix + collection;
            if (!localStorage.getItem(key)) {
                // Load default data from JSON files
                try {
                    const response = await fetch(`data/${collection}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                } catch (e) {
                    console.log(`Could not load default ${collection} data`);
                }
            }
        }
    },

    // ==================== ASSETS ====================

    async getAssets() {
        const defaultData = { assets: [], categories: [], types: {}, statuses: [], conditions: [], locations: [] };
        const key = this.config.storagePrefix + 'assets';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.assets) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage assets:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/assets.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading assets.json:', e);
        }

        return defaultData;
    },

    async saveAsset(asset) {
        try {
            let data = await this.getAssets();
            if (!data || !data.assets) {
                data = { assets: [], categories: [], types: {}, statuses: [], conditions: [], locations: [] };
            }

            const index = asset.id ? data.assets.findIndex(a => a.id === asset.id) : -1;

            if (index >= 0) {
                data.assets[index] = { ...asset, lastUpdated: new Date().toISOString().split('T')[0] };
            } else {
                asset.id = this.generateId('AST');
                asset.lastUpdated = new Date().toISOString().split('T')[0];
                data.assets.push(asset);
            }

            if (this.config.useApi) {
                await fetch(this.config.apiUrl + 'assets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                localStorage.setItem(this.config.storagePrefix + 'assets', JSON.stringify(data));
            }
            return asset;
        } catch (error) {
            console.error('DataService.saveAsset error:', error);
            throw error;
        }
    },

    async deleteAsset(assetId) {
        try {
            const data = await this.getAssets();
            if (!data || !data.assets) return;

            data.assets = data.assets.filter(a => a.id !== assetId);

            if (this.config.useApi) {
                await fetch(this.config.apiUrl + 'assets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                localStorage.setItem(this.config.storagePrefix + 'assets', JSON.stringify(data));
            }
        } catch (error) {
            console.error('DataService.deleteAsset error:', error);
            throw error;
        }
    },

    // ==================== CHECKOUTS ====================

    async getCheckouts() {
        const defaultData = { checkouts: [], borrowerTypes: ['Student', 'Faculty', 'Staff', 'Guest'], equipmentTypes: ['Laptop', 'Display Tablet', 'Non-Display Tablet', 'Monitor', 'Camera', 'Other'] };
        const key = this.config.storagePrefix + 'checkouts';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.checkouts) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage checkouts:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/checkouts.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading checkouts.json:', e);
        }

        return defaultData;
    },

    async saveCheckout(checkout) {
        try {
            let data = await this.getCheckouts();
            if (!data || !data.checkouts) {
                data = { checkouts: [], borrowerTypes: ['Student', 'Faculty', 'Staff', 'Guest'], equipmentTypes: [] };
            }

            const index = checkout.id ? data.checkouts.findIndex(c => c.id === checkout.id) : -1;

            if (index >= 0) {
                data.checkouts[index] = checkout;
            } else {
                checkout.id = this.generateId('CHK');
                data.checkouts.push(checkout);
            }

            if (this.config.useApi) {
                await fetch(this.config.apiUrl + 'checkouts.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                localStorage.setItem(this.config.storagePrefix + 'checkouts', JSON.stringify(data));
            }
            return checkout;
        } catch (error) {
            console.error('DataService.saveCheckout error:', error);
            throw error;
        }
    },

    async updateAssetStatus(assetId, status, assignedTo) {
        const data = await this.getAssets();
        const asset = data.assets.find(a => a.id === assetId);
        if (asset) {
            asset.status = status;
            asset.assignedTo = assignedTo;
            asset.lastUpdated = new Date().toISOString().split('T')[0];

            if (this.config.useApi) {
                await fetch(this.config.apiUrl + 'assets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                localStorage.setItem(this.config.storagePrefix + 'assets', JSON.stringify(data));
            }
        }
    },

    // ==================== PHOTO LAB ====================

    async getPhotoLab() {
        const defaultData = {
            labs: [],
            stations: [],
            equipment: [],
            students: [],
            schedule: [],
            stationCheckouts: [],
            categories: ['Camera', 'Lens', 'Lighting', 'Support', 'Accessories', 'Film', 'Chemicals', 'Other'],
            stationStatuses: ['available', 'in-use', 'maintenance'],
            currentSemester: 'Spring 2024'
        };
        const key = this.config.storagePrefix + 'photolab';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage photolab:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/photolab.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading photolab.json:', e);
        }

        return defaultData;
    },

    async savePhotoLabEquipment(equipment) {
        const data = await this.getPhotoLab();
        const index = data.equipment.findIndex(e => e.id === equipment.id);

        if (index >= 0) {
            data.equipment[index] = equipment;
        } else {
            equipment.id = this.generateId('PL');
            data.equipment.push(equipment);
        }

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'photolab.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'photolab', JSON.stringify(data));
        }
        return equipment;
    },

    async saveReservation(reservation) {
        const data = await this.getPhotoLab();
        const index = data.reservations.findIndex(r => r.id === reservation.id);

        if (index >= 0) {
            data.reservations[index] = reservation;
        } else {
            reservation.id = this.generateId('RES');
            data.reservations.push(reservation);
        }

        // Update equipment availability
        const equipment = data.equipment.find(e => e.id === reservation.equipmentId);
        if (equipment) {
            if (reservation.status === 'Checked Out') {
                equipment.available = Math.max(0, equipment.available - reservation.quantity);
            } else if (reservation.status === 'Returned' || reservation.status === 'Cancelled') {
                equipment.available = Math.min(equipment.quantity, equipment.available + reservation.quantity);
            }
        }

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'photolab.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'photolab', JSON.stringify(data));
        }
        return reservation;
    },

    // ==================== SOFTWARE ====================

    async getSoftware() {
        const defaultData = { software: [], categories: [], licenseTypes: [], assignmentTypes: [], billingCycles: [], statuses: [] };
        const key = this.config.storagePrefix + 'software';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.software) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage software:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/software.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading software.json:', e);
        }

        return defaultData;
    },

    async saveSoftware(software) {
        const data = await this.getSoftware();
        const index = data.software.findIndex(s => s.id === software.id);

        if (index >= 0) {
            data.software[index] = { ...software, lastUpdated: new Date().toISOString().split('T')[0] };
        } else {
            software.id = this.generateId('SW');
            software.lastUpdated = new Date().toISOString().split('T')[0];
            data.software.push(software);
        }

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'software.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'software', JSON.stringify(data));
        }
        return software;
    },

    async deleteSoftware(softwareId) {
        const data = await this.getSoftware();
        data.software = data.software.filter(s => s.id !== softwareId);

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'software.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'software', JSON.stringify(data));
        }
    },

    // ==================== ROOMS ====================

    async getRooms() {
        const defaultData = { rooms: [], roomTypes: ['Office', 'Lab', 'Classroom', 'Conference', 'Studio', 'Storage', 'Other'], equipmentTypes: ['Computer', 'Display', 'Projector', 'Printer', 'Audio', 'Camera', 'Network', 'Other'], equipmentStatuses: ['Working', 'In Repair', 'Not Working', 'Retired'], buildings: ['Art Building', 'Design Building'] };
        const key = this.config.storagePrefix + 'rooms';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.rooms) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage rooms:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/rooms.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading rooms.json:', e);
        }

        return defaultData;
    },

    async saveRoom(room) {
        const data = await this.getRooms();
        const index = data.rooms.findIndex(r => r.id === room.id);

        if (index >= 0) {
            data.rooms[index] = { ...room, lastUpdated: new Date().toISOString().split('T')[0] };
        } else {
            room.id = this.generateId('ROOM');
            room.lastUpdated = new Date().toISOString().split('T')[0];
            data.rooms.push(room);
        }

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'rooms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'rooms', JSON.stringify(data));
        }
        return room;
    },

    async deleteRoom(roomId) {
        const data = await this.getRooms();
        data.rooms = data.rooms.filter(r => r.id !== roomId);

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'rooms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'rooms', JSON.stringify(data));
        }
    },

    // ==================== PERSONNEL ====================

    async getPersonnel() {
        const defaultData = { personnel: [], categories: [] };
        const key = this.config.storagePrefix + 'personnel';

        // Always try localStorage first
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.personnel) return data;
            }
        } catch (e) {
            console.error('Error parsing localStorage personnel:', e);
        }

        // Try to load from JSON file
        try {
            const response = await fetch('data/personnel.json');
            if (response.ok) {
                const jsonData = await response.json();
                localStorage.setItem(key, JSON.stringify(jsonData));
                return jsonData;
            }
        } catch (e) {
            console.error('Error loading personnel.json:', e);
        }

        return defaultData;
    },

    async savePersonnel(person) {
        const data = await this.getPersonnel();
        const index = data.personnel.findIndex(p => p.id === person.id);

        if (index >= 0) {
            data.personnel[index] = person;
        } else {
            person.id = this.generateId('PER');
            data.personnel.push(person);
        }

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'personnel.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'personnel', JSON.stringify(data));
        }
        return person;
    },

    async deletePersonnel(personId) {
        const data = await this.getPersonnel();
        data.personnel = data.personnel.filter(p => p.id !== personId);

        if (this.config.useApi) {
            await fetch(this.config.apiUrl + 'personnel.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            localStorage.setItem(this.config.storagePrefix + 'personnel', JSON.stringify(data));
        }
    },

    // Search personnel for autofill
    async searchPersonnel(query) {
        const data = await this.getPersonnel();
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        return data.personnel.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.firstName.toLowerCase().includes(lowerQuery) ||
            p.lastName.toLowerCase().includes(lowerQuery) ||
            (p.title && p.title.toLowerCase().includes(lowerQuery))
        ).slice(0, 10); // Limit to 10 results
    },

    // ==================== EXPORT FUNCTIONS ====================

    exportAssetsToCSV() {
        return this.getAssets().then(data => {
            const headers = ['ID', 'Name', 'Category', 'Type', 'Serial Number', 'CSUN Tag', 'Location', 'Status', 'Condition', 'Purchase Date', 'Warranty Expiry', 'Assigned To', 'Notes', 'Last Updated'];
            const rows = data.assets.map(a => [
                a.id, a.name, a.category, a.type, a.serialNumber, a.csunTag, a.location, a.status, a.condition, a.purchaseDate, a.warrantyExpiry, a.assignedTo || '', a.notes, a.lastUpdated
            ]);
            return this.generateCSV(headers, rows, 'IT_Assets');
        });
    },

    exportCheckoutsToCSV() {
        return this.getCheckouts().then(data => {
            // Export checkout records
            const headers = [
                'ID', 'Full Name', 'Student ID', 'CSUN Email', 'Personal Email', 'Phone',
                'Borrower Type', 'Equipment Count', 'Checkout Date', 'Due Date', 'Checked In Date',
                'Purpose', 'Status', 'Notes', 'Checked Out By'
            ];
            const rows = data.checkouts.map(c => [
                c.id, c.fullName, c.studentId || '', c.csunEmail, c.personalEmail || '', c.phoneNumber || '',
                c.borrowerType, (c.equipment || []).length, c.checkoutDate, c.dueDate, c.checkedInDate || '',
                c.purpose, c.status, c.notes, c.checkedOutBy
            ]);
            this.generateCSV(headers, rows, 'Checkouts');

            // Export equipment details
            const eqHeaders = [
                'Checkout ID', 'Borrower Name', 'Equipment Type', 'Equipment Name',
                'Asset Tag', 'Checkout Date', 'Returned Date', 'Status'
            ];
            const eqRows = [];
            data.checkouts.forEach(c => {
                (c.equipment || []).forEach(eq => {
                    eqRows.push([
                        c.id, c.fullName, eq.type, eq.name, eq.assetTag || '',
                        c.checkoutDate, eq.returnedDate || '', eq.returnedDate ? 'Returned' : 'Out'
                    ]);
                });
            });
            return this.generateCSV(eqHeaders, eqRows, 'Checkout_Equipment');
        });
    },

    exportPhotoLabToCSV() {
        return this.getPhotoLab().then(data => {
            // Export equipment
            const eqHeaders = ['ID', 'Name', 'Category', 'Type', 'Quantity', 'Available', 'Location', 'Requires Training', 'Training Course', 'Condition', 'Accessories', 'Notes'];
            const eqRows = data.equipment.map(e => [
                e.id, e.name, e.category, e.type, e.quantity, e.available, e.location, e.requiresTraining ? 'Yes' : 'No', e.trainingCourse || '', e.condition, (e.accessories || []).join('; '), e.notes
            ]);
            this.generateCSV(eqHeaders, eqRows, 'PhotoLab_Equipment');

            // Export reservations
            const resHeaders = ['ID', 'Equipment ID', 'Equipment Name', 'Quantity', 'Borrower Name', 'Borrower Email', 'Borrower Type', 'Reservation Date', 'Pickup Date', 'Return Date', 'Actual Return', 'Purpose', 'Status', 'Notes', 'Approved By'];
            const resRows = data.reservations.map(r => [
                r.id, r.equipmentId, r.equipmentName, r.quantity, r.borrowerName, r.borrowerEmail, r.borrowerType, r.reservationDate, r.pickupDate, r.returnDate, r.actualReturnDate || '', r.purpose, r.status, r.notes, r.approvedBy
            ]);
            return this.generateCSV(resHeaders, resRows, 'PhotoLab_Reservations');
        });
    },

    exportSoftwareToCSV() {
        return this.getSoftware().then(data => {
            const headers = [
                'ID', 'Name', 'Vendor', 'Version', 'Category', 'License Type',
                'Total Licenses', 'Used Licenses', 'Cost', 'Billing Cycle',
                'Purchase Date', 'Renewal Date', 'Assignment Type', 'Assigned To',
                'Status', 'Contact Name', 'Contact Email', 'Contact Phone',
                'Account Rep', 'Notes', 'Last Updated'
            ];
            const rows = data.software.map(s => [
                s.id, s.name, s.vendor, s.version, s.category, s.licenseType,
                s.totalLicenses, s.usedLicenses || 0, s.cost || 0, s.billingCycle,
                s.purchaseDate, s.renewalDate, s.assignmentType, s.assignedTo,
                s.status, s.supportContact?.name || '', s.supportContact?.email || '',
                s.supportContact?.phone || '', s.supportContact?.accountRep || '',
                s.notes, s.lastUpdated
            ]);
            return this.generateCSV(headers, rows, 'Software_Licenses');
        });
    },

    exportRoomsToCSV() {
        return this.getRooms().then(data => {
            const headers = [
                'Room ID', 'Room Number', 'Room Name', 'Building', 'Floor', 'Type',
                'Capacity', 'Primary Contact', 'Equipment Count', 'Notes', 'Last Updated'
            ];
            const rows = data.rooms.map(r => [
                r.id, r.roomNumber, r.name, r.building, r.floor, r.type,
                r.capacity || '', r.primaryContact || '', (r.equipment || []).length,
                r.notes, r.lastUpdated
            ]);
            this.generateCSV(headers, rows, 'Room_Inventory');

            // Also export equipment details
            const eqHeaders = [
                'Room Number', 'Room Name', 'Equipment ID', 'Equipment Type',
                'Equipment Name', 'Asset Tag', 'Serial Number', 'Status', 'Notes'
            ];
            const eqRows = [];
            data.rooms.forEach(r => {
                (r.equipment || []).forEach(eq => {
                    eqRows.push([
                        r.roomNumber, r.name, eq.id, eq.type,
                        eq.name, eq.assetTag, eq.serialNumber, eq.status, eq.notes
                    ]);
                });
            });
            return this.generateCSV(eqHeaders, eqRows, 'Room_Equipment');
        });
    },

    exportAllToCSV() {
        this.exportAssetsToCSV();
        this.exportCheckoutsToCSV();
        this.exportPhotoLabToCSV();
        this.exportSoftwareToCSV();
        this.exportRoomsToCSV();
    },

    generateCSV(headers, rows, filename) {
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
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        return csv;
    },

    // ==================== UTILITY FUNCTIONS ====================

    generateId(prefix) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}${random}`.toUpperCase();
    },

    // Get statistics for dashboard
    async getStats() {
        const [assets, checkouts, photolab, software, rooms] = await Promise.all([
            this.getAssets(),
            this.getCheckouts(),
            this.getPhotoLab(),
            this.getSoftware(),
            this.getRooms()
        ]);

        const totalAssets = assets.assets.length;
        const checkedOut = assets.assets.filter(a => a.status === 'Checked Out').length;
        const available = assets.assets.filter(a => a.status === 'Available').length;
        const photoLabItems = photolab.equipment.reduce((sum, e) => sum + e.quantity, 0);

        // Check for overdue items
        const today = new Date().toISOString().split('T')[0];
        const overdueCheckouts = checkouts.checkouts.filter(c =>
            c.status === 'Active' && c.dueDate < today
        );

        // Items in repair
        const inRepair = assets.assets.filter(a => a.status === 'In Repair').length;

        // Expiring warranties (within 90 days)
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        const expiringWarranties = assets.assets.filter(a => {
            if (!a.warrantyExpiry) return false;
            const expiry = new Date(a.warrantyExpiry);
            return expiry <= ninetyDaysFromNow && expiry >= new Date();
        });

        // Software stats
        const totalSoftware = software.software.length;
        const activeSoftware = software.software.filter(s => s.status === 'Active').length;
        const sixtyDays = new Date();
        sixtyDays.setDate(sixtyDays.getDate() + 60);
        const expiringSoftware = software.software.filter(s => {
            if (!s.renewalDate || s.status === 'Cancelled' || s.status === 'Expired') return false;
            const renewal = new Date(s.renewalDate);
            return renewal <= sixtyDays && renewal >= new Date();
        });
        const softwareCost = software.software
            .filter(s => s.status === 'Active')
            .reduce((sum, s) => sum + (s.cost || 0), 0);

        // Room stats
        const totalRooms = rooms.rooms.length;
        const totalRoomEquipment = rooms.rooms.reduce((sum, r) => sum + (r.equipment || []).length, 0);
        const roomsWithIssues = rooms.rooms.filter(r =>
            (r.equipment || []).some(eq => eq.status !== 'Working')
        ).length;

        return {
            totalAssets,
            checkedOut,
            available,
            photoLabItems,
            overdueCheckouts,
            inRepair,
            expiringWarranties,
            totalSoftware,
            activeSoftware,
            expiringSoftware,
            softwareCost,
            totalRooms,
            totalRoomEquipment,
            roomsWithIssues
        };
    },

    // Reset all data to defaults from JSON files
    async resetAllData() {
        const collections = ['assets', 'checkouts', 'photolab', 'software', 'rooms', 'personnel'];

        // Clear all localStorage keys using the correct prefix
        collections.forEach(collection => {
            localStorage.removeItem(this.config.storagePrefix + collection);
        });

        // Reinitialize
        await this.init();

        return true;
    }
};

// Initialize on load
DataService.init();

// Global function to reset data from browser console
async function resetPortalData() {
    if (confirm('Reset all data to defaults? This will clear any changes you have made.')) {
        await DataService.resetAllData();
        location.reload();
    }
}
