/**
 * CSUN Art & Design Asset Portal - Main App
 */

document.addEventListener('DOMContentLoaded', async function() {
    updateDate();
    await loadDashboard();
});

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

async function loadDashboard() {
    try {
        const stats = await DataService.getStats();

        // Update stat cards
        document.getElementById('statTotalAssets').textContent = stats.totalAssets;

        // Checked Out in X/Y format
        document.getElementById('statCheckedOut').textContent = `${stats.checkedOut}/${stats.available}`;
        document.getElementById('statCheckedOutDetail').textContent = `checked out / available`;

        // Overdue count
        document.getElementById('statOverdue').textContent = stats.overdueCheckouts.length;

        // Software count
        document.getElementById('statSoftware').textContent = stats.totalSoftware;

        // Load combined alerts
        await loadAlerts(stats);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadAlerts(stats) {
    const [checkouts, software, assets] = await Promise.all([
        DataService.getCheckouts(),
        DataService.getSoftware(),
        DataService.getAssets()
    ]);

    const container = document.getElementById('alertsContainer');
    const today = new Date().toISOString().split('T')[0];
    const alerts = [];

    // Overdue checkouts (highest priority)
    checkouts.checkouts
        .filter(c => c.status === 'Active' && c.dueDate < today)
        .forEach(c => {
            alerts.push({
                priority: 0,
                type: 'danger',
                icon: 'exclamation-circle',
                title: 'OVERDUE',
                message: c.fullName,
                detail: `${(c.equipment || []).length} item(s) - Due: ${formatDate(c.dueDate)}`,
                link: `checkouts.html?id=${c.id}`
            });
        });

    // Items in repair
    if (stats.inRepair > 0) {
        alerts.push({
            priority: 1,
            type: 'warning',
            icon: 'tools',
            title: 'In Repair',
            message: `${stats.inRepair} item(s) currently being repaired`,
            detail: '',
            link: 'assets.html?status=In%20Repair'
        });
    }

    // Software renewals (within 60 days)
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);
    software.software
        .filter(s => s.renewalDate && s.status === 'Active')
        .forEach(s => {
            const isExpired = s.renewalDate < today;
            const renewalDate = new Date(s.renewalDate);
            if (isExpired || renewalDate <= sixtyDays) {
                alerts.push({
                    priority: isExpired ? 0 : 2,
                    type: isExpired ? 'danger' : 'warning',
                    icon: 'cube',
                    title: isExpired ? 'EXPIRED' : 'Software Renewal',
                    message: `${s.name} (${s.vendor})`,
                    detail: `${isExpired ? 'Expired' : 'Renews'}: ${formatDate(s.renewalDate)}`,
                    link: `software.html?id=${s.id}`
                });
            }
        });

    // Upcoming checkout due dates (within 7 days, not overdue)
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    checkouts.checkouts
        .filter(c => c.status === 'Active' && c.dueDate >= today && new Date(c.dueDate) <= sevenDays)
        .forEach(c => {
            alerts.push({
                priority: 3,
                type: 'info',
                icon: 'calendar-check',
                title: 'Due Soon',
                message: c.fullName,
                detail: `${(c.equipment || []).length} item(s) - Due: ${formatDate(c.dueDate)}`,
                link: `checkouts.html?id=${c.id}`
            });
        });

    // Expiring warranties (within 90 days)
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    assets.assets
        .filter(a => a.warrantyExpiry && new Date(a.warrantyExpiry) <= ninetyDays && new Date(a.warrantyExpiry) >= new Date())
        .forEach(a => {
            alerts.push({
                priority: 4,
                type: 'info',
                icon: 'shield-alt',
                title: 'Warranty Expiring',
                message: a.name,
                detail: `Expires: ${formatDate(a.warrantyExpiry)}`,
                link: `assets.html?id=${a.id}`
            });
        });

    // Sort by priority
    alerts.sort((a, b) => a.priority - b.priority);

    // Update count
    document.getElementById('alertCount').textContent = alerts.length;

    // Clear container
    container.innerHTML = '';

    if (alerts.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'text-center text-gray-400 py-8';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle text-4xl text-green-500 mb-3';
        emptyDiv.appendChild(icon);
        const text = document.createElement('p');
        text.className = 'text-green-600 font-medium';
        text.textContent = 'All clear! No alerts or upcoming deadlines.';
        emptyDiv.appendChild(text);
        container.appendChild(emptyDiv);
        return;
    }

    const typeStyles = {
        danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', text: 'text-red-700' },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-700' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', text: 'text-blue-700' }
    };

    // Show up to 8 alerts in a grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';

    alerts.slice(0, 8).forEach(alert => {
        const style = typeStyles[alert.type];
        const row = document.createElement('a');
        row.href = alert.link;
        row.className = `flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${style.border} hover:shadow-md transition cursor-pointer`;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0';
        const icon = document.createElement('i');
        icon.className = `fas fa-${alert.icon} ${style.icon} text-lg`;
        iconDiv.appendChild(icon);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-1 min-w-0';

        const titleDiv = document.createElement('div');
        titleDiv.className = `text-xs font-bold ${style.text} uppercase`;
        titleDiv.textContent = alert.title;
        contentDiv.appendChild(titleDiv);

        const msgDiv = document.createElement('div');
        msgDiv.className = 'font-medium text-gray-800 truncate';
        msgDiv.textContent = alert.message;
        contentDiv.appendChild(msgDiv);

        if (alert.detail) {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'text-xs text-gray-500 truncate';
            detailDiv.textContent = alert.detail;
            contentDiv.appendChild(detailDiv);
        }

        const arrow = document.createElement('i');
        arrow.className = 'fas fa-chevron-right text-gray-400 flex-shrink-0';

        row.appendChild(iconDiv);
        row.appendChild(contentDiv);
        row.appendChild(arrow);
        gridDiv.appendChild(row);
    });

    container.appendChild(gridDiv);

    // Show "View all" link if there are more than 8 alerts
    if (alerts.length > 8) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'text-center mt-3 pt-3 border-t';
        const moreLink = document.createElement('a');
        moreLink.href = 'checkouts.html';
        moreLink.className = 'text-sm text-gray-500 hover:text-gray-700';
        moreLink.textContent = `+ ${alerts.length - 8} more alerts`;
        moreDiv.appendChild(moreLink);
        container.appendChild(moreDiv);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function exportAllData() {
    if (confirm('Export all data to CSV files?\n\nThis will download:\n- IT_Assets.csv\n- Checkouts.csv\n- PhotoLab_Equipment.csv\n- PhotoLab_Reservations.csv\n- Software_Licenses.csv')) {
        DataService.exportAllToCSV();
    }
}

function showDataInfo() {
    const useApi = DataService.config.useApi;
    alert(
        `Data Storage Information\n\n` +
        `Storage Mode: ${useApi ? 'Server (JSON Files)' : 'Browser (localStorage)'}\n\n` +
        (useApi
            ? `Data is stored on your server in the /data folder as JSON files.`
            : `Data is stored in your browser's localStorage.\n\nNote: Data is device-specific. Use "Export All" to backup your data or transfer it to another device.`
        ) +
        `\n\nTo migrate to SharePoint:\n1. Click "Export All" to download CSV files\n2. Import CSVs into SharePoint lists`
    );
}
