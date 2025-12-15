#!/bin/bash
# ============================================================
# BrainSpark Deployment Script
# deploy.sh - One-click deployment to GCP
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-asia-south1}"
ENVIRONMENT="${ENVIRONMENT:-prod}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🧠 BrainSpark Deployment Tool                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# ============================================================
# Helper Functions
# ============================================================

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    
    # Check terraform
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform not found. Please install Terraform."
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install Docker."
        exit 1
    fi
    
    # Check project ID
    if [ -z "$PROJECT_ID" ]; then
        log_error "GCP_PROJECT_ID environment variable not set."
        echo "Usage: GCP_PROJECT_ID=your-project ./deploy.sh"
        exit 1
    fi
    
    log_info "All prerequisites met ✓"
}

# ============================================================
# GCP Authentication
# ============================================================

setup_gcp() {
    log_info "Setting up GCP authentication..."
    
    gcloud config set project $PROJECT_ID
    gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
    
    log_info "GCP configured for project: $PROJECT_ID ✓"
}

# ============================================================
# Build and Push Docker Images
# ============================================================

build_images() {
    log_info "Building Docker images..."
    
    REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/brainspark"
    
    # Build backend
    log_info "Building backend image..."
    docker build -t ${REGISTRY}/api:latest ./backend
    docker push ${REGISTRY}/api:latest
    
    # Build frontend
    log_info "Building frontend image..."
    docker build \
        --build-arg REACT_APP_API_URL="https://brainspark-api-${PROJECT_ID}.${REGION}.run.app" \
        -t ${REGISTRY}/web:latest \
        ./frontend
    docker push ${REGISTRY}/web:latest
    
    log_info "Docker images built and pushed ✓"
}

# ============================================================
# Terraform Deployment
# ============================================================

deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan
    terraform plan \
        -var="project_id=${PROJECT_ID}" \
        -var="region=${REGION}" \
        -var="environment=${ENVIRONMENT}" \
        -var="anthropic_api_key=${ANTHROPIC_API_KEY}" \
        -out=tfplan
    
    # Apply
    terraform apply tfplan
    
    # Get outputs
    API_URL=$(terraform output -raw api_url)
    
    cd ..
    
    log_info "Infrastructure deployed ✓"
    log_info "API URL: $API_URL"
}

# ============================================================
# Database Migration
# ============================================================

run_migrations() {
    log_info "Running database migrations..."
    
    # Get Cloud SQL proxy
    if [ ! -f "./cloud_sql_proxy" ]; then
        curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
        chmod +x cloud_sql_proxy
    fi
    
    # Get connection name from Terraform
    cd terraform
    CONNECTION_NAME=$(terraform output -raw database_connection)
    cd ..
    
    # Start proxy in background
    ./cloud_sql_proxy -instances=${CONNECTION_NAME}=tcp:5433 &
    PROXY_PID=$!
    sleep 5
    
    # Run migrations
    cd backend
    DATABASE_URL="postgresql://brainspark:${DB_PASSWORD}@localhost:5433/brainspark" \
        alembic upgrade head
    cd ..
    
    # Stop proxy
    kill $PROXY_PID
    
    log_info "Database migrations complete ✓"
}

# ============================================================
# Firebase Deployment (Frontend)
# ============================================================

deploy_frontend() {
    log_info "Deploying frontend to Firebase Hosting..."
    
    cd frontend
    
    # Build production bundle
    npm ci
    REACT_APP_API_URL="${API_URL}" npm run build
    
    # Deploy to Firebase
    firebase deploy --only hosting
    
    cd ..
    
    log_info "Frontend deployed ✓"
}

# ============================================================
# Health Check
# ============================================================

health_check() {
    log_info "Running health checks..."
    
    # Wait for Cloud Run to be ready
    sleep 10
    
    # Check API health
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health")
    
    if [ "$HEALTH_RESPONSE" == "200" ]; then
        log_info "API health check passed ✓"
    else
        log_error "API health check failed (HTTP $HEALTH_RESPONSE)"
        exit 1
    fi
}

# ============================================================
# Main Deployment Flow
# ============================================================

main() {
    echo ""
    log_info "Starting deployment to $ENVIRONMENT environment..."
    echo ""
    
    check_prerequisites
    setup_gcp
    build_images
    deploy_infrastructure
    run_migrations
    deploy_frontend
    health_check
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         🎉 Deployment Complete!                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}API URL:${NC}      $API_URL"
    echo -e "  ${BLUE}Frontend:${NC}     https://${PROJECT_ID}.web.app"
    echo -e "  ${BLUE}Environment:${NC}  $ENVIRONMENT"
    echo ""
}

# ============================================================
# Command Line Interface
# ============================================================

case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        check_prerequisites
        setup_gcp
        build_images
        ;;
    infra)
        check_prerequisites
        deploy_infrastructure
        ;;
    migrate)
        run_migrations
        ;;
    frontend)
        deploy_frontend
        ;;
    health)
        health_check
        ;;
    destroy)
        log_warn "Destroying infrastructure..."
        cd terraform
        terraform destroy \
            -var="project_id=${PROJECT_ID}" \
            -var="region=${REGION}" \
            -var="environment=${ENVIRONMENT}" \
            -var="anthropic_api_key=${ANTHROPIC_API_KEY}"
        cd ..
        log_info "Infrastructure destroyed"
        ;;
    *)
        echo "Usage: $0 {deploy|build|infra|migrate|frontend|health|destroy}"
        exit 1
        ;;
esac

# ============================================================
# Local Development Script (dev.sh)
# ============================================================
: '
#!/bin/bash
# dev.sh - Local development environment

set -e

echo "🧠 Starting BrainSpark Development Environment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Start services
docker-compose up -d postgres redis

# Wait for services
echo "Waiting for database..."
sleep 5

# Run migrations
cd backend
alembic upgrade head
cd ..

# Start backend (with hot reload)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend (with hot reload)
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 Development servers running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down" EXIT

wait
'
