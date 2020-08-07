# Environment variables needed for Elastic Beanstalk
eb_env_variables = {
  APPLICATION_NAME = ""
  AWS_REGION       = ""
  CLIENT_URL       = ""
  DB_HOST          = ""
  DB_NAME          = ""
  DB_PASSWORD      = ""
  DB_PORT          = ""
  DB_USER          = ""
  EMAIL_DOMAIN     = ""
  ERROR_LOGS       = "/opt/node/app/server-logs"
  JWT_SECRET       = ""
  NODE_ENV         = "production"
  SENTRY_DSN       = ""
  SERVER_PORT      = "3000"
}

# Domain name for the server
api_domain_name = ""

# Elastic Beanstalk application name
application_name = ""

# AssumeRole ARN to allow for creation/deletion of resources
aws_assume_role_arn = ""

# Hosted zone (defaulted to shift3sandbox.com.) but can be changed if needed
aws_route53_hosted_zone = "shift3sandbox.com."

# Database name
database_name = ""

# Database password
database_password = ""

# Database username
database_username = ""

# Default project tags
default_tags = {}