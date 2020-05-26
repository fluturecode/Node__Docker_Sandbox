variable "alias_dns_name" {
  description = "DNS name for the resource you want to put as the domain alias"
}

variable "domain_name" {
  description = "Domain name for the route53 record"
}

variable "hosted_zone" {
  default     = "shift3sandbox.com."
  description = "Route53 hosted zone"
}

variable "resource_zone_id" {
  description = "Resource zone id"
}