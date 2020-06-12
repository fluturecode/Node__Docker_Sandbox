import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config();

  process.env.DB_HOST = 'localhost';
  process.env.ERROR_LOGS = 'src/server-logs';
}

export default {
  application_name: process.env.APPLICATION_NAME,
  aws_region: process.env.AWS_REGION,
  client_url: process.env.CLIENT_URL,
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD,
  db_port: parseInt(process.env.DB_PORT, 10) || 5432,
  db_user: process.env.DB_USER,
  email_domain: process.env.EMAIL_DOMAIN,
  error_logs_directory: process.env.ERROR_LOGS,
  jwt_secret: process.env.JWT_SECRET,
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  sentry_dsn: process.env.SENTRY_DSN
};