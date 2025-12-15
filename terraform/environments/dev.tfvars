# BrainSpark Development Environment Variables

project_id  = "YOUR_GCP_PROJECT_ID"
region      = "asia-south1"
environment = "dev"

# Domain (can use Cloud Run default URL for dev)
domain        = "brainspark-dev.siggmatreders.com"
api_subdomain = "api-dev.brainspark.siggmatreders.com"

# Database (smaller for dev)
db_tier = "db-f1-micro" # Shared CPU, 0.6GB RAM

# Redis (smaller for dev)
redis_memory_gb = 1

# Cloud Run Scaling (minimal for dev)
min_instances = 0 # Scale to zero when not in use
max_instances = 2
