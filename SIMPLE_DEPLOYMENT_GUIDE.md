# Simple HTML Deployment Guide

## Quick Deployment (5 Minutes!)

### Step 1: Create Lists
Run the PowerShell script:
```powershell
cd deployment-scripts
.\create-sharepoint-lists.ps1
```

### Step 2: Upload HTML
1. Go to SharePoint site
2. Site Contents → Site Assets
3. Upload `art-design-portal-sharepoint.html`

### Step 3: Embed on Page
Add Embed web part with:
```html
<iframe src="/SiteAssets/art-design-portal-sharepoint.html" 
        width="100%" 
        height="1200px" 
        frameborder="0">
</iframe>
```

## Features Included
- Purchase request forms
- Support request forms  
- Department statistics
- Calendar integration
- News display
- Staff directory

## Troubleshooting
Check browser console (F12) for errors.
Verify list names match exactly.
Ensure users have Contribute permissions.

## Done!
The portal is now live and working.
