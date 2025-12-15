# BrainSpark Production Environment Variables
# Copy this file and fill in your values

project_id  = "YOUR_GCP_PROJECT_ID"
region      = "asia-south1"
environment = "prod"

# Domain
domain        = "brainspark.siggmatreders.com"
api_subdomain = "api.brainspark.siggmatreders.com"

# Database
db_tier = "db-custom-2-4096" # 2 vCPU, 4GB RAM

# Redis
redis_memory_gb = 2

# Cloud Run Scaling
min_instances = 1
max_instances = 10

# NOTE: Set ANTHROPIC_API_KEY as environment variable or use -var flag
# terraform apply -var="anthropic_api_key=sk-ant-..."
