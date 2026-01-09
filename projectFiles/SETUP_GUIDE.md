# CSUN Art & Design Portal - Complete Setup Guide

## 📋 Table of Contents
1. [SharePoint Lists Setup](#sharepoint-lists-setup)
2. [SPFx Project Setup](#spfx-project-setup)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Teams Integration](#teams-integration)

---

## 1. SharePoint Lists Setup

### Create the Following Lists in SharePoint:

### A. Purchase Requests List

**List Name:** `PurchaseRequests`

**Columns:**

| Column Name | Type | Required | Choices/Settings |
|------------|------|----------|------------------|
| Title | Single line of text | Yes | Default title field |
| DepartmentArea | Choice | Yes | Animation, Graphic Design, Photography, Illustration, Art History, Painting/Drawing, Sculpture, Ceramics, Other |
| Category | Choice | Yes | Hardware, Software, Furniture, Supplies, Other |
| ItemDescription | Multiple lines of text | Yes | Plain text, 6 lines |
| ItemLink | Hyperlink | No | Format: Hyperlink |
| FundingSource | Choice | Yes | IRA, Lottery, Department, Other |
| FundingSourceOther | Multiple lines of text | No | Plain text, 3 lines |
| Requester | Person or Group | Yes | Allow selection of: People Only |
| Purchaser | Person or Group | No | Allow selection of: People Only |
| OtherComments | Multiple lines of text | No | Plain text, 6 lines |
| Status | Choice | Yes | Submitted (default), Under Review, Approved, Ordered, Received, Denied |
| DateSubmitted | Date and Time | Yes | Date Only, Default: Today |
| DateCompleted | Date and Time | No | Date Only |
| EstimatedCost | Currency | No | Min: 0, Decimals: 2 |

**PowerShell to Create List:**
```powershell
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/yoursite" -Interactive

# Create the list
New-PnPList -Title "PurchaseRequests" -Template GenericList

# Add columns
Add-PnPField -List "PurchaseRequests" -DisplayName "DepartmentArea" -InternalName "DepartmentArea" -Type Choice -Choices @("Animation","Graphic Design","Photography","Illustration","Art History","Painting/Drawing","Sculpture","Ceramics","Other") -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "Category" -InternalName "Category" -Type Choice -Choices @("Hardware","Software","Furniture","Supplies","Other") -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "ItemDescription" -InternalName "ItemDescription" -Type Note -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "ItemLink" -InternalName "ItemLink" -Type URL
Add-PnPField -List "PurchaseRequests" -DisplayName "FundingSource" -InternalName "FundingSource" -Type Choice -Choices @("IRA","Lottery","Department","Other") -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "FundingSourceOther" -InternalName "FundingSourceOther" -Type Note
Add-PnPField -List "PurchaseRequests" -DisplayName "Requester" -InternalName "Requester" -Type User -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "Purchaser" -InternalName "Purchaser" -Type User
Add-PnPField -List "PurchaseRequests" -DisplayName "OtherComments" -InternalName "OtherComments" -Type Note
Add-PnPField -List "PurchaseRequests" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices @("Submitted","Under Review","Approved","Ordered","Received","Denied") -DefaultValue "Submitted" -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "DateSubmitted" -InternalName "DateSubmitted" -Type DateTime -Required
Add-PnPField -List "PurchaseRequests" -DisplayName "DateCompleted" -InternalName "DateCompleted" -Type DateTime
Add-PnPField -List "PurchaseRequests" -DisplayName "EstimatedCost" -InternalName "EstimatedCost" -Type Currency
```

---

### B. Support Requests List

**List Name:** `SupportRequests`

**Columns:**

| Column Name | Type | Required | Choices/Settings |
|------------|------|----------|------------------|
| Title | Single line of text | Yes | Default title field |
| RequestType | Choice | Yes | Issue, Request, Other |
| DepartmentArea | Choice | Yes | Same as Purchase Requests |
| Category | Choice | Yes | Equipment, Facilities, Supplies, Event, Other |
| Details | Multiple lines of text | Yes | Plain text, 6 lines |
| Priority | Choice | Yes | Low, Medium (default), High, Critical |
| Status | Choice | Yes | Open (default), In Progress, Resolved, Closed |
| AssignedTo | Person or Group | No | Allow selection of: People Only |
| NeedByDate | Date and Time | No | Date Only |
| ResolvedDate | Date and Time | No | Date Only |
| ResolutionNotes | Multiple lines of text | No | Plain text, 6 lines |

**PowerShell to Create List:**
```powershell
New-PnPList -Title "SupportRequests" -Template GenericList -EnableAttachments

Add-PnPField -List "SupportRequests" -DisplayName "RequestType" -InternalName "RequestType" -Type Choice -Choices @("Issue","Request","Other") -Required
Add-PnPField -List "SupportRequests" -DisplayName "DepartmentArea" -InternalName "DepartmentArea" -Type Choice -Choices @("Animation","Graphic Design","Photography","Illustration","Art History","Painting/Drawing","Sculpture","Ceramics","Other") -Required
Add-PnPField -List "SupportRequests" -DisplayName "Category" -InternalName "Category" -Type Choice -Choices @("Equipment","Facilities","Supplies","Event","Other") -Required
Add-PnPField -List "SupportRequests" -DisplayName "Details" -InternalName "Details" -Type Note -Required
Add-PnPField -List "SupportRequests" -DisplayName "Priority" -InternalName "Priority" -Type Choice -Choices @("Low","Medium","High","Critical") -DefaultValue "Medium" -Required
Add-PnPField -List "SupportRequests" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices @("Open","In Progress","Resolved","Closed") -DefaultValue "Open" -Required
Add-PnPField -List "SupportRequests" -DisplayName "AssignedTo" -InternalName "AssignedTo" -Type User
Add-PnPField -List "SupportRequests" -DisplayName "NeedByDate" -InternalName "NeedByDate" -Type DateTime
Add-PnPField -List "SupportRequests" -DisplayName "ResolvedDate" -InternalName "ResolvedDate" -Type DateTime
Add-PnPField -List "SupportRequests" -DisplayName "ResolutionNotes" -InternalName "ResolutionNotes" -Type Note
```

---

### C. News & Announcements List

**List Name:** `NewsAnnouncements`

**Columns:**

| Column Name | Type | Required | Settings |
|------------|------|----------|----------|
| Title | Single line of text | Yes | Default title field |
| Content | Multiple lines of text | Yes | Enhanced rich text, 6 lines |
| Link | Hyperlink | No | Format: Hyperlink |
| PublishedDate | Date and Time | Yes | Date Only, Default: Today |
| ExpirationDate | Date and Time | No | Date Only |

**PowerShell to Create List:**
```powershell
New-PnPList -Title "NewsAnnouncements" -Template GenericList

Add-PnPField -List "NewsAnnouncements" -DisplayName "Content" -InternalName "Content" -Type Note -Required
Add-PnPField -List "NewsAnnouncements" -DisplayName "Link" -InternalName "Link" -Type URL
Add-PnPField -List "NewsAnnouncements" -DisplayName "PublishedDate" -InternalName "PublishedDate" -Type DateTime -Required
Add-PnPField -List "NewsAnnouncements" -DisplayName "ExpirationDate" -InternalName "ExpirationDate" -Type DateTime
```

---

### D. Department Stats List

**List Name:** `DepartmentStats`

**Columns:**

| Column Name | Type | Required | Settings |
|------------|------|----------|----------|
| Title | Single line of text | Yes | e.g., "Fall 2024 Stats" |
| TotalEnrollments | Number | Yes | No decimals |
| UndergradEnrollments | Number | Yes | No decimals |
| GradEnrollments | Number | Yes | No decimals |
| FacultyCount | Number | Yes | No decimals |
| LastUpdated | Date and Time | Yes | Date and Time, Default: Today |

**PowerShell to Create List:**
```powershell
New-PnPList -Title "DepartmentStats" -Template GenericList

Add-PnPField -List "DepartmentStats" -DisplayName "TotalEnrollments" -InternalName "TotalEnrollments" -Type Number -Required
Add-PnPField -List "DepartmentStats" -DisplayName "UndergradEnrollments" -InternalName "UndergradEnrollments" -Type Number -Required
Add-PnPField -List "DepartmentStats" -DisplayName "GradEnrollments" -InternalName "GradEnrollments" -Type Number -Required
Add-PnPField -List "DepartmentStats" -DisplayName "FacultyCount" -InternalName "FacultyCount" -Type Number -Required
Add-PnPField -List "DepartmentStats" -DisplayName "LastUpdated" -InternalName "LastUpdated" -Type DateTime -Required
```

---

### E. Calendar (Already Created)

Your existing M365 Calendar: **"CSUN Art & Design Service Portal"**

✅ Already configured and working!

---

## 2. SPFx Project Setup

### Prerequisites
```bash
# Install Node.js 16 or 18 (not 20+)
node --version  # Should be v16.x or v18.x

# Install Yeoman and SPFx generator globally
npm install -g yo @microsoft/generator-sharepoint gulp-cli
```

### Create SPFx Project
```bash
# Create project directory
mkdir art-design-portal
cd art-design-portal

# Generate SPFx project
yo @microsoft/sharepoint

# Answer prompts:
# - Solution name: art-design-portal
# - Baseline: SharePoint Online only
# - Folder: Use current folder
# - Tenant: N
# - Web part name: ArtDesignPortal
# - Description: CSUN Art & Design IT Portal
# - Framework: React
# - Add PnP library: Yes
```

### Install Dependencies
```bash
npm install @pnp/sp @pnp/graph --save
npm install @pnp/spfx-controls-react --save
npm install @fortawesome/fontawesome-free --save
```

---

## 3. Project Structure

```
art-design-portal/
├── src/
│   ├── webparts/
│   │   └── artDesignPortal/
│   │       ├── ArtDesignPortalWebPart.ts
│   │       ├── components/
│   │       │   ├── ArtDesignPortal.tsx
│   │       │   ├── ArtDesignPortal.module.scss
│   │       │   ├── PurchaseRequestForm.tsx
│   │       │   ├── SupportRequestForm.tsx
│   │       │   ├── RequestForms.module.scss
│   │       │   ├── RequestStatusDashboard.tsx
│   │       │   ├── NewsEditor.tsx
│   │       │   └── IArtDesignPortalProps.ts
│   │       └── loc/
│   └── services/
│       ├── sharepoint.config.ts
│       └── SharePointService.ts
├── config/
│   ├── package-solution.json
│   └── serve.json
├── package.json
└── tsconfig.json
```

---

## 4. Configuration

### A. Update `package-solution.json`

Add Graph API permissions for Teams integration:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "art-design-portal-client-side-solution",
    "id": "YOUR-GUID-HERE",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "CSUN Art & Design",
      "websiteUrl": "",
      "privacyUrl": "",
      "termsOfUseUrl": "",
      "mpnId": ""
    },
    "metadata": {
      "shortDescription": {
        "default": "CSUN Art & Design IT Portal"
      },
      "longDescription": {
        "default": "Department portal for IT services, requests, and support"
      },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    },
    "features": [
      {
        "title": "art-design-portal Feature",
        "description": "The feature that activates elements of the art-design-portal solution.",
        "id": "YOUR-FEATURE-GUID-HERE",
        "version": "1.0.0.0"
      }
    ],
    "webApiPermissionRequests": [
      {
        "resource": "Microsoft Graph",
        "scope": "Chat.ReadWrite"
      },
      {
        "resource": "Microsoft Graph",
        "scope": "User.Read.All"
      }
    ]
  },
  "paths": {
    "zippedPackage": "solution/art-design-portal.sppkg"
  }
}
```

---

## 5. Build and Deploy

### Development (Local Testing)
```bash
# Start local workbench
gulp serve

