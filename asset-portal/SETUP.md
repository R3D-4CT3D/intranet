# CSUN Art & Design Asset Portal - Setup Guide

A lightweight IT asset management system with JSON file storage.

## Features

- **IT Assets**: Track computers, monitors, printers, and equipment
- **Equipment Checkout**: Manage loans to faculty, staff, and students
- **Photo Lab**: Equipment catalog and reservation system
- **CSV Export**: Export all data for SharePoint import

## Quick Start (No Backend)

The portal works immediately without any backend setup:

1. Open `index.html` in a web browser
2. Data is stored in your browser's localStorage
3. Use "Export All" to backup or transfer data

**Note**: localStorage data is device-specific. Export regularly!

## NAS Deployment (With Backend)

For persistent, shared storage on a NAS:

### Requirements
- Web server with PHP 7.0+ (most Synology/QNAP NAS have this)
- Write permissions on the `data/` folder

### Steps

1. **Copy files to your NAS web folder**
   ```
   /web/asset-portal/
   ├── index.html
   ├── assets.html
   ├── checkouts.html
   ├── photolab.html
   ├── api/
   │   ├── status.php
   │   ├── assets.php
   │   ├── checkouts.php
   │   └── photolab.php
   ├── data/
   │   ├── assets.json
   │   ├── checkouts.json
   │   └── photolab.json
   └── js/
       ├── dataService.js
       ├── app.js
       ├── assets.js
       ├── checkouts.js
       └── photolab.js
   ```

2. **Set permissions on data folder**
   ```bash
   chmod 755 data/
   chmod 644 data/*.json
   ```

3. **Test API**
   Visit: `http://your-nas/asset-portal/api/status.php`

   Should return: `{"status":"ok",...}`

4. **Access portal**
   Visit: `http://your-nas/asset-portal/`

## Storage Modes

The portal auto-detects which storage mode to use:

| Mode | When Used | Data Location |
|------|-----------|---------------|
| **localStorage** | API not available | Browser storage (device-specific) |
| **Server** | API returns 200 | `data/*.json` files |

## Exporting to SharePoint

1. Click "Export All" on the main dashboard
2. Four CSV files will download:
   - `IT_Assets_YYYY-MM-DD.csv`
   - `Checkouts_YYYY-MM-DD.csv`
   - `PhotoLab_Equipment_YYYY-MM-DD.csv`
   - `PhotoLab_Reservations_YYYY-MM-DD.csv`

3. Import into SharePoint:
   - Create matching SharePoint lists
   - Use SharePoint's "Import from Excel" feature
   - Map columns appropriately

## Data Backup

The PHP API automatically creates backups before each write:
- Location: `data/*.json.backup.TIMESTAMP`
- Keeps last 10 backups per file

For localStorage mode, use "Export All" to create backups.

## Customization

### Adding Asset Categories
Edit `data/assets.json`:
```json
{
  "categories": ["Computer", "Monitor", "Printer", ...],
  "types": {
    "Computer": ["Desktop", "Laptop", ...],
    ...
  }
}
```

### Adding Locations
Edit `data/assets.json`:
```json
{
  "locations": ["Art 100", "Art 105", ...]
}
```

## Troubleshooting

### "No API detected" in console
- Check PHP is installed on your server
- Verify `api/status.php` is accessible
- Check file permissions

### Data not saving
- For localStorage: Check browser storage isn't full
- For server: Verify `data/` folder is writable

### CORS errors
- Ensure all files are served from the same domain
- Check PHP headers in api files

## Support

For CSUN Art & Design IT questions, contact the IT team.
