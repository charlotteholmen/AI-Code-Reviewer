# GitHub Actions Workflows - Setup Guide

## 📋 Overview

This guide explains how to set up and configure the GitHub Actions workflows for automated testing and deployment to Azure.

## 🔧 Workflows Created

### 1. **test.yml** - Automated Testing
- **Trigger:** `push` (main/develop), `pull_request` (main/develop), manual
- **Jobs:**
  - Test all backend services (Auth, Editor, AI Model, Code Gen, Repo Fixer)
  - Test frontend (React/Vite) - lint, test, build
  - Validate Terraform infrastructure
  - Security & dependency checks
- **Artifacts:** Test reports, build outputs

### 2. **deploy-backend.yml** - Backend Services Deployment
- **Trigger:** Push to main (services changes), manual
- **Services Deployed:**
  - Auth Service (Port 3001)
  - Editor Service (Port 3002)
  - AI Model Service (Port 3003)
  - Repo Fixer Service (Port 3004)
  - Code Gen Service (Port 3005)
- **Steps:**
  1. Install dependencies
  2. Run tests (non-blocking)
  3. Login to Azure
  4. Package services as ZIP
  5. Deploy to Azure App Services

### 3. **deploy-frontend.yml** - Frontend Deployment
- **Trigger:** Push to main (frontend changes), manual
- **Steps:**
  1. Install dependencies
  2. Run linting
  3. Build Vite/React application
  4. Login to Azure
  5. Deploy to Azure App Service
- **Environment:** Uses secrets for API endpoints and WebSocket URLs

### 4. **deploy-infra.yml** - Infrastructure Deployment (Terraform)
- **Trigger:** Push to main (INFRA changes), manual workflow_dispatch
- **Options:**
  - `plan` - Review changes (default)
  - `apply` - Deploy infrastructure
  - `destroy` - Remove infrastructure (not recommended)
- **Steps:**
  1. Initialize Terraform with Azure state backend
  2. Validate configuration
  3. Create plan
  4. Apply (only when manually triggered with action=apply)
  5. Output resource information

---

## ⚙️ Required GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

### Azure Credentials
```
AZURE_CREDENTIALS
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_SUBSCRIPTION_ID
AZURE_TENANT_ID
AZURE_RESOURCE_GROUP
AZURE_STORAGE_ACCOUNT
```

### Web App Publish Profiles (for deployment)
```
AZURE_WEBAPP_AUTH_PUBLISH_PROFILE
AZURE_WEBAPP_EDITOR_PUBLISH_PROFILE
AZURE_WEBAPP_AI_PUBLISH_PROFILE
AZURE_WEBAPP_FIXER_PUBLISH_PROFILE
AZURE_WEBAPP_CODEGEN_PUBLISH_PROFILE
AZURE_WEBAPP_FRONTEND_PUBLISH_PROFILE
```

### Frontend Environment Variables
```
VITE_API_AUTH_URL
VITE_API_EDITOR_URL
VITE_API_AI_URL
VITE_API_REPO_FIXER_URL
VITE_API_CODE_GEN_URL
VITE_WS_EDITOR_URL
VITE_WS_AI_URL
VITE_FRONTEND_URL
```

---

## 🔐 How to Get Azure Credentials

### 1. Generate Azure Service Principal Credentials

```bash
# Login to Azure
az login

# Get subscription ID
az account show --query id

# Create Service Principal
az ad sp create-for-rbac --name "github-actions-deploy" --role Contributor --scopes /subscriptions/{subscription-id}
```

This will output:
```json
{
  "appId": "your-client-id",
  "displayName": "github-actions-deploy",
  "password": "your-client-secret",
  "tenant": "your-tenant-id"
}
```

### 2. Create GitHub Secrets

```bash
# Combine into JSON format for AZURE_CREDENTIALS
{
  "clientId": "appId-value",
  "clientSecret": "password-value",
  "subscriptionId": "subscription-id",
  "tenantId": "tenant-value"
}
```

Add as `AZURE_CREDENTIALS` secret.

### 3. Get Publish Profiles for Each Service

```bash
# For each Azure App Service
az webapp deployment list-publishing-profiles --resource-group YOUR_RG --name YOUR_APP_NAME

# Download as XML and convert/use the contents
```

---

## 📝 Adding Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret from the list above

