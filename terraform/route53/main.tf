data "aws_route53_zone" "zone" {
  name         = var.hosted_zone
  private_zone = false
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.zone.id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.alias_dns_name
    zone_id                = var.resource_zone_id
    evaluate_target_health = true
  }
}