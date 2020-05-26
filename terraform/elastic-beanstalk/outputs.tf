output "dns_cname" {
  description = "DNS name for the new EB environment"
  value       = "${aws_elastic_beanstalk_environment.main.cname}"
}

output "hosted_zone_id" {
  description = "Hosted zone id for the elastic beanstalk instance"
  value       = "${data.aws_elastic_beanstalk_hosted_zone.main.id}"
}