Example:
```
Name: AZURE_CREDENTIALS
Secret: <paste the JSON credentials>
```

---

## 🚀 Deployment Workflow

### Automatic Deployments

**Backend Services:**
```
Push to main → Test → Deploy to Azure
```

**Frontend:**
```
Push to main → Build → Deploy to Azure
```

**Infrastructure:**
```
Push to main → Plan → Manual approval needed to apply
```

### Manual Deployments

**Test Everything:**
```
GitHub UI → Actions → Test and Lint → Run workflow
```

**Deploy Backend:**
```
GitHub UI → Actions → Deploy Backend → Run workflow
```

**Deploy Frontend:**
```
GitHub UI → Actions → Deploy Frontend → Run workflow
```

**Deploy/Update Infrastructure:**
```
GitHub UI → Actions → Deploy Infrastructure
Select: action=apply
Click: Run workflow
```

---

## 📊 Service URLs After Deployment

Once deployed, update your frontend `.env` with Azure hosted endpoints:

```env
# After deployment, change localhost to Azure URLs
VITE_API_AUTH_URL=https://app-web-ai-reviewer.[region].azurewebsites.net/api/auth
VITE_API_EDITOR_URL=https://app-web-ai-reviewer-editor.[region].azurewebsites.net
VITE_API_AI_URL=https://app-web-ai-reviewer-ai.[region].azurewebsites.net/api/ai
VITE_API_REPO_FIXER_URL=https://app-web-ai-reviewer-fixer.[region].azurewebsites.net/api/repo
VITE_API_CODE_GEN_URL=https://app-web-ai-reviewer-codegen.[region].azurewebsites.net/api
VITE_WS_EDITOR_URL=wss://app-web-ai-reviewer-editor.[region].azurewebsites.net/ws
VITE_WS_AI_URL=wss://app-web-ai-reviewer-ai.[region].azurewebsites.net/ws
```

---

## 🔍 Monitoring Deployments

### View Workflow Status
1. GitHub repo → Actions tab
2. Select workflow
3. View logs and status for each job

### Check Azure Deployments
```bash
# Check deployment status
az webapp deployment slot list --name YOUR_APP --resource-group YOUR_RG

# View logs
az webapp log tail --name YOUR_APP --resource-group YOUR_RG
```

---

## ⚠️ Troubleshooting

### Workflow Not Running
- Check file paths (especially spaces in folder names)
- Verify GitHub Actions is enabled in repository
- Check branch filter in workflow `on` section

### Azure Login Fails
- Verify AZURE_CREDENTIALS secret is properly formatted
- Ensure Service Principal has appropriate permissions
- Check subscription ID matches

### Deployment Fails
- Verify publish profiles are current
- Check Azure App Service names match workflow
- Review Azure resource group permissions

### Terraform Apply Fails
- Ensure backend storage account exists
- Verify Terraform state lock isn't stuck
- Check quotas/limits in Azure subscription

---

## 🔄 Workflow Dependencies

```
test.yml (PR/merge checks)
    ↓
deploy-backend.yml (If tests pass & pushed to main)
    ↓
deploy-frontend.yml (If pushed to main)
    ↓
deploy-infra.yml (Manual approval)
```

---

## 💡 Best Practices

1. **Always test before deploying**
   - Run `test.yml` on PRs before merging

2. **Review Terraform plans**
   - Deploy infra with `plan` first (default)
   - Review outputs before `apply`

3. **Use staging slots**
   - Test in staging before swapping to production
   - Terraform defines staging slot configuration

4. **Monitor after deployment**
   - Check Application Insights
   - Review service health checks

5. **Rotate secrets regularly**
   - Update publish profiles every 90 days
   - Rotate Azure credentials annually

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure App Service Deployment](https://learn.microsoft.com/en-us/azure/app-service/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/reference-index)

---

## ✅ Deployment Checklist

- [ ] GitHub secrets configured
- [ ] Azure resources created (via Terraform)
- [ ] Publish profiles added to GitHub
- [ ] Test workflow passes locally
- [ ] Backend services tested manually
- [ ] Frontend builds without errors
- [ ] Environment variables configured
- [ ] Monitoring alerts configured
- [ ] Backup strategy documented
- [ ] Disaster recovery plan ready

---

**Last Updated:** March 7, 2026
**Status:** Production Ready
