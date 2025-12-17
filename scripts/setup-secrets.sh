#!/bin/bash
#=============================================================================
# BrainSpark - Secrets Setup Script
#=============================================================================
# This script creates and configures all required secrets in Google Secret Manager
#
# Prerequisites:
#   1. gcloud CLI installed and authenticated
#   2. Secret Manager API enabled
#   3. Appropriate IAM permissions
#
# Usage:
#   ./scripts/setup-secrets.sh
#
#=============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="asia-south1"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   BrainSpark - Secrets Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Project ID: $PROJECT_ID"
echo ""

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_description=$2
    local prompt_message=$3
    local default_value=$4

    echo ""
    echo -e "${YELLOW}Configuring: ${secret_name}${NC}"
    echo "Description: $secret_description"

    # Check if secret exists
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        echo -e "${GREEN}Secret already exists${NC}"
        read -p "Update existing secret? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipped"
            return 0
        fi
    else
        echo "Creating new secret..."
        gcloud secrets create "$secret_name" \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
    fi

    # Get secret value from user
    if [ -n "$default_value" ]; then
        read -p "$prompt_message [$default_value]: " secret_value
        secret_value=${secret_value:-$default_value}
    else
        read -sp "$prompt_message: " secret_value
        echo
    fi

    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Warning: Empty value provided, skipping${NC}"
        return 0
    fi

    # Add new version
    echo "$secret_value" | gcloud secrets versions add "$secret_name" \
        --data-file=- \
        --project="$PROJECT_ID"

    echo -e "${GREEN}✓ Secret configured${NC}"
}

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"
echo -e "${GREEN}✓ API enabled${NC}"

# Create secrets
echo ""
echo -e "${BLUE}Creating Application Secrets${NC}"
echo "============================================"

# Claude API Key
create_or_update_secret \
    "anthropic-api-key" \
    "Anthropic Claude API Key for AI responses" \
    "Enter Claude API key (from https://console.anthropic.com)" \
    ""

# Grok API Key
create_or_update_secret \
    "grok-api-key" \
    "xAI Grok API Key for AI responses (failover)" \
    "Enter Grok API key (from https://console.x.ai)" \
    ""

# JWT Secret
JWT_DEFAULT=$(openssl rand -hex 32 2>/dev/null || echo "change-this-secret-in-production")
create_or_update_secret \
    "jwt-secret" \
    "JWT signing secret for authentication" \
    "Enter JWT secret (or press enter for random)" \
    "$JWT_DEFAULT"

# Database URL (PostgreSQL)
create_or_update_secret \
    "database-url" \
    "PostgreSQL database connection URL" \
    "Enter database URL (postgres://user:pass@host/db)" \
    "sqlite:///./brainspark.db"

# Grant Cloud Run access to secrets
echo ""
echo -e "${YELLOW}Granting Cloud Run access to secrets...${NC}"

# Get Cloud Build service account
BUILD_SA="${PROJECT_ID}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="$(gcloud iam service-accounts list --filter='email:compute@developer.gserviceaccount.com' --format='value(email)')"

for secret in "anthropic-api-key" "grok-api-key" "jwt-secret" "database-url"; do
    echo "  Granting access to: $secret"

    # Grant to Cloud Build
    gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$BUILD_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID" &>/dev/null || true

    # Grant to Compute (Cloud Run)
    if [ -n "$COMPUTE_SA" ]; then
        gcloud secrets add-iam-policy-binding "$secret" \
            --member="serviceAccount:$COMPUTE_SA" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID" &>/dev/null || true
    fi
done

echo -e "${GREEN}✓ Permissions granted${NC}"

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Secrets Setup Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Configured Secrets:${NC}"
echo "  ✓ anthropic-api-key (Claude AI)"
echo "  ✓ grok-api-key (Grok AI - Failover)"
echo "  ✓ jwt-secret (Authentication)"
echo "  ✓ database-url (Database Connection)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Verify secrets: gcloud secrets list --project=$PROJECT_ID"
echo "  2. Run deployment: ./scripts/deploy-production.sh"
echo ""
echo -e "${BLUE}Manage Secrets:${NC}"
echo "  List: gcloud secrets list"
echo "  View: gcloud secrets versions access latest --secret=SECRET_NAME"
echo "  Update: gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo -e "${BLUE}============================================${NC}"
