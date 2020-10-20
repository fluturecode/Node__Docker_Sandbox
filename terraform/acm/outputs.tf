output "cert_arn" {
  description = "AWS ACM validated cert arn"
  value       = aws_acm_certificate_validation.cert.certificate_arn
}
