# GitHub Actions & Azure Deployment Checklist

## Phase 1: Prerequisites ✅
- [ ] GitHub repository created
- [ ] Azure account with active subscription  
- [ ] Azure CLI installed (`az --version`)
- [ ] GitHub CLI installed (`gh --version`)
- [ ] Read `.github/GITHUB_ACTIONS_SETUP.md`
- [ ] Read `.github/WORKFLOWS_SUMMARY.md`

---

## Phase 2: Azure Setup
- [ ] Create Azure Service Principal
  ```bash
  bash .github/setup-github-actions.sh
  ```
- [ ] Save Service Principal credentials securely
- [ ] Create Resource Group in Azure
- [ ] Create Storage Account for Terraform state (optional - script can do this)

---

## Phase 3: GitHub Secrets Configuration
### Core Azure Secrets (Required)
- [ ] AZURE_CREDENTIALS (JSON format)
- [ ] AZURE_CLIENT_ID
- [ ] AZURE_CLIENT_SECRET
- [ ] AZURE_SUBSCRIPTION_ID
- [ ] AZURE_TENANT_ID
- [ ] AZURE_RESOURCE_GROUP
- [ ] AZURE_STORAGE_ACCOUNT

### Verify Secrets
```bash
gh secret list
```

---

## Phase 4: Infrastructure Deployment (Terraform)
- [ ] Edit `INFRA/terraform.tfvars`
  - [ ] Set `app_name` (e.g., "ai-reviewer")
  - [ ] Set `environment` (dev/staging/prod)
  - [ ] Set `azure_region` (e.g., "eastus")
  - [ ] Set `app_service_plan_sku` (S1 for dev, P1V2 for prod)
  - [ ] Configure feature flags
  - [ ] Set common_tags

- [ ] Test Terraform locally
  ```bash
  cd INFRA
  terraform init -backend=false
  terraform validate
  terraform plan
  ```

- [ ] Deploy via GitHub Actions
  - [ ] Push INFRA/ changes to main
  - [ ] Go to Actions → Deploy Infrastructure
  - [ ] Review plan output
  - [ ] Manually trigger with action=apply
  - [ ] Verify all resources created in Azure Portal

- [ ] Verify deployed resources
  - [ ] Resource Group exists
  - [ ] App Services created (6 total: 5 backend + 1 frontend)
  - [ ] Cosmos DB provisioned
  - [ ] Storage account exists
  - [ ] Key Vault created
  - [ ] Application Insights provisioned

---

## Phase 5: Get Azure Credentials for Deployments

For each App Service, get publish profile:
```bash
az webapp deployment list-publishing-profiles \
  --resource-group YOUR_RG \
  --name YOUR_APP_NAME \
  --xml
```

Add as GitHub Secrets:
- [ ] AZURE_WEBAPP_AUTH_PUBLISH_PROFILE (Auth Service)
- [ ] AZURE_WEBAPP_EDITOR_PUBLISH_PROFILE (Editor Service)
- [ ] AZURE_WEBAPP_AI_PUBLISH_PROFILE (AI Model Service)
- [ ] AZURE_WEBAPP_FIXER_PUBLISH_PROFILE (Repo Fixer Service)
- [ ] AZURE_WEBAPP_CODEGEN_PUBLISH_PROFILE (Code Gen Service)
- [ ] AZURE_WEBAPP_FRONTEND_PUBLISH_PROFILE (Frontend)

---

## Phase 6: Configure Frontend Environment Variables

Get Azure App Service URLs from Azure Portal:
- [ ] Note Auth Service URL
- [ ] Note Editor Service URL
- [ ] Note AI Model Service URL
- [ ] Note Repo Fixer Service URL
- [ ] Note Code Gen Service URL
- [ ] Note Frontend URL

