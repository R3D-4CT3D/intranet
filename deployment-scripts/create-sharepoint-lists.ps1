# ================================================
# SharePoint Lists Creation Script
# CSUN Art & Design Portal
# ================================================

# IMPORTANT: Update this URL to your actual SharePoint site!
$siteUrl = "https://csun.sharepoint.com/sites/ArtAndDesign"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CSUN Art & Design Portal - List Creation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Connect to SharePoint
Write-Host "Connecting to SharePoint..." -ForegroundColor Yellow
Write-Host "Site URL: $siteUrl" -ForegroundColor Gray
Write-Host ""

try {
    # IMPORTANT: Replace this with your own Azure AD App Client ID!
    # See deployment guide for instructions on creating an Azure AD App Registration
    $clientId = "YOUR-CLIENT-ID-HERE"

    if ($clientId -eq "YOUR-CLIENT-ID-HERE") {
        Write-Host "❌ Error: Please update the Client ID in the script!" -ForegroundColor Red
        Write-Host "Follow the instructions in the deployment guide to create an Azure AD App Registration." -ForegroundColor Yellow
        exit 1
    }

    Connect-PnPOnline -Url $siteUrl -Interactive -ClientId $clientId
    Write-Host "✅ Connected successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error connecting to SharePoint!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Function to create list if it doesn't exist
function Create-ListIfNotExists {
    param($ListTitle, $Template)

    try {
        $list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
        if ($null -eq $list) {
            Write-Host "Creating list: $ListTitle..." -ForegroundColor Yellow
            New-PnPList -Title $ListTitle -Template $Template -ErrorAction Stop
            Write-Host "✅ Created: $ListTitle" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  List already exists: $ListTitle (skipping)" -ForegroundColor DarkYellow
            return $false
        }
    } catch {
        Write-Host "❌ Error creating $ListTitle" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Function to add field if it doesn't exist
function Add-FieldIfNotExists {
    param($ListName, $FieldName, $FieldType, $Choices, $Required, $DefaultValue)

    try {
        $field = Get-PnPField -List $ListName -Identity $FieldName -ErrorAction SilentlyContinue
        if ($null -eq $field) {
            $params = @{
                List = $ListName
                DisplayName = $FieldName
                InternalName = $FieldName
                Type = $FieldType
            }

            if ($Choices) { $params.Add("Choices", $Choices) }
            if ($Required) { $params.Add("Required", $true) }
            if ($DefaultValue) { $params.Add("DefaultValue", $DefaultValue) }

            Add-PnPField @params -ErrorAction Stop
            Write-Host "  ✅ Added field: $FieldName" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  Error adding field $FieldName : $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

# ==================== CREATE LISTS ====================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Creating SharePoint Lists..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Purchase Requests List
Write-Host "1️⃣  PURCHASE REQUESTS LIST" -ForegroundColor Cyan
if (Create-ListIfNotExists -ListTitle "PurchaseRequests" -Template "GenericList") {
    Start-Sleep -Seconds 2
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "DepartmentArea" -FieldType "Choice" -Choices @("Animation","Graphic Design","Photography","Illustration","Art History","Painting/Drawing","Sculpture","Ceramics","Other") -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "Category" -FieldType "Choice" -Choices @("Hardware","Software","Furniture","Supplies","Other") -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "ItemDescription" -FieldType "Note" -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "ItemLink" -FieldType "URL"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "FundingSource" -FieldType "Choice" -Choices @("IRA","Lottery","Department","Other") -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "FundingSourceOther" -FieldType "Note"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "Requester" -FieldType "User" -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "Purchaser" -FieldType "User"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "OtherComments" -FieldType "Note"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "Status" -FieldType "Choice" -Choices @("Submitted","Under Review","Approved","Ordered","Received","Denied") -Required $true -DefaultValue "Submitted"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "DateSubmitted" -FieldType "DateTime" -Required $true
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "DateCompleted" -FieldType "DateTime"
    Add-FieldIfNotExists -ListName "PurchaseRequests" -FieldName "EstimatedCost" -FieldType "Currency"
}
Write-Host ""

# 2. Support Requests List
Write-Host "2️⃣  SUPPORT REQUESTS LIST" -ForegroundColor Cyan
if (Create-ListIfNotExists -ListTitle "SupportRequests" -Template "GenericList") {
    Start-Sleep -Seconds 2
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "RequestType" -FieldType "Choice" -Choices @("Issue","Request","Other") -Required $true
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "DepartmentArea" -FieldType "Choice" -Choices @("Animation","Graphic Design","Photography","Illustration","Art History","Painting/Drawing","Sculpture","Ceramics","Other") -Required $true
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "Category" -FieldType "Choice" -Choices @("Equipment","Facilities","Supplies","Event","Other") -Required $true
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "Details" -FieldType "Note" -Required $true
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "Priority" -FieldType "Choice" -Choices @("Low","Medium","High","Critical") -Required $true -DefaultValue "Medium"
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "Status" -FieldType "Choice" -Choices @("Open","In Progress","Resolved","Closed") -Required $true -DefaultValue "Open"
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "AssignedTo" -FieldType "User"
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "NeedByDate" -FieldType "DateTime"
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "ResolvedDate" -FieldType "DateTime"
    Add-FieldIfNotExists -ListName "SupportRequests" -FieldName "ResolutionNotes" -FieldType "Note"
}
Write-Host ""

# 3. Portal News List (Title + Link)
Write-Host "3️⃣  PORTAL NEWS LIST" -ForegroundColor Cyan
$newsListCreated = Create-ListIfNotExists -ListTitle "PortalNews" -Template "GenericList"
if ($newsListCreated) {
    Start-Sleep -Seconds 2
    # Title field already exists by default
    Add-FieldIfNotExists -ListName "PortalNews" -FieldName "Link" -FieldType "URL"

    # Add sample news items
    Write-Host "  Adding sample news items..." -ForegroundColor Gray
    try {
        Add-PnPListItem -List "PortalNews" -Values @{
            "Title" = "Welcome to the New Portal!"
            "Link" = "https://www.csun.edu/mike-curb-arts-media-communication/art"
        }
        Add-PnPListItem -List "PortalNews" -Values @{
            "Title" = "Spring 2025 Lab Hours Posted"
        }
        Write-Host "  ✅ Sample news added" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not add sample news: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}
Write-Host ""

# 4. Portal Stats List (Label + Value pairs)
Write-Host "4️⃣  PORTAL STATS LIST" -ForegroundColor Cyan
$statsListCreated = Create-ListIfNotExists -ListTitle "PortalStats" -Template "GenericList"
if ($statsListCreated) {
    Start-Sleep -Seconds 2
    # Title field = Label name (e.g., "Total Enrollments")
    Add-FieldIfNotExists -ListName "PortalStats" -FieldName "StatValue" -FieldType "Text" -Required $true
    Add-FieldIfNotExists -ListName "PortalStats" -FieldName "SortOrder" -FieldType "Number" -Required $true

    # Add default stats
    Write-Host "  Adding default stats..." -ForegroundColor Gray
    try {
        Add-PnPListItem -List "PortalStats" -Values @{
            "Title" = "Total Enrollments"
            "StatValue" = "1,647"
            "SortOrder" = 1
        }
        Add-PnPListItem -List "PortalStats" -Values @{
            "Title" = "Undergraduate"
            "StatValue" = "1,523"
            "SortOrder" = 2
        }
        Add-PnPListItem -List "PortalStats" -Values @{
            "Title" = "Graduate"
            "StatValue" = "124"
            "SortOrder" = 3
        }
        Add-PnPListItem -List "PortalStats" -Values @{
            "Title" = "Faculty"
            "StatValue" = "140"
            "SortOrder" = 4
        }
        Write-Host "  ✅ Default stats added" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not add default stats: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}
Write-Host ""

# ==================== SUMMARY ====================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created Lists:" -ForegroundColor Yellow
Write-Host "  1. PurchaseRequests  - For purchase request forms" -ForegroundColor White
Write-Host "  2. SupportRequests   - For support ticket forms" -ForegroundColor White
Write-Host "  3. PortalNews        - News/announcements (Title + Link)" -ForegroundColor White
Write-Host "  4. PortalStats       - Department statistics" -ForegroundColor White
Write-Host ""
Write-Host "To update the portal:" -ForegroundColor Yellow
Write-Host "  - Stats: Edit items in 'PortalStats' list" -ForegroundColor White
Write-Host "  - News:  Add items to 'PortalNews' list (Title + optional Link)" -ForegroundColor White
Write-Host "  - Staff: Add/remove members from your M365 Team" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Create an M365 Team for 'Art & Design Department Staff'" -ForegroundColor White
Write-Host "  2. Update the portal HTML with your SharePoint site URL" -ForegroundColor White
Write-Host "  3. Update the portal HTML with your Team's Group ID" -ForegroundColor White
Write-Host "  4. Upload portal-template.html to Site Assets" -ForegroundColor White
Write-Host "  5. Embed on a SharePoint page using iframe" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

# Disconnect
Disconnect-PnPOnline
