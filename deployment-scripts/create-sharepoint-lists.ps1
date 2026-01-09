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
    Connect-PnPOnline -Url $siteUrl -Interactive
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

# 3. News & Announcements List
Write-Host "3️⃣  NEWS & ANNOUNCEMENTS LIST" -ForegroundColor Cyan
if (Create-ListIfNotExists -ListTitle "NewsAnnouncements" -Template "GenericList") {
    Start-Sleep -Seconds 2
    Add-FieldIfNotExists -ListName "NewsAnnouncements" -FieldName "Content" -FieldType "Note" -Required $true
    Add-FieldIfNotExists -ListName "NewsAnnouncements" -FieldName "Link" -FieldType "URL"
    Add-FieldIfNotExists -ListName "NewsAnnouncements" -FieldName "PublishedDate" -FieldType "DateTime" -Required $true
    Add-FieldIfNotExists -ListName "NewsAnnouncements" -FieldName "ExpirationDate" -FieldType "DateTime"
}
Write-Host ""

# 4. Department Stats List
Write-Host "4️⃣  DEPARTMENT STATS LIST" -ForegroundColor Cyan
if (Create-ListIfNotExists -ListTitle "DepartmentStats" -Template "GenericList") {
    Start-Sleep -Seconds 2
    Add-FieldIfNotExists -ListName "DepartmentStats" -FieldName "TotalEnrollments" -FieldType "Number" -Required $true
    Add-FieldIfNotExists -ListName "DepartmentStats" -FieldName "UndergradEnrollments" -FieldType "Number" -Required $true
    Add-FieldIfNotExists -ListName "DepartmentStats" -FieldName "GradEnrollments" -FieldType "Number" -Required $true
    Add-FieldIfNotExists -ListName "DepartmentStats" -FieldName "FacultyCount" -FieldType "Number" -Required $true
    Add-FieldIfNotExists -ListName "DepartmentStats" -FieldName "LastUpdated" -FieldType "DateTime" -Required $true
}
Write-Host ""

# ==================== SUMMARY ====================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created Lists:" -ForegroundColor Yellow
Write-Host "  1. PurchaseRequests" -ForegroundColor White
Write-Host "  2. SupportRequests" -ForegroundColor White
Write-Host "  3. NewsAnnouncements" -ForegroundColor White
Write-Host "  4. DepartmentStats" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy the .sppkg file to App Catalog" -ForegroundColor White
Write-Host "  2. Approve API permissions in SharePoint Admin" -ForegroundColor White
Write-Host "  3. Add the web part to your site" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

# Disconnect
Disconnect-PnPOnline
