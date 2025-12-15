# BrainSpark Terraform Outputs

output "api_url" {
  value       = google_cloud_run_v2_service.backend.uri
  description = "Backend API URL (Cloud Run)"
}

output "database_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL connection name for Cloud Run"
  sensitive   = true
}

output "database_private_ip" {
  value       = google_sql_database_instance.postgres.private_ip_address
  description = "Cloud SQL private IP address"
  sensitive   = true
}

output "redis_host" {
  value       = google_redis_instance.cache.host
  description = "Redis (Memorystore) host IP"
}

output "redis_port" {
  value       = google_redis_instance.cache.port
  description = "Redis (Memorystore) port"
}

output "vpc_connector_name" {
  value       = google_vpc_access_connector.connector.name
  description = "VPC Access Connector name"
}

output "artifact_registry_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/brainspark"
  description = "Artifact Registry URL for Docker images"
}

output "service_account_email" {
  value       = google_service_account.backend.email
  description = "Backend service account email"
}

output "deployment_instructions" {
  value = <<-EOT

    ========================================
    BrainSpark Deployment Complete!
    ========================================

    Domain: https://${var.domain}
    API:    ${google_cloud_run_v2_service.backend.uri}

    Next Steps:
    1. Configure DNS: Point ${var.domain} to Cloud Run
    2. Configure API DNS: Point ${var.api_subdomain} to API service
    3. Deploy frontend to Firebase Hosting or Cloud Run
    4. Run database migrations

    Commands:
    - Push Docker image: docker push ${var.region}-docker.pkg.dev/${var.project_id}/brainspark/api:latest
    - View logs: gcloud run logs read --service brainspark-api --region ${var.region}

    ========================================
  EOT
  description = "Post-deployment instructions"
}
