// Uncomment these lines if not utilizing Docker or
// something that feeds node the .env like ElasticBeanstalk
// import dotenv from 'dotenv';
// dotenv.config();

export default {
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD,
  db_port: parseInt(process.env.DB_PORT, 10) || 5432,
  db_user: process.env.DB_USER,
  jwt_secret: process.env.JWT_SECRET,
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000
};