# BrainSpark - Infrastructure as Code

## Document Purpose

This document contains the Terraform configurations for deploying BrainSpark infrastructure on Google Cloud Platform.

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Project Structure](#2-project-structure)
3. [Core Infrastructure](#3-core-infrastructure)
4. [Database Configuration](#4-database-configuration)
5. [Application Services](#5-application-services)
6. [Networking](#6-networking)
7. [Security Configuration](#7-security-configuration)
8. [Monitoring Setup](#8-monitoring-setup)
9. [CI/CD Integration](#9-cicd-integration)
10. [Environment Management](#10-environment-management)

---

## 1. Infrastructure Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Google Cloud Platform                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         Cloud Load Balancer                         │     │
│  │                    (HTTPS, Cloud Armor, CDN)                        │     │
│  └────────────────────────────────┬───────────────────────────────────┘     │
│                                   │                                          │
│          ┌────────────────────────┼────────────────────────┐                │
│          │                        │                        │                │
│          ▼                        ▼                        ▼                │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │  Cloud Run   │        │  Cloud Run   │        │  Cloud Run   │          │
│  │  (Frontend)  │        │  (Core API)  │        │ (AI Service) │          │
│  └──────────────┘        └──────────────┘        └──────────────┘          │
│          │                        │                        │                │
│          │                        │                        │                │
│          │               ┌────────┴────────┐               │                │
│          │               │                 │               │                │
│          │               ▼                 ▼               │                │
│          │       ┌──────────────┐  ┌──────────────┐       │                │
│          │       │  Cloud SQL   │  │ Memorystore  │       │                │
│          │       │ (PostgreSQL) │  │   (Redis)    │       │                │
│          │       └──────────────┘  └──────────────┘       │                │
│          │                                                 │                │
│          │       ┌──────────────┐  ┌──────────────┐       │                │
│          └──────▶│Cloud Storage │  │Secret Manager│◀──────┘                │
│                  │   (Assets)   │  │   (Secrets)  │                        │
│                  └──────────────┘  └──────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Resource Summary

| Resource | Service | Configuration |
|----------|---------|---------------|
| Compute | Cloud Run | 3 services, auto-scaling |
| Database | Cloud SQL | PostgreSQL 15, HA |
| Cache | Memorystore | Redis 7, 1GB |
| Storage | Cloud Storage | Multi-regional |
| CDN | Cloud CDN | Global edge caching |
| Load Balancer | Cloud Load Balancing | HTTPS, managed SSL |
| WAF | Cloud Armor | DDoS protection |
| Secrets | Secret Manager | Encrypted secrets |
| DNS | Cloud DNS | Managed DNS |

---

## 2. Project Structure

### 2.1 Terraform Directory Structure

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── cloud-run/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloud-sql/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── memorystore/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── load-balancer/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── scripts/
    ├── init.sh
    ├── plan.sh
    ├── apply.sh
    └── destroy.sh
```

---

## 3. Core Infrastructure

### 3.1 Provider Configuration

```hcl
# terraform/environments/prod/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "gcs" {
    bucket = "brainspark-terraform-state"
    prefix = "prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "certificatemanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
  ])

  service                    = each.value
  disable_on_destroy         = false
  disable_dependent_services = false
}
```

### 3.2 Variables

```hcl
# terraform/environments/prod/variables.tf

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "domain" {
  description = "Application domain"
  type        = string
  default     = "brainspark.app"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-4096"
}

variable "redis_memory_size_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 1
}

variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
  default     = 2
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 100
}

variable "alert_email" {
  description = "Email for alerts"
  type        = string
}
```

### 3.3 Terraform Variables File

```hcl
# terraform/environments/prod/terraform.tfvars

project_id           = "brainspark-prod"
region               = "us-central1"
environment          = "prod"
domain               = "brainspark.app"
db_tier              = "db-custom-2-4096"
redis_memory_size_gb = 2
min_instances        = 2
max_instances        = 100
alert_email          = "alerts@brainspark.app"
```

---

## 4. Database Configuration

### 4.1 Cloud SQL Module

```hcl
# terraform/modules/cloud-sql/main.tf

resource "google_sql_database_instance" "main" {
  name             = "${var.name_prefix}-db"
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = var.environment == "prod" ? true : false

  settings {
    tier              = var.tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = var.disk_size
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = var.environment == "prod" ? 30 : 7
      }
      transaction_log_retention_days = 7
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 4  # 4 AM UTC
      update_track = "stable"
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
      require_ssl     = true
    }

    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# Database
resource "google_sql_database" "main" {
  name     = "brainspark"
  instance = google_sql_database_instance.main.name
}

# User
resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "google_sql_user" "main" {
  name     = "brainspark"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

# Store password in Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.name_prefix}-db-password"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Read Replica (Production only)
resource "google_sql_database_instance" "replica" {
  count = var.environment == "prod" ? 1 : 0

  name                 = "${var.name_prefix}-db-replica"
  master_instance_name = google_sql_database_instance.main.name
  region               = var.region
  database_version     = "POSTGRES_15"

  replica_configuration {
    failover_target = false
  }

  settings {
    tier              = var.tier
    availability_type = "ZONAL"
    disk_size         = var.disk_size
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
      require_ssl     = true
    }
  }
}
```

### 4.2 Cloud SQL Outputs

```hcl
# terraform/modules/cloud-sql/outputs.tf

output "instance_name" {
  value = google_sql_database_instance.main.name
}

output "connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "private_ip" {
  value = google_sql_database_instance.main.private_ip_address
}

output "database_name" {
  value = google_sql_database.main.name
}

output "database_user" {
  value = google_sql_user.main.name
}

output "password_secret_id" {
  value = google_secret_manager_secret.db_password.secret_id
}
```

---

## 5. Application Services

### 5.1 Cloud Run Module

```hcl
# terraform/modules/cloud-run/main.tf

resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  ingress  = var.ingress

  template {
    service_account = var.service_account_email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle = true
      }

      # Environment variables
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secret environment variables
      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value.secret_id
              version = env.value.version
            }
          }
        }
      }

      # Health check
      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 10
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 30
        timeout_seconds       = 3
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    # VPC connector for private network access
    vpc_access {
      connector = var.vpc_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    # Cloud SQL connection
    dynamic "volumes" {
      for_each = var.cloudsql_connection != null ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.cloudsql_connection]
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# IAM for public access (if needed)
resource "google_cloud_run_v2_service_iam_member" "public" {
  count = var.allow_public_access ? 1 : 0

  location = google_cloud_run_v2_service.service.location
  name     = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

### 5.2 Service Definitions

```hcl
# terraform/environments/prod/services.tf

# Core API Service
module "core_api" {
  source = "../../modules/cloud-run"

  service_name          = "brainspark-api"
  region                = var.region
  image                 = "gcr.io/${var.project_id}/brainspark-api:latest"
  service_account_email = google_service_account.api.email

  cpu                = "2"
  memory             = "1Gi"
  min_instances      = var.min_instances
  max_instances      = var.max_instances
  ingress            = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  allow_public_access = false

  vpc_connector_id    = module.networking.vpc_connector_id
  cloudsql_connection = module.database.connection_name

  env_vars = {
    ENVIRONMENT      = var.environment
    DATABASE_HOST    = module.database.private_ip
    DATABASE_NAME    = "brainspark"
    DATABASE_USER    = "brainspark"
    REDIS_HOST       = module.redis.host
    REDIS_PORT       = "6379"
    CORS_ORIGINS     = "https://${var.domain}"
    LOG_LEVEL        = "INFO"
  }

  secret_env_vars = {
    DATABASE_PASSWORD = {
      secret_id = module.database.password_secret_id
      version   = "latest"
    }
    JWT_SECRET = {
      secret_id = google_secret_manager_secret.jwt_secret.secret_id
      version   = "latest"
    }
    ANTHROPIC_API_KEY = {
      secret_id = google_secret_manager_secret.anthropic_key.secret_id
      version   = "latest"
    }
  }
}

# AI Service
module "ai_service" {
  source = "../../modules/cloud-run"

  service_name          = "brainspark-ai"
  region                = var.region
  image                 = "gcr.io/${var.project_id}/brainspark-ai:latest"
  service_account_email = google_service_account.ai.email

  cpu                = "2"
  memory             = "2Gi"
  min_instances      = 1
  max_instances      = 20
  ingress            = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  allow_public_access = false

  vpc_connector_id = module.networking.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
    LOG_LEVEL   = "INFO"
  }

  secret_env_vars = {
    ANTHROPIC_API_KEY = {
      secret_id = google_secret_manager_secret.anthropic_key.secret_id
      version   = "latest"
    }
  }
}

# Frontend Service
module "frontend" {
  source = "../../modules/cloud-run"

  service_name          = "brainspark-web"
  region                = var.region
  image                 = "gcr.io/${var.project_id}/brainspark-web:latest"
  service_account_email = google_service_account.frontend.email

  cpu                = "1"
  memory             = "512Mi"
  min_instances      = var.min_instances
  max_instances      = 50
  ingress            = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  allow_public_access = false

  env_vars = {
    API_URL = module.core_api.url
  }
}
```

---

## 6. Networking

### 6.1 VPC and Networking Module

```hcl
# terraform/modules/networking/main.tf

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.name_prefix}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = "${var.name_prefix}-subnet"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Serverless VPC Connector
resource "google_vpc_access_connector" "connector" {
  name          = "${var.name_prefix}-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 10

  machine_type = "e2-standard-4"
}

# Private Service Access (for Cloud SQL)
resource "google_compute_global_address" "private_ip" {
  name          = "${var.name_prefix}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}

# Cloud NAT (for outbound internet access)
resource "google_compute_router" "router" {
  name    = "${var.name_prefix}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "${var.name_prefix}-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall Rules
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.name_prefix}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
}
```

---

## 7. Security Configuration

### 7.1 IAM and Service Accounts

```hcl
# terraform/environments/prod/iam.tf

# API Service Account
resource "google_service_account" "api" {
  account_id   = "brainspark-api"
  display_name = "BrainSpark API Service Account"
}

resource "google_project_iam_member" "api_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_storage" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# AI Service Account
resource "google_service_account" "ai" {
  account_id   = "brainspark-ai"
  display_name = "BrainSpark AI Service Account"
}

resource "google_project_iam_member" "ai_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.ai.email}"
}

# Frontend Service Account
resource "google_service_account" "frontend" {
  account_id   = "brainspark-frontend"
  display_name = "BrainSpark Frontend Service Account"
}
```

### 7.2 Secret Manager

```hcl
# terraform/environments/prod/secrets.tf

# JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
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

# Anthropic API Key (manually set)
resource "google_secret_manager_secret" "anthropic_key" {
  secret_id = "anthropic-api-key"

  replication {
    auto {}
  }
}

# Firebase credentials (manually set)
resource "google_secret_manager_secret" "firebase_creds" {
  secret_id = "firebase-credentials"

  replication {
    auto {}
  }
}

# Stripe API Key (manually set)
resource "google_secret_manager_secret" "stripe_key" {
  secret_id = "stripe-api-key"

  replication {
    auto {}
  }
}

# SendGrid API Key (manually set)
resource "google_secret_manager_secret" "sendgrid_key" {
  secret_id = "sendgrid-api-key"

  replication {
    auto {}
  }
}
```

### 7.3 Cloud Armor (WAF)

```hcl
# terraform/environments/prod/security.tf

resource "google_compute_security_policy" "policy" {
  name = "brainspark-security-policy"

  # Default rule
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }

  # Block SQL injection
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block SQL injection"
  }

  # Block XSS
  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block XSS attacks"
  }

  # Rate limiting
  rule {
    action   = "throttle"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 1000
        interval_sec = 60
      }
    }
    description = "Rate limit - 1000 requests per minute"
  }

  # Block known bad IPs (optional - managed via console)
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
    }
  }
}
```

---

## 8. Monitoring Setup

### 8.1 Monitoring Module

```hcl
# terraform/modules/monitoring/main.tf

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "BrainSpark Alerts Email"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
}

# Uptime Check
resource "google_monitoring_uptime_check_config" "api" {
  display_name = "BrainSpark API Health"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "api.${var.domain}"
    }
  }
}

# Alert Policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 1%"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.01

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High API Latency"
  combiner     = "OR"

  conditions {
    display_name = "P95 latency > 3s"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_latencies\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 3000

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

resource "google_monitoring_alert_policy" "database_cpu" {
  display_name = "Database High CPU"
  combiner     = "OR"

  conditions {
    display_name = "CPU > 80%"

    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/cpu/utilization\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "BrainSpark Overview"
    gridLayout = {
      columns = 2
      widgets = [
        {
          title = "Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\""
                }
              }
            }]
          }
        },
        {
          title = "Error Rate"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
                }
              }
            }]
          }
        },
        {
          title = "Latency (P95)"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_latencies\""
                }
              }
            }]
          }
        },
        {
          title = "Active Instances"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/container/instance_count\""
                }
              }
            }]
          }
        }
      ]
    }
  })
}
```

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/terraform.yml

name: Terraform

on:
  push:
    branches: [main]
    paths: ['terraform/**']
  pull_request:
    branches: [main]
    paths: ['terraform/**']

env:
  TF_VERSION: '1.5.0'
  GOOGLE_CREDENTIALS: ${{ secrets.GCP_SA_KEY }}

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Format
        run: terraform fmt -check -recursive
        working-directory: terraform

      - name: Terraform Validate
        run: |
          terraform init -backend=false
          terraform validate
        working-directory: terraform/environments/prod

  plan:
    needs: validate
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/prod

      - name: Terraform Plan
        run: terraform plan -no-color -out=tfplan
        working-directory: terraform/environments/prod

      - name: Comment Plan
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan 📖
            \`\`\`
            ${process.env.PLAN}
            \`\`\`
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  apply:
    needs: validate
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init
        working-directory: terraform/environments/prod

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: terraform/environments/prod
```

---

## 10. Environment Management

### 10.1 Environment Comparison

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| Cloud Run min instances | 0 | 1 | 2 |
| Cloud Run max instances | 5 | 20 | 100 |
| Cloud SQL tier | db-f1-micro | db-custom-1-2048 | db-custom-2-4096 |
| Cloud SQL HA | No | No | Yes |
| Redis size | 1GB | 1GB | 2GB |
| Redis HA | No | No | Yes |
| Backups | 7 days | 14 days | 30 days |
| Cloud Armor | Basic | Basic | Full |
| Monitoring | Basic | Standard | Full |

### 10.2 Deployment Scripts

```bash
#!/bin/bash
# terraform/scripts/apply.sh

set -e

ENVIRONMENT=${1:-dev}

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo "Invalid environment: $ENVIRONMENT"
    echo "Usage: ./apply.sh [dev|staging|prod]"
    exit 1
fi

cd "$(dirname "$0")/../environments/$ENVIRONMENT"

echo "Initializing Terraform for $ENVIRONMENT..."
terraform init

echo "Planning changes for $ENVIRONMENT..."
terraform plan -out=tfplan

if [ "$ENVIRONMENT" == "prod" ]; then
    echo "⚠️  You are about to apply changes to PRODUCTION!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo "Applying changes to $ENVIRONMENT..."
terraform apply tfplan

echo "✅ Terraform apply complete for $ENVIRONMENT"
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [12-LAUNCH-CHECKLIST.md](../planning/12-LAUNCH-CHECKLIST.md)*
*Next Document: [14-DEVOPS-GUIDE.md](./14-DEVOPS-GUIDE.md)*