Add as GitHub Secrets:
- [ ] VITE_API_AUTH_URL (e.g., https://your-app.azurewebsites.net/api/auth)
- [ ] VITE_API_EDITOR_URL
- [ ] VITE_API_AI_URL
- [ ] VITE_API_REPO_FIXER_URL
- [ ] VITE_API_CODE_GEN_URL
- [ ] VITE_WS_EDITOR_URL (WebSocket, use wss://)
- [ ] VITE_WS_AI_URL
- [ ] VITE_FRONTEND_URL

---

## Phase 7: Test Workflows

### Test Pipeline
- [ ] Push code to develop branch
- [ ] Go to Actions tab
- [ ] Select "Test and Lint"
- [ ] Verify all test jobs complete
- [ ] Review logs for any errors

### Backend Deployment
- [ ] Push to main (or trigger manually)
- [ ] Go to Actions → Deploy Backend Services
- [ ] Monitor deployment progress
- [ ] Verify in Azure App Services
- [ ] Test service endpoints via curl or Postman

### Frontend Deployment
- [ ] Push to main (or trigger manually)
- [ ] Go to Actions → Deploy Frontend
- [ ] Monitor build & deployment
- [ ] Verify frontend URL loads in browser
- [ ] Test service connectivity

---

## Phase 8: Deployment Verification

### Manual Service Testing
```bash
# Test Auth Service
curl https://your-app-auth.azurewebsites.net/health

# Test Editor Service  
curl https://your-app-editor.azurewebsites.net/health

# Test AI Service
curl https://your-app-ai.azurewebsites.net/api/ai/health

# Test Repo Fixer
curl https://your-app-fixer.azurewebsites.net/api/repo/health

# Test Code Gen
curl https://your-app-codegen.azurewebsites.net/api/health

# Test Frontend
curl https://your-app-frontend.azurewebsites.net
```

### Azure Portal Checks
- [ ] All App Services show "Running" status
- [ ] No error messages in App Service logs
- [ ] Application Insights shows incoming requests
- [ ] Cosmos DB connection string working
- [ ] Key Vault secrets accessible
- [ ] Storage account accessible

### Application Testing
- [ ] Frontend loads without errors
- [ ] Can authenticate (login)
- [ ] Can access code editor
- [ ] Can trigger AI review
- [ ] WebSocket connections work
- [ ] No CORS errors in console

---

## Phase 9: Production Hardening

- [ ] Enable Azure CDN for frontend
- [ ] Configure custom domain & SSL certificate
- [ ] Enable Web Application Firewall (WAF)
- [ ] Set up auto-scaling policies
- [ ] Configure backup & recovery
- [ ] Enable diagnostic logging
- [ ] Set up monitoring alerts
- [ ] Review security recommendations in Azure Advisor

---

## Phase 10: Ongoing Maintenance

### Weekly
- [ ] Monitor GitHub Actions workflow logs
- [ ] Check Azure Resource Health
- [ ] Review Application Insights for errors

### Monthly
- [ ] Review security vulnerabilities (`npm audit`)
- [ ] Check resource utilization & costs
- [ ] Test disaster recovery procedures
- [ ] Update dependencies (`npm update`)

### Quarterly
- [ ] Rotate secrets and certificates
- [ ] Review Azure Advisor recommendations
- [ ] Backup critical data
- [ ] Update documentation

### Annually
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Architecture review
- [ ] Update dependencies to latest major versions

---

## Phase 11: Troubleshooting

### Workflow Doesn't Run
```bash
# Check workflow file syntax
gh workflow view .github/workflows/deploy-backend.yml

# Check current status
gh workflow list
```

### Secrets Not Found
```bash
# Verify secret exists
gh secret list

# Check if secret is accessible
gh secret view AZURE_CREDENTIALS
```

### Azure Deployment Fails
```bash
# Check App Service logs
az webapp log tail --name YOUR_APP --resource-group YOUR_RG

# View recent deployments
az webapp deployment list --name YOUR_APP --resource-group YOUR_RG
```

### Terraform Fails
```bash
# Check Terraform state
terraform show

# Validate configuration
terraform validate

# Check state lock
terraform force-unlock LOCK_ID
```

---

## Completion Checklist

### Critical Path
- [ ] Phase 1: Prerequisites complete
- [ ] Phase 2: Azure account setup
- [ ] Phase 3: All 13+ secrets configured
- [ ] Phase 4: Infrastructure deployed via Terraform
- [ ] Phase 5: Publish profiles obtained
- [ ] Phase 6: Frontend variables configured
- [ ] Phase 7: All workflows tested & passing
- [ ] Phase 8: Services verified working

### Production Ready
- [ ] Phase 9: Security hardening applied
- [ ] Phase 10: Maintenance plan documented
- [ ] Phase 11: Team trained on troubleshooting
- [ ] Documentation updated
- [ ] Team has access to all credentials (secured)
- [ ] Backup & disaster recovery tested
- [ ] Monitoring & alerting configured

---

## Important URLs

### GitHub
- Repository: `https://github.com/YOUR_ORG/YOUR_REPO`
- Actions: `https://github.com/YOUR_ORG/YOUR_REPO/actions`
- Secrets: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`

### Azure Portal
- Resources: `https://portal.azure.com`
- App Services: Search for "App Services"
- Resource Groups: Search for "Resource Groups"
- Cosmos DB: Search for "Azure Cosmos DB"
- Key Vault: Search for "Key Vaults"
- Application Insights: Search for "Application Insights"

---

## Contact & Support

For issues or questions:
1. Check `.github/GITHUB_ACTIONS_SETUP.md` (detailed setup)
2. Check `.github/WORKFLOWS_SUMMARY.md` (workflow overview)
3. Review GitHub Actions logs
4. Check Azure Resource Health
5. Consult Azure documentation

---

**Date Started:** _______________
**Date Completed:** _______________
**Completed By:** _______________

**Last Updated:** March 7, 2026
