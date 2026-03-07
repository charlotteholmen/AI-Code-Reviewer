#!/bin/bash

# GitHub Actions Setup Helper Script
# This script helps you configure Azure credentials and set up GitHub secrets

set -e

echo "🔐 GitHub Actions - Azure Credentials Setup"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Install from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI is not installed${NC}"
    echo "Install from: https://cli.github.com"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 1: Login to Azure
echo -e "${BLUE}Step 1: Logging into Azure${NC}"
echo "----------------------------"
az login
echo ""

# Step 2: Get subscription info
echo -e "${BLUE}Step 2: Getting subscription information${NC}"
echo "----------------------------------------"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

echo -e "Subscription: ${GREEN}$SUBSCRIPTION_NAME${NC}"
echo -e "Subscription ID: ${GREEN}$SUBSCRIPTION_ID${NC}"
echo -e "Tenant ID: ${GREEN}$TENANT_ID${NC}"
echo ""

# Step 3: Create Service Principal
echo -e "${BLUE}Step 3: Creating Service Principal${NC}"
echo "-----------------------------------"
read -p "Enter Service Principal name (default: github-actions-deploy): " SP_NAME
SP_NAME="${SP_NAME:-github-actions-deploy}"

echo "Creating Service Principal: $SP_NAME"
SP_OUTPUT=$(az ad sp create-for-rbac --name "$SP_NAME" --role Contributor --scopes /subscriptions/$SUBSCRIPTION_ID)

CLIENT_ID=$(echo $SP_OUTPUT | jq -r '.appId')
CLIENT_SECRET=$(echo $SP_OUTPUT | jq -r '.password')

echo -e "${GREEN}✅ Service Principal created${NC}"
echo -e "Client ID: ${YELLOW}$CLIENT_ID${NC}"
echo ""

# Step 4: Prepare credentials JSON
echo -e "${BLUE}Step 4: Preparing credentials${NC}"
echo "-----------------------------"

AZURE_CREDENTIALS=$(cat <<EOF
{
  "clientId": "$CLIENT_ID",
  "clientSecret": "$CLIENT_SECRET",
  "subscriptionId": "$SUBSCRIPTION_ID",
  "tenantId": "$TENANT_ID"
}
EOF
)

echo "Credentials JSON prepared"
echo ""

# Step 5: Login to GitHub
echo -e "${BLUE}Step 5: Logging into GitHub${NC}"
echo "----------------------------"
gh auth login --web

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q)
echo -e "Repository: ${GREEN}$REPO${NC}"
echo ""

# Step 6: Set GitHub Secrets
echo -e "${BLUE}Step 6: Setting GitHub Secrets${NC}"
echo "------------------------------"

echo "Setting AZURE_CREDENTIALS..."
echo "$AZURE_CREDENTIALS" | gh secret set AZURE_CREDENTIALS --repo "$REPO"

echo "Setting AZURE_CLIENT_ID..."
echo "$CLIENT_ID" | gh secret set AZURE_CLIENT_ID --repo "$REPO"

echo "Setting AZURE_CLIENT_SECRET..."
echo "$CLIENT_SECRET" | gh secret set AZURE_CLIENT_SECRET --repo "$REPO"

echo "Setting AZURE_SUBSCRIPTION_ID..."
echo "$SUBSCRIPTION_ID" | gh secret set AZURE_SUBSCRIPTION_ID --repo "$REPO"

echo "Setting AZURE_TENANT_ID..."
echo "$TENANT_ID" | gh secret set AZURE_TENANT_ID --repo "$REPO"

echo -e "${GREEN}✅ Core Azure secrets set${NC}"
echo ""

# Step 7: Get Resource Group
echo -e "${BLUE}Step 7: Configuring Terraform Backend${NC}"
echo "--------------------------------------"
read -p "Enter Resource Group name: " RESOURCE_GROUP

# Create storage account for Terraform state if needed
read -p "Do you want to create a storage account for Terraform state? (y/n): " CREATE_STORAGE

if [ "$CREATE_STORAGE" = "y" ]; then
    STORAGE_ACCOUNT="sa${SUBSCRIPTION_ID:0:8}tfstate"
    echo "Creating storage account: $STORAGE_ACCOUNT"
    
    az storage account create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$STORAGE_ACCOUNT" \
        --sku Standard_LRS \
        --encryption-services blob
    
    az storage container create \
        --name tfstate \
        --account-name "$STORAGE_ACCOUNT"
    
    echo "Setting AZURE_STORAGE_ACCOUNT..."
    echo "$STORAGE_ACCOUNT" | gh secret set AZURE_STORAGE_ACCOUNT --repo "$REPO"
else
    read -p "Enter existing Storage Account name: " STORAGE_ACCOUNT
    echo "Setting AZURE_STORAGE_ACCOUNT..."
    echo "$STORAGE_ACCOUNT" | gh secret set AZURE_STORAGE_ACCOUNT --repo "$REPO"
fi

echo "Setting AZURE_RESOURCE_GROUP..."
echo "$RESOURCE_GROUP" | gh secret set AZURE_RESOURCE_GROUP --repo "$REPO"