# Access at: https://yourtenant.sharepoint.com/sites/yoursite/_layouts/15/workbench.aspx
```

### Production Build
```bash
# Build for production
gulp bundle --ship

# Package solution
gulp package-solution --ship

# Output: sharepoint/solution/art-design-portal.sppkg
```

### Deploy to SharePoint
1. Go to SharePoint Admin Center
2. Navigate to **More features** → **Apps** → **App Catalog**
3. Upload `art-design-portal.sppkg`
4. Check "Make this solution available to all sites"
5. Click **Deploy**

### Add to Site
1. Go to your site: `https://yourtenant.sharepoint.com/sites/yoursite`
2. Click **Settings** (gear icon) → **Add an app**
3. Find "art-design-portal" and click **Add**
4. Edit a page and add the "ArtDesignPortal" web part

---

## 6. Teams Integration Setup

### Grant API Permissions
1. Go to **SharePoint Admin Center**
2. Navigate to **Advanced** → **API access**
3. Approve the pending requests:
   - Microsoft Graph → Chat.ReadWrite
   - Microsoft Graph → User.Read.All

### Test Teams Messaging
The chat bubble will now be able to send messages via Teams!

---

## 7. Initial Data Setup

### Add Initial Stats
```powershell
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/yoursite" -Interactive

Add-PnPListItem -List "DepartmentStats" -Values @{
    "Title" = "Fall 2024"
    "TotalEnrollments" = 1647
    "UndergradEnrollments" = 1523
    "GradEnrollments" = 124
    "FacultyCount" = 140
    "LastUpdated" = (Get-Date)
}
```

### Add Sample News
```powershell
Add-PnPListItem -List "NewsAnnouncements" -Values @{
    "Title" = "Welcome to the New IT Portal"
    "Content" = "We're excited to announce the launch of our new IT service portal..."
    "PublishedDate" = (Get-Date)
}
```

---

## 8. Next Steps

✅ **You now have:**
- All SharePoint lists created
- SPFx project structure
- Service layer for data access
- Purchase & Support request forms
- Calendar integration
- Teams chat functionality

### To Complete:
1. Copy the provided files into your SPFx project
2. Update the GUIDs in `package-solution.json`
3. Build and deploy
4. Test all functionality
5. Customize branding/colors as needed

---

## Need Help?

Contact Brandon Brathwaite - IT Consultant II
📧 brandon.brathwaite@csun.edu
📍 Art 110
