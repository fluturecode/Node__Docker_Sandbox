variable "domain_name" {
  description = "Domain name for the eb environment"
}

variable "environment" {
  default = "Staging"
  description = "Environment of the application Staging | Dev | Production"
}

variable "hosted_zone" {
  default     = "shift3sandbox.com."
  description = "AWS Hosted zone"
}
