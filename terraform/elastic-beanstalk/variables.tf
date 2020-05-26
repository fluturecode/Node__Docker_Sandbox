variable "acm_certificate_arn" {
  description = "ARN for acm SSL certificate"
}

variable "application_name" {
  description = "Name of the EB application for your project"
}

variable "application_description" {
  default     = "Docker powered elastic beanstalk environment created by Terraform"
  description = "Description for your projects environment"
}

variable "application_environment" {
  default     = "api-webserver"
  description = "Deployment environment name"
}

variable "environment_variables" {
  default     = ""
  description = "List of environment variables to add to EB"
}

variable "instance_type" {
  default     = "t2.micro"
  description = "EC2 Instance type created by default and when autoscaling"
}

variable "max_size" {
  default     = "2"
  description = "Maximum number of EC2 instances when scaling out"
}

variable "solution_stack" {
  default     = "64bit Amazon Linux 2018.03 v2.15.0 running Docker 19.03.6-ce"
  description = "AWS Solution stack for envrionment defaults (Docker, Node, Python) etc."
}