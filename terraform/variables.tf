# BrainSpark Terraform Variables
# This file defines all input variables for the infrastructure

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-south1" # Mumbai - close to user base
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "anthropic_api_key" {
  description = "Anthropic API Key for Claude"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Custom domain for the application"
  type        = string
  default     = "brainspark.siggmatreders.com"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api.brainspark.siggmatreders.com"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-4096"
}

variable "redis_memory_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 1
}

variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 10
}
