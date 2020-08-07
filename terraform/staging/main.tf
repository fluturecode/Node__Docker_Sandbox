# Local variables passed in through secret files
variable "api_domain_name" {}
variable "application_name" {}
variable "aws_assume_role_arn" {}
variable "aws_route53_hosted_zone" {}
variable "database_name" {}
variable "database_password" {}
variable "database_username" {}
variable "default_tags" {}
variable "eb_env_variables" {}
variable "eb_iam_profile" {}
variable "eb_service_role" {}

variable "aws_region" {
  default = "us-west-2"
}

provider "aws" {
  region  = var.aws_region
  version = "2.58"

  assume_role {
    role_arn = var.aws_assume_role_arn
  }
}

resource "aws_default_vpc" "default" {}

data "aws_subnet_ids" "default" {
  vpc_id = aws_default_vpc.default.id
}

module "boilerplate_ecr" {
  source = "../ecr"
  name   = var.application_name
}

module "eb_acm" {
  source      = "../acm"
  domain_name = var.api_domain_name
  hosted_zone = var.aws_route53_hosted_zone
}

resource "aws_security_group" "allow_db_communication" {
  name        = "${var.application_name}-db-sg"
  description = "Allows private connection to DB instance"
  tags        = merge({ "Name" = "${var.application_name}-db-sg" }, var.default_tags)
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "Allows connection to postgres"
    protocol    = "tcp"
    from_port   = 5432
    to_port     = 5432
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "tf_eb" {
  source = "../elastic-beanstalk"

  acm_certificate_arn   = module.eb_acm.cert_arn
  allowed_subnets       = data.aws_subnet_ids.default.ids
  application_name      = var.application_name
  ec2_security_groups   = [aws_security_group.allow_db_communication.id]
  eb_service_role       = var.eb_service_role
  environment_variables = var.eb_env_variables
  iam_instance_profile  = var.eb_iam_profile
  max_size              = "4"
  tags                  = var.default_tags
  vpc_id                = aws_default_vpc.default.id
}

module "rds_instance" {
  source = "../rds"

  allocated_storage         = "20"
  apply_immediately         = true
  backup_window             = "09:30-10:00"
  backup_retention_period   = "14"
  database_name             = var.database_name
  database_password         = var.database_password
  database_username         = var.database_username
  deletion_protection       = true
  engine                    = "postgres"
  engine_version            = "11.6"
  final_snapshot_identifier = "boilerplate-server-node"
  identifier                = "node-boilerplate-sandbox"
  instance_class            = "db.t3.micro"
  maintenance_window        = "Sun:06:00-Sun:09:00"
  max_allocated_storage     = "50"
  multi_az                  = false
  parameter_group_name      = "default.postgres11"
  port                      = 5432
  publicly_accessible       = false
  security_group_ids        = [aws_security_group.allow_db_communication.id]
  skip_final_snapshot       = false
  storage_encrypted         = true
  tags                      = var.default_tags
}

module "eb_route53_record" {
  source            = "../route53"
  alias_dns_name    = module.tf_eb.dns_cname
  domain_name       = var.api_domain_name
  hosted_zone       = var.aws_route53_hosted_zone
  resource_zone_id  = module.tf_eb.hosted_zone_id
}

module "ses_through_domain_name" {
  source      = "../ses"
  domain_name = var.api_domain_name
  hosted_zone = var.aws_route53_hosted_zone
}