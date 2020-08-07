data "aws_elastic_beanstalk_hosted_zone" "main" {}

resource "aws_elastic_beanstalk_application" "eb_app" {
  name        = "${var.application_name}"
  description = "${var.application_description}"
}

resource "aws_elastic_beanstalk_environment" "main" {
  name                    = "${var.application_name}-${var.application_environment}"
  application             = "${aws_elastic_beanstalk_application.eb_app.name}"
  solution_stack_name     = "${var.solution_stack}"
  tier                    = "WebServer"

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.allowed_subnets)
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = join(",", compact(var.ec2_security_groups))
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "${var.instance_type}"
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
    value     = "true"
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
    name      = "SSLPolicy"
    namespace = "aws:elbv2:listener:443"
    value     = "ELBSecurityPolicy-TLS-1-2-2017-01"
  }

  setting {
    name      = "ServiceRole"
    namespace = "aws:elasticbeanstalk:environment"
    value     = var.eb_service_role
  }

  setting {
    name      = "ServiceRoleForManagedUpdates"
    namespace = "aws:elasticbeanstalk:managedactions"
    value     = var.eb_service_role
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "SSLCertificateArns"
    value     = "${var.acm_certificate_arn}"
  }

  setting {
    name      = "HealthCheckInterval"
    namespace = "aws:elasticbeanstalk:environment:process:default"
    value     = "15"
  }

  setting {
    name      = "HealthCheckPath"
    namespace = "aws:elasticbeanstalk:environment:process:default"
    value     = "/health-check"
  }

  setting {
    name      = "IamInstanceProfile"
    namespace = "aws:autoscaling:launchconfiguration"
    value     = var.iam_instance_profile
  }

  setting {
    name      = "MeasureName"
    namespace = "aws:autoscaling:trigger"
    value     = "CPUUtilization"
  }

  setting {
    name      = "EvaluationPeriods"
    namespace = "aws:autoscaling:trigger"
    value     = "2"
  }

  setting {
    name      = "Unit"
    namespace = "aws:autoscaling:trigger"
    value     = "Percent"
  }

  setting {
    name      = "UpperBreachScaleIncrement"
    namespace = "aws:autoscaling:trigger"
    value     = "1"
  }

  setting {
    name      = "LowerBreachScaleIncrement"
    namespace = "aws:autoscaling:trigger"
    value     = "-1"
  }

  setting {
    name      = "LowerThreshold"
    namespace = "aws:autoscaling:trigger"
    value     = "25"
  }

  setting {
    name      = "UpperThreshold"
    namespace = "aws:autoscaling:trigger"
    value     = "50"
  }

  setting {
    name      = "MinSize"
    namespace = "aws:autoscaling:asg"
    value     = "1"
  }

  setting {
    name      = "MonitoringInterval"
    namespace = "aws:autoscaling:launchconfiguration"
    value     = "5 minute"
  }

  setting {
    name      = "Period"
    namespace = "aws:autoscaling:trigger"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = "${var.max_size}"
  }

  setting {
    name      = "EvaluationPeriods"
    namespace = "aws:autoscaling:trigger"
    value     = "2"
  }

  tags = var.tags
}