# 🚀 Simple Deployment Guide for Global Admin

**For:** CSUN Art & Design Portal
**Time Required:** 15-20 minutes
**Difficulty:** Easy - Just copy & paste!

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] Global Admin access to CSUN SharePoint
- [ ] PowerShell installed on your computer
- [ ] Access to SharePoint Admin Center

---

## 📦 Step 1: Install PowerShell Module (One-time setup)

**Option A: If you've never installed PnP PowerShell before**

1. Open **PowerShell as Administrator** (Right-click → Run as Administrator)
2. Copy and paste this command:

```powershell
Install-Module -Name PnP.PowerShell -Force -AllowClobber
```

3. If asked "Do you want to install from an untrusted repository?", type **Y** and press Enter

**Option B: If you already have PnP PowerShell**

Just run:
```powershell
Update-Module -Name PnP.PowerShell
```

---

## 🗂️ Step 2: Create SharePoint Lists

### Instructions:

1. **Open PowerShell as Administrator**
2. **Find the script file** called `create-sharepoint-lists.ps1` in the `deployment-scripts` folder
3. **Right-click** on the file → **Edit** (Opens in PowerShell ISE or Notepad)
4. **Update Line 2** with your actual SharePoint site URL:
   ```powershell
   $siteUrl = "https://csun.sharepoint.com/sites/ArtAndDesign"
   ```
5. **Save the file**
6. **Run the script**:
   - In PowerShell, navigate to the folder:
     ```powershell
     cd C:\path\to\intranet\deployment-scripts
     ```
   - Run:
     ```powershell
     .\create-sharepoint-lists.ps1
     ```

7. **Follow the prompts**:
   - Sign in with your CSUN admin credentials when asked
   - Wait for "✅ All lists created successfully!" message

---

## 📤 Step 3: Deploy the App Package

### Option A: Using the Simplified Script (Recommended)

1. **Find the `.sppkg` file** in the `sharepoint/solution` folder
2. **Run the deployment script**:
   ```powershell
   cd C:\path\to\intranet\deployment-scripts
   .\deploy-to-sharepoint.ps1
   ```
3. Follow the prompts and sign in when asked

### Option B: Manual Upload (If script doesn't work)

1. **Go to SharePoint Admin Center**
   - URL: https://csun-admin.sharepoint.com

2. **Navigate to:**
   - More features → Apps → App Catalog

3. **Upload the package:**
   - Click "Apps for SharePoint"
   - Click "Upload"
   - Select the `.sppkg` file from `sharepoint/solution/art-design-portal.sppkg`
   - Check ✅ "Make this solution available to all sites"
   - Click **Deploy**

4. **Approve API Permissions** (Important!):
   - In SharePoint Admin Center, go to: Advanced → API access
   - Approve these pending requests:
     - Microsoft Graph → Chat.ReadWrite
     - Microsoft Graph → User.Read.All

---

## 🎯 Step 4: Add to Your Site

1. **Go to your Art & Design site**
   - Example: https://csun.sharepoint.com/sites/ArtAndDesign

2. **Edit a page or create a new one**
   - Click the ⚙️ gear icon → Add a page
   - Or edit an existing page

3. **Add the web part**:
   - Click the ➕ icon on the page
   - Search for "Art Design Portal"
   - Click it to add it to the page

4. **Publish the page**

---

## ✅ Step 5: Test It Out!

1. Open the page with the web part
2. Try submitting a test purchase request
3. Check that it appears in the SharePoint list

---

## ❗ Troubleshooting

### "Cannot connect to site"
- **Solution**: Make sure you updated the site URL in the script
- **Check**: You have permissions to the site

### "Lists already exist"
- **Solution**: This is fine! The script will skip existing lists
- **Or**: Delete the existing lists first and re-run

### "Package upload failed"
- **Solution**: Make sure you're using the SharePoint Admin Center, not the regular site
- **Check**: You have App Catalog permissions

### "Web part shows errors"
- **Solution**: Make sure API permissions are approved (Step 3, part 4)
- **Wait**: Sometimes it takes 5-10 minutes for permissions to propagate

---

## 🆘 Need Help?

If you get stuck:
1. Screenshot the error message
2. Check which step you're on
3. Contact Brandon Brathwaite: brandon.brathwaite@csun.edu

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ PowerShell shows "Lists created successfully"
- ✅ You can see the web part in your site
- ✅ Forms can be submitted without errors
- ✅ Data appears in SharePoint lists

**Good luck! You've got this! 🚀**
