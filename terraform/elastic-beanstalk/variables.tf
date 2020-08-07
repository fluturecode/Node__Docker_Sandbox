variable "acm_certificate_arn" {
  description = "ARN for acm SSL certificate"
}

variable "allowed_subnets" {
  description = "List of subnet ids to use for the EB environment"
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

variable "ec2_security_groups" {
  description = "List of security groups to attach to the ec2 instances"
}

variable "eb_service_role" {
  description = "Role used for the EB services"
}

variable "environment_variables" {
  default     = ""
  description = "List of environment variables to add to EB"
}

variable "iam_instance_profile" {
  default     = "aws-elasticbeanstalk-ec2-role"
  description = "IAM profile for each ec2 spun up inside EB"
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
  default     = "64bit Amazon Linux 2018.03 v2.15.1 running Docker 19.03.6-ce"
  description = "AWS Solution stack for envrionment defaults (Docker, Node, Python) etc."
}

variable "tags" {
  description = "Tags for the EB resources"
  default     = {}
}

variable "vpc_id" {
  description = "VPC for the EB environment"
}