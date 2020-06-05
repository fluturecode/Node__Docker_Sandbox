# Variables passed in through secret files
variable "eb_env_variables" {}
variable "api_domain_name" {}
variable "application_name" {}
variable "aws_route53_hosted_zone" {}

variable "aws_region" {
  default = "us-west-2"
}

provider "aws" {
  region  = "${var.aws_region}"
  version = ">=2.58"
}

module "boilerplate_ecr" {
  source = "../ecr"
  name   = "${var.application_name}"
}

module "eb_acm" {
  source      = "../acm"
  domain_name = "${var.api_domain_name}"
  hosted_zone = "${var.aws_route53_hosted_zone}"
}

module "tf_eb" {
  source                = "../elastic-beanstalk"
  acm_certificate_arn   = "${module.eb_acm.cert_arn}"
  application_name      = "${var.application_name}"
  environment_variables = "${var.eb_env_variables}"
  max_size              = "4"
}

module "eb_route53_record" {
  source            = "../route53"
  alias_dns_name    = "${module.tf_eb.dns_cname}"
  domain_name       = "${var.api_domain_name}"
  hosted_zone       = "${var.aws_route53_hosted_zone}"
  resource_zone_id  = "${module.tf_eb.hosted_zone_id}"
}

module "ses_through_domain_name" {
  source      = "../ses"
  domain_name = "${var.api_domain_name}"
  hosted_zone = "${var.aws_route53_hosted_zone}"
}