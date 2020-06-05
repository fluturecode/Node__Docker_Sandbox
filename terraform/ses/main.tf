data "aws_route53_zone" "zone" {
  name         = "${var.hosted_zone}"
  private_zone = false
}

resource "aws_ses_domain_identity" "ses_identity" {
  domain = "${var.domain_name}"
}

resource "aws_route53_record" "example_amazonses_verification_record" {
  zone_id = "${data.aws_route53_zone.zone.id}"
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = "600"
  records = ["${aws_ses_domain_identity.ses_identity.verification_token}"]
}