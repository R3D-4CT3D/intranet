# CSUN Art & Design IT Portal

A SharePoint Framework (SPFx) web part for managing IT requests, support tickets, and department communications for the CSUN Art & Design department.

## 📋 Features

- **Purchase Request Forms** - Submit and track equipment/software purchases
- **Support Request Forms** - IT support ticketing system
- **News & Announcements** - Department communications
- **Calendar Integration** - Event management
- **Department Statistics Dashboard** - Enrollment and faculty metrics
- **Microsoft Teams Integration** - Direct messaging capabilities

## 🚀 Quick Start for Administrators

**New to deployment?** → Read [ADMIN_DEPLOYMENT_GUIDE.md](ADMIN_DEPLOYMENT_GUIDE.md)

**Deployment blocked?** → See [PIVOT_OPTIONS.md](PIVOT_OPTIONS.md) for alternatives

## 📁 Project Structure

```
intranet/
├── projectFiles/           # Source code
│   ├── PurchaseRequestForm.tsx
│   ├── SupportRequestForm.tsx
│   ├── SharePointService.ts
│   ├── sharepoint.config.ts
│   └── RequestForms.module.scss
├── deployment-scripts/     # PowerShell scripts for setup
│   └── create-sharepoint-lists.ps1
├── ADMIN_DEPLOYMENT_GUIDE.md  # Step-by-step for non-technical admins
├── PIVOT_OPTIONS.md           # Alternative solutions if needed
└── SETUP_GUIDE.md             # Technical documentation
```

## 🛠️ Technology Stack

- **Framework:** SharePoint Framework (SPFx) 1.x
- **UI Library:** React
- **Language:** TypeScript
- **Data Layer:** PnP/SP (SharePoint REST API wrapper)
- **Styling:** SCSS Modules
- **Backend:** SharePoint Lists
- **Integration:** Microsoft Graph API (for Teams)

## 📦 Prerequisites

- Node.js 16 or 18 (not 20+)
- SharePoint Online tenant
- Global Admin or SharePoint Admin permissions
- PowerShell with PnP.PowerShell module

## 🏗️ Development Setup

```bash
# Install dependencies
npm install -g yo @microsoft/generator-sharepoint gulp-cli

# Create SPFx project
yo @microsoft/sharepoint

# Install PnP libraries
npm install @pnp/sp @pnp/graph --save
npm install @pnp/spfx-controls-react --save

# Local development
gulp serve

# Production build
gulp bundle --ship
gulp package-solution --ship
```

## 🚢 Deployment

### For Administrators (Non-Technical)
Follow [ADMIN_DEPLOYMENT_GUIDE.md](ADMIN_DEPLOYMENT_GUIDE.md) - simplified instructions

### For Developers
Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) - full technical documentation

## 📊 SharePoint Lists

The following lists are created automatically by the deployment script:

1. **PurchaseRequests** - Purchase request tracking
2. **SupportRequests** - IT support tickets
3. **NewsAnnouncements** - Department news
4. **DepartmentStats** - Enrollment statistics

Calendar uses existing: **"CSUN Art & Design Service Portal"**

## 🔐 Required Permissions

### SharePoint Permissions
- Read/Write to lists
- User profile access

### Microsoft Graph API Permissions
- `Chat.ReadWrite` - For Teams messaging
- `User.Read.All` - For user lookup

## 🎨 Customization

### Update Branding
Edit the SCSS files in `projectFiles/RequestForms.module.scss`

### Modify Form Fields
Edit the TypeScript interfaces in `projectFiles/sharepoint.config.ts`

### Change Department Areas
Update the choices array in `deployment-scripts/create-sharepoint-lists.ps1`

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to SharePoint"**
- Verify site URL in deployment script
- Check admin permissions
- Try clearing browser cache

**"Lists not found"**
- Run the `create-sharepoint-lists.ps1` script
- Verify lists exist in SharePoint

**"Permission denied errors"**
- Approve API permissions in SharePoint Admin Center
- Wait 5-10 minutes for propagation

**"Web part shows blank page"**
- Check browser console for errors
- Verify lists are created
- Check API permissions

## 📝 Version History

- **1.0.0** - Initial release
  - Purchase and Support request forms
  - SharePoint list integration
  - Basic Teams integration

## 👥 Contributors

- Brandon Kakudo - IT Consultant II (brandon.kakudo@csun.edu)

## 📄 License

Internal CSUN project - not for distribution

## 🆘 Support

For issues or questions:
1. Check [ADMIN_DEPLOYMENT_GUIDE.md](ADMIN_DEPLOYMENT_GUIDE.md)
2. Review [PIVOT_OPTIONS.md](PIVOT_OPTIONS.md) for alternatives
3. Contact: brandon.brathwaite@csun.edu

## 🔄 Alternative Solutions

If SharePoint deployment isn't working, see [PIVOT_OPTIONS.md](PIVOT_OPTIONS.md) for:
- Power Apps solution
- Microsoft Forms + Power Automate
- Static HTML alternative
- Full comparison of options

---

**Built with ❤️ for CSUN Art & Design Department**