echo -e "${GREEN}✅ Terraform backend configured${NC}"
echo ""

# Step 8: Frontend Environment Variables
echo -e "${BLUE}Step 8: Setting Frontend Environment Variables (Optional)${NC}"
echo "-----------------------------------------------------------"
read -p "Do you want to set frontend environment variables now? (y/n): " SET_FRONTEND

if [ "$SET_FRONTEND" = "y" ]; then
    read -p "Enter Auth Service URL (e.g., https://app-auth.azurewebsites.net/api/auth): " AUTH_URL
    read -p "Enter Editor Service URL: " EDITOR_URL
    read -p "Enter AI Service URL: " AI_URL
    read -p "Enter Repo Fixer URL: " FIXER_URL
    read -p "Enter Code Gen URL: " CODEGEN_URL
    read -p "Enter Editor WebSocket URL (e.g., wss://...): " WS_EDITOR_URL
    read -p "Enter AI WebSocket URL: " WS_AI_URL
    read -p "Enter Frontend URL: " FRONTEND_URL
    
    echo "$AUTH_URL" | gh secret set VITE_API_AUTH_URL --repo "$REPO"
    echo "$EDITOR_URL" | gh secret set VITE_API_EDITOR_URL --repo "$REPO"
    echo "$AI_URL" | gh secret set VITE_API_AI_URL --repo "$REPO"
    echo "$FIXER_URL" | gh secret set VITE_API_REPO_FIXER_URL --repo "$REPO"
    echo "$CODEGEN_URL" | gh secret set VITE_API_CODE_GEN_URL --repo "$REPO"
    echo "$WS_EDITOR_URL" | gh secret set VITE_WS_EDITOR_URL --repo "$REPO"
    echo "$WS_AI_URL" | gh secret set VITE_WS_AI_URL --repo "$REPO"
    echo "$FRONTEND_URL" | gh secret set VITE_FRONTEND_URL --repo "$REPO"
    
    echo -e "${GREEN}✅ Frontend environment variables set${NC}"
fi
echo ""

# Step 9: Publish Profiles
echo -e "${BLUE}Step 9: Setting Azure Web App Publish Profiles (Optional)${NC}"
echo "----------------------------------------------------------"
read -p "Do you want to set publish profiles now? (y/n): " SET_PROFILES

if [ "$SET_PROFILES" = "y" ]; then
    read -p "Enter Auth Service App Name: " AUTH_APP
    read -p "Enter Editor Service App Name: " EDITOR_APP
    read -p "Enter AI Model Service App Name: " AI_APP
    read -p "Enter Repo Fixer Service App Name: " FIXER_APP
    read -p "Enter Code Gen Service App Name: " CODEGEN_APP
    read -p "Enter Frontend App Name: " FRONTEND_APP
    
    echo "Downloading publish profiles..."
    
    # Get profiles
    AUTH_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$AUTH_APP" --xml)
    EDITOR_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$EDITOR_APP" --xml)
    AI_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$AI_APP" --xml)
    FIXER_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$FIXER_APP" --xml)
    CODEGEN_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$CODEGEN_APP" --xml)
    FRONTEND_PROFILE=$(az webapp deployment list-publishing-profiles --resource-group "$RESOURCE_GROUP" --name "$FRONTEND_APP" --xml)
    
    # Set secrets
    gh secret set AZURE_WEBAPP_AUTH_PUBLISH_PROFILE --repo "$REPO" < <(echo "$AUTH_PROFILE")
    gh secret set AZURE_WEBAPP_EDITOR_PUBLISH_PROFILE --repo "$REPO" < <(echo "$EDITOR_PROFILE")
    gh secret set AZURE_WEBAPP_AI_PUBLISH_PROFILE --repo "$REPO" < <(echo "$AI_PROFILE")
    gh secret set AZURE_WEBAPP_FIXER_PUBLISH_PROFILE --repo "$REPO" < <(echo "$FIXER_PROFILE")
    gh secret set AZURE_WEBAPP_CODEGEN_PUBLISH_PROFILE --repo "$REPO" < <(echo "$CODEGEN_PROFILE")
    gh secret set AZURE_WEBAPP_FRONTEND_PUBLISH_PROFILE --repo "$REPO" < <(echo "$FRONTEND_PROFILE")
    
    echo -e "${GREEN}✅ Publish profiles set${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Summary${NC}"
echo "========"
echo "Repository: $REPO"
echo "Subscription: $SUBSCRIPTION_NAME"
echo "Service Principal: $SP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify secrets in GitHub: gh secret list"
echo "2. Configure Terraform variables in INFRA/terraform.tfvars"
echo "3. Run 'terraform plan' to validate infrastructure"
echo "4. Push changes to main branch to trigger workflows"
echo "5. Monitor deployments in GitHub Actions"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Save the Service Principal credentials securely"
echo "- Review .github/GITHUB_ACTIONS_SETUP.md for detailed instructions"
echo "- Test workflows in a develop branch first"
echo ""
