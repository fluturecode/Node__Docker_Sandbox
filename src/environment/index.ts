// Uncomment these lines if not utilizing Docker or
// something that feeds node the .env like ElasticBeanstalk
// import dotenv from 'dotenv';
// dotenv.config();

export default {
  db_url: process.env.DB_URL,
  jwt_secret: process.env.JWT_SECRET,
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000
};