#!/bin/bash
#=============================================================================
# BrainSpark - Production Deployment Script
#=============================================================================
# This script deploys the entire BrainSpark application to Google Cloud Run
#
# Prerequisites:
#   1. gcloud CLI installed and authenticated
#   2. Project ID configured
#   3. Secrets created in Secret Manager
#   4. Artifact Registry repository created
#
# Usage:
#   ./scripts/deploy-production.sh
#
#=============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="brainspark-kids-companion"
REGION="asia-south1"
ENVIRONMENT="prod"

# Print header
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   BrainSpark Production Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI not found${NC}"
    echo "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
echo -e "${YELLOW}Current GCP Project:${NC} $CURRENT_PROJECT"

# Confirm project
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}WARNING: Current project ($CURRENT_PROJECT) doesn't match expected ($PROJECT_ID)${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
    PROJECT_ID=$CURRENT_PROJECT
fi

echo ""
echo -e "${GREEN}Deployment Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Environment: $ENVIRONMENT"
echo ""

# Confirm deployment
read -p "Deploy to production? This will update live services. (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo -e "${BLUE}Starting deployment...${NC}"
echo ""

# Run Cloud Build
echo -e "${YELLOW}Step 1/3:${NC} Triggering Cloud Build..."
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_ENVIRONMENT=$ENVIRONMENT,_REGION=$REGION \
    --timeout=1200s

echo ""
echo -e "${GREEN}✓ Cloud Build completed successfully${NC}"

# Get service URLs
echo ""
echo -e "${YELLOW}Step 2/3:${NC} Retrieving service URLs..."

BACKEND_URL=$(gcloud run services describe brainspark-api \
    --region=$REGION \
    --format='value(status.url)' 2>/dev/null)

FRONTEND_URL=$(gcloud run services describe brainspark-web \
    --region=$REGION \
    --format='value(status.url)' 2>/dev/null)

echo -e "${GREEN}✓ Services deployed${NC}"

# Test backend health
echo ""
echo -e "${YELLOW}Step 3/3:${NC} Testing deployment..."

echo "  Testing backend health..."
if curl -sf "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "  ${RED}✗ Backend health check failed${NC}"
    echo "  Check Cloud Run logs for details"
fi

echo "  Testing frontend..."
if curl -sf "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "  ${RED}✗ Frontend check failed${NC}"
    echo "  Check Cloud Run logs for details"
fi

# Print deployment summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Service URLs:${NC}"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""
echo -e "${GREEN}API Documentation:${NC}"
echo "  Swagger UI: ${BACKEND_URL}/docs"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure custom domain mapping"
echo "  2. Set up Cloud CDN for frontend"
echo "  3. Configure monitoring and alerting"
echo "  4. Run integration tests"
echo ""
echo -e "${BLUE}View logs:${NC}"
echo "  Backend:  gcloud run logs read brainspark-api --region=$REGION"
echo "  Frontend: gcloud run logs read brainspark-web --region=$REGION"
echo ""
echo -e "${BLUE}============================================${NC}"
