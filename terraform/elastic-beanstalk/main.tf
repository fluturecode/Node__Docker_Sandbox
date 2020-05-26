data "aws_elastic_beanstalk_hosted_zone" "main" {}

resource "aws_elastic_beanstalk_application" "eb_app" {
  name        = "${var.application_name}"
  description = "${var.application_description}"
}

resource "aws_elastic_beanstalk_environment" "main" {
  name                = "${var.application_name}-${var.application_environment}"
  application         = "${aws_elastic_beanstalk_application.eb_app.name}"
  solution_stack_name = "${var.solution_stack}"
  tier                = "WebServer"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"

    value = "${var.instance_type}"
  }

  dynamic "setting" {
    for_each = "${var.environment_variables}"
    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = "${setting.key}"
      value     = "${setting.value}"
    }
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  setting {
    namespace = "aws:elbv2:listener:default"
    name      = "ListenerEnabled"
    value     = "false"
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "ListenerEnabled"
    value     = "true"
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "Protocol"
    value     = "HTTPS"
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "SSLCertificateArns"
    value     = "${var.acm_certificate_arn}"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"

    value = "${var.max_size}"
  }
}