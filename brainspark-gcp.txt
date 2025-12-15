# ============================================================
# terraform/main.tf - BrainSpark GCP Infrastructure
# ============================================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "brainspark-terraform-state"
    prefix = "terraform/state"
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-south1"  # Mumbai - close to Chennai
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}

variable "anthropic_api_key" {
  description = "Anthropic API Key"
  type        = string
  sensitive   = true
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ])
  
  service            = each.key
  disable_on_destroy = false
}

# ============================================================
# NETWORKING
# ============================================================

resource "google_compute_network" "vpc" {
  name                    = "brainspark-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "brainspark-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  
  private_ip_google_access = true
}

resource "google_vpc_access_connector" "connector" {
  name          = "brainspark-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"
}

# ============================================================
# CLOUD SQL (PostgreSQL)
# ============================================================

resource "google_sql_database_instance" "postgres" {
  name             = "brainspark-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  deletion_protection = var.environment == "prod" ? true : false
  
  settings {
    tier              = var.environment == "prod" ? "db-custom-2-4096" : "db-f1-micro"
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "prod"
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    
    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }
  
  depends_on = [google_project_service.services]
}

resource "google_sql_database" "database" {
  name     = "brainspark"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = "brainspark"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# ============================================================
# REDIS (Memorystore)
# ============================================================

resource "google_redis_instance" "cache" {
  name           = "brainspark-redis-${var.environment}"
  tier           = var.environment == "prod" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.environment == "prod" ? 2 : 1
  region         = var.region
  
  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  
  redis_version = "REDIS_7_0"
  
  depends_on = [google_project_service.services]
}

# ============================================================
# SECRET MANAGER
# ============================================================

resource "google_secret_manager_secret" "anthropic_key" {
  secret_id = "anthropic-api-key"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "anthropic_key" {
  secret      = google_secret_manager_secret.anthropic_key.id
  secret_data = var.anthropic_api_key
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# ============================================================
# ARTIFACT REGISTRY
# ============================================================

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "brainspark"
  format        = "DOCKER"
}

# ============================================================
# CLOUD RUN - Backend API
# ============================================================

resource "google_cloud_run_v2_service" "backend" {
  name     = "brainspark-api"
  location = var.region
  
  template {
    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = var.environment == "prod" ? 10 : 2
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
    
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/brainspark/api:latest"
      
      resources {
        limits = {
          cpu    = var.environment == "prod" ? "2" : "1"
          memory = var.environment == "prod" ? "2Gi" : "512Mi"
        }
      }
      
      env {
        name  = "DATABASE_URL"
        value = "postgresql://brainspark:${random_password.db_password.result}@${google_sql_database_instance.postgres.private_ip_address}:5432/brainspark"
      }
      
      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.cache.host}:${google_redis_instance.cache.port}"
      }
      
      env {
        name = "ANTHROPIC_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.anthropic_key.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      
      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 10
        period_seconds        = 10
      }
      
      liveness_probe {
        http_get {
          path = "/health"
        }
        period_seconds = 30
      }
    }
    
    service_account = google_service_account.backend.email
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  depends_on = [
    google_project_service.services,
    google_sql_database.database
  ]
}

# IAM for public access to API
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================================
# FIREBASE HOSTING (Frontend)
# ============================================================

# Note: Firebase Hosting is managed via Firebase CLI
# This outputs the Cloud Run URL to configure in frontend

# ============================================================
# SERVICE ACCOUNTS
# ============================================================

resource "google_service_account" "backend" {
  account_id   = "brainspark-backend"
  display_name = "BrainSpark Backend Service Account"
}

resource "google_project_iam_member" "backend_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "backend_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# ============================================================
# OUTPUTS
# ============================================================

output "api_url" {
  value       = google_cloud_run_v2_service.backend.uri
  description = "Backend API URL"
}

output "database_connection" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL connection name"
  sensitive   = true
}

output "redis_host" {
  value       = google_redis_instance.cache.host
  description = "Redis host"
}

output "vpc_connector" {
  value       = google_vpc_access_connector.connector.name
  description = "VPC Connector name"
}

# ============================================================
# terraform/variables.tfvars.example
# ============================================================
# project_id        = "your-gcp-project-id"
# region            = "asia-south1"
# environment       = "prod"
# anthropic_api_key = "sk-ant-..."